import { z } from 'zod'

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

export const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  postcode: z
    .string()
    .regex(/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, 'Invalid UK postcode'),
  occasion: z.string().optional(),
  date: z
    .string()
    .min(1, 'Please select a date')
    .refine((value) => isDateOnOrAfterToday(value), {
      message: dateMinErrorMessage
    }),
  requirements: z.string().optional(),
  csrfToken: z.string().min(1, 'CSRF token is required')
})

export type FormValues = Omit<z.infer<typeof formSchema>, 'csrfToken'>

const referenceImageConfig = {
  acceptedTypes: ['image/jpeg', 'image/png', 'image/heic'],
  maxBytes: 5 * 1024 * 1024
}

export const referenceImageAccept = referenceImageConfig.acceptedTypes.join(',')

export const formFieldOrder = [
  'fullName',
  'email',
  'phone',
  'address',
  'city',
  'postcode',
  'occasion',
  'date',
  'requirements',
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

