import { beforeEach, describe, expect, it, vi } from 'vitest'

interface StoredAdminLoginAttempt {
  key_hash: string
  failed_at: string
}

const state = vi.hoisted(() => ({
  attempts: [] as StoredAdminLoginAttempt[]
}))

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table !== 'admin_login_attempts') {
        throw new Error(`Unexpected table: ${table}`)
      }

      return {
        select: () => ({
          eq: (_column: string, keyHash: string) => ({
            gte: (_columnName: string, cutoffIso: string) => ({
              order: () => ({
                limit: (limit: number) => Promise.resolve({
                  data: state.attempts
                    .filter((attempt) => (
                      attempt.key_hash === keyHash &&
                      attempt.failed_at >= cutoffIso
                    ))
                    .sort((left, right) => right.failed_at.localeCompare(left.failed_at))
                    .slice(0, limit),
                  error: null
                })
              })
            })
          })
        }),
        delete: () => ({
          eq: (_column: string, keyHash: string) => {
            const clearAll = () => {
              state.attempts = state.attempts.filter((attempt) => attempt.key_hash !== keyHash)
              return { error: null }
            }

            return {
              lt: (_columnName: string, cutoffIso: string) => {
                state.attempts = state.attempts.filter((attempt) => (
                  attempt.key_hash !== keyHash ||
                  attempt.failed_at >= cutoffIso
                ))

                return Promise.resolve({ error: null })
              },
              then: (
                onfulfilled?: ((value: { error: null }) => unknown) | null,
                onrejected?: ((reason: unknown) => unknown) | null
              ) => Promise.resolve(clearAll()).then(onfulfilled, onrejected)
            }
          }
        }),
        insert: (row: StoredAdminLoginAttempt) => {
          state.attempts.push(row)
          return Promise.resolve({ error: null })
        }
      }
    }
  })
}))

import {
  clearAdminLoginFailures,
  getAdminLoginThrottle,
  recordAdminLoginFailure
} from '@/lib/admin-auth'

describe('admin login throttling', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret-with-enough-length'
    state.attempts = []
  })

  it('locks after repeated failed attempts and can be cleared', async () => {
    const key = 'test-ip:admin-locks'
    const now = 1_000_000

    await clearAdminLoginFailures(key)

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await recordAdminLoginFailure(key, now + attempt)
    }

    expect((await getAdminLoginThrottle(key, now + 4)).isLocked).toBe(false)

    await recordAdminLoginFailure(key, now + 5)

    expect(await getAdminLoginThrottle(key, now + 6)).toMatchObject({
      isLocked: true,
      retryAfterSeconds: 900
    })

    await clearAdminLoginFailures(key)

    expect((await getAdminLoginThrottle(key, now + 7)).isLocked).toBe(false)
  })
})
