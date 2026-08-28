import {
  toSafeOperationalError,
  type SafeOperationalError
} from '@/lib/security/safe-operational-error'

export const safeEmailFailureMessage = 'Email delivery failed'

function readProviderErrorName(error: unknown): unknown {
  if (!error || typeof error !== 'object' || Array.isArray(error)) {
    return undefined
  }

  return (error as Record<string, unknown>).name
}

export function toSafeEmailProviderError(error: unknown): SafeOperationalError {
  const safeError = toSafeOperationalError(error)

  if (safeError.code !== 'OPERATION_FAILED') {
    return safeError
  }

  return toSafeOperationalError({
    code: readProviderErrorName(error),
    status: safeError.status
  })
}

export function createSafeEmailResultError(
  error: unknown,
  providerResponse = false
): { message: string, code: string, status?: number } {
  const safeError = providerResponse
    ? toSafeEmailProviderError(error)
    : toSafeOperationalError(error)

  return {
    message: safeEmailFailureMessage,
    ...safeError
  }
}

export function createSafeEmailException(error: unknown): Error & SafeOperationalError {
  const safeError = toSafeOperationalError(error)
  return Object.assign(new Error(safeEmailFailureMessage), safeError)
}
