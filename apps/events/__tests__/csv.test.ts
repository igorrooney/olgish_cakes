import { describe, expect, it } from 'vitest'

import { buildKlaviyoCsv } from '@/lib/csv'

describe('Klaviyo CSV export', () => {
  it('exports only Email and Name columns', () => {
    const csv = buildKlaviyoCsv([
      {
        email: 'customer@example.com',
        full_name: 'Olga Customer'
      }
    ])

    expect(csv).toBe('Email,Name\r\ncustomer@example.com,Olga Customer\r\n')
  })

  it('escapes names and emails safely', () => {
    const csv = buildKlaviyoCsv([
      {
        email: 'quoted@example.com',
        full_name: 'Olga "Cake", Leeds'
      }
    ])

    expect(csv).toContain('"Olga ""Cake"", Leeds"')
  })
})
