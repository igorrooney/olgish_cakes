export {
  isCsrfTokenLoadError,
  csrfTokenQueryKey,
  csrfTokenStaleTimeMs,
  fetchCsrfToken
} from '@/app/services/csrfToken'

export type ContactPageEnquirySubmission = {
  name: string
  email: string
  phone?: string
  cakeInterest: string
  message: string
  dateNeeded?: string
  referrer: string
}

export type SubmissionError = Error & {
  fieldErrors?: Record<string, string>
}

type ValidationErrorDetail = {
  path?: (string | number)[]
  message?: string
}

type ErrorResponse = {
  error?: string
  details?: ValidationErrorDetail[] | string
}

const fallbackErrorMessage =
  'Something went wrong while sending your message. Please try again, or contact me directly at hello@olgishcakes.co.uk or +44 786 721 8194.'

const maskedServerErrorMessages = new Set([
  'Failed to send email'
])

const fieldNameMap: Record<string, string> = {
  cakeInterest: 'enquiryType'
}

const createSubmissionError = (message: string, fieldErrors?: Record<string, string>) => {
  const error = new Error(message) as SubmissionError

  if (fieldErrors) {
    error.fieldErrors = fieldErrors
  }

  return error
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

const parseValidationDetailArray = (details: ValidationErrorDetail[]) => {
  const fieldErrors: Record<string, string> = {}

  details.forEach((detail) => {
    const pathValue = detail.path?.[0]
    const message = detail.message?.trim()

    if (!pathValue || !message) {
      return
    }

    const resolvedFieldName = fieldNameMap[pathValue.toString()] || pathValue.toString()
    fieldErrors[resolvedFieldName] = message
  })

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined
}

const parseValidationDetailString = (details: string) => {
  const matches = [...details.matchAll(/([a-zA-Z]+): /g)]

  if (matches.length === 0) {
    return undefined
  }

  const fieldErrors: Record<string, string> = {}

  matches.forEach((match, index) => {
    const fieldName = match[1]
    const messageStartIndex = (match.index || 0) + match[0].length
    const messageEndIndex = index + 1 < matches.length
      ? (matches[index + 1].index || details.length)
      : details.length
    const message = details
      .slice(messageStartIndex, messageEndIndex)
      .replace(/,\s*$/, '')
      .trim()

    if (message.length === 0) {
      return
    }

    fieldErrors[fieldNameMap[fieldName] || fieldName] = message
  })

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined
}

const parseValidationDetails = (details: ErrorResponse['details']) => {
  if (Array.isArray(details)) {
    return parseValidationDetailArray(details)
  }

  if (typeof details === 'string') {
    return parseValidationDetailString(details)
  }

  return undefined
}

export const isSubmissionError = (error: unknown): error is SubmissionError =>
  typeof error === 'object' && error !== null && 'fieldErrors' in error

export const buildContactPageEnquiryFormData = (values: ContactPageEnquirySubmission) => {
  const submissionData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === 'string' && value.length > 0) {
      submissionData.append(key, value)
    }
  })

  return submissionData
}

export const submitContactPageEnquiry = async (
  submissionData: FormData,
  signal?: AbortSignal
) => {
  const response = await fetch('/api/contact', {
    method: 'POST',
    body: submissionData,
    credentials: 'same-origin',
    signal
  })

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as ErrorResponse

    if (errorData.error === 'Validation failed') {
      const fieldErrors = parseValidationDetails(errorData.details)

      throw createSubmissionError(
        'Validation failed. Please check the form fields.',
        fieldErrors
      )
    }

    throw new Error(getServerErrorMessage(errorData.error) ?? fallbackErrorMessage)
  }

  return (await response.json().catch(() => ({}))) as Record<string, unknown>
}
