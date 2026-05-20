import { z } from 'zod'
import { type CustomCakeEnquirySubmission } from '../services/customCakeEnquiry'
import {
  dateMinErrorMessage,
  isDateOnOrAfterToday
} from '../components/homepage/mobileForm.utils'

type ChoiceOption = {
  label: string
  value: string
  disabled?: boolean
}

const optionalTextSchema = z.string().trim()
const optionalEmailSchema = z.union([
  z.literal(''),
  z.string().trim().email('Invalid email address')
])

export const quoteCakeTypeOptions: ChoiceOption[] = [
  { label: 'Birthday cake', value: 'Birthday cake' },
  { label: 'Anniversary cake', value: 'Anniversary cake' },
  { label: 'Wedding cake', value: 'Wedding cake' },
  { label: 'Celebration cake', value: 'Celebration cake' },
  { label: 'Medovik or Ukrainian-style cake', value: 'Medovik or Ukrainian-style cake' },
  { label: 'Not sure yet', value: 'Not sure yet' }
]

export const quoteDesignStyleOptions: ChoiceOption[] = [
  { label: 'Clean and modern', value: 'Clean and modern' },
  { label: 'Elegant floral', value: 'Elegant floral' },
  { label: 'Playful party cake', value: 'Playful party cake' },
  { label: 'Minimal buttercream finish', value: 'Minimal buttercream finish' },
  { label: 'Traditional Ukrainian influence', value: 'Traditional Ukrainian influence' }
]

export const quoteBudgetOptions: ChoiceOption[] = [
  { label: 'Under \u00A3100', value: 'Under \u00A3100' },
  { label: '\u00A3100 to \u00A3200', value: '\u00A3100 to \u00A3200' },
  { label: '\u00A3200 to \u00A3350', value: '\u00A3200 to \u00A3350' },
  { label: '\u00A3350+', value: '\u00A3350+' },
  { label: 'Not sure yet', value: 'Not sure yet' }
]

export const quoteFulfilmentOptions: ChoiceOption[] = [
  { label: 'Collection from Leeds', value: 'Collection from Leeds' },
  { label: 'Local delivery', value: 'Local delivery' },
  { label: 'UK cakes by post if suitable', value: 'UK cakes by post if suitable' },
  { label: 'Not sure yet', value: 'Not sure yet' }
]

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
  csrfToken: z.string().min(1, 'CSRF token is required')
}).superRefine((values, ctx) => {
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

export type GetCustomQuoteFormValues = Omit<z.infer<typeof quoteFormSchema>, 'csrfToken'>

export const getCustomQuoteInitialValues: GetCustomQuoteFormValues = {
  fullName: '',
  email: '',
  phone: '',
  occasion: '',
  date: '',
  servings: '',
  brief: ''
}

export const getCustomQuoteFieldOrder = [
  'fullName',
  'email',
  'phone',
  'date',
  'servings',
  'occasion',
  'brief',
  'referenceImage'
] as const

const addBriefLine = (lines: string[], label: string, value?: string) => {
  const trimmedValue = value?.trim()
  if (!trimmedValue) {
    return
  }

  lines.push(`${label}: ${trimmedValue}`)
}

export const buildQuoteRequirements = (values: GetCustomQuoteFormValues) => {
  const lines = ['Quote brief']

  addBriefLine(lines, 'Occasion', values.occasion)
  addBriefLine(lines, 'Servings', values.servings)
  addBriefLine(lines, 'Brief', values.brief)

  return lines.join('\n')
}

export const buildGetCustomQuoteSubmission = (
  values: GetCustomQuoteFormValues,
  csrfToken: string
): CustomCakeEnquirySubmission => ({
  fullName: values.fullName.trim(),
  email: values.email.trim() || undefined,
  phone: values.phone.trim() || undefined,
  occasion: values.occasion.trim() || undefined,
  date: values.date,
  requirements: buildQuoteRequirements(values),
  csrfToken
})
