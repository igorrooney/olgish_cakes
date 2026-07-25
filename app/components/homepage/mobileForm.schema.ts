import { z } from 'zod'
import {
  dateMinErrorMessage,
  isDateOnOrAfterToday
} from './mobileForm.utils'

export const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().trim(),
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
