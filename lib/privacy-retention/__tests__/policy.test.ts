/**
 * @jest-environment node
 */

import {
  addCalendarMonths,
  calculateOrderFinancialYearEnd,
  calculateOrderRetentionDueAt,
  isPrivacyRetentionHoldReason,
  privacyRetentionCategories,
  subtractCalendarDays,
  subtractCalendarMonths
} from '../policy'

describe('privacy retention calendar policy', () => {
  it('subtracts calendar days without mutating the source date', () => {
    const source = new Date('2026-03-01T10:20:30.456Z')

    expect(subtractCalendarDays(source, 1).toISOString())
      .toBe('2026-02-28T10:20:30.456Z')
    expect(source.toISOString()).toBe('2026-03-01T10:20:30.456Z')
  })

  it.each([
    ['2024-01-31T10:20:30.456Z', 1, '2024-02-29T10:20:30.456Z'],
    ['2025-01-31T10:20:30.456Z', 1, '2025-02-28T10:20:30.456Z'],
    ['2024-02-29T10:20:30.456Z', 12, '2025-02-28T10:20:30.456Z'],
    ['2026-08-31T10:20:30.456Z', 6, '2027-02-28T10:20:30.456Z'],
    ['2026-11-30T10:20:30.456Z', 3, '2027-02-28T10:20:30.456Z']
  ])('adds calendar months and clamps month end: %s + %i', (source, months, expected) => {
    expect(addCalendarMonths(new Date(source), months).toISOString()).toBe(expected)
  })

  it.each([
    ['2024-03-31T10:20:30.456Z', 1, '2024-02-29T10:20:30.456Z'],
    ['2025-03-31T10:20:30.456Z', 1, '2025-02-28T10:20:30.456Z'],
    ['2026-01-31T10:20:30.456Z', 2, '2025-11-30T10:20:30.456Z']
  ])('subtracts calendar months and clamps month end: %s - %i', (source, months, expected) => {
    expect(subtractCalendarMonths(new Date(source), months).toISOString()).toBe(expected)
  })

  it.each([
    ['2026-04-04T23:00:00.000Z', '2026-04-05'],
    ['2026-04-05T22:59:59.999Z', '2026-04-05'],
    ['2026-04-05T23:00:00.000Z', '2027-04-05'],
    ['2026-04-06T11:00:00.000Z', '2027-04-05']
  ])('uses the UK-local 5 April boundary for %s', (completedAt, expected) => {
    expect(calculateOrderFinancialYearEnd(new Date(completedAt))).toBe(expected)
  })

  it('returns the six-year deadline at the start of the UK calendar day', () => {
    expect(calculateOrderRetentionDueAt('2026-04-05'))
      .toBe('2032-04-05T23:00:00.000Z')
  })

  it('clamps leap day before adding the final calendar day', () => {
    expect(calculateOrderRetentionDueAt('2024-02-29', 1))
      .toBe('2025-03-01T00:00:00.000Z')
  })

  it.each([
    ['not-a-date', 6],
    ['2026-2-05', 6],
    ['2026-02-30', 6],
    ['2026-13-01', 6],
    ['2026-04-05', -1],
    ['2026-04-05', 1.5]
  ])('rejects invalid retention date input %s / %s', (value, years) => {
    expect(() => calculateOrderRetentionDueAt(value, years))
      .toThrow('Invalid financial year end date')
  })

  it('rejects invalid completion and financial-year dates', () => {
    expect(() => calculateOrderFinancialYearEnd(new Date('invalid')))
      .toThrow('Invalid completed-at date')
    expect(() => calculateOrderFinancialYearEnd(
      new Date('2026-01-01T00:00:00.000Z'),
      2,
      30
    )).toThrow('Invalid financial year end date')
  })

  it('keeps retention category IDs unique and hold reasons allowlisted', () => {
    const categoryIds = privacyRetentionCategories.map(({ id }) => id)
    expect(new Set(categoryIds).size).toBe(categoryIds.length)
    expect(isPrivacyRetentionHoldReason('legal-claim')).toBe(true)
    expect(isPrivacyRetentionHoldReason('customer-request')).toBe(false)
    expect(isPrivacyRetentionHoldReason('__proto__')).toBe(false)
  })
})
