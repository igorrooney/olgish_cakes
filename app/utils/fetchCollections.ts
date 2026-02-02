import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'
import { HOMEPAGE_COLLECTIONS_QUERY } from '@/lib/queries/collections'
import type { HomepageCollection } from '@/app/types/collection'

export async function getHomepageCollections(): Promise<HomepageCollection[]> {
  try {
    const config = getCacheConfig('collections')
    const collections = await cachedSanityFetch<HomepageCollection[]>(
      HOMEPAGE_COLLECTIONS_QUERY,
      {},
      config
    )
    return collections || []
  } catch (error) {
    console.error('Error fetching homepage collections:', error)
    return []
  }
}
