export type PrivacyRetentionRunDetailMode =
  | 'discovery'
  | 'manual'
  | 'owner-review'

export type PrivacyRetentionRunDetailStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'partial'
  | 'failed'

export type PrivacyRetentionRunActionOutcome =
  | 'pending'
  | 'deleted'
  | 'skipped'
  | 'failed'

export interface PrivacyRetentionRunActionDetail {
  candidateId: string
  category: string
  recordType: string
  recordReference: string
  action: string
  outcome: PrivacyRetentionRunActionOutcome
  errorCode: string | null
  occurredAt: string
}

export interface PrivacyRetentionRunDetails {
  runReference: string
  mode: PrivacyRetentionRunDetailMode
  status: PrivacyRetentionRunDetailStatus
  startedAt: string
  completedAt: string | null
  updatedAt: string
  counts: {
    candidates: number
    selected: number
    succeeded: number
    skipped: number
    failed: number
  }
  auditInitialisationIncomplete: boolean
  actions: PrivacyRetentionRunActionDetail[]
}

export type PrivacyRetentionRunAuditIntegrityCode =
  | 'valid'
  | 'terminal-action-count-mismatch'
  | 'terminal-pending-action'
  | 'terminal-outcome-count-mismatch'
  | 'non-manual-terminal-actions'
  | 'active-action-count-mismatch'
  | 'active-outcome-count-mismatch'

export interface PrivacyRetentionRunAuditAssessment {
  valid: boolean
  code: PrivacyRetentionRunAuditIntegrityCode
  auditInitialisationIncomplete: boolean
}

type PrivacyRetentionRunAuditInput = Pick<
  PrivacyRetentionRunDetails,
  'mode' | 'status' | 'counts' | 'actions'
>

export const assessPrivacyRetentionRunAudit = (
  input: PrivacyRetentionRunAuditInput
): PrivacyRetentionRunAuditAssessment => {
  const isTerminal = input.status !== 'pending' && input.status !== 'running'
  const outcomeCounts = input.actions.reduce((counts, action) => ({
    deleted: counts.deleted + (action.outcome === 'deleted' ? 1 : 0),
    skipped: counts.skipped + (action.outcome === 'skipped' ? 1 : 0),
    failed: counts.failed + (action.outcome === 'failed' ? 1 : 0),
    pending: counts.pending + (action.outcome === 'pending' ? 1 : 0)
  }), { deleted: 0, skipped: 0, failed: 0, pending: 0 })

  if (input.mode === 'manual' && isTerminal) {
    if (input.actions.length !== input.counts.selected) {
      return {
        valid: false,
        code: 'terminal-action-count-mismatch',
        auditInitialisationIncomplete: false
      }
    }
    if (outcomeCounts.pending !== 0) {
      return {
        valid: false,
        code: 'terminal-pending-action',
        auditInitialisationIncomplete: false
      }
    }
    if (
      outcomeCounts.deleted !== input.counts.succeeded ||
      outcomeCounts.skipped !== input.counts.skipped ||
      outcomeCounts.failed !== input.counts.failed
    ) {
      return {
        valid: false,
        code: 'terminal-outcome-count-mismatch',
        auditInitialisationIncomplete: false
      }
    }
  }

  if (input.mode !== 'manual' && isTerminal) {
    if (input.counts.selected !== 0 || input.actions.length !== 0) {
      return {
        valid: false,
        code: 'non-manual-terminal-actions',
        auditInitialisationIncomplete: false
      }
    }
  }

  if (input.mode === 'manual' && !isTerminal) {
    if (input.actions.length > input.counts.selected) {
      return {
        valid: false,
        code: 'active-action-count-mismatch',
        auditInitialisationIncomplete: false
      }
    }
    if (
      input.counts.succeeded > outcomeCounts.deleted ||
      input.counts.skipped > outcomeCounts.skipped ||
      input.counts.failed > outcomeCounts.failed
    ) {
      return {
        valid: false,
        code: 'active-outcome-count-mismatch',
        auditInitialisationIncomplete: false
      }
    }
  }

  return {
    valid: true,
    code: 'valid',
    auditInitialisationIncomplete:
      input.mode === 'manual' &&
      !isTerminal &&
      input.actions.length < input.counts.selected
  }
}
