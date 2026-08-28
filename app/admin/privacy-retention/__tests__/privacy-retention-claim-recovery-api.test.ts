import { recoverExpiredClaimAndPlaceHold } from '../privacy-retention-claim-recovery-api'

const mockFetch = jest.fn()

const response = (body: unknown, ok = true) => ({
  ok,
  json: jest.fn().mockResolvedValue(body)
})

describe('privacy-retention claim recovery client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = mockFetch
  })

  it('posts exact credentials with an AbortSignal and parses content-free evidence', async () => {
    const controller = new AbortController()
    mockFetch.mockResolvedValue(response({
      status: 'held',
      recordReference: 'OC-2026-001',
      claimRecovered: true,
      holdReviewAt: '2099-01-20T12:00:00.000Z',
      recoveredAt: '2026-08-25T14:00:00.000Z'
    }))

    await expect(recoverExpiredClaimAndPlaceHold({
      candidateId: 'order:11111111-1111-4111-8111-111111111111',
      reason: 'legal-claim',
      reviewAt: '2099-01-20T12:00:00.000Z',
      credentials: {
        password: 'admin-password',
        confirmation: 'RECOVER CLAIM AND HOLD OC-2026-001'
      },
      signal: controller.signal
    })).resolves.toEqual(expect.objectContaining({
      status: 'held',
      claimRecovered: true
    }))

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/privacy-retention/holds/recover-expired-claim',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        signal: controller.signal
      })
    )
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
      password: 'admin-password',
      candidateId: 'order:11111111-1111-4111-8111-111111111111',
      reason: 'legal-claim',
      reviewAt: '2099-01-20T12:00:00.000Z',
      confirmation: 'RECOVER CLAIM AND HOLD OC-2026-001'
    })
  })

  it('surfaces only the safe API message and rejects malformed success data', async () => {
    mockFetch.mockResolvedValueOnce(response({
      error: 'Deletion may already have started, so this claim cannot be cancelled automatically.'
    }, false))

    const payload = {
      candidateId: 'order:11111111-1111-4111-8111-111111111111',
      reason: 'legal-claim' as const,
      reviewAt: '2099-01-20T12:00:00.000Z',
      credentials: {
        password: 'admin-password',
        confirmation: 'RECOVER CLAIM AND HOLD OC-2026-001'
      },
      signal: new AbortController().signal
    }

    await expect(recoverExpiredClaimAndPlaceHold(payload)).rejects.toThrow(
      'Deletion may already have started'
    )

    mockFetch.mockResolvedValueOnce(response({
      status: 'held',
      recordReference: 'OC-2026-001',
      claimRecovered: false
    }))
    await expect(recoverExpiredClaimAndPlaceHold(payload)).rejects.toThrow(
      'recovery response was invalid'
    )
  })
})
