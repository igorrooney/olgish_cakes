/**
 * @jest-environment node
 */

const mockRpc = jest.fn()

jest.mock('@/lib/supabase-admin-client', () => ({
  getSupabaseAdminClient: () => ({
    rpc: mockRpc
  })
}))

import {
  PrivacyRetentionClaimRecoveryError,
  recoverExpiredPrivacyRetentionClaimAndPlaceHold
} from '../claim-recovery'

const input = {
  candidateId: 'order:11111111-1111-4111-8111-111111111111',
  reason: 'legal-claim' as const,
  reviewAt: '2026-12-01T12:00:00.000Z',
  confirmation: 'RECOVER CLAIM AND HOLD OC-2026-001'
}

describe('privacy-retention claim recovery repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls the atomic RPC without asking the caller for a claim token', async () => {
    mockRpc.mockResolvedValue({
      data: [{
        status: 'held',
        record_reference: 'OC-2026-001',
        claim_recovered: true,
        hold_review_at: input.reviewAt,
        recovered_at: '2026-08-25T14:00:00.000Z'
      }],
      error: null
    })

    await expect(recoverExpiredPrivacyRetentionClaimAndPlaceHold(input))
      .resolves.toEqual({
        status: 'held',
        recordReference: 'OC-2026-001',
        claimRecovered: true,
        holdReviewAt: input.reviewAt,
        recoveredAt: '2026-08-25T14:00:00.000Z'
      })

    expect(mockRpc).toHaveBeenCalledWith(
      'place_privacy_retention_legal_hold_with_claim_recovery',
      {
        p_candidate_id: input.candidateId,
        p_reason: 'legal-claim',
        p_review_at: input.reviewAt,
        p_confirmation: input.confirmation
      }
    )
    expect(JSON.stringify(mockRpc.mock.calls)).not.toContain('claim_token')
  })

  it.each([
    ['RETENTION_CONFIRMATION_INVALID', 400],
    ['RETENTION_HOLD_REVIEW_DATE_INVALID', 400],
    ['RETENTION_RECORD_NOT_FOUND', 404],
    ['RETENTION_HOLD_RECOVERY_ALREADY_HELD', 409],
    ['RETENTION_HOLD_RECOVERY_EXPIRED_CLAIM_REQUIRED', 409],
    ['RETENTION_HOLD_RECOVERY_CLAIM_LIVE', 409],
    ['RETENTION_HOLD_RECOVERY_UNSAFE', 409]
  ] as const)('maps allowlisted database code %s without provider detail', async (
    code,
    status
  ) => {
    mockRpc.mockResolvedValue({
      data: null,
      error: {
        message: `${code} SENTINEL-PRIVATE-PROVIDER-DETAIL`,
        details: 'SENTINEL-DIETARY-HEALTH-CONTENT'
      }
    })

    await expect(recoverExpiredPrivacyRetentionClaimAndPlaceHold(input))
      .rejects.toMatchObject({ code, status, message: code })
  })

  it('fails closed with a fixed error for unknown provider failures', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: {
        message: 'SENTINEL-PRIVATE-PROVIDER-DETAIL',
        details: 'SENTINEL-DIETARY-HEALTH-CONTENT'
      }
    })

    await expect(recoverExpiredPrivacyRetentionClaimAndPlaceHold(input))
      .rejects.toMatchObject({
        code: 'RETENTION_HOLD_RECOVERY_FAILED',
        status: 500,
        message: 'RETENTION_HOLD_RECOVERY_FAILED'
      })
  })

  it.each([
    null,
    [],
    [{ status: 'held', claim_recovered: true }],
    [{
      status: 'held',
      record_reference: 'OC-2026-001',
      claim_recovered: false,
      hold_review_at: input.reviewAt,
      recovered_at: '2026-08-25T14:00:00.000Z'
    }],
    [{
      status: 'held',
      record_reference: 'OC-2026-001',
      claim_recovered: true,
      hold_review_at: 'not-a-date',
      recovered_at: '2026-08-25T14:00:00.000Z'
    }]
  ])('rejects malformed success data %#', async (data) => {
    mockRpc.mockResolvedValue({ data, error: null })

    await expect(recoverExpiredPrivacyRetentionClaimAndPlaceHold(input))
      .rejects.toBeInstanceOf(PrivacyRetentionClaimRecoveryError)
  })
})
