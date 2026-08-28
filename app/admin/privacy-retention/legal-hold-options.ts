import type { PrivacyRetentionHoldReason } from '@/lib/privacy-retention/types'

export const privacyRetentionHoldReasons: Array<{
  value: PrivacyRetentionHoldReason
  label: string
}> = [
  { value: 'active-complaint', label: 'Active complaint or dispute' },
  { value: 'legal-claim', label: 'Active or anticipated legal claim' },
  { value: 'regulatory-request', label: 'Regulatory or law-enforcement request' },
  { value: 'fraud-investigation', label: 'Fraud or security investigation' },
  { value: 'other-necessary-hold', label: 'Other documented necessary hold' }
]

export const formatPrivacyRetentionHoldDate = (value?: string) => {
  if (!value) {
    return 'Not recorded'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const getUkCalendarDate = (value: Date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(value)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export const getTomorrowInUk = () => {
  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  return getUkCalendarDate(tomorrow)
}
