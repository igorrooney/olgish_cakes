import { z } from 'zod'
import { workshopEnquirySchema } from '@/lib/validation'
import type { WorkshopEnquirySubmission } from '@/app/services/workshopEnquiry'

type WorkshopChoiceOption = {
  label: string
  value: string
  disabled?: boolean
}

export const workshopEventTypeOptions: WorkshopChoiceOption[] = [
  { label: 'Select from list', value: '', disabled: true },
  { label: 'Corporate event', value: 'Corporate event' },
  { label: 'Team building', value: 'Team building' },
  { label: 'Birthday', value: 'Birthday' },
  { label: 'Hen party', value: 'Hen party' },
  { label: 'Private party', value: 'Private party' },
  { label: 'Other', value: 'Other' }
]

export type WorkshopEnquiryFormValues =
  Omit<z.infer<typeof workshopEnquirySchema>, 'csrfToken' | 'decorationTheme'> & {
    decorationTheme: string
  }

export const getWorkshopEnquiryInitialValues: WorkshopEnquiryFormValues = {
  fullName: '',
  email: '',
  phone: '',
  eventType: '',
  groupSize: '',
  location: '',
  preferredDate: '',
  decorationTheme: '',
  brief: ''
}

export const workshopEnquiryFieldOrder = [
  'fullName',
  'email',
  'phone',
  'eventType',
  'groupSize',
  'location',
  'preferredDate',
  'decorationTheme',
  'brief'
] as const

export const buildWorkshopEnquirySubmission = (
  values: WorkshopEnquiryFormValues,
  csrfToken: string
): WorkshopEnquirySubmission => ({
  fullName: values.fullName.trim(),
  email: values.email.trim(),
  phone: values.phone.trim() || undefined,
  eventType: values.eventType.trim(),
  groupSize: values.groupSize.trim(),
  location: values.location.trim(),
  preferredDate: values.preferredDate,
  decorationTheme: values.decorationTheme.trim() || undefined,
  brief: values.brief.trim(),
  csrfToken
})
