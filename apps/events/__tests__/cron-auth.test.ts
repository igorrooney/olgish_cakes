import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it } from 'vitest'

import { isCleanupRequestAuthorized } from '@/app/api/cron/cleanup-event-photo-temp/route'

const originalCronSecret = process.env.CRON_SECRET

describe('cleanup cron authorization', () => {
  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret
  })

  it('accepts only the bearer token and rejects query string secrets', () => {
    process.env.CRON_SECRET = 'cleanup-secret'

    expect(isCleanupRequestAuthorized(new NextRequest(
      'https://events.olgishcakes.co.uk/api/cron/cleanup-event-photo-temp',
      {
        headers: {
          authorization: 'Bearer cleanup-secret'
        }
      }
    ))).toBe(true)

    expect(isCleanupRequestAuthorized(new NextRequest(
      'https://events.olgishcakes.co.uk/api/cron/cleanup-event-photo-temp?secret=cleanup-secret'
    ))).toBe(false)
  })
})
