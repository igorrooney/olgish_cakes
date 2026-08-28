const londonDateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

export const getTodayDateInputValue = (baseDate = new Date()) => {
  const dateParts = londonDateFormatter.formatToParts(baseDate)
  const year = dateParts.find((part) => part.type === 'year')?.value
  const month = dateParts.find((part) => part.type === 'month')?.value
  const day = dateParts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('Failed to format London date parts')
  }

  return `${year}-${month}-${day}`
}

export const dateMinErrorMessage = 'Please select today or a future date'

export const isDateOnOrAfterToday = (value: string, todayDate = getTodayDateInputValue()) => {
  if (!value) {
    return true
  }
  return value >= todayDate
}

export type FormValues = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  postcode: string
  occasion?: string
  date: string
  requirements?: string
  dietaryHealthInformation: string
  dietaryHealthConsent: boolean
}

const referenceImageConfig = {
  acceptedTypes: ['image/jpeg', 'image/png', 'image/heic'],
  maxBytes: 5 * 1024 * 1024
}

export const referenceImageAccept = referenceImageConfig.acceptedTypes.join(',')

export const formFieldOrder = [
  'fullName',
  'email',
  'phone',
  'recipientName',
  'address',
  'city',
  'postcode',
  'occasion',
  'date',
  'requirements',
  'dietaryHealthInformation',
  'dietaryHealthConsent',
  'giftNote',
  'referenceImage'
] as const

export const getReferenceImageError = (file: File | null) => {
  if (!file) {
    return null
  }

  if (!referenceImageConfig.acceptedTypes.includes(file.type)) {
    return 'Image must be a JPEG, PNG, or HEIC file'
  }

  if (file.size > referenceImageConfig.maxBytes) {
    return 'Image must be 5MB or smaller'
  }

  return null
}

