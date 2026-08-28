import 'server-only'

import { getSupabaseAdminClient } from '@/lib/supabase-admin-client'
import type { PrivacyRetentionHoldReason } from './types'

export type PrivacyRetentionClaimRecoveryErrorCode =
  | 'RETENTION_CONFIRMATION_INVALID'
  | 'RETENTION_HOLD_REVIEW_DATE_INVALID'
  | 'RETENTION_RECORD_NOT_FOUND'
  | 'RETENTION_HOLD_RECOVERY_ALREADY_HELD'
  | 'RETENTION_HOLD_RECOVERY_EXPIRED_CLAIM_REQUIRED'
  | 'RETENTION_HOLD_RECOVERY_CLAIM_LIVE'
  | 'RETENTION_HOLD_RECOVERY_UNSAFE'
  | 'RETENTION_HOLD_RECOVERY_FAILED'

export interface PrivacyRetentionClaimRecoveryResult {
  status: 'held'
  recordReference: string
  claimRecovered: true
  holdReviewAt: string
  recoveredAt: string
}

export class PrivacyRetentionClaimRecoveryError extends Error {
  code: PrivacyRetentionClaimRecoveryErrorCode
  status: number

  constructor(code: PrivacyRetentionClaimRecoveryErrorCode, status: number) {
    super(code)
    this.name = 'PrivacyRetentionClaimRecoveryError'
    this.code = code
    this.status = status
  }
}

interface RecoverPrivacyRetentionClaimInput {
  candidateId: string
  reason: PrivacyRetentionHoldReason
  reviewAt: string
  confirmation: string
}

const errorStatuses: Partial<Record<PrivacyRetentionClaimRecoveryErrorCode, number>> = {
  RETENTION_CONFIRMATION_INVALID: 400,
  RETENTION_HOLD_REVIEW_DATE_INVALID: 400,
  RETENTION_RECORD_NOT_FOUND: 404,
  RETENTION_HOLD_RECOVERY_ALREADY_HELD: 409,
  RETENTION_HOLD_RECOVERY_EXPIRED_CLAIM_REQUIRED: 409,
  RETENTION_HOLD_RECOVERY_CLAIM_LIVE: 409,
  RETENTION_HOLD_RECOVERY_UNSAFE: 409
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const isIsoDate = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value))

const throwRecoveryError = (error: unknown): never => {
  const message = isRecord(error) && typeof error.message === 'string'
    ? error.message
    : ''
  const code = (Object.keys(errorStatuses) as PrivacyRetentionClaimRecoveryErrorCode[])
    .find((candidate) => message.includes(candidate))

  if (code) {
    throw new PrivacyRetentionClaimRecoveryError(code, errorStatuses[code] ?? 409)
  }

  throw new PrivacyRetentionClaimRecoveryError(
    'RETENTION_HOLD_RECOVERY_FAILED',
    500
  )
}

const parseRecoveryResult = (
  data: unknown
): PrivacyRetentionClaimRecoveryResult => {
  const row: unknown = Array.isArray(data) ? data[0] : data

  if (
    !isRecord(row) ||
    row.status !== 'held' ||
    typeof row.record_reference !== 'string' ||
    row.record_reference.length === 0 ||
    row.record_reference.length > 128 ||
    row.claim_recovered !== true ||
    !isIsoDate(row.hold_review_at) ||
    !isIsoDate(row.recovered_at)
  ) {
    throw new PrivacyRetentionClaimRecoveryError(
      'RETENTION_HOLD_RECOVERY_FAILED',
      500
    )
  }

  return {
    status: 'held',
    recordReference: row.record_reference,
    claimRecovered: true,
    holdReviewAt: row.hold_review_at,
    recoveredAt: row.recovered_at
  }
}

export async function recoverExpiredPrivacyRetentionClaimAndPlaceHold(
  input: RecoverPrivacyRetentionClaimInput
): Promise<PrivacyRetentionClaimRecoveryResult> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.rpc(
    'place_privacy_retention_legal_hold_with_claim_recovery',
    {
      p_candidate_id: input.candidateId,
      p_reason: input.reason,
      p_review_at: input.reviewAt,
      p_confirmation: input.confirmation
    }
  )

  if (error) {
    throwRecoveryError(error)
  }

  return parseRecoveryResult(data)
}
