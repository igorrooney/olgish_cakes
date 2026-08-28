/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { PrivacyRetentionServiceError } from '@/lib/privacy-retention/service'
import { DELETE, POST } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockVerifyAdminPassword = jest.fn()
const mockSetHold = jest.fn()
const mockReleaseHold = jest.fn()
const mockLoggerError = jest.fn()
let mockRateLimited = false

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/admin/credentials.server', () => ({
  verifyAdminPassword: (...args: unknown[]) => mockVerifyAdminPassword(...args)
}))

jest.mock('@/lib/privacy-retention/service', () => {
  const actual = jest.requireActual('@/lib/privacy-retention/service')
  return {
    ...actual,
    setPrivacyRetentionLegalHold: (...args: unknown[]) => mockSetHold(...args),
    releasePrivacyRetentionLegalHold: (...args: unknown[]) => mockReleaseHold(...args)
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
const holdBody = {
  password: 'admin-password',
  candidateId,
  reason: 'active-complaint',
  reviewAt: '2026-12-01T09:00:00.000Z'
}
const releaseBody = {
  password: 'admin-password',
  candidateId,
  confirmation: 'REMOVE HOLD OC-100'
}

const makeRequest = (
  method: 'POST' | 'DELETE',
  body: unknown,
  rawBody?: string
) => new NextRequest(
  'http://localhost/api/admin/privacy-retention/holds',
  {
    method,
    body: rawBody === undefined ? JSON.stringify(body) : rawBody,
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin'
    }
  }
)

describe('/api/admin/privacy-retention/holds', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimited = false
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(true)
    mockSetHold.mockResolvedValue({
      status: 'held',
      candidateId,
      updatedAt: '2026-08-25T10:00:00.000Z'
    })
    mockReleaseHold.mockResolvedValue({
      status: 'released',
      candidateId,
      updatedAt: '2026-08-25T10:05:00.000Z'
    })
  })

  it('sets an allowlisted legal hold after password authorization', async () => {
    const response = await POST(makeRequest('POST', holdBody))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(expect.objectContaining({
      status: 'held',
      candidateId
    }))
    expect(mockSetHold).toHaveBeenCalledWith({
      candidateId,
      reason: 'active-complaint',
      reviewAt: holdBody.reviewAt
    })
  })

  it('rejects malformed, overlong, non-datetime and unrecognised hold values', async () => {
    const invalidRequests = [
      makeRequest('POST', undefined, '{'),
      makeRequest('POST', { ...holdBody, unexpected: true }),
      makeRequest('POST', { ...holdBody, candidateId: 'x'.repeat(161) }),
      makeRequest('POST', { ...holdBody, reason: 'customer-asked' }),
      makeRequest('POST', { ...holdBody, reviewAt: 'next Tuesday' })
    ]

    for (const request of invalidRequests) {
      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'Invalid legal-hold request.' })
    }

    expect(mockIsAdminAuthenticated).not.toHaveBeenCalled()
    expect(mockSetHold).not.toHaveBeenCalled()
  })

  it('requires authentication and password for setting a hold', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)
    expect((await POST(makeRequest('POST', holdBody))).status).toBe(401)

    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(false)
    expect((await POST(makeRequest('POST', holdBody))).status).toBe(401)
    expect(mockSetHold).not.toHaveBeenCalled()
  })

  it('maps invalid review dates and missing records to safe responses', async () => {
    mockSetHold
      .mockRejectedValueOnce(new PrivacyRetentionServiceError(
        'RETENTION_HOLD_REVIEW_DATE_INVALID',
        400
      ))
      .mockRejectedValueOnce(new PrivacyRetentionServiceError(
        'RETENTION_RECORD_NOT_FOUND',
        404
      ))

    const invalidDate = await POST(makeRequest('POST', holdBody))
    expect(invalidDate.status).toBe(400)
    expect(await invalidDate.json()).toEqual({
      error: 'Choose a future legal-hold review date.',
      code: 'RETENTION_HOLD_REVIEW_DATE_INVALID'
    })

    const missing = await POST(makeRequest('POST', holdBody))
    expect(missing.status).toBe(404)
    expect(await missing.json()).toEqual({
      error: 'The retention record was not found.',
      code: 'RETENTION_RECORD_NOT_FOUND'
    })
  })

  it('releases a hold using only the selected candidate and typed phrase', async () => {
    const response = await DELETE(makeRequest('DELETE', releaseBody))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(expect.objectContaining({
      status: 'released',
      candidateId
    }))
    expect(mockReleaseHold).toHaveBeenCalledWith({
      candidateId,
      confirmation: 'REMOVE HOLD OC-100'
    })
  })

  it('strictly validates and authorizes hold release requests', async () => {
    const invalid = await DELETE(makeRequest('DELETE', {
      ...releaseBody,
      recordReference: 'untrusted-extra-field'
    }))
    expect(invalid.status).toBe(400)
    expect(mockReleaseHold).not.toHaveBeenCalled()

    mockIsAdminAuthenticated.mockResolvedValue(false)
    expect((await DELETE(makeRequest('DELETE', releaseBody))).status).toBe(401)

    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(false)
    expect((await DELETE(makeRequest('DELETE', releaseBody))).status).toBe(401)
    expect(mockReleaseHold).not.toHaveBeenCalled()
  })

  it('rejects a forged release phrase resolved against the server record', async () => {
    mockReleaseHold.mockRejectedValue(new PrivacyRetentionServiceError(
      'RETENTION_CONFIRMATION_INVALID',
      400
    ))

    const response = await DELETE(makeRequest('DELETE', {
      ...releaseBody,
      confirmation: 'REMOVE HOLD ANOTHER-RECORD'
    }))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Enter the exact confirmation phrase shown for this retention action.',
      code: 'RETENTION_CONFIRMATION_INVALID'
    })
  })

  it('sanitises hold persistence failures', async () => {
    const sentinel = 'SENTINEL-HOLD-DATABASE-DETAIL'
    mockSetHold.mockRejectedValue(Object.assign(
      new Error(sentinel),
      { code: 'HOLD_UPDATE_FAILED', details: sentinel }
    ))

    const response = await POST(makeRequest('POST', holdBody))
    const responseText = await response.text()
    const logged = JSON.stringify(mockLoggerError.mock.calls)

    expect(response.status).toBe(500)
    expect(responseText).not.toContain(sentinel)
    expect(logged).not.toContain(sentinel)
    expect(logged).toContain('HOLD_UPDATE_FAILED')
  })

  it('rate limits both setting and releasing before authorization', async () => {
    mockRateLimited = true

    expect((await POST(makeRequest('POST', holdBody))).status).toBe(429)
    expect((await DELETE(makeRequest('DELETE', releaseBody))).status).toBe(429)
    expect(mockIsAdminAuthenticated).not.toHaveBeenCalled()
    expect(mockSetHold).not.toHaveBeenCalled()
    expect(mockReleaseHold).not.toHaveBeenCalled()
  })
})
