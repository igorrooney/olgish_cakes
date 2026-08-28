const safeCodePattern = /^[A-Za-z0-9_.-]{1,64}$/

export interface SafeOperationalError {
  code: string
  status?: number
}

const readRecordValue = (
  value: unknown,
  key: string
): unknown => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  return (value as Record<string, unknown>)[key]
}

const normalizeCode = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }

  const code = value.trim()
  return safeCodePattern.test(code) ? code : null
}

const normalizeStatus = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return undefined
  }

  return value >= 400 && value <= 599 ? value : undefined
}

export function toSafeOperationalError(error: unknown): SafeOperationalError {
  const status =
    normalizeStatus(readRecordValue(error, 'status')) ??
    normalizeStatus(readRecordValue(error, 'statusCode'))
  const code =
    normalizeCode(readRecordValue(error, 'code')) ??
    (error instanceof DOMException && error.name === 'AbortError'
      ? 'REQUEST_ABORTED'
      : null) ??
    (error instanceof TypeError ? 'TYPE_ERROR' : null) ??
    'OPERATION_FAILED'

  return {
    code,
    ...(status ? { status } : {})
  }
}
