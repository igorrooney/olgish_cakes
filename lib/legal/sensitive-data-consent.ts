import { z } from 'zod'

export const SENSITIVE_DATA_CONSENT_VERSION = '2026-07-29'
export const sensitiveDataInformationField = 'dietaryHealthInformation'
export const sensitiveDataConsentField = 'dietaryHealthConsent'
export const sensitiveDataInformationMaxLength = 2000
export const sensitiveDataConsentRequiredMessage =
  'Please explicitly consent before sending health-related dietary information'
export const sensitiveDataConsentError = sensitiveDataConsentRequiredMessage

export const dietaryHealthInformationSchema = z
  .string()
  .trim()
  .max(
    sensitiveDataInformationMaxLength,
    `Health-related dietary information must be ${sensitiveDataInformationMaxLength} characters or fewer`
  )
  .optional()
  .default('')

export const dietaryHealthConsentSchema = z.boolean().optional().default(false)

type SensitiveDataConsentValues = {
  dietaryHealthInformation?: string
  dietaryHealthConsent?: boolean
}

export const addSensitiveDataConsentIssue = (
  values: SensitiveDataConsentValues,
  context: z.RefinementCtx
) => {
  const information = values.dietaryHealthInformation?.trim() ?? ''

  if (information.length > 0 && values.dietaryHealthConsent !== true) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [sensitiveDataConsentField],
      message: sensitiveDataConsentRequiredMessage
    })
  }
}

export const parseDietaryHealthConsent = (value: FormDataEntryValue | null) =>
  typeof value === 'string' && value === 'true'

export const createSensitiveDataConsentEvidence = (
  dietaryHealthInformation: string | undefined,
  dietaryHealthConsent: boolean
) => {
  const information = dietaryHealthInformation?.trim() ?? ''

  if (information.length === 0) {
    return {
      dietaryHealthInformation: null,
      dietaryHealthConsent: false,
      dietaryHealthConsentVersion: null,
      dietaryHealthConsentedAt: null
    }
  }

  if (dietaryHealthConsent !== true) {
    throw new Error(sensitiveDataConsentRequiredMessage)
  }

  return {
    dietaryHealthInformation: information,
    dietaryHealthConsent: true,
    dietaryHealthConsentVersion: SENSITIVE_DATA_CONSENT_VERSION,
    dietaryHealthConsentedAt: new Date().toISOString()
  }
}
