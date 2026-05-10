import { unstable_cache } from 'next/cache'
import { client, sanityFetchOptions, USE_REAL_TIME_DATA } from '@/sanity/lib/client'
import { SANITY_CACHE_CONFIG } from './sanity-cache-config'

interface CacheOptions {
  revalidate?: number | false
  tags?: readonly string[]
}

/**
 * Cached Sanity fetch wrapper that uses Next.js unstable_cache
 * Respects USE_REAL_TIME_DATA environment variable
 * 
 * @param query - GROQ query string
 * @param params - Query parameters
 * @param options - Cache options (revalidate time in seconds or false, tags)
 * @returns Cached fetch result
 */
export async function cachedSanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: CacheOptions = {}
): Promise<T> {
  // If real-time data is enabled, skip caching
  if (USE_REAL_TIME_DATA) {
    return client.fetch<T>(query, params, sanityFetchOptions)
  }

  const { revalidate = false, tags = [] } = options

  // Create cache key from query and params
  const cacheKey = JSON.stringify({ query, params })

  // Use unstable_cache for request-level memoization
  const cacheOptions: { tags?: string[]; revalidate?: number | false } = { tags: [...tags] }
  if (revalidate !== false) {
    cacheOptions.revalidate = revalidate
  }

  const cachedFetch = unstable_cache(
    async () => {
      return client.fetch<T>(query, params)
    },
    [cacheKey],
    cacheOptions
  )

  return cachedFetch()
}

/**
 * Helper to get cache config by type
 */
export function getCacheConfig(type: keyof typeof SANITY_CACHE_CONFIG) {
  return SANITY_CACHE_CONFIG[type] || { revalidate: false, tags: [] }
}
