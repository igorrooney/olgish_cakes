/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { PrivacyRetentionServiceError } from '@/lib/privacy-retention/service'
import { POST } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockVerifyAdminPassword = jest.fn()
const mockRecordReview = jest.fn()
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
    recordPrivacyRetentionOwnerReview: (...args: unknown[]) => mockRecordReview(...args)
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

const runReference = 'RET-20260825-A1B2C3D4'
const validBody = {
  password: 'admin-password',
  confirmation: `REVIEW ${runReference}`,
  runReference,
  reviewedSchedule: true,
  reviewedExternalSystems: true
}

const makeRequest = (body: unknown = validBody, rawBody?: string) => new NextRequest(
  'http://localhost/api/admin/privacy-retention/review',
  {
    method: 'POST',
    body: rawBody === undefined ? JSON.stringify(body) : rawBody,
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin'
    }
  }
)

describe('POST /api/admin/privacy-retention/review', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimited = false
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(true)
    mockRecordReview.mockResolvedValue({
      status: 'recorded',
      runReference,
      reviewedAt: '2026-08-25T10:00:00.000Z',
      nextReviewDueAt: '2026-11-25T10:00:00.000Z'
    })
  })

  it('records a password-confirmed owner review', async () => {
    const response = await POST(makeRequest())

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      status: 'recorded',
      runReference,
      reviewedAt: '2026-08-25T10:00:00.000Z',
      nextReviewDueAt: '2026-11-25T10:00:00.000Z'
    })
    expect(mockRecordReview).toHaveBeenCalledWith({
      runReference,
      confirmation: `REVIEW ${runReference}`,
      reviewedSchedule: true,
      reviewedExternalSystems: true
    })
  })

  it('strictly validates the body before authorization', async () => {
    const requests = [
      makeRequest(undefined, '{'),
      makeRequest({ ...validBody, extra: 'not-allowed' }),
      makeRequest({ ...validBody, runReference: 'bad-reference' }),
      makeRequest({ ...validBody, confirmation: '' }),
      makeRequest({ ...validBody, reviewedSchedule: false }),
      makeRequest({ ...validBody, reviewedExternalSystems: false })
    ]

    for (const request of requests) {
      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({
        error: 'Invalid retention review request.'
      })
    }

    expect(mockIsAdminAuthenticated).not.toHaveBeenCalled()
    expect(mockRecordReview).not.toHaveBeenCalled()
  })

  it('requires an authenticated session and valid admin password', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)
    expect((await POST(makeRequest())).status).toBe(401)

    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(false)
    expect((await POST(makeRequest())).status).toBe(401)
    expect(mockRecordReview).not.toHaveBeenCalled()
  })

  it('returns a safe error for an incorrect server confirmation phrase', async () => {
    mockRecordReview.mockRejectedValue(new PrivacyRetentionServiceError(
      'RETENTION_CONFIRMATION_INVALID',
      400
    ))

    const response = await POST(makeRequest())

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Enter the exact confirmation phrase shown for this retention action.',
      code: 'RETENTION_CONFIRMATION_INVALID'
    })
  })

  it('sanitises repository failures', async () => {
    const sentinel = 'SENTINEL-REVIEW-DETAIL'
    mockRecordReview.mockRejectedValue(Object.assign(
      new Error(sentinel),
      { code: 'AUDIT_INSERT_FAILED', hint: sentinel }
    ))

    const response = await POST(makeRequest())
    const body = await response.text()
    const logged = JSON.stringify(mockLoggerError.mock.calls)

    expect(response.status).toBe(500)
    expect(body).not.toContain(sentinel)
    expect(logged).not.toContain(sentinel)
    expect(logged).toContain('AUDIT_INSERT_FAILED')
  })

  it('honours rate limiting before authorization', async () => {
    mockRateLimited = true

    const response = await POST(makeRequest())

    expect(response.status).toBe(429)
    expect(mockIsAdminAuthenticated).not.toHaveBeenCalled()
    expect(mockRecordReview).not.toHaveBeenCalled()
  })
})
