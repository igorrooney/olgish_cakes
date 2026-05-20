import { describe, expect, it } from 'vitest'

import {
  clearAdminLoginFailures,
  getAdminLoginThrottle,
  recordAdminLoginFailure
} from '@/lib/admin-auth'

describe('admin login throttling', () => {
  it('locks after repeated failed attempts and can be cleared', () => {
    const key = 'test-ip:admin-locks'
    const now = 1_000_000

    clearAdminLoginFailures(key)

    for (let attempt = 0; attempt < 4; attempt += 1) {
      recordAdminLoginFailure(key, now + attempt)
    }

    expect(getAdminLoginThrottle(key, now + 4).isLocked).toBe(false)

    recordAdminLoginFailure(key, now + 5)

    expect(getAdminLoginThrottle(key, now + 6)).toMatchObject({
      isLocked: true,
      retryAfterSeconds: 900
    })

    clearAdminLoginFailures(key)

    expect(getAdminLoginThrottle(key, now + 7).isLocked).toBe(false)
  })
})
