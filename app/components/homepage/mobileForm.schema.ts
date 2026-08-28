import { z } from 'zod'
import {
  dateMinErrorMessage,
  isDateOnOrAfterToday
} from './mobileForm.utils'
import {
  addSensitiveDataConsentIssue,
  dietaryHealthConsentSchema,
  dietaryHealthInformationSchema
} from '@/lib/legal/sensitive-data-consent'

export const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().trim(),
  address: z.string().trim().max(500, 'Address must be 500 characters or fewer'),
  city: z.string().trim().max(100, 'City must be 100 characters or fewer'),
  postcode: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(value),
      'Invalid UK postcode'
    ),
  occasion: z.string().optional(),
  date: z
    .string()
    .min(1, 'Please select a date')
    .refine((value) => isDateOnOrAfterToday(value), {
      message: dateMinErrorMessage
    }),
  requirements: z.string().optional(),
  dietaryHealthInformation: dietaryHealthInformationSchema,
  dietaryHealthConsent: dietaryHealthConsentSchema,
  csrfToken: z.string().min(1, 'CSRF token is required')
}).superRefine((values, context) => {
  addSensitiveDataConsentIssue(values, context)
})
