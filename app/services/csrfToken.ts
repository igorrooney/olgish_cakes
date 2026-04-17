export const csrfTokenLoadErrorMessage = 'CSRF token not loaded. Please refresh the page and try again.'
export const csrfTokenQueryKey = ['csrf-token'] as const
export const csrfTokenStaleTimeMs = 5 * 60 * 1000

export const isCsrfTokenLoadError = (error: unknown) => (
  error instanceof Error && (
    error.message === csrfTokenLoadErrorMessage ||
    error.message === 'Failed to fetch CSRF token' ||
    error.message === 'Missing CSRF token'
  )
)

export const fetchCsrfToken = async (signal?: AbortSignal) => {
  const response = await fetch('/api/csrf-token', {
    credentials: 'same-origin',
    cache: 'no-store',
    signal
  })

  if (!response.ok) {
    throw new Error('Failed to fetch CSRF token')
  }

  const data = (await response.json()) as { token?: string }

  if (!data.token) {
    throw new Error('Missing CSRF token')
  }

  return data.token
}
