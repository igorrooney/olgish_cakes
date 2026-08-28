import type { PrivacyRetentionHoldReason } from '@/lib/privacy-retention/types'

const endpoint = '/api/admin/privacy-retention/holds/recover-expired-claim'

interface RecoveryCredentials {
  password: string
  confirmation: string
}

interface RecoverExpiredClaimPayload {
  candidateId: string
  reason: PrivacyRetentionHoldReason
  reviewAt: string
  credentials: RecoveryCredentials
  signal: AbortSignal
}

export interface RecoveredClaimHoldResponse {
  status: 'held'
  recordReference: string
  claimRecovered: true
  holdReviewAt: string
  recoveredAt: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const parseResponse = (value: unknown): RecoveredClaimHoldResponse | null => {
  if (
    !isRecord(value) ||
    value.status !== 'held' ||
    typeof value.recordReference !== 'string' ||
    value.claimRecovered !== true ||
    typeof value.holdReviewAt !== 'string' ||
    typeof value.recoveredAt !== 'string'
  ) {
    return null
  }

  return {
    status: 'held',
    recordReference: value.recordReference,
    claimRecovered: true,
    holdReviewAt: value.holdReviewAt,
    recoveredAt: value.recoveredAt
  }
}

const readErrorMessage = (value: unknown) =>
  isRecord(value) && typeof value.error === 'string'
    ? value.error
    : null

export async function recoverExpiredClaimAndPlaceHold(
  payload: RecoverExpiredClaimPayload
): Promise<RecoveredClaimHoldResponse> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      password: payload.credentials.password,
      candidateId: payload.candidateId,
      reason: payload.reason,
      reviewAt: payload.reviewAt,
      confirmation: payload.credentials.confirmation
    }),
    signal: payload.signal
  })
  const body: unknown = await response.json().catch((): unknown => null)

  if (!response.ok) {
    throw new Error(
      readErrorMessage(body) ??
      'The deletion claim could not be recovered safely.'
    )
  }

  const result = parseResponse(body)
  if (!result) {
    throw new Error('The deletion claim recovery response was invalid.')
  }

  return result
}
