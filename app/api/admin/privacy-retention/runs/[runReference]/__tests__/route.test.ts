import { NextRequest } from 'next/server'
import { GET } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockGetRunDetails = jest.fn()
const mockLoggerError = jest.fn()
const mockWithRateLimit = jest.fn(
  (
    handler: (request: NextRequest) => Promise<Response>,
    _options?: unknown
  ) => handler
)

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/privacy-retention/run-details', () => ({
  PrivacyRetentionRunDetailsError: class PrivacyRetentionRunDetailsError extends Error {
    code: string

    constructor(code: string) {
      super(code)
      this.code = code
    }
  },
  getPrivacyRetentionRunDetails: (...args: unknown[]) => mockGetRunDetails(...args)
}))

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(
    args[0] as (request: NextRequest) => Promise<Response>,
    args[1]
  )
}))

jest.mock('@/lib/logger', () => ({
  logger: { error: (...args: unknown[]) => mockLoggerError(...args) }
}))

const runReference = 'RET-20260825-A1B2C3D4'
const context = (reference = runReference) => ({
  params: Promise.resolve({ runReference: reference })
})
const request = () => new NextRequest(
  `http://localhost/api/admin/privacy-retention/runs/${runReference}`
)

const details = {
  runReference,
  mode: 'manual',
  status: 'running',
  startedAt: '2026-08-25T09:00:00.000Z',
  completedAt: null,
  updatedAt: '2026-08-25T09:00:10.000Z',
  counts: {
    candidates: 2,
    selected: 2,
    succeeded: 1,
    skipped: 0,
    failed: 0
  },
  auditInitialisationIncomplete: true,
  actions: []
}

describe('privacy-retention run details route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockGetRunDetails.mockResolvedValue(details)
  })

  it('requires an authenticated admin session before validation or lookup', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)
    const response = await GET(request(), context('not-a-reference'))

    expect(response.status).toBe(401)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(mockGetRunDetails).not.toHaveBeenCalled()
  })

  it('validates the reference and returns a private safe result', async () => {
    const invalidResponse = await GET(request(), context('RET-invalid'))
    expect(invalidResponse.status).toBe(400)
    expect(mockGetRunDetails).not.toHaveBeenCalled()

    const response = await GET(request(), context())
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
    expect(mockGetRunDetails).toHaveBeenCalledWith(runReference)
    expect(mockWithRateLimit).toHaveBeenCalledWith(
      expect.any(Function),
      {
        windowMs: 60 * 1000,
        maxRequests: 30,
        distributedScope: 'admin-privacy-retention-run-details'
      }
    )
    expect(await response.json()).toEqual(details)
  })

  it('returns a private 404 for an unknown run', async () => {
    mockGetRunDetails.mockResolvedValue(null)
    const response = await GET(request(), context())
    expect(response.status).toBe(404)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(await response.json()).toEqual({ error: 'Retention run not found.' })
  })

  it('does not expose provider errors or request data', async () => {
    mockGetRunDetails.mockRejectedValue(new Error('SENTINEL_PROVIDER_SECRET'))
    const response = await GET(request(), context())
    const body = JSON.stringify(await response.json())

    expect(response.status).toBe(500)
    expect(body).not.toContain('SENTINEL')
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Privacy-retention operation failed',
      expect.objectContaining({
        operation: 'admin.privacy-retention.run-details'
      })
    )
    expect(JSON.stringify(mockLoggerError.mock.calls)).not.toContain('SENTINEL')
  })
})
