import { randomUUID } from 'node:crypto'

const INSTAGRAM_AUTHORIZE_URL = 'https://www.instagram.com/oauth/authorize'
const INSTAGRAM_SHORT_LIVED_TOKEN_URL = 'https://api.instagram.com/oauth/access_token'
const INSTAGRAM_LONG_LIVED_TOKEN_URL = 'https://graph.instagram.com/access_token'
const INSTAGRAM_REFRESH_TOKEN_URL = 'https://graph.instagram.com/refresh_access_token'
const DEFAULT_TIMEOUT_MS = 15000
const DEFAULT_SCOPES = ['instagram_business_basic']

export interface InstagramOAuthConfig {
  appId: string
  appSecret: string
  redirectUri: string
  embedUrl?: string
  scopes: string[]
  timeoutMs: number
}

export interface InstagramShortLivedToken {
  accessToken: string
  userId: string
}

export interface InstagramLongLivedToken {
  accessToken: string
  expiresIn: number
  tokenType?: string
}

type FetchLike = typeof fetch

const trimEnvValue = (value?: string): string | null => {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : null
}

const getTimeoutMs = (value?: string): number => {
  const parsedValue = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : DEFAULT_TIMEOUT_MS
}

const createAbortSignal = (
  timeoutMs: number,
  signal?: AbortSignal
): { signal: AbortSignal, cleanup: () => void } => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  if (signal) {
    const abortListener = () => {
      controller.abort()
    }

    if (signal.aborted) {
      abortListener()
    } else {
      signal.addEventListener('abort', abortListener, { once: true })
    }

    return {
      signal: controller.signal,
      cleanup: () => {
        clearTimeout(timeoutId)
        signal.removeEventListener('abort', abortListener)
      }
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId)
    }
  }
}

const getErrorMessage = async (response: Response): Promise<string> => {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as {
      error?: { message?: string }
      error_message?: string
    }

    if (payload.error?.message) {
      return payload.error.message
    }

    if (payload.error_message) {
      return payload.error_message
    }
  }

  const responseText = await response.text()
  return responseText.trim() || response.statusText || 'Unknown error'
}

const ensureValidRedirectUri = (value: string): string => {
  let redirectUrl: URL

  try {
    redirectUrl = new URL(value)
  } catch {
    throw new Error('INSTAGRAM_REDIRECT_URI must be a valid absolute URL')
  }

  if (redirectUrl.hostname === 'www.instagram.com' || redirectUrl.hostname === 'api.instagram.com') {
    throw new Error('INSTAGRAM_REDIRECT_URI must be your callback URL, not the full Instagram login/embed URL')
  }

  return redirectUrl.toString()
}

const ensureValidEmbedUrl = (value: string, redirectUri: string): string => {
  let embedUrl: URL

  try {
    embedUrl = new URL(value)
  } catch {
    throw new Error('INSTAGRAM_EMBED_URL must be a valid absolute URL')
  }

  const embeddedRedirectUri = embedUrl.searchParams.get('redirect_uri')

  if (embeddedRedirectUri && new URL(embeddedRedirectUri).toString() !== redirectUri) {
    throw new Error('INSTAGRAM_EMBED_URL redirect_uri must exactly match INSTAGRAM_REDIRECT_URI')
  }

  return embedUrl.toString()
}

export const normalizeInstagramScopes = (value?: string): string[] => {
  const rawValue = value?.trim()
  if (!rawValue) {
    return [...DEFAULT_SCOPES]
  }

  const uniqueScopes = [...new Set(
    rawValue
      .split(/[,\s]+/)
      .map(scope => scope.trim())
      .filter(Boolean)
  )]

  return uniqueScopes.length > 0 ? uniqueScopes : [...DEFAULT_SCOPES]
}

export const createInstagramAuthState = (): string => randomUUID()

export const isLoopbackRedirectUri = (value: string): boolean => {
  try {
    const redirectUrl = new URL(value)
    return (
      redirectUrl.protocol === 'http:' &&
      (redirectUrl.hostname === '127.0.0.1' || redirectUrl.hostname === 'localhost')
    )
  } catch {
    return false
  }
}

export const extractInstagramAuthorizationCode = (value: string): string | null => {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  if (/^[A-Za-z0-9._-]+$/.test(trimmedValue) && !trimmedValue.includes('code=')) {
    return trimmedValue
  }

  try {
    const url = new URL(trimmedValue)
    return url.searchParams.get('code')
  } catch {
    return null
  }
}

export const getInstagramOAuthConfig = (env: NodeJS.ProcessEnv): InstagramOAuthConfig => {
  const appId = trimEnvValue(env.INSTAGRAM_APP_ID)
  const appSecret = trimEnvValue(env.INSTAGRAM_APP_SECRET)
  const redirectUri = trimEnvValue(env.INSTAGRAM_REDIRECT_URI)

  const missingVariables = [
    !appId ? 'INSTAGRAM_APP_ID' : null,
    !appSecret ? 'INSTAGRAM_APP_SECRET' : null,
    !redirectUri ? 'INSTAGRAM_REDIRECT_URI' : null
  ].filter((value): value is string => value !== null)

  if (missingVariables.length > 0) {
    throw new Error(`Missing required Instagram OAuth environment variables: ${missingVariables.join(', ')}`)
  }

  const resolvedAppId = appId ?? ''
  const resolvedAppSecret = appSecret ?? ''
  const resolvedRedirectUri = redirectUri ?? ''
  const normalizedRedirectUri = ensureValidRedirectUri(resolvedRedirectUri)
  const embedUrl = trimEnvValue(env.INSTAGRAM_EMBED_URL)

  return {
    appId: resolvedAppId,
    appSecret: resolvedAppSecret,
    redirectUri: normalizedRedirectUri,
    embedUrl: embedUrl ? ensureValidEmbedUrl(embedUrl, normalizedRedirectUri) : undefined,
    scopes: normalizeInstagramScopes(env.INSTAGRAM_OAUTH_SCOPES),
    timeoutMs: getTimeoutMs(env.INSTAGRAM_OAUTH_TIMEOUT_MS)
  }
}

export const buildInstagramAuthorizeUrl = ({
  appId,
  redirectUri,
  scopes,
  state,
  embedUrl,
  forceReauth = true
}: {
  appId: string
  redirectUri: string
  scopes: string[]
  state: string
  embedUrl?: string
  forceReauth?: boolean
}): string => {
  const url = new URL(embedUrl ?? INSTAGRAM_AUTHORIZE_URL)

  url.searchParams.set('client_id', appId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scopes.join(','))
  url.searchParams.set('state', state)

  if (forceReauth) {
    url.searchParams.set('force_reauth', 'true')
  } else {
    url.searchParams.delete('force_reauth')
  }

  return url.toString()
}

export const exchangeInstagramCodeForShortLivedToken = async ({
  appId,
  appSecret,
  redirectUri,
  code,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImpl = fetch,
  signal
}: {
  appId: string
  appSecret: string
  redirectUri: string
  code: string
  timeoutMs?: number
  fetchImpl?: FetchLike
  signal?: AbortSignal
}): Promise<InstagramShortLivedToken> => {
  const requestBody = new FormData()
  requestBody.set('client_id', appId)
  requestBody.set('client_secret', appSecret)
  requestBody.set('grant_type', 'authorization_code')
  requestBody.set('redirect_uri', redirectUri)
  requestBody.set('code', code)

  const { signal: requestSignal, cleanup } = createAbortSignal(timeoutMs, signal)

  try {
    const response = await fetchImpl(INSTAGRAM_SHORT_LIVED_TOKEN_URL, {
      method: 'POST',
      body: requestBody,
      signal: requestSignal
    })

    if (!response.ok) {
      throw new Error(`Instagram OAuth error (${response.status}): ${await getErrorMessage(response)}`)
    }

    const payload = (await response.json()) as {
      access_token?: string
      user_id?: string | number
    }

    if (!payload.access_token || payload.user_id === undefined) {
      throw new Error('Instagram OAuth response is missing access_token or user_id')
    }

    return {
      accessToken: payload.access_token,
      userId: String(payload.user_id)
    }
  } finally {
    cleanup()
  }
}

export const exchangeInstagramShortLivedTokenForLongLivedToken = async ({
  appSecret,
  shortLivedAccessToken,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImpl = fetch,
  signal
}: {
  appSecret: string
  shortLivedAccessToken: string
  timeoutMs?: number
  fetchImpl?: FetchLike
  signal?: AbortSignal
}): Promise<InstagramLongLivedToken> => {
  const requestUrl = new URL(INSTAGRAM_LONG_LIVED_TOKEN_URL)

  requestUrl.searchParams.set('grant_type', 'ig_exchange_token')
  requestUrl.searchParams.set('client_secret', appSecret)
  requestUrl.searchParams.set('access_token', shortLivedAccessToken)

  const { signal: requestSignal, cleanup } = createAbortSignal(timeoutMs, signal)

  try {
    const response = await fetchImpl(requestUrl.toString(), {
      method: 'GET',
      signal: requestSignal
    })

    if (!response.ok) {
      throw new Error(`Instagram token exchange error (${response.status}): ${await getErrorMessage(response)}`)
    }

    const payload = (await response.json()) as {
      access_token?: string
      expires_in?: number
      token_type?: string
    }

    if (!payload.access_token || typeof payload.expires_in !== 'number') {
      throw new Error('Instagram long-lived token response is missing access_token or expires_in')
    }

    return {
      accessToken: payload.access_token,
      expiresIn: payload.expires_in,
      tokenType: payload.token_type
    }
  } finally {
    cleanup()
  }
}

export const refreshInstagramLongLivedToken = async ({
  accessToken,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImpl = fetch,
  signal
}: {
  accessToken: string
  timeoutMs?: number
  fetchImpl?: FetchLike
  signal?: AbortSignal
}): Promise<InstagramLongLivedToken> => {
  const requestUrl = new URL(INSTAGRAM_REFRESH_TOKEN_URL)

  requestUrl.searchParams.set('grant_type', 'ig_refresh_token')
  requestUrl.searchParams.set('access_token', accessToken)

  const { signal: requestSignal, cleanup } = createAbortSignal(timeoutMs, signal)

  try {
    const response = await fetchImpl(requestUrl.toString(), {
      method: 'GET',
      signal: requestSignal
    })

    if (!response.ok) {
      throw new Error(`Instagram token refresh error (${response.status}): ${await getErrorMessage(response)}`)
    }

    const payload = (await response.json()) as {
      access_token?: string
      expires_in?: number
      token_type?: string
    }

    if (!payload.access_token || typeof payload.expires_in !== 'number') {
      throw new Error('Instagram token refresh response is missing access_token or expires_in')
    }

    return {
      accessToken: payload.access_token,
      expiresIn: payload.expires_in,
      tokenType: payload.token_type
    }
  } finally {
    cleanup()
  }
}
