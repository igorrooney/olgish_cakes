import 'server-only'

import {
  getSupabaseAdminClient,
  type SupabaseAdminClient
} from '@/lib/supabase-admin-client'
import {
  assessPrivacyRetentionRunAudit,
  type PrivacyRetentionRunActionDetail,
  type PrivacyRetentionRunActionOutcome,
  type PrivacyRetentionRunDetailMode,
  type PrivacyRetentionRunDetails,
  type PrivacyRetentionRunDetailStatus
} from './run-details-contract'

const runReferencePattern = /^RET-\d{8}-[A-F0-9]{8}$/
const safeCandidateIdPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/
const safeReferencePattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/
const safeSlugPattern = /^[a-z][a-z0-9-]{0,63}$/
const safeRecordTypePattern = /^[A-Za-z][A-Za-z0-9 -]{0,95}$/
const safeErrorCodePattern = /^[A-Z][A-Z0-9_]{0,63}$/
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const maximumActionsPerRun = 250

const modes: PrivacyRetentionRunDetailMode[] = [
  'discovery',
  'manual',
  'owner-review'
]
const statuses: PrivacyRetentionRunDetailStatus[] = [
  'pending',
  'running',
  'completed',
  'partial',
  'failed'
]
const actionOutcomes: PrivacyRetentionRunActionOutcome[] = [
  'pending',
  'deleted',
  'skipped',
  'failed'
]

type RetentionRunDetailRow = {
  id: string
  run_reference: string
  run_mode: string
  status: string
  candidate_count: unknown
  selected_count: unknown
  succeeded_count: unknown
  skipped_count: unknown
  failed_count: unknown
  started_at: unknown
  completed_at: unknown
  updated_at: unknown
}

type RetentionActionDetailRow = {
  candidate_id: unknown
  category: unknown
  record_type: unknown
  record_reference: unknown
  action_type: unknown
  outcome: unknown
  error_code: unknown
  occurred_at: unknown
}

export class PrivacyRetentionRunDetailsError extends Error {
  code: string

  constructor(code: string) {
    super(code)
    this.name = 'PrivacyRetentionRunDetailsError'
    this.code = code
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0

const isSafeTimestamp = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= 64 &&
  !Number.isNaN(Date.parse(value))

const isMode = (value: unknown): value is PrivacyRetentionRunDetailMode =>
  typeof value === 'string' && modes.includes(value as PrivacyRetentionRunDetailMode)

const isStatus = (value: unknown): value is PrivacyRetentionRunDetailStatus =>
  typeof value === 'string' && statuses.includes(value as PrivacyRetentionRunDetailStatus)

const isActionOutcome = (value: unknown): value is PrivacyRetentionRunActionOutcome =>
  typeof value === 'string' && actionOutcomes.includes(value as PrivacyRetentionRunActionOutcome)

const assertDatabaseSuccess = (error: unknown, code: string) => {
  if (error) {
    throw new PrivacyRetentionRunDetailsError(code)
  }
}

const mapAction = (value: unknown): PrivacyRetentionRunActionDetail => {
  if (!isRecord(value)) {
    throw new PrivacyRetentionRunDetailsError('RETENTION_RUN_ACTION_INVALID')
  }

  const row = value as RetentionActionDetailRow
  if (
    typeof row.candidate_id !== 'string' ||
    !safeCandidateIdPattern.test(row.candidate_id) ||
    typeof row.category !== 'string' ||
    !safeSlugPattern.test(row.category) ||
    typeof row.record_type !== 'string' ||
    !safeRecordTypePattern.test(row.record_type) ||
    typeof row.record_reference !== 'string' ||
    !safeReferencePattern.test(row.record_reference) ||
    typeof row.action_type !== 'string' ||
    !safeSlugPattern.test(row.action_type) ||
    !isActionOutcome(row.outcome) ||
    !(
      (row.outcome === 'failed' && typeof row.error_code === 'string' && safeErrorCodePattern.test(row.error_code)) ||
      (row.outcome !== 'failed' && row.error_code === null)
    ) ||
    !isSafeTimestamp(row.occurred_at)
  ) {
    throw new PrivacyRetentionRunDetailsError('RETENTION_RUN_ACTION_INVALID')
  }

  return {
    candidateId: row.candidate_id,
    category: row.category,
    recordType: row.record_type,
    recordReference: row.record_reference,
    action: row.action_type,
    outcome: row.outcome,
    errorCode: row.error_code,
    occurredAt: row.occurred_at
  }
}

const mapRun = (
  value: unknown,
  actions: PrivacyRetentionRunActionDetail[]
): PrivacyRetentionRunDetails => {
  if (!isRecord(value)) {
    throw new PrivacyRetentionRunDetailsError('RETENTION_RUN_INVALID')
  }

  const row = value as RetentionRunDetailRow
  if (
    typeof row.id !== 'string' ||
    !uuidPattern.test(row.id) ||
    !runReferencePattern.test(row.run_reference) ||
    !isMode(row.run_mode) ||
    !isStatus(row.status) ||
    !isNonNegativeInteger(row.candidate_count) ||
    !isNonNegativeInteger(row.selected_count) ||
    !isNonNegativeInteger(row.succeeded_count) ||
    !isNonNegativeInteger(row.skipped_count) ||
    !isNonNegativeInteger(row.failed_count) ||
    !isSafeTimestamp(row.started_at) ||
    !(row.completed_at === null || isSafeTimestamp(row.completed_at)) ||
    !isSafeTimestamp(row.updated_at) ||
    row.selected_count > row.candidate_count ||
    row.succeeded_count + row.skipped_count + row.failed_count > row.selected_count ||
    (
      (row.status === 'pending' || row.status === 'running')
        ? row.completed_at !== null
        : row.completed_at === null
    )
  ) {
    throw new PrivacyRetentionRunDetailsError('RETENTION_RUN_INVALID')
  }

  const details: PrivacyRetentionRunDetails = {
    runReference: row.run_reference,
    mode: row.run_mode,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
    counts: {
      candidates: row.candidate_count,
      selected: row.selected_count,
      succeeded: row.succeeded_count,
      skipped: row.skipped_count,
      failed: row.failed_count
    },
    auditInitialisationIncomplete: false,
    actions
  }

  const assessment = assessPrivacyRetentionRunAudit(details)
  if (!assessment.valid) {
    throw new PrivacyRetentionRunDetailsError('RETENTION_RUN_AUDIT_INCONSISTENT')
  }

  return {
    ...details,
    auditInitialisationIncomplete: assessment.auditInitialisationIncomplete
  }
}

export async function getPrivacyRetentionRunDetails(
  runReference: string,
  client: SupabaseAdminClient = getSupabaseAdminClient()
): Promise<PrivacyRetentionRunDetails | null> {
  if (!runReferencePattern.test(runReference)) {
    throw new PrivacyRetentionRunDetailsError('RETENTION_RUN_REFERENCE_INVALID')
  }

  const runResult = await client
    .from('privacy_retention_runs')
    .select('id,run_reference,run_mode,status,candidate_count,selected_count,succeeded_count,skipped_count,failed_count,started_at,completed_at,updated_at')
    .eq('run_reference', runReference)
    .maybeSingle()

  assertDatabaseSuccess(runResult.error, 'RETENTION_RUN_DETAILS_LOAD_FAILED')
  if (!runResult.data) {
    return null
  }

  const runRow = runResult.data as unknown as RetentionRunDetailRow
  if (typeof runRow.id !== 'string') {
    throw new PrivacyRetentionRunDetailsError('RETENTION_RUN_INVALID')
  }

  const actionResult = await client
    .from('privacy_retention_actions')
    .select('candidate_id,category,record_type,record_reference,action_type,outcome,error_code,occurred_at')
    .eq('run_id', runRow.id)
    .order('occurred_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(maximumActionsPerRun + 1)

  assertDatabaseSuccess(actionResult.error, 'RETENTION_RUN_ACTIONS_LOAD_FAILED')
  if (!Array.isArray(actionResult.data)) {
    throw new PrivacyRetentionRunDetailsError('RETENTION_RUN_ACTIONS_INVALID')
  }

  const actionRows = actionResult.data
  if (actionRows.length > maximumActionsPerRun) {
    throw new PrivacyRetentionRunDetailsError('RETENTION_RUN_ACTION_LIMIT_EXCEEDED')
  }

  const details = mapRun(runRow, actionRows.map(mapAction))
  if (details.runReference !== runReference) {
    throw new PrivacyRetentionRunDetailsError('RETENTION_RUN_REFERENCE_MISMATCH')
  }

  return details
}
