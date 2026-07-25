/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '../rate-limit'

const mockTakeEnquiryRateLimit = jest.fn()
const mockGetSupabaseAdminClient = jest.fn(() => ({ rpc: jest.fn() }))

jest.mock('../enquiry-rate-limit', () => ({
  applyEnquiryRateLimitHeaders: (
    response: NextResponse,
    result: {
      limit: number
      remaining: number
      resetAt: number
      rateLimited: boolean
      retryAfterSeconds: number
    }
  ) => {
    response.headers.set('X-RateLimit-Limit', String(result.limit))
    response.headers.set('X-RateLimit-Remaining', String(result.remaining))
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))

    if (result.rateLimited) {
      response.headers.set('Retry-After', String(result.retryAfterSeconds))
    }

    return response
  },
  getEnquiryRateLimitIdentifier: () => '203.0.113.10',
  takeEnquiryRateLimit: (...args: unknown[]) => mockTakeEnquiryRateLimit(...args)
}))

jest.mock('../supabase-admin-client', () => ({
  getSupabaseAdminClient: () => mockGetSupabaseAdminClient()
}))

jest.mock('../logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

describe('distributed rate limiting', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalJestWorkerId = process.env.JEST_WORKER_ID
  const originalSupabaseUrl = process.env.SUPABASE_URL
  const originalSupabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NODE_ENV = 'production'
    delete process.env.JEST_WORKER_ID
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
  })

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv

    if (originalJestWorkerId === undefined) {
      delete process.env.JEST_WORKER_ID
    } else {
      process.env.JEST_WORKER_ID = originalJestWorkerId
    }

    if (originalSupabaseUrl === undefined) {
      delete process.env.SUPABASE_URL
    } else {
      process.env.SUPABASE_URL = originalSupabaseUrl
    }

    if (originalSupabaseServiceRoleKey === undefined) {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
    } else {
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupabaseServiceRoleKey
    }
  })

  it('uses the atomic distributed limiter and adds headers to an allowed response', async () => {
    mockTakeEnquiryRateLimit.mockResolvedValue({
      limit: 10,
      currentCount: 1,
      remaining: 9,
      resetAt: 1_100_000,
      retryAfterSeconds: 60,
      rateLimited: false
    })
    const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
    const request = new NextRequest('https://example.com/api/contact')
    const wrappedHandler = withRateLimit(handler, {
      distributedScope: 'contact-enquiry',
      maxRequests: 10,
      windowMs: 60_000
    })

    const response = await wrappedHandler(request)

    expect(response.status).toBe(200)
    expect(handler).toHaveBeenCalledWith(request)
    expect(mockTakeEnquiryRateLimit).toHaveBeenCalledWith(
      expect.anything(),
      {
        scope: 'contact-enquiry',
        identifier: '203.0.113.10',
        maxRequests: 10,
        windowMs: 60_000
      }
    )
    expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('9')
  })

  it('returns 429 without calling the handler when the distributed limit is exceeded', async () => {
    mockTakeEnquiryRateLimit.mockResolvedValue({
      limit: 10,
      currentCount: 11,
      remaining: 0,
      resetAt: 1_100_000,
      retryAfterSeconds: 42,
      rateLimited: true
    })
    const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
    const wrappedHandler = withRateLimit(handler, {
      distributedScope: 'contact-enquiry',
      maxRequests: 10,
      windowMs: 60_000
    })

    const response = await wrappedHandler(new NextRequest('https://example.com/api/contact'))

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('42')
    expect(handler).not.toHaveBeenCalled()
  })

  it('fails closed in production when the distributed store is not configured', async () => {
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
    const wrappedHandler = withRateLimit(handler, {
      distributedScope: 'contact-enquiry'
    })

    const response = await wrappedHandler(new NextRequest('https://example.com/api/contact'))

    expect(response.status).toBe(503)
    expect(response.headers.get('Retry-After')).toBe('60')
    expect(handler).not.toHaveBeenCalled()
  })

  it('fails closed when the distributed store returns an error', async () => {
    mockTakeEnquiryRateLimit.mockRejectedValue(new Error('Database unavailable'))
    const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
    const wrappedHandler = withRateLimit(handler, {
      distributedScope: 'contact-enquiry'
    })

    const response = await wrappedHandler(new NextRequest('https://example.com/api/contact'))

    expect(response.status).toBe(503)
    expect(handler).not.toHaveBeenCalled()
  })
})
