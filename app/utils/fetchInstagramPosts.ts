import type { InstagramMediaType, InstagramPost } from '@/app/types/instagram'

interface InstagramApiMediaItem {
  id: string
  caption?: string
  media_type?: string
  media_url?: string
  permalink?: string
  thumbnail_url?: string
  timestamp?: string
  like_count?: number
}

interface InstagramApiResponse {
  data?: InstagramApiMediaItem[]
}

const DEFAULT_POST_LIMIT = 3
const MIN_POST_LIMIT = 3
const MAX_POST_LIMIT = 3
const DEFAULT_REVALIDATE_SECONDS = 1800
const DEFAULT_GRAPH_API_VERSION = 'v19.0'
const DEFAULT_GRAPH_API_BASE_URL = 'https://graph.instagram.com'
const MAX_API_FETCH_LIMIT = 25
const IMAGE_FETCH_MULTIPLIER = 3
const INSTAGRAM_FETCH_TIMEOUT_MS = 8000
const RECOVERABLE_INSTAGRAM_ERROR_PATTERN = /Missing required Instagram environment variables|Error validating access token|Invalid OAuth access token/i

const isInstagramMediaType = (value?: string): value is InstagramMediaType =>
  value === 'IMAGE' || value === 'VIDEO' || value === 'CAROUSEL_ALBUM'

const createTimeoutSignal = (): AbortSignal => {
  if (typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(INSTAGRAM_FETCH_TIMEOUT_MS)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), INSTAGRAM_FETCH_TIMEOUT_MS)

  controller.signal.addEventListener('abort', () => clearTimeout(timeoutId), { once: true })

  return controller.signal
}

const createFallbackAnySignal = (signals: AbortSignal[]): AbortSignal => {
  const controller = new AbortController()

  const abortWithSignal = (signal: AbortSignal) => {
    if (controller.signal.aborted) {
      return
    }

    controller.abort(signal.reason)
  }

  for (const signal of signals) {
    if (signal.aborted) {
      abortWithSignal(signal)
      return controller.signal
    }

    signal.addEventListener('abort', () => abortWithSignal(signal), { once: true })
  }

  return controller.signal
}

const clampPostLimit = (value: number): number =>
  Math.min(MAX_POST_LIMIT, Math.max(MIN_POST_LIMIT, value))

const normalizePostLimit = (value?: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_POST_LIMIT
  }

  return clampPostLimit(Math.round(value))
}

export const getInstagramPostLimit = (limit?: number): number => {
  if (typeof limit === 'number') {
    return normalizePostLimit(limit)
  }

  const envLimit = Number.parseInt(process.env.INSTAGRAM_POST_LIMIT ?? '', 10)
  return normalizePostLimit(envLimit)
}

export const getInstagramRevalidateSeconds = (): number => {
  const envValue = Number.parseInt(process.env.INSTAGRAM_REVALIDATE_SECONDS ?? '', 10)
  if (Number.isFinite(envValue) && envValue > 0) {
    return envValue
  }

  return DEFAULT_REVALIDATE_SECONDS
}

export const isRecoverableInstagramError = (error: unknown): boolean =>
  error instanceof Error &&
  (error.name === 'AbortError' || RECOVERABLE_INSTAGRAM_ERROR_PATTERN.test(error.message))

const getInstagramRequestSignal = (signal?: AbortSignal): AbortSignal => {
  const timeoutSignal = createTimeoutSignal()

  if (!signal) {
    return timeoutSignal
  }

  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any([signal, timeoutSignal])
  }

  return createFallbackAnySignal([signal, timeoutSignal])
}

const getInstagramApiBaseUrl = (): string => {
  const baseUrl = process.env.INSTAGRAM_GRAPH_API_BASE_URL?.trim()
  if (baseUrl) {
    return baseUrl.replace(/\/$/, '')
  }

  const apiVersion = process.env.INSTAGRAM_GRAPH_API_VERSION?.trim() || DEFAULT_GRAPH_API_VERSION
  const normalizedVersion = apiVersion.startsWith('v') ? apiVersion : `v${apiVersion}`
  return `${DEFAULT_GRAPH_API_BASE_URL}/${normalizedVersion}`
}

const getInstagramConfig = () => {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const userId = process.env.INSTAGRAM_USER_ID

  if (!accessToken || !userId) {
    throw new Error(
      `Missing required Instagram environment variables: ${
        !accessToken ? 'INSTAGRAM_ACCESS_TOKEN' : ''
      }${!accessToken && !userId ? ', ' : ''}${!userId ? 'INSTAGRAM_USER_ID' : ''}`
    )
  }

  return { accessToken, userId }
}

const getResponseErrorMessage = async (response: Response): Promise<string | null> => {
  try {
    const payload = (await response.json()) as { error?: { message?: string } }
    if (payload?.error?.message) {
      return payload.error.message
    }
  } catch {
    return null
  }

  return null
}

const resolveMediaUrl = (item: InstagramApiMediaItem): string | null => {
  const primaryUrl = typeof item.media_url === 'string' ? item.media_url : null
  const fallbackUrl = typeof item.thumbnail_url === 'string' ? item.thumbnail_url : null

  if (item.media_type === 'VIDEO') {
    return fallbackUrl || primaryUrl
  }

  return primaryUrl || fallbackUrl
}

const mapInstagramPost = (item: InstagramApiMediaItem): InstagramPost | null => {
  if (item.media_type === 'VIDEO') {
    return null
  }

  const mediaType = isInstagramMediaType(item.media_type) ? item.media_type : 'IMAGE'
  const imageUrl = resolveMediaUrl(item)
  const permalink = typeof item.permalink === 'string' ? item.permalink : null

  if (!imageUrl || !permalink || typeof item.id !== 'string') {
    return null
  }

  const caption = typeof item.caption === 'string' ? item.caption : undefined
  const likeCount = typeof item.like_count === 'number' ? item.like_count : undefined
  const timestamp = typeof item.timestamp === 'string' ? item.timestamp : undefined

  return {
    id: item.id,
    caption,
    imageUrl,
    permalink,
    mediaType,
    timestamp,
    likeCount
  }
}

export async function getLatestInstagramPosts(
  { limit, signal }: { limit?: number, signal?: AbortSignal } = {}
): Promise<InstagramPost[]> {
  const { accessToken, userId } = getInstagramConfig()
  const resolvedLimit = getInstagramPostLimit(limit)
  const fetchLimit = Math.min(MAX_API_FETCH_LIMIT, resolvedLimit * IMAGE_FETCH_MULTIPLIER)
  const baseUrl = getInstagramApiBaseUrl()
  const revalidateSeconds = getInstagramRevalidateSeconds()

  const fields = [
    'id',
    'caption',
    'media_type',
    'media_url',
    'permalink',
    'thumbnail_url',
    'timestamp',
    'like_count'
  ].join(',')

  const searchParams = new URLSearchParams({
    fields,
    access_token: accessToken,
    limit: fetchLimit.toString()
  })

  const response = await fetch(`${baseUrl}/${userId}/media?${searchParams.toString()}`, {
    next: { revalidate: revalidateSeconds },
    signal: getInstagramRequestSignal(signal)
  })

  if (!response.ok) {
    const errorMessage = await getResponseErrorMessage(response)
    throw new Error(
      `Instagram API error (${response.status}): ${errorMessage || response.statusText}`
    )
  }

  const payload = (await response.json()) as InstagramApiResponse
  const items = Array.isArray(payload.data) ? payload.data : []

  const posts = items
    .map(mapInstagramPost)
    .filter((post): post is InstagramPost => post !== null)

  return posts.slice(0, resolvedLimit)
}
