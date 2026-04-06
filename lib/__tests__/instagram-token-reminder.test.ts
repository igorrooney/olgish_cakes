/**
 * @jest-environment node
 */
import {
  getInstagramTokenAlertWindowDays,
  getInstagramTokenExpiresAt,
  getInstagramTokenReminderStatus
} from '../instagram-token-reminder'

describe('instagram-token-reminder', () => {
  it('defaults the alert window to 10 days and clamps the configured range', () => {
    expect(getInstagramTokenAlertWindowDays({})).toBe(10)
    expect(getInstagramTokenAlertWindowDays({ INSTAGRAM_TOKEN_ALERT_WINDOW_DAYS: '0' })).toBe(1)
    expect(getInstagramTokenAlertWindowDays({ INSTAGRAM_TOKEN_ALERT_WINDOW_DAYS: '90' })).toBe(60)
    expect(getInstagramTokenAlertWindowDays({ INSTAGRAM_TOKEN_ALERT_WINDOW_DAYS: '14' })).toBe(14)
  })

  it('parses the configured token expiry date', () => {
    expect(getInstagramTokenExpiresAt({
      INSTAGRAM_TOKEN_EXPIRES_AT: '2026-06-05T08:00:00.000Z'
    })).toBe('2026-06-05T08:00:00.000Z')
  })

  it('rejects missing or invalid token expiry values', () => {
    expect(() => getInstagramTokenExpiresAt({})).toThrow('Missing INSTAGRAM_TOKEN_EXPIRES_AT')
    expect(() => getInstagramTokenExpiresAt({
      INSTAGRAM_TOKEN_EXPIRES_AT: 'not-a-date'
    })).toThrow('INSTAGRAM_TOKEN_EXPIRES_AT must be a valid ISO-8601 date')
  })

  it('does not notify when the expiry is outside the alert window', () => {
    const status = getInstagramTokenReminderStatus({
      alertWindowDays: 10,
      expiresAt: '2026-06-05T08:00:00.000Z',
      now: new Date('2026-05-20T08:00:00.000Z')
    })

    expect(status).toEqual({
      alertWindowDays: 10,
      daysRemaining: 16,
      expiresAt: '2026-06-05T08:00:00.000Z',
      isExpired: false,
      shouldNotify: false
    })
  })

  it('notifies when the expiry falls within the alert window', () => {
    const status = getInstagramTokenReminderStatus({
      alertWindowDays: 10,
      expiresAt: '2026-06-05T08:00:00.000Z',
      now: new Date('2026-05-31T08:00:00.000Z')
    })

    expect(status).toEqual({
      alertWindowDays: 10,
      daysRemaining: 5,
      expiresAt: '2026-06-05T08:00:00.000Z',
      isExpired: false,
      shouldNotify: true
    })
  })

  it('treats tokens expiring later today as a same-day reminder', () => {
    const status = getInstagramTokenReminderStatus({
      alertWindowDays: 10,
      expiresAt: '2026-06-05T22:00:00.000Z',
      now: new Date('2026-06-05T00:30:00.000Z')
    })

    expect(status).toEqual({
      alertWindowDays: 10,
      daysRemaining: 0,
      expiresAt: '2026-06-05T22:00:00.000Z',
      isExpired: false,
      shouldNotify: true
    })
  })

  it('uses the next Europe/London calendar day for tomorrow reminders', () => {
    const status = getInstagramTokenReminderStatus({
      alertWindowDays: 10,
      expiresAt: '2026-06-06T00:30:00.000Z',
      now: new Date('2026-06-05T22:30:00.000Z')
    })

    expect(status).toEqual({
      alertWindowDays: 10,
      daysRemaining: 1,
      expiresAt: '2026-06-06T00:30:00.000Z',
      isExpired: false,
      shouldNotify: true
    })
  })

  it('marks the token as expired when the date has passed', () => {
    const status = getInstagramTokenReminderStatus({
      alertWindowDays: 10,
      expiresAt: '2026-06-05T08:00:00.000Z',
      now: new Date('2026-06-06T08:00:00.000Z')
    })

    expect(status).toEqual({
      alertWindowDays: 10,
      daysRemaining: 0,
      expiresAt: '2026-06-05T08:00:00.000Z',
      isExpired: true,
      shouldNotify: true
    })
  })
})
