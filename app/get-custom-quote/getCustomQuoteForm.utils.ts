import { type CustomCakeEnquirySubmission } from '../services/customCakeEnquiry'

type ChoiceOption = {
  label: string
  value: string
  disabled?: boolean
}

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

export type GetCustomQuoteFormValues = {
  fullName: string
  email: string
  phone: string
  occasion: string
  date: string
  servings: string
  brief: string
}

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
