/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { PrivacyRetentionServiceError } from '@/lib/privacy-retention/service'
import { POST } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockVerifyAdminPassword = jest.fn()
const mockResumeRun = jest.fn()
const mockLoggerError = jest.fn()
const mockRateLimitOptions = jest.fn()
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
    resumePrivacyRetentionRun: (...args: unknown[]) => mockResumeRun(...args)
  }
})

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: (
    handler: (request: NextRequest) => Promise<Response>,
    options: unknown
  ) => {
    mockRateLimitOptions(options)
    return async (request: NextRequest) => {
      if (mockRateLimited) {
        return Response.json({ error: 'Too many requests' }, { status: 429 })
      }
      return handler(request)
    }
  }
}))

const runReference = 'RET-20260825-A1B2C3D4'
const validBody = {
  password: 'admin-password',
  confirmation: `RESUME ${runReference}`
}
const context = (reference = runReference) => ({
  params: Promise.resolve({ runReference: reference })
})
const makeRequest = (
  body: unknown = validBody,
  rawBody?: string
) => new NextRequest(
  `http://localhost/api/admin/privacy-retention/runs/${runReference}/resume`,
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

describe('POST /api/admin/privacy-retention/runs/[runReference]/resume', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimited = false
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(true)
    mockResumeRun.mockResolvedValue({
      status: 'completed',
      runReference,
      completedAt: '2026-08-25T10:00:00.000Z',
      selectedCount: 1,
      succeededCount: 1,
      failedCount: 0,
      results: [{
        candidateId: 'order:11111111-1111-4111-8111-111111111111',
        status: 'deleted',
        message: 'The selected retained information was removed.'
      }]
    })
  })

  it('resumes the exact persisted run behind authentication and rate limiting', async () => {
    const response = await POST(makeRequest(), context())

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(expect.objectContaining({
      status: 'completed',
      runReference
    }))
    expect(mockResumeRun).toHaveBeenCalledWith({
      runReference,
      confirmation: `RESUME ${runReference}`
    })
    expect(mockRateLimitOptions).toHaveBeenCalledWith({
      windowMs: 60_000,
      maxRequests: 5,
      distributedScope: 'admin-privacy-retention'
    })
  })

  it('rejects malformed bodies, unknown fields and invalid path references', async () => {
    const requests: Array<[NextRequest, ReturnType<typeof context>]> = [
      [makeRequest(undefined, '{not-json'), context()],
      [makeRequest({ ...validBody, unexpected: true }), context()],
      [makeRequest({ ...validBody, confirmation: '' }), context()],
      [makeRequest({ confirmation: validBody.confirmation }), context()],
      [makeRequest(), context('RET-invalid')]
    ]

    for (const [request, requestContext] of requests) {
      const response = await POST(request, requestContext)
      expect(response.status).toBe(400)
    }
    expect(mockResumeRun).not.toHaveBeenCalled()
  })

  it('requires the session and current admin password', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)
    const unauthenticated = await POST(makeRequest(), context())
    expect(unauthenticated.status).toBe(401)

    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(false)
    const wrongPassword = await POST(makeRequest(), context())
    expect(wrongPassword.status).toBe(401)
    expect(mockResumeRun).not.toHaveBeenCalled()
  })

  it('returns safe field-level errors for confirmation and missing runs', async () => {
    mockResumeRun
      .mockRejectedValueOnce(new PrivacyRetentionServiceError(
        'RETENTION_CONFIRMATION_INVALID',
        400
      ))
      .mockRejectedValueOnce(new PrivacyRetentionServiceError(
        'RETENTION_RUN_NOT_FOUND',
        404
      ))

    const confirmation = await POST(makeRequest(), context())
    expect(confirmation.status).toBe(400)
    expect(await confirmation.json()).toEqual({
      error: 'Enter the exact confirmation phrase shown for this retention action.',
      code: 'RETENTION_CONFIRMATION_INVALID'
    })

    const missing = await POST(makeRequest(), context())
    expect(missing.status).toBe(404)
    expect(await missing.json()).toEqual({
      error: 'The retention run was not found.',
      code: 'RETENTION_RUN_NOT_FOUND'
    })
    expect(mockLoggerError).not.toHaveBeenCalled()
  })

  it('does not expose credentials, record content or provider errors', async () => {
    const sentinel = 'SENTINEL-HEALTH-AND-PASSWORD'
    mockResumeRun.mockRejectedValue(Object.assign(
      new Error(`${sentinel} provider failure`),
      { code: 'DATABASE_FAILURE', details: sentinel }
    ))

    const response = await POST(makeRequest({
      password: sentinel,
      confirmation: `RESUME ${runReference}`
    }), context())
    const responseText = await response.text()
    const logged = JSON.stringify(mockLoggerError.mock.calls)

    expect(response.status).toBe(500)
    expect(responseText).not.toContain(sentinel)
    expect(logged).not.toContain(sentinel)
    expect(logged).toContain('DATABASE_FAILURE')
  })

  it('returns the limiter response before parsing, authentication or resumption', async () => {
    mockRateLimited = true
    const response = await POST(makeRequest(), context())

    expect(response.status).toBe(429)
    expect(mockIsAdminAuthenticated).not.toHaveBeenCalled()
    expect(mockResumeRun).not.toHaveBeenCalled()
  })
})
