const DEFAULT_ALERT_WINDOW_DAYS = 10
const MAX_ALERT_WINDOW_DAYS = 60
const MIN_ALERT_WINDOW_DAYS = 1
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000
const REMINDER_TIME_ZONE = 'Europe/London'
const reminderDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: REMINDER_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

export interface InstagramTokenReminderStatus {
  alertWindowDays: number
  daysRemaining: number
  expiresAt: string
  isExpired: boolean
  shouldNotify: boolean
}

const getCalendarDayNumber = (value: Date): number => {
  const dateParts = reminderDateFormatter.formatToParts(value)
  const year = Number(dateParts.find(part => part.type === 'year')?.value)
  const month = Number(dateParts.find(part => part.type === 'month')?.value)
  const day = Number(dateParts.find(part => part.type === 'day')?.value)

  return Date.UTC(year, month - 1, day) / MILLISECONDS_IN_DAY
}

export function getInstagramTokenAlertWindowDays(env: NodeJS.ProcessEnv): number {
  const rawValue = env.INSTAGRAM_TOKEN_ALERT_WINDOW_DAYS?.trim()
  const parsedValue = Number.parseInt(rawValue ?? '', 10)

  if (!Number.isFinite(parsedValue)) {
    return DEFAULT_ALERT_WINDOW_DAYS
  }

  return Math.min(MAX_ALERT_WINDOW_DAYS, Math.max(MIN_ALERT_WINDOW_DAYS, parsedValue))
}

export function getInstagramTokenExpiresAt(env: NodeJS.ProcessEnv): string {
  const rawValue = env.INSTAGRAM_TOKEN_EXPIRES_AT?.trim()

  if (!rawValue) {
    throw new Error('Missing INSTAGRAM_TOKEN_EXPIRES_AT')
  }

  const expiresAt = new Date(rawValue)

  if (Number.isNaN(expiresAt.getTime())) {
    throw new Error('INSTAGRAM_TOKEN_EXPIRES_AT must be a valid ISO-8601 date')
  }

  return expiresAt.toISOString()
}

export function getInstagramTokenReminderStatus({
  alertWindowDays,
  expiresAt,
  now = new Date()
}: {
  alertWindowDays: number
  expiresAt: string
  now?: Date
}): InstagramTokenReminderStatus {
  const expiresAtDate = new Date(expiresAt)

  if (Number.isNaN(expiresAtDate.getTime())) {
    throw new Error('expiresAt must be a valid ISO-8601 date')
  }

  const millisecondsRemaining = expiresAtDate.getTime() - now.getTime()
  const isExpired = millisecondsRemaining <= 0
  const daysRemaining = isExpired
    ? 0
    : Math.max(0, getCalendarDayNumber(expiresAtDate) - getCalendarDayNumber(now))

  return {
    alertWindowDays,
    daysRemaining,
    expiresAt: expiresAtDate.toISOString(),
    isExpired,
    shouldNotify: isExpired || daysRemaining <= alertWindowDays
  }
}
