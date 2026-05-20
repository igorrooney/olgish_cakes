export {
  isCsrfTokenLoadError,
  csrfTokenQueryKey,
  csrfTokenStaleTimeMs,
  fetchCsrfToken
} from './csrfToken'

export type CustomCakeEnquirySubmission = {
  fullName: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postcode?: string
  occasion?: string
  date: string
  requirements?: string
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

export const customCakeEnquiryContactFallback =
  'Please try again, or contact me directly at hello@olgishcakes.co.uk or +44 786 721 8194.'
export const customCakeEnquiryFallbackErrorMessage =
  `Something went wrong while sending your enquiry. ${customCakeEnquiryContactFallback}`
const maskedServerErrorMessages = new Set([
  'Enquiry saved but all operator notifications failed. Please contact Olgish Cakes directly.'
])

export const withCustomCakeEnquiryContactFallback = (message: string) => {
  const trimmedMessage = message.trim()

  if (trimmedMessage.length === 0) {
    return customCakeEnquiryFallbackErrorMessage
  }

  if (trimmedMessage.includes(customCakeEnquiryContactFallback)) {
    return trimmedMessage
  }

  return `${trimmedMessage} ${customCakeEnquiryContactFallback}`
}

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

export const buildCustomCakeEnquiryFormData = (
  values: CustomCakeEnquirySubmission,
  referenceImage?: File | null
) => {
  const submissionData = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === 'string' && value.length > 0) {
      submissionData.append(key, value)
    }
  })
  if (referenceImage) {
    submissionData.append('referenceImage', referenceImage)
  }
  return submissionData
}

export const submitCustomCakeEnquiry = async (
  submissionData: FormData,
  signal?: AbortSignal
) => {
  const response = await fetch('/api/custom-cake-enquiry', {
    method: 'POST',
    body: submissionData,
    credentials: 'same-origin',
    signal
  })

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as ErrorResponse
    if (errorData.error === 'Validation failed' && errorData.details) {
      const fieldErrors: Record<string, string> = {}
      errorData.details.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message
        }
      })
      throw createSubmissionError('Validation failed. Please check the form fields.', fieldErrors)
    }

    const serverErrorMessage = getServerErrorMessage(errorData.error)

    throw new Error(
      serverErrorMessage
        ? withCustomCakeEnquiryContactFallback(serverErrorMessage)
        : customCakeEnquiryFallbackErrorMessage
    )
  }

  return (await response.json().catch(() => ({}))) as Record<string, unknown>
}
