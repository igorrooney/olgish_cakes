export type WorkshopEnquirySubmission = {
  fullName: string
  email: string
  phone?: string
  eventType: string
  groupSize: string
  location: string
  preferredDate: string
  decorationTheme?: string
  brief: string
  csrfToken: string
}

export type SubmissionError = Error & {
  fieldErrors?: Record<string, string>
}

type ValidationErrorDetail = {
  path: (string | number)[]
  message: string
}

type ErrorResponse = {
  error?: string
  details?: ValidationErrorDetail[]
}

const workshopFallbackErrorMessage =
  'Something went wrong while sending your workshop enquiry. Please try again, or contact me directly at hello@olgishcakes.co.uk or +44 786 721 8194.'
const maskedServerErrorMessages = new Set([
  'Enquiry saved but all operator notifications failed. Please contact Olgish Cakes directly.'
])

const getServerErrorMessage = (error: unknown) => {
  if (typeof error !== 'string') {
    return null
  }

  const trimmedError = error.trim()

  if (trimmedError.length === 0 || maskedServerErrorMessages.has(trimmedError)) {
    return null
  }

  return trimmedError
}

const createSubmissionError = (message: string, fieldErrors?: Record<string, string>) => {
  const error = new Error(message) as SubmissionError

  if (fieldErrors) {
    error.fieldErrors = fieldErrors
  }

  return error
}

export const isSubmissionError = (error: unknown): error is SubmissionError =>
  typeof error === 'object' && error !== null && 'fieldErrors' in error

export const fetchCsrfToken = async (signal?: AbortSignal) => {
  const response = await fetch('/api/csrf-token', { signal })

  if (!response.ok) {
    throw new Error('Failed to fetch CSRF token')
  }

  const data = (await response.json()) as { token?: string }

  if (!data.token) {
    throw new Error('Missing CSRF token')
  }

  return data.token
}

export const buildWorkshopEnquiryFormData = (values: WorkshopEnquirySubmission) => {
  const submissionData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === 'string' && value.length > 0) {
      submissionData.append(key, value)
    }
  })

  return submissionData
}

export const submitWorkshopEnquiry = async (
  submissionData: FormData,
  signal?: AbortSignal
) => {
  const response = await fetch('/api/workshop-enquiry', {
    method: 'POST',
    body: submissionData,
    credentials: 'same-origin',
    signal
  })

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as ErrorResponse

    if (errorData.error === 'Validation failed' && errorData.details) {
      const fieldErrors: Record<string, string> = {}

      errorData.details.forEach((detail) => {
        if (detail.path[0]) {
          fieldErrors[detail.path[0].toString()] = detail.message
        }
      })

      throw createSubmissionError(
        'Validation failed. Please check the form fields.',
        fieldErrors
      )
    }

    throw new Error(getServerErrorMessage(errorData.error) ?? workshopFallbackErrorMessage)
  }

  return (await response.json().catch(() => ({}))) as Record<string, unknown>
}
