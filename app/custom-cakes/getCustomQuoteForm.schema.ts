import { z } from 'zod'
import {
  dateMinErrorMessage,
  isDateOnOrAfterToday
} from '../components/homepage/mobileForm.utils'
import {
  addSensitiveDataConsentIssue,
  dietaryHealthConsentSchema,
  dietaryHealthInformationSchema
} from '@/lib/legal/sensitive-data-consent'

const optionalTextSchema = z.string().trim()
const optionalEmailSchema = z.union([
  z.literal(''),
  z.string().trim().email('Invalid email address')
])

export const quoteFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: optionalEmailSchema,
  phone: optionalTextSchema,
  occasion: optionalTextSchema,
  date: z
    .string()
    .min(1, 'Please select a date')
    .refine((value) => isDateOnOrAfterToday(value), {
      message: dateMinErrorMessage
    }),
  servings: z.string().trim().min(1, 'Please add approximate servings'),
  brief: z.string().trim().min(8, 'Please add a few words about the cake'),
  dietaryHealthInformation: dietaryHealthInformationSchema,
  dietaryHealthConsent: dietaryHealthConsentSchema,
  csrfToken: z.string().min(1, 'CSRF token is required')
}).superRefine((values, ctx) => {
  addSensitiveDataConsentIssue(values, ctx)

  if (values.email.length > 0 || values.phone.length > 0) {
    return
  }

  const message = 'Add an email address or phone number'
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ['email'],
    message
  })
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ['phone'],
    message
  })
})
