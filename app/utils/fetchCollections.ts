import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'
import {
  HOMEPAGE_CAKE_COLLECTIONS_QUERY,
  HOMEPAGE_GIFT_HAMPER_COLLECTIONS_QUERY
} from '@/lib/queries/collections'
import type { HomepageCollection } from '@/app/types/collection'

export async function getHomepageCollections(): Promise<HomepageCollection[]> {
  try {
    const config = getCacheConfig('cakeCollections')
    const collections = await cachedSanityFetch<HomepageCollection[]>(
      HOMEPAGE_CAKE_COLLECTIONS_QUERY,
      {},
      config
    )
    return collections || []
  } catch (error) {
    console.error('Error fetching homepage collections:', error)
    return []
  }
}

export async function getHomepageGiftHamperCollections(): Promise<HomepageCollection[]> {
  try {
    const config = getCacheConfig('giftHamperCollections')
    const collections = await cachedSanityFetch<HomepageCollection[]>(
      HOMEPAGE_GIFT_HAMPER_COLLECTIONS_QUERY,
      {},
      config
    )
    return collections || []
  } catch (error) {
    console.error('Error fetching homepage gift hamper collections:', error)
    return []
  }
}
