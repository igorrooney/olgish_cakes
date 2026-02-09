import { z } from 'zod'

export const getTodayDateInputValue = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const dateMinErrorMessage = 'Please select today or a future date'

export const isDateOnOrAfterToday = (value: string) => {
  if (!value) {
    return true
  }
  return value >= getTodayDateInputValue()
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
