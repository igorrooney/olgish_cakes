import { NextRequest } from 'next/server'
import { GET } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockListActiveHolds = jest.fn()
const mockWithRateLimit = jest.fn((
  handler: (request: NextRequest) => Promise<Response>
) => handler)

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/privacy-retention/active-holds', () => ({
  listPrivacyRetentionActiveHolds: (...args: unknown[]) =>
    mockListActiveHolds(...args)
}))

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: (
    handler: (request: NextRequest) => Promise<Response>,
    options: unknown
  ) => {
    mockWithRateLimit(handler, options)
    return handler
  }
}))

describe('active privacy-retention legal-holds route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockListActiveHolds.mockResolvedValue({
      holds: [],
      page: 1,
      pageSize: 20,
      hasMore: false
    })
  })

  it('requires an authenticated admin session', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)

    const response = await GET(new NextRequest(
      'http://localhost/api/admin/privacy-retention/holds/active'
    ))

    expect(response.status).toBe(401)
    expect(mockListActiveHolds).not.toHaveBeenCalled()
  })

  it('validates pagination and returns a private no-store page', async () => {
    const response = await GET(new NextRequest(
      'http://localhost/api/admin/privacy-retention/holds/active?page=2&pageSize=10'
    ))

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
    expect(mockListActiveHolds).toHaveBeenCalledWith({ page: 2, pageSize: 10 })
    expect(mockWithRateLimit).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        maxRequests: 30,
        distributedScope: 'admin-privacy-retention'
      })
    )
  })

  it('rejects unknown and out-of-range query parameters', async () => {
    const unknown = await GET(new NextRequest(
      'http://localhost/api/admin/privacy-retention/holds/active?page=1&leak=true'
    ))
    const oversized = await GET(new NextRequest(
      'http://localhost/api/admin/privacy-retention/holds/active?pageSize=51'
    ))

    expect(unknown.status).toBe(400)
    expect(oversized.status).toBe(400)
    expect(mockListActiveHolds).not.toHaveBeenCalled()
  })

  it('returns a safe failure without exposing provider details', async () => {
    mockListActiveHolds.mockRejectedValue(
      new Error('database row MUST-NOT-LEAK')
    )

    const response = await GET(new NextRequest(
      'http://localhost/api/admin/privacy-retention/holds/active'
    ))
    const body = await response.text()

    expect(response.status).toBe(500)
    expect(body).not.toContain('MUST-NOT-LEAK')
    expect(body).toContain('could not be completed safely')
  })
})
