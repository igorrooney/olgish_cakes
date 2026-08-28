/**
 * @jest-environment node
 */
import { NextResponse } from 'next/server'
import {
  applyEnquiryRateLimitHeaders,
  getEnquiryRateLimitIdentifier,
  takeEnquiryRateLimit
} from '../enquiry-rate-limit'

type RpcArgs = Record<string, unknown>

type CounterRecord = {
  count: number
  windowStartMs: number
}

function createFakeRateLimitClient() {
  const counters = new Map<string, CounterRecord>()

  const rpc = jest.fn(async (fn: string, args: RpcArgs) => {
    if (fn === 'take_enquiry_rate_limit') {
      const scope = String(args.p_scope)
      const identifier = String(args.p_identifier)
      const windowSeconds = Number(args.p_window_seconds)
      const maxRequests = Number(args.p_max_requests)
      const nowMs = Date.parse(String(args.p_now))
      const windowStartMs = Math.floor(nowMs / (windowSeconds * 1000)) * windowSeconds * 1000
      const resetAtMs = windowStartMs + windowSeconds * 1000
      const key = `${scope}:${identifier}:${windowStartMs}`
      const current = counters.get(key)
      const nextCount = (current?.count ?? 0) + 1

      counters.set(key, {
        count: nextCount,
        windowStartMs
      })

      return {
        data: [{
          allowed: nextCount <= maxRequests,
          current_count: nextCount,
          remaining: Math.max(maxRequests - nextCount, 0),
          reset_at: new Date(resetAtMs).toISOString(),
          retry_after_seconds: Math.max(Math.ceil((resetAtMs - nowMs) / 1000), 0)
        }],
        error: null
      }
    }

    return {
      data: null,
      error: { message: `Unexpected RPC: ${fn}` }
    }
  })

  return { counters, rpc }
}

describe('enquiry-rate-limit', () => {
  it('prefers platform and proxy-controlled IP headers', () => {
    const identifier = getEnquiryRateLimitIdentifier({
      headers: new Headers({
        'x-vercel-forwarded-for': '203.0.113.10, 203.0.113.11',
        'x-forwarded-for': '10.0.0.1, 192.168.0.1',
        'x-real-ip': '127.0.0.1'
      })
    })

    expect(identifier).toBe('203.0.113.10')
  })

  it('falls back through x-real-ip, x-forwarded-for and unknown', () => {
    const realIpIdentifier = getEnquiryRateLimitIdentifier({
      headers: new Headers({
        'x-real-ip': '127.0.0.1'
      })
    })
    const forwardedIdentifier = getEnquiryRateLimitIdentifier({
      headers: new Headers({
        'x-forwarded-for': '10.0.0.1, 192.168.0.1'
      })
    })
    const unknownIdentifier = getEnquiryRateLimitIdentifier({
      headers: new Headers()
    })

    expect(realIpIdentifier).toBe('127.0.0.1')
    expect(forwardedIdentifier).toBe('10.0.0.1')
    expect(unknownIdentifier).toBe('unknown')
  })

  it('tracks repeated requests within the same fixed window', async () => {
    const client = createFakeRateLimitClient()
    const now = Date.parse('2026-12-25T09:59:10.000Z')

    const first = await takeEnquiryRateLimit(client, {
      scope: 'workshop-enquiry',
      identifier: '10.0.0.2',
      maxRequests: 5,
      windowMs: 60000,
      now
    })
    const second = await takeEnquiryRateLimit(client, {
      scope: 'workshop-enquiry',
      identifier: '10.0.0.2',
      maxRequests: 5,
      windowMs: 60000,
      now: now + 5000
    })

    expect(first.currentCount).toBe(1)
    expect(first.remaining).toBe(4)
    expect(first.rateLimited).toBe(false)
    expect(second.currentCount).toBe(2)
    expect(second.remaining).toBe(3)
    expect(second.rateLimited).toBe(false)
  })

  it('marks requests over the limit as rate limited', async () => {
    const client = createFakeRateLimitClient()
    const now = Date.parse('2026-12-25T09:59:10.000Z')
    let result = null

    for (let index = 0; index < 6; index += 1) {
      result = await takeEnquiryRateLimit(client, {
        scope: 'workshop-enquiry',
        identifier: '10.0.0.3',
        maxRequests: 5,
        windowMs: 60000,
        now
      })
    }

    expect(result).toMatchObject({
      currentCount: 6,
      remaining: 0,
      rateLimited: true
    })
  })

  it('keeps counters separate by scope', async () => {
    const client = createFakeRateLimitClient()
    const now = Date.parse('2026-12-25T09:59:10.000Z')

    for (let index = 0; index < 5; index += 1) {
      await takeEnquiryRateLimit(client, {
        scope: 'workshop-enquiry',
        identifier: '10.0.0.4',
        maxRequests: 5,
        windowMs: 60000,
        now
      })
    }

    const otherScope = await takeEnquiryRateLimit(client, {
      scope: 'custom-cake-enquiry',
      identifier: '10.0.0.4',
      maxRequests: 5,
      windowMs: 60000,
      now
    })

    expect(otherScope.currentCount).toBe(1)
    expect(otherScope.remaining).toBe(4)
    expect(otherScope.rateLimited).toBe(false)
  })

  it('starts a fresh counter when the window rolls over', async () => {
    const client = createFakeRateLimitClient()

    const endOfWindow = await takeEnquiryRateLimit(client, {
      scope: 'workshop-enquiry',
      identifier: '10.0.0.5',
      maxRequests: 5,
      windowMs: 60000,
      now: Date.parse('2026-12-25T09:59:59.000Z')
    })
    const nextWindow = await takeEnquiryRateLimit(client, {
      scope: 'workshop-enquiry',
      identifier: '10.0.0.5',
      maxRequests: 5,
      windowMs: 60000,
      now: Date.parse('2026-12-25T10:00:01.000Z')
    })

    expect(endOfWindow.currentCount).toBe(1)
    expect(nextWindow.currentCount).toBe(1)
    expect(nextWindow.remaining).toBe(4)
  })

  it('applies standard rate limit headers to responses', () => {
    const response = applyEnquiryRateLimitHeaders(
      NextResponse.json({ ok: true }),
      {
        limit: 5,
        currentCount: 6,
        remaining: 0,
        resetAt: Date.parse('2026-12-25T10:00:00.000Z'),
        retryAfterSeconds: 60,
        rateLimited: true
      }
    )

    expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
    expect(response.headers.get('X-RateLimit-Reset')).toBe('1798192800')
    expect(response.headers.get('Retry-After')).toBe('60')
  })
})
