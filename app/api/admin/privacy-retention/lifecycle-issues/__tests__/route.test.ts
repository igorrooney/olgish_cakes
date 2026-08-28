import { NextRequest } from 'next/server'
import { GET } from '../route'

const mockIsAdminAuthenticated = jest.fn()
const mockListIssues = jest.fn()

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/privacy-retention/lifecycle-review', () => ({
  listPrivacyRetentionLifecycleIssues: (...args: unknown[]) => mockListIssues(...args)
}))

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: (handler: (request: NextRequest) => Promise<Response>) => handler
}))

describe('privacy-retention lifecycle issues route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockListIssues.mockResolvedValue({ issues: [], page: 1, pageSize: 20, hasMore: false })
  })

  it('requires an authenticated admin session', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)
    const response = await GET(new NextRequest('http://localhost/api/admin/privacy-retention/lifecycle-issues'))
    expect(response.status).toBe(401)
    expect(mockListIssues).not.toHaveBeenCalled()
  })

  it('validates pagination and returns a private safe page', async () => {
    const response = await GET(new NextRequest('http://localhost/api/admin/privacy-retention/lifecycle-issues?page=2&pageSize=10'))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(mockListIssues).toHaveBeenCalledWith({ page: 2, pageSize: 10 })
  })

  it('rejects unknown query parameters', async () => {
    const response = await GET(new NextRequest('http://localhost/api/admin/privacy-retention/lifecycle-issues?page=1&leak=true'))
    expect(response.status).toBe(400)
    expect(mockListIssues).not.toHaveBeenCalled()
  })
})
