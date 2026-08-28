import { NextRequest, NextResponse } from 'next/server'
import {
  applyEnquiryRateLimitHeaders,
  getEnquiryRateLimitIdentifier,
  takeEnquiryRateLimit,
  type EnquiryRateLimitResult,
  type EnquiryRateLimitScope
} from './enquiry-rate-limit'
import { logger } from './logger'
import { getSupabaseAdminClient } from './supabase-admin-client'
import { toSafeOperationalError } from './security/safe-operational-error'

// The in-memory store is a development fallback. Public production endpoints opt
// into the atomic Supabase limiter with distributedScope.
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
  distributedScope?: EnquiryRateLimitScope
}

interface RateLimitResult {
  rateLimited: boolean
  remaining: number
  resetTime: number
}

const isSupabaseRateLimitConfigured = () =>
  Boolean(
    process.env.SUPABASE_URL?.trim() &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  )

const createRateLimitExceededResponse = (
  result: EnquiryRateLimitResult
) => applyEnquiryRateLimitHeaders(
  NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      resetTime: result.retryAfterSeconds
    },
    { status: 429 }
  ),
  result
)

const createRateLimitUnavailableResponse = () => NextResponse.json(
  {
    error: 'Service temporarily unavailable',
    message: 'We could not safely process this request. Please try again shortly.'
  },
  {
    status: 503,
    headers: {
      'Retry-After': '60'
    }
  }
)

const checkDistributedRateLimit = async (
  request: NextRequest,
  options: RateLimitOptions
) => {
  const maxRequests = options.maxRequests || 10
  const windowMs = options.windowMs || 60 * 1000

  if (!options.distributedScope) {
    return null
  }

  if (!isSupabaseRateLimitConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('Distributed rate limiter is not configured', {
        operation: `rate_limit.${options.distributedScope}.take`,
        code: 'DISTRIBUTED_LIMITER_NOT_CONFIGURED'
      })
      return createRateLimitUnavailableResponse()
    }

    return null
  }

  try {
    const result = await takeEnquiryRateLimit(getSupabaseAdminClient(), {
      scope: options.distributedScope,
      identifier: getEnquiryRateLimitIdentifier(request),
      maxRequests,
      windowMs
    })

    if (result.rateLimited) {
      return createRateLimitExceededResponse(result)
    }

    return result
  } catch (error) {
    logger.error('Distributed rate limiter failed', {
      operation: `rate_limit.${options.distributedScope}.take`,
      ...toSafeOperationalError(error)
    })
    return createRateLimitUnavailableResponse()
  }
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

    const distributedResult = await checkDistributedRateLimit(request, options)

    if (distributedResult instanceof NextResponse) {
      return distributedResult
    }

    if (distributedResult) {
      const response = await handler(request)
      return applyEnquiryRateLimitHeaders(response, distributedResult)
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

