import type {
  PrivacyRetentionCategory,
  PrivacyRetentionHoldReason
} from './types'

export const PRIVACY_RETENTION_OWNER_LABEL =
  process.env.PRIVACY_RETENTION_OWNER_NAME?.trim() || 'Olga — Data Controller'

export const PRIVACY_RETENTION_REVIEW_MONTHS = 3
export const ENQUIRY_RETENTION_MONTHS = 24
export const UPLOAD_RETENTION_MONTHS = 24
export const ORDER_RETENTION_YEARS = 6
export const SECURITY_RECORD_RETENTION_DAYS = 90
export const PRIVACY_RETENTION_MAX_SELECTION = 100
export const PRIVACY_RETENTION_PAGE_SIZE = 50
export const PRIVACY_RETENTION_MAX_PAGE = 10000

export const privacyRetentionCategories: PrivacyRetentionCategory[] = [
  {
    id: 'expired-enquiry',
    label: 'Expired enquiries',
    description: 'Closed enquiries whose documented retention deadline has passed.'
  },
  {
    id: 'expired-enquiry-upload',
    label: 'Expired enquiry uploads',
    description: 'Customer reference uploads whose separate 24-month deadline has passed.'
  },
  {
    id: 'expired-order-upload',
    label: 'Expired order uploads',
    description: 'Order reference and note images due for removal while the core order record is retained.'
  },
  {
    id: 'expired-order',
    label: 'Expired order records',
    description: 'Order records beyond the six-year financial retention deadline and not under legal hold.'
  },
  {
    id: 'expired-health-information',
    label: 'Expired dietary-health information',
    description: 'Protected dietary-health information whose short operational retention deadline has passed.'
  },
  {
    id: 'expired-security-record',
    label: 'Expired security records',
    description: 'Rate-limit and login-attempt records older than 90 days.'
  }
]

export const privacyRetentionHoldLabels: Record<PrivacyRetentionHoldReason, string> = {
  'active-complaint': 'Active complaint',
  'legal-claim': 'Legal claim',
  'regulatory-request': 'Regulatory request',
  'fraud-investigation': 'Fraud investigation',
  'other-necessary-hold': 'Other necessary legal hold'
}

export const isPrivacyRetentionHoldReason = (
  value: string
): value is PrivacyRetentionHoldReason =>
  Object.prototype.hasOwnProperty.call(privacyRetentionHoldLabels, value)

export const subtractCalendarDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() - days)
  return result
}

const ukDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  calendar: 'iso8601',
  numberingSystem: 'latn',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

const ukDateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  calendar: 'iso8601',
  numberingSystem: 'latn',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
})

type CalendarDateParts = {
  year: number
  month: number
  day: number
}

type CalendarDateTimeParts = CalendarDateParts & {
  hour: number
  minute: number
  second: number
}

const getFormattedNumber = (
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): number => {
  const value = parts.find((part) => part.type === type)?.value
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN

  if (!Number.isInteger(parsed)) {
    throw new Error('Unable to resolve UK calendar date')
  }

  return parsed
}

const getUkDateParts = (date: Date): CalendarDateParts => {
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid completed-at date')
  }

  const parts = ukDateFormatter.formatToParts(date)
  return {
    year: getFormattedNumber(parts, 'year'),
    month: getFormattedNumber(parts, 'month'),
    day: getFormattedNumber(parts, 'day')
  }
}

const getUkDateTimeParts = (date: Date): CalendarDateTimeParts => {
  const parts = ukDateTimeFormatter.formatToParts(date)
  return {
    year: getFormattedNumber(parts, 'year'),
    month: getFormattedNumber(parts, 'month'),
    day: getFormattedNumber(parts, 'day'),
    hour: getFormattedNumber(parts, 'hour'),
    minute: getFormattedNumber(parts, 'minute'),
    second: getFormattedNumber(parts, 'second')
  }
}

const getDaysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate()

const isValidCalendarDate = ({
  year,
  month,
  day
}: CalendarDateParts): boolean =>
  Number.isInteger(year) &&
  year >= 1000 &&
  year <= 9999 &&
  Number.isInteger(month) &&
  month >= 1 &&
  month <= 12 &&
  Number.isInteger(day) &&
  day >= 1 &&
  day <= getDaysInMonth(year, month)

const toUkMidnight = ({ year, month, day }: CalendarDateParts): Date => {
  const targetAsUtc = Date.UTC(year, month - 1, day)
  let candidate = targetAsUtc

  // Resolve the Europe/London offset for the target date. Repeating makes this
  // reliable across daylight-saving transitions without relying on a fixed offset.
  for (let iteration = 0; iteration < 2; iteration += 1) {
    const observed = getUkDateTimeParts(new Date(candidate))
    const observedAsUtc = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
      observed.second
    )
    candidate += targetAsUtc - observedAsUtc
  }

  return new Date(candidate)
}

const shiftCalendarMonths = (date: Date, months: number): Date => {
  const result = new Date(date)
  const originalDay = result.getUTCDate()

  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + months)
  const lastDayOfTargetMonth = new Date(Date.UTC(
    result.getUTCFullYear(),
    result.getUTCMonth() + 1,
    0
  )).getUTCDate()
  result.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth))

  return result
}

export const subtractCalendarMonths = (date: Date, months: number): Date =>
  shiftCalendarMonths(date, -months)

export const addCalendarMonths = (date: Date, months: number): Date =>
  shiftCalendarMonths(date, months)

export const calculateOrderFinancialYearEnd = (
  completedAt: Date,
  financialYearEndMonth = 4,
  financialYearEndDay = 5
): string => {
  const completion = getUkDateParts(completedAt)
  const currentYearEnd = {
    year: completion.year,
    month: financialYearEndMonth,
    day: financialYearEndDay
  }

  if (!isValidCalendarDate(currentYearEnd)) {
    throw new Error('Invalid financial year end date')
  }

  const completedAfterYearEnd =
    completion.month > financialYearEndMonth ||
    (
      completion.month === financialYearEndMonth &&
      completion.day > financialYearEndDay
    )
  const year = completedAfterYearEnd ? completion.year + 1 : completion.year

  if (!isValidCalendarDate({ year, month: financialYearEndMonth, day: financialYearEndDay })) {
    throw new Error('Invalid financial year end date')
  }

  return [
    year.toString().padStart(4, '0'),
    financialYearEndMonth.toString().padStart(2, '0'),
    financialYearEndDay.toString().padStart(2, '0')
  ].join('-')
}

export const calculateOrderRetentionDueAt = (
  financialYearEndedAt: string,
  years = ORDER_RETENTION_YEARS
): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(financialYearEndedAt)
  const yearValue = match ? Number.parseInt(match[1], 10) : Number.NaN
  const monthValue = match ? Number.parseInt(match[2], 10) : Number.NaN
  const dayValue = match ? Number.parseInt(match[3], 10) : Number.NaN

  if (
    !isValidCalendarDate({ year: yearValue, month: monthValue, day: dayValue }) ||
    !Number.isInteger(years) ||
    years < 0
  ) {
    throw new Error('Invalid financial year end date')
  }

  const shiftedYear = yearValue + years
  if (shiftedYear > 9999) {
    throw new Error('Invalid financial year end date')
  }
  const shiftedDay = Math.min(dayValue, getDaysInMonth(shiftedYear, monthValue))
  const dayAfter = new Date(Date.UTC(shiftedYear, monthValue - 1, shiftedDay))
  dayAfter.setUTCDate(dayAfter.getUTCDate() + 1)

  return toUkMidnight({
    year: dayAfter.getUTCFullYear(),
    month: dayAfter.getUTCMonth() + 1,
    day: dayAfter.getUTCDate()
  }).toISOString()
}
