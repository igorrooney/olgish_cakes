export const SUCCESS_REQUEST_ID_PARAM = 'requestId'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function parseSuccessRequestId(value: string | string[] | undefined): string | null {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    return null
  }

  return value
}

export function buildSuccessPath(requestId: string): string {
  return `/success?${SUCCESS_REQUEST_ID_PARAM}=${encodeURIComponent(requestId)}`
}
