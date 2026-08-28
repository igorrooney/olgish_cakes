/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { PrivacyRetentionClaimRecoveryError } from '@/lib/privacy-retention/claim-recovery'
import { POST } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockVerifyAdminPassword = jest.fn()
const mockRecover = jest.fn()
const mockLoggerError = jest.fn()
let mockRateLimited = false

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/admin/credentials.server', () => ({
  verifyAdminPassword: (...args: unknown[]) => mockVerifyAdminPassword(...args)
}))

jest.mock('@/lib/privacy-retention/claim-recovery', () => {
  const actual = jest.requireActual('@/lib/privacy-retention/claim-recovery')
  return {
    ...actual,
    recoverExpiredPrivacyRetentionClaimAndPlaceHold: (...args: unknown[]) =>
      mockRecover(...args)
  }
})

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: (handler: (request: NextRequest) => Promise<Response>) =>
    async (request: NextRequest) => mockRateLimited
      ? Response.json({ error: 'Too many requests' }, { status: 429 })
      : handler(request)
}))

const candidateId = 'order:11111111-1111-4111-8111-111111111111'
const body = {
  password: 'admin-password',
  candidateId,
  reason: 'legal-claim',
  reviewAt: '2026-12-01T12:00:00.000Z',
  confirmation: 'RECOVER CLAIM AND HOLD OC-2026-001'
}

const makeRequest = (requestBody: unknown, rawBody?: string) => new NextRequest(
  'http://localhost/api/admin/privacy-retention/holds/recover-expired-claim',
  {
    method: 'POST',
    body: rawBody === undefined ? JSON.stringify(requestBody) : rawBody,
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin'
    }
  }
)

describe('/api/admin/privacy-retention/holds/recover-expired-claim', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimited = false
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(true)
    mockRecover.mockResolvedValue({
      status: 'held',
      recordReference: 'OC-2026-001',
      claimRecovered: true,
      holdReviewAt: body.reviewAt,
      recoveredAt: '2026-08-25T14:00:00.000Z'
    })
  })

  it('authenticates and invokes the atomic recovery without a claim token', async () => {
    const response = await POST(makeRequest(body))
    const responseBody = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(responseBody).toEqual({
      status: 'held',
      recordReference: 'OC-2026-001',
      claimRecovered: true,
      holdReviewAt: body.reviewAt,
      recoveredAt: '2026-08-25T14:00:00.000Z'
    })
    expect(mockRecover).toHaveBeenCalledWith({
      candidateId,
      reason: 'legal-claim',
      reviewAt: body.reviewAt,
      confirmation: body.confirmation
    })
    expect(JSON.stringify(responseBody)).not.toContain('token')
    expect(JSON.stringify(mockRecover.mock.calls)).not.toContain('claimToken')
  })

  it('strictly validates the body and caps secrets before authorization', async () => {
    const invalidRequests = [
      makeRequest(undefined, '{'),
      makeRequest({ ...body, extra: true }),
      makeRequest({ ...body, password: 'x'.repeat(257) }),
      makeRequest({ ...body, confirmation: 'x'.repeat(221) }),
      makeRequest({ ...body, candidateId: 'x'.repeat(161) }),
      makeRequest({ ...body, reason: 'customer-request' }),
      makeRequest({ ...body, reviewAt: 'next week' })
    ]

    for (const request of invalidRequests) {
      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({
        error: 'Invalid legal-hold recovery request.'
      })
    }

    expect(mockIsAdminAuthenticated).not.toHaveBeenCalled()
    expect(mockVerifyAdminPassword).not.toHaveBeenCalled()
    expect(mockRecover).not.toHaveBeenCalled()
  })

  it('requires an authenticated admin and the current admin password', async () => {
    mockIsAdminAuthenticated.mockResolvedValueOnce(false)
    const unauthenticated = await POST(makeRequest(body))
    expect(unauthenticated.status).toBe(401)

    mockIsAdminAuthenticated.mockResolvedValueOnce(true)
    mockVerifyAdminPassword.mockReturnValueOnce(false)
    const wrongPassword = await POST(makeRequest(body))
    expect(wrongPassword.status).toBe(401)
    expect(mockRecover).not.toHaveBeenCalled()
  })

  it.each([
    [
      'RETENTION_CONFIRMATION_INVALID',
      400,
      'Enter the exact recovery confirmation phrase shown.'
    ],
    [
      'RETENTION_HOLD_REVIEW_DATE_INVALID',
      400,
      'Choose a future legal-hold review date.'
    ],
    [
      'RETENTION_RECORD_NOT_FOUND',
      404,
      'The retention record was not found.'
    ],
    [
      'RETENTION_HOLD_RECOVERY_ALREADY_HELD',
      409,
      'This record is already protected by a legal hold.'
    ],
    [
      'RETENTION_HOLD_RECOVERY_EXPIRED_CLAIM_REQUIRED',
      409,
      'No expired reversible deletion claim exists for this record. Use the normal legal-hold action.'
    ],
    [
      'RETENTION_HOLD_RECOVERY_CLAIM_LIVE',
      409,
      'A live deletion claim is still active. Wait for its lease to expire or review the active retention run.'
    ],
    [
      'RETENTION_HOLD_RECOVERY_UNSAFE',
      409,
      'Deletion may already have started, so this claim cannot be cancelled automatically.'
    ]
  ] as const)('maps %s to a fixed, content-free response', async (
    code,
    status,
    message
  ) => {
    mockRecover.mockRejectedValue(
      new PrivacyRetentionClaimRecoveryError(code, status)
    )

    const response = await POST(makeRequest(body))
    expect(response.status).toBe(status)
    expect(await response.json()).toEqual({ error: message })
    expect(mockLoggerError).not.toHaveBeenCalled()
  })

  it('sanitises unknown persistence failures and never logs secrets', async () => {
    const sentinel = 'SENTINEL-DIETARY-HEALTH-AND-PROVIDER-DETAIL'
    mockRecover.mockRejectedValue(Object.assign(
      new Error(sentinel),
      { code: 'DATABASE_PROVIDER_FAILED', details: sentinel }
    ))

    const response = await POST(makeRequest({
      ...body,
      password: `password-${sentinel}`,
      confirmation: `RECOVER CLAIM AND HOLD ${sentinel}`
    }))
    const responseText = await response.text()
    const logged = JSON.stringify(mockLoggerError.mock.calls)

    expect(response.status).toBe(500)
    expect(responseText).not.toContain(sentinel)
    expect(logged).not.toContain(sentinel)
    expect(logged).toContain('DATABASE_PROVIDER_FAILED')
    expect(logged).toContain('admin.privacy-retention.claim-recovery-hold')
  })

  it('rate limits before authentication or password verification', async () => {
    mockRateLimited = true

    const response = await POST(makeRequest(body))
    expect(response.status).toBe(429)
    expect(mockIsAdminAuthenticated).not.toHaveBeenCalled()
    expect(mockVerifyAdminPassword).not.toHaveBeenCalled()
    expect(mockRecover).not.toHaveBeenCalled()
  })
})
