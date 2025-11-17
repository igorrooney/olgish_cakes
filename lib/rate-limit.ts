import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter
// WARNING: In-memory storage only works for single-instance deployments.
// For production with multiple serverless instances on Vercel, use Vercel KV or Redis.
// See: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk
// Alternative: Use @vercel/firewall SDK for IP-based rate limiting
//
// Production Scale Considerations:
// - This implementation uses a Map for in-memory storage
// - In serverless environments with multiple instances, each instance has its own Map
// - For production scale, consider migrating to:
//   1. Vercel KV (recommended for Vercel deployments): https://vercel.com/docs/storage/vercel-kv
//   2. Redis (for other platforms or custom infrastructure)
//   3. Vercel Firewall (for IP-based rate limiting at edge)
// - The cleanup interval runs every 5 minutes to prevent memory leaks
// - For high-traffic scenarios, consider implementing a maximum Map size limit
interface RateLimitStore {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitStore>()

// Clean up old entries periodically (every 5 minutes)
// Skip in test environment to avoid keeping tests alive
if (typeof setInterval !== 'undefined' && process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

interface RateLimitOptions {
  windowMs?: number // Time window in milliseconds
  maxRequests?: number // Maximum requests per window
}

interface RateLimitResult {
  rateLimited: boolean
  remaining: number
  resetTime: number
}

/**
 * Rate limiting function for API routes
 * @param request - Next.js request object
 * @param options - Rate limit configuration
 * @returns Rate limit status
 */
export async function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const windowMs = options.windowMs || 60 * 1000 // Default: 1 minute
  const maxRequests = options.maxRequests || 10 // Default: 10 requests per window

  // Get client identifier (IP address)
  // Note: NextRequest doesn't have an 'ip' property, use headers instead
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
             'unknown'

  const key = `rate-limit:${ip}`
  const now = Date.now()

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: now + windowMs
    }
    rateLimitStore.set(key, entry)
  }

  // Increment request count
  entry.count++

  // Check if rate limit exceeded
  const rateLimited = entry.count > maxRequests
  const remaining = Math.max(0, maxRequests - entry.count)

  return {
    rateLimited,
    remaining,
    resetTime: entry.resetTime
  }
}

/**
 * Rate limiting middleware wrapper for API route handlers
 * @param handler - API route handler function
 * @param options - Rate limit configuration
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Skip rate limiting in test environment
    if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined) {
      return await handler(request)
    }

    const { rateLimited, remaining, resetTime } = await checkRateLimit(request, options)

    if (rateLimited) {
      const resetSeconds = Math.ceil((resetTime - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          resetTime: resetSeconds
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(options.maxRequests || 10),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
            'Retry-After': String(resetSeconds)
          }
        }
      )
    }

    // Add rate limit headers to successful responses
    const response = await handler(request)
    response.headers.set('X-RateLimit-Limit', String(options.maxRequests || 10))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)))

    return response
  }
}

