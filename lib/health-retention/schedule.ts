import 'server-only'

import { getSupabaseAdminClient } from '@/lib/supabase-admin-client'
import type { AdminEnquiryType } from '@/lib/enquiries/supabase-enquiries'

export type LegacyHealthRetentionScheduleStatus =
  | 'scheduled'
  | 'already-scheduled'
  | 'not-found'
  | 'no-active-information'
  | 'already-withdrawn'
  | 'already-erased'

export interface LegacyHealthRetentionScheduleResult {
  status: LegacyHealthRetentionScheduleStatus
  dueAt?: string
}

export class LegacyHealthRetentionScheduleError extends Error {
  code: string
  status: number

  constructor(code: string, status: number) {
    super(code)
    this.name = 'LegacyHealthRetentionScheduleError'
    this.code = code
    this.status = status
  }
}

const errorStatuses: Record<string, number> = {
  HEALTH_RETENTION_ENQUIRY_NOT_FOUND: 404,
  HEALTH_RETENTION_ORDER_NOT_FOUND: 404,
  HEALTH_RETENTION_RECORD_NOT_TERMINAL: 409,
  HEALTH_RETENTION_LEGAL_HOLD_ACTIVE: 409,
  HEALTH_RETENTION_DELETION_CLAIM_ACTIVE: 409
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const throwScheduleError = (error: unknown): never => {
  const message = isRecord(error) && typeof error.message === 'string'
    ? error.message
    : ''
  const code = Object.keys(errorStatuses).find((candidate) => message.includes(candidate))

  if (code) {
    throw new LegacyHealthRetentionScheduleError(code, errorStatuses[code])
  }

  throw new LegacyHealthRetentionScheduleError(
    'HEALTH_RETENTION_SCHEDULE_FAILED',
    500
  )
}

const parseScheduleResult = (data: unknown): LegacyHealthRetentionScheduleResult => {
  const row: unknown = Array.isArray(data) ? data[0] : data
  if (!isRecord(row) || typeof row.status !== 'string') {
    throw new LegacyHealthRetentionScheduleError(
      'HEALTH_RETENTION_SCHEDULE_FAILED',
      500
    )
  }

  const statuses: LegacyHealthRetentionScheduleStatus[] = [
    'scheduled',
    'already-scheduled',
    'not-found',
    'no-active-information',
    'already-withdrawn',
    'already-erased'
  ]
  if (!statuses.includes(row.status as LegacyHealthRetentionScheduleStatus)) {
    throw new LegacyHealthRetentionScheduleError(
      'HEALTH_RETENTION_SCHEDULE_FAILED',
      500
    )
  }

  const status = row.status as LegacyHealthRetentionScheduleStatus
  const dueAt = typeof row.due_at === 'string' ? row.due_at : undefined
  if ((status === 'scheduled' || status === 'already-scheduled') && !dueAt) {
    throw new LegacyHealthRetentionScheduleError(
      'HEALTH_RETENTION_SCHEDULE_FAILED',
      500
    )
  }

  return {
    status,
    ...(dueAt ? { dueAt } : {})
  }
}

export async function scheduleLegacyEnquiryHealthRetention(
  type: AdminEnquiryType,
  recordReference: string
): Promise<LegacyHealthRetentionScheduleResult> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.rpc(
    'schedule_legacy_enquiry_health_retention',
    {
      p_enquiry_type: type,
      p_record_id: recordReference
    }
  )

  if (error) {
    throwScheduleError(error)
  }

  return parseScheduleResult(data)
}

export async function scheduleLegacyOrderHealthRetention(
  recordReference: string
): Promise<LegacyHealthRetentionScheduleResult> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.rpc(
    'schedule_legacy_order_health_retention',
    {
      p_identifier: recordReference
    }
  )

  if (error) {
    throwScheduleError(error)
  }

  return parseScheduleResult(data)
}
