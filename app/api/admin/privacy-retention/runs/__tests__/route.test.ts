/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { PrivacyRetentionServiceError } from '@/lib/privacy-retention/service'
import { POST } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockVerifyAdminPassword = jest.fn()
const mockExecuteSelection = jest.fn()
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
    executePrivacyRetentionSelection: (...args: unknown[]) => mockExecuteSelection(...args)
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
const snapshotToken = `eyJ2ZXJzaW9uIjoxfQ.${'a'.repeat(43)}`
const validBody = {
  password: 'admin-password',
  confirmation: `DELETE ${runReference}`,
  runReference,
  snapshotToken,
  candidateIds: ['order:11111111-1111-4111-8111-111111111111'],
  acknowledgedExternalCopies: true
}

const makeRequest = (
  body: unknown = validBody,
  rawBody?: string,
  origin = 'http://localhost'
) => new NextRequest(
  'http://localhost/api/admin/privacy-retention/runs',
  {
    method: 'POST',
    body: rawBody === undefined ? JSON.stringify(body) : rawBody,
    headers: {
      'content-type': 'application/json',
      origin,
      'sec-fetch-site': 'same-origin'
    }
  }
)

describe('POST /api/admin/privacy-retention/runs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimited = false
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(true)
    mockExecuteSelection.mockResolvedValue({
      status: 'completed',
      runReference,
      completedAt: '2026-08-25T09:05:00.000Z',
      selectedCount: 1,
      succeededCount: 1,
      failedCount: 0,
      results: [{
        candidateId: validBody.candidateIds[0],
        status: 'deleted',
        message: 'The selected retained information was removed.'
      }]
    })
  })

  it('rejects cross-origin requests before authentication or body processing', async () => {
    const response = await POST(makeRequest(
      validBody,
      undefined,
      'https://attacker.example'
    ))

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'Forbidden' })
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(mockIsAdminAuthenticated).not.toHaveBeenCalled()
    expect(mockVerifyAdminPassword).not.toHaveBeenCalled()
    expect(mockExecuteSelection).not.toHaveBeenCalled()
  })

  it('executes only the explicitly selected candidate IDs', async () => {
    const response = await POST(makeRequest())
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual(expect.objectContaining({
      status: 'completed',
      selectedCount: 1,
      succeededCount: 1
    }))
    expect(mockExecuteSelection).toHaveBeenCalledWith({
      runReference,
      snapshotToken,
      confirmation: `DELETE ${runReference}`,
      candidateIds: validBody.candidateIds,
      acknowledgedExternalCopies: true
    })
    expect(mockRateLimitOptions).toHaveBeenCalledWith({
      windowMs: 60_000,
      maxRequests: 5,
      distributedScope: 'admin-privacy-retention'
    })
  })

  it('rejects malformed JSON, unknown fields, empty selections and invalid references', async () => {
    const requests = [
      makeRequest(undefined, '{not-json'),
      makeRequest({ ...validBody, unexpected: true }),
      makeRequest({ ...validBody, acknowledgedExternalCopies: false }),
      makeRequest({ ...validBody, candidateIds: [] }),
      makeRequest({ ...validBody, candidateIds: ['x'.repeat(161)] }),
      makeRequest({ ...validBody, runReference: 'RET-invalid' }),
      makeRequest({ ...validBody, snapshotToken: undefined }),
      makeRequest({ ...validBody, snapshotToken: 'not-a-signed-token' }),
      makeRequest({
        ...validBody,
        snapshotToken: `${'a'.repeat(961)}.${'b'.repeat(43)}`
      })
    ]

    for (const request of requests) {
      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'Invalid retention request.' })
    }

    expect(mockIsAdminAuthenticated).not.toHaveBeenCalled()
    expect(mockExecuteSelection).not.toHaveBeenCalled()
  })

  it('requires both an authenticated session and the admin password', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)
    const unauthenticated = await POST(makeRequest())
    expect(unauthenticated.status).toBe(401)
    expect(await unauthenticated.json()).toEqual({ error: 'Unauthorized' })

    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockVerifyAdminPassword.mockReturnValue(false)
    const wrongPassword = await POST(makeRequest())
    expect(wrongPassword.status).toBe(401)
    expect(await wrongPassword.json()).toEqual({ error: 'Invalid admin password' })
    expect(mockExecuteSelection).not.toHaveBeenCalled()
  })

  it('maps invalid confirmation and stale selections to safe field-level responses', async () => {
    mockExecuteSelection
      .mockRejectedValueOnce(new PrivacyRetentionServiceError(
        'RETENTION_CONFIRMATION_INVALID',
        400
      ))
      .mockRejectedValueOnce(new PrivacyRetentionServiceError(
        'RETENTION_PREVIEW_STALE',
        409
      ))

    const invalidConfirmation = await POST(makeRequest())
    expect(invalidConfirmation.status).toBe(400)
    expect(await invalidConfirmation.json()).toEqual({
      error: 'Enter the exact confirmation phrase shown for this retention action.',
      code: 'RETENTION_CONFIRMATION_INVALID'
    })

    const staleSelection = await POST(makeRequest())
    expect(staleSelection.status).toBe(409)
    expect(await staleSelection.json()).toEqual({
      error: 'The retention preview changed. Refresh it before continuing.',
      code: 'RETENTION_PREVIEW_STALE'
    })
    expect(mockLoggerError).not.toHaveBeenCalled()
  })

  it('maps invalid and expired snapshots without exposing token details', async () => {
    mockExecuteSelection
      .mockRejectedValueOnce(new PrivacyRetentionServiceError(
        'RETENTION_PREVIEW_TOKEN_INVALID',
        409
      ))
      .mockRejectedValueOnce(new PrivacyRetentionServiceError(
        'RETENTION_PREVIEW_EXPIRED',
        409
      ))

    const invalid = await POST(makeRequest())
    expect(invalid.status).toBe(409)
    expect(await invalid.json()).toEqual({
      error: 'The retention preview could not be verified. Refresh it before continuing.',
      code: 'RETENTION_PREVIEW_TOKEN_INVALID'
    })

    const expired = await POST(makeRequest())
    expect(expired.status).toBe(409)
    expect(await expired.json()).toEqual({
      error: 'The retention preview expired. Refresh it before continuing.',
      code: 'RETENTION_PREVIEW_EXPIRED'
    })
    expect(mockLoggerError).not.toHaveBeenCalled()
  })

  it('does not leak selected-record content or database details on failure', async () => {
    const sentinel = 'SENTINEL-CUSTOMER-HEALTH-TEXT'
    mockExecuteSelection.mockRejectedValue(Object.assign(
      new Error(`${sentinel} delete failure`),
      { code: 'STORAGE_DELETE_FAILED', details: sentinel }
    ))

    const response = await POST(makeRequest())
    const responseText = await response.text()
    const logged = JSON.stringify(mockLoggerError.mock.calls)

    expect(response.status).toBe(500)
    expect(responseText).not.toContain(sentinel)
    expect(logged).not.toContain(sentinel)
    expect(logged).toContain('STORAGE_DELETE_FAILED')
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Privacy-retention operation failed',
      expect.objectContaining({ operation: 'admin.privacy-retention.execute' })
    )
  })

  it('returns the limiter response before authentication or deletion', async () => {
    mockRateLimited = true

    const response = await POST(makeRequest())

    expect(response.status).toBe(429)
    expect(mockIsAdminAuthenticated).not.toHaveBeenCalled()
    expect(mockExecuteSelection).not.toHaveBeenCalled()
  })
})
