import { describe, expect, it } from 'vitest'

import { formatDateTime } from '@/lib/format'

describe('formatDateTime', () => {
  it('formats timestamps in UK local time during daylight saving', () => {
    expect(formatDateTime('2026-05-20T12:34:00.000Z')).toContain('13:34')
  })
})
