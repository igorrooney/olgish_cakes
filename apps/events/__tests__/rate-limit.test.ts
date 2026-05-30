import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  PUBLIC_REQUEST_EMAIL_RATE_LIMIT_MAX,
  PUBLIC_UPLOAD_RATE_LIMIT_MAX
} from '@/lib/constants'

interface StoredPublicRateLimitAttempt {
  action: string
  key_hash: string
  attempted_at: string
}

const state = vi.hoisted(() => ({
  attempts: [] as StoredPublicRateLimitAttempt[]
}))

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table !== 'event_photo_rate_limit_attempts') {
        throw new Error(`Unexpected table: ${table}`)
      }

      return {
        delete: () => ({
          eq: (_actionColumn: string, action: string) => ({
            eq: (_keyColumn: string, keyHash: string) => ({
              lt: (_timeColumn: string, cutoffIso: string) => {
                state.attempts = state.attempts.filter((attempt) => (
                  attempt.action !== action ||
                  attempt.key_hash !== keyHash ||
                  attempt.attempted_at >= cutoffIso
                ))

                return Promise.resolve({ error: null })
              }
            })
          })
        }),
        select: () => ({
          eq: (_actionColumn: string, action: string) => ({
            eq: (_keyColumn: string, keyHash: string) => ({
              gte: (_timeColumn: string, cutoffIso: string) => ({
                order: () => ({
                  limit: (limit: number) => Promise.resolve({
                    data: state.attempts
                      .filter((attempt) => (
                        attempt.action === action &&
                        attempt.key_hash === keyHash &&
                        attempt.attempted_at >= cutoffIso
                      ))
                      .sort((left, right) => right.attempted_at.localeCompare(left.attempted_at))
                      .slice(0, limit),
                    error: null
                  })
                })
              })
            })
          })
        }),
        insert: (row: StoredPublicRateLimitAttempt) => {
          state.attempts.push(row)
          return Promise.resolve({ error: null })
        }
      }
    }
  })
}))

import {
  getPublicRateLimitIp,
  recordPublicRequestAttempt,
  recordPublicUploadAttempt
} from '@/lib/rate-limit'

function makeRequest(ipAddress: string): NextRequest {
  return new NextRequest('https://events.olgishcakes.co.uk/api/event-photo/uploads', {
    headers: {
      'x-forwarded-for': `${ipAddress}, 10.0.0.1`
    }
  })
}

describe('public event photo rate limiting', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret-with-enough-length'
    state.attempts = []
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses the first forwarded IP address', () => {
    expect(getPublicRateLimitIp(makeRequest('203.0.113.10'))).toBe('203.0.113.10')
  })

  it('limits signed upload URL requests by client IP', async () => {
    const request = makeRequest('203.0.113.20')

    for (let attempt = 0; attempt < PUBLIC_UPLOAD_RATE_LIMIT_MAX; attempt += 1) {
      await expect(recordPublicUploadAttempt(request)).resolves.toMatchObject({
        isLimited: false,
        retryAfterSeconds: 0
      })
    }

    await expect(recordPublicUploadAttempt(request)).resolves.toMatchObject({
      isLimited: true,
      retryAfterSeconds: 900
    })
  })

  it('limits final submissions by normalized email address', async () => {
    for (let attempt = 0; attempt < PUBLIC_REQUEST_EMAIL_RATE_LIMIT_MAX; attempt += 1) {
      await expect(
        recordPublicRequestAttempt(makeRequest(`203.0.113.${attempt + 30}`), 'Customer@Example.com')
      ).resolves.toMatchObject({
        isLimited: false,
        retryAfterSeconds: 0
      })
    }

    await expect(
      recordPublicRequestAttempt(makeRequest('203.0.113.50'), ' customer@example.com ')
    ).resolves.toMatchObject({
      isLimited: true,
      retryAfterSeconds: 3600
    })
  })
})
