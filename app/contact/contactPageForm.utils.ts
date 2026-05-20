import { z } from 'zod'
import { getTodayDateInputValue, isDateOnOrAfterToday } from '../components/homepage/mobileForm.utils'
import type { ContactPageEnquirySubmission } from './contactPageEnquiry'

type ChoiceOption = {
  label: string
  value: string
  disabled?: boolean
}

const dateMinErrorMessage = 'Please select today or a future date'

function validateUKPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '')

  if (cleaned.startsWith('+44')) {
    return /^\+44[1-9]\d{8,9}$/.test(cleaned)
  }

  if (cleaned.startsWith('0044')) {
    return /^0044[1-9]\d{8,9}$/.test(cleaned)
  }

  if (cleaned.startsWith('0')) {
    return /^0[1-9]\d{8,9}$/.test(cleaned)
  }

  return false
}

const requiredEmailSchema = z
  .string()
  .trim()
  .min(1, 'Please add an email address')
  .pipe(z.string().email('Invalid email address'))

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(20, 'Phone number must not exceed 20 characters')
  .superRefine((value, context) => {
    if (value.length === 0) {
      return
    }

    if (value.length < 10) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone number must be at least 10 digits'
      })
      return
    }

    if (!validateUKPhone(value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a valid UK phone number (e.g., +44 7911 123456 or 07911 123456)'
      })
    }
  })

export const enquiryTypeOptions: ChoiceOption[] = [
  { label: 'Select from list', value: '', disabled: true },
  { label: 'Custom cake question', value: 'Custom cake question' },
  { label: 'Cakes by post or delivery', value: 'Cakes by post or delivery' },
  { label: 'Workshop question', value: 'Workshop question' },
  { label: 'General question', value: 'General question' }
]

export const contactPageFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: requiredEmailSchema,
  phone: optionalPhoneSchema,
  enquiryType: z.string().trim().min(1, 'Please choose the kind of question'),
  dateNeeded: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isDateOnOrAfterToday(value), {
      message: dateMinErrorMessage
    }),
  message: z.string().trim().min(12, 'Please add a little more detail').max(2000),
  csrfToken: z.string().min(1, 'CSRF token is required')
})

export type ContactPageFormValues = {
  name: string
  email: string
  phone: string
  enquiryType: string
  dateNeeded: string
  message: string
}

export const getContactPageInitialValues: ContactPageFormValues = {
  name: '',
  email: '',
  phone: '',
  enquiryType: '',
  dateNeeded: '',
  message: ''
}

export const getContactPageFieldOrder = [
  'name',
  'email',
  'phone',
  'enquiryType',
  'dateNeeded',
  'message'
] as const

export const getContactPageMinDate = () => getTodayDateInputValue()

export const buildContactPageSubmission = (
  values: ContactPageFormValues,
  csrfToken: string
): ContactPageEnquirySubmission & { csrfToken: string } => ({
  name: values.name.trim(),
  email: values.email.trim(),
  phone: values.phone.trim() || undefined,
  cakeInterest: values.enquiryType.trim(),
  message: values.message.trim(),
  dateNeeded: values.dateNeeded.trim() || undefined,
  referrer: '/contact',
  csrfToken
})
