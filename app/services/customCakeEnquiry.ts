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

const enquiryFallbackErrorMessage =
  'Something went wrong while sending your quote request. Please try again, or contact me directly at hello@olgishcakes.co.uk or +44 786 721 8194.'

const getServerErrorMessage = (error: unknown) => {
  if (typeof error !== 'string') {
    return null
  }

  const trimmedError = error.trim()

  return trimmedError.length > 0 ? trimmedError : null
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

    throw new Error(getServerErrorMessage(errorData.error) ?? enquiryFallbackErrorMessage)
  }

  return (await response.json().catch(() => ({}))) as Record<string, unknown>
}
