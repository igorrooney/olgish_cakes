import { checkRateLimit, withRateLimit } from '../rate-limit'
import { NextRequest, NextResponse } from 'next/server'

// Mock Date.now() for consistent testing
const mockDateNow = jest.spyOn(Date, 'now')

describe('rate-limit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDateNow.mockReturnValue(1000000) // Start at 1,000,000ms
    // Clear the rate limit store by resetting the module
    jest.resetModules()
  })

  afterEach(() => {
    mockDateNow.mockRestore()
  })

  describe('checkRateLimit', () => {
    it('should allow requests within limit', async () => {
      const { checkRateLimit } = require('../rate-limit')
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      })

      const result1 = await checkRateLimit(request, { maxRequests: 10, windowMs: 60000 })
      expect(result1.rateLimited).toBe(false)
      expect(result1.remaining).toBe(9)
      expect(result1.resetTime).toBeGreaterThan(1000000)
    })

    it('should block requests exceeding limit', async () => {
      const { checkRateLimit } = require('../rate-limit')
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      })

      // Make 10 requests (limit is 10)
      for (let i = 0; i < 10; i++) {
        await checkRateLimit(request, { maxRequests: 10, windowMs: 60000 })
      }

      // 11th request should be rate limited
      const result = await checkRateLimit(request, { maxRequests: 10, windowMs: 60000 })
      expect(result.rateLimited).toBe(true)
      expect(result.remaining).toBe(0)
    })

    it('should reset after window expires', async () => {
      const { checkRateLimit } = require('../rate-limit')
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      })

      // Make requests up to limit
      for (let i = 0; i < 10; i++) {
        await checkRateLimit(request, { maxRequests: 10, windowMs: 60000 })
      }

      // Advance time past window
      mockDateNow.mockReturnValue(1000000 + 61000) // 61 seconds later

      // Should be able to make requests again
      const result = await checkRateLimit(request, { maxRequests: 10, windowMs: 60000 })
      expect(result.rateLimited).toBe(false)
      expect(result.remaining).toBe(9)
    })

    it('should handle multiple IP addresses independently', async () => {
      const { checkRateLimit } = require('../rate-limit')
      const request1 = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      })
      const request2 = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '5.6.7.8' }
      })

      // Exhaust limit for IP 1
      for (let i = 0; i < 10; i++) {
        await checkRateLimit(request1, { maxRequests: 10, windowMs: 60000 })
      }

      // IP 2 should still be able to make requests
      const result = await checkRateLimit(request2, { maxRequests: 10, windowMs: 60000 })
      expect(result.rateLimited).toBe(false)
      expect(result.remaining).toBe(9)
    })

    it('should use default values when options not provided', async () => {
      const { checkRateLimit } = require('../rate-limit')
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      })

      const result = await checkRateLimit(request)
      expect(result.rateLimited).toBe(false)
      expect(result.remaining).toBe(9) // Default maxRequests is 10
    })

    it('should extract IP from x-forwarded-for header', async () => {
      const { checkRateLimit } = require('../rate-limit')
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }
      })

      const result = await checkRateLimit(request)
      expect(result.rateLimited).toBe(false)
    })

    it('should fallback to x-real-ip when x-forwarded-for not present', async () => {
      const { checkRateLimit } = require('../rate-limit')
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-real-ip': '9.9.9.9' }
      })

      const result = await checkRateLimit(request)
      expect(result.rateLimited).toBe(false)
    })

    it('should use unknown when no IP headers present', async () => {
      const { checkRateLimit } = require('../rate-limit')
      const request = new NextRequest('http://localhost/api/test')

      const result = await checkRateLimit(request)
      expect(result.rateLimited).toBe(false)
    })

    it('should calculate remaining requests correctly', async () => {
      const { checkRateLimit } = require('../rate-limit')
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      })

      const result1 = await checkRateLimit(request, { maxRequests: 5, windowMs: 60000 })
      expect(result1.remaining).toBe(4)

      const result2 = await checkRateLimit(request, { maxRequests: 5, windowMs: 60000 })
      expect(result2.remaining).toBe(3)
    })
  })

  describe('withRateLimit', () => {
    it('should bypass rate limiting in test environment', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'test'

      const { withRateLimit } = require('../rate-limit')
      const mockHandler = jest.fn().mockResolvedValue(new NextResponse('OK'))
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      })

      const wrappedHandler = withRateLimit(mockHandler, { maxRequests: 1, windowMs: 60000 })
      
      // Make multiple requests - should all pass in test mode
      await wrappedHandler(request)
      await wrappedHandler(request)
      await wrappedHandler(request)

      expect(mockHandler).toHaveBeenCalledTimes(3)

      process.env.NODE_ENV = originalEnv
    })

    it('should bypass rate limiting when JEST_WORKER_ID is set', async () => {
      const originalWorkerId = process.env.JEST_WORKER_ID
      process.env.JEST_WORKER_ID = '1'

      const { withRateLimit } = require('../rate-limit')
      const mockHandler = jest.fn().mockResolvedValue(new NextResponse('OK'))
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      })

      const wrappedHandler = withRateLimit(mockHandler, { maxRequests: 1, windowMs: 60000 })
      
      await wrappedHandler(request)
      await wrappedHandler(request)

      expect(mockHandler).toHaveBeenCalledTimes(2)

      if (originalWorkerId) {
        process.env.JEST_WORKER_ID = originalWorkerId
      } else {
        delete process.env.JEST_WORKER_ID
      }
    })

    it('should return 429 when rate limit exceeded', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      delete process.env.JEST_WORKER_ID

      const { withRateLimit } = require('../rate-limit')
      const mockHandler = jest.fn().mockResolvedValue(new NextResponse('OK'))
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      })

      const wrappedHandler = withRateLimit(mockHandler, { maxRequests: 1, windowMs: 60000 })
      
      // First request should pass
      const response1 = await wrappedHandler(request)
      expect(response1.status).toBe(200)
      expect(mockHandler).toHaveBeenCalledTimes(1)

      // Second request should be rate limited
      const response2 = await wrappedHandler(request)
      expect(response2.status).toBe(429)
      const json = await response2.json()
      expect(json.error).toBe('Too many requests')
      expect(json.message).toBe('Rate limit exceeded. Please try again later.')
      expect(mockHandler).toHaveBeenCalledTimes(1) // Handler not called again

      process.env.NODE_ENV = originalEnv
    })

    it('should add rate limit headers to successful responses', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      delete process.env.JEST_WORKER_ID

      const { withRateLimit } = require('../rate-limit')
      const mockHandler = jest.fn().mockResolvedValue(new NextResponse('OK'))
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      })

      const wrappedHandler = withRateLimit(mockHandler, { maxRequests: 10, windowMs: 60000 })
      const response = await wrappedHandler(request)

      expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()

      process.env.NODE_ENV = originalEnv
    })

    it('should add rate limit headers to 429 responses', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      delete process.env.JEST_WORKER_ID

      const { withRateLimit } = require('../rate-limit')
      const mockHandler = jest.fn().mockResolvedValue(new NextResponse('OK'))
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      })

      const wrappedHandler = withRateLimit(mockHandler, { maxRequests: 1, windowMs: 60000 })
      
      // Exhaust limit
      await wrappedHandler(request)
      
      // Get rate limited response
      const response = await wrappedHandler(request)

      expect(response.status).toBe(429)
      expect(response.headers.get('X-RateLimit-Limit')).toBe('1')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
      expect(response.headers.get('Retry-After')).toBeTruthy()

      process.env.NODE_ENV = originalEnv
    })

    it('should call handler when not rate limited', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      delete process.env.JEST_WORKER_ID

      const { withRateLimit } = require('../rate-limit')
      const mockHandler = jest.fn().mockResolvedValue(new NextResponse('OK', { status: 200 }))
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      })

      const wrappedHandler = withRateLimit(mockHandler, { maxRequests: 10, windowMs: 60000 })
      const response = await wrappedHandler(request)

      expect(mockHandler).toHaveBeenCalledTimes(1)
      expect(mockHandler).toHaveBeenCalledWith(request)
      expect(response.status).toBe(200)

      process.env.NODE_ENV = originalEnv
    })
  })
})

