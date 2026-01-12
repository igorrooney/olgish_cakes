import { unstable_cache } from 'next/cache'
import { client, USE_REAL_TIME_DATA } from '@/sanity/lib/client'

interface CacheOptions {
  revalidate?: number
  tags?: string[]
}

/**
 * Cached Sanity fetch wrapper that uses Next.js unstable_cache
 * Respects USE_REAL_TIME_DATA environment variable
 * 
 * @param query - GROQ query string
 * @param params - Query parameters
 * @param options - Cache options (revalidate time in seconds, tags)
 * @returns Cached fetch result
 */
export async function cachedSanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: CacheOptions = {}
): Promise<T> {
  // If real-time data is enabled, skip caching
  if (USE_REAL_TIME_DATA) {
    return client.fetch<T>(query, params)
  }

  const { revalidate = 3600, tags = [] } = options

  // Create cache key from query and params
  const cacheKey = JSON.stringify({ query, params })

  // Use unstable_cache for request-level memoization
  const cachedFetch = unstable_cache(
    async () => {
      return client.fetch<T>(query, params)
    },
    [cacheKey],
    {
      revalidate,
      tags
    }
  )

  return cachedFetch()
}

/**
 * Helper to get cache config by type
 */
export function getCacheConfig(type: keyof typeof import('./sanity-cache-config').SANITY_CACHE_CONFIG) {
  // Dynamic import to avoid circular dependencies
  const { SANITY_CACHE_CONFIG } = require('./sanity-cache-config')
  return SANITY_CACHE_CONFIG[type] || { revalidate: 3600, tags: [] }
}
