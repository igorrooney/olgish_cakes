import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'
import {
  COLLECTIONS_DISPLAY_ORDER_QUERY,
  HOMEPAGE_CAKE_COLLECTIONS_QUERY,
  HOMEPAGE_GIFT_HAMPER_COLLECTIONS_QUERY
} from '@/lib/queries/collections'
import type { HomepageCollection } from '@/app/types/collection'

type CakeHomepageCollection = HomepageCollection & {
  homepageOrder?: number | null
}

interface CollectionReference {
  _ref: string
}

interface CollectionsDisplayOrder {
  cakeCollectionsOrder?: CollectionReference[]
  giftHamperCollectionsOrder?: CollectionReference[]
}

interface CacheConfig {
  revalidate?: number | false
  tags?: readonly string[]
}

function normalizeDocumentId(documentId: string) {
  return documentId.startsWith('drafts.')
    ? documentId.slice('drafts.'.length)
    : documentId
}

function createOrderMap(references: CollectionReference[] | undefined): Map<string, number> {
  const orderMap = new Map<string, number>()

  if (!references) {
    return orderMap
  }

  references.forEach((reference, index) => {
    if (!reference?._ref) {
      return
    }

    const normalizedId = normalizeDocumentId(reference._ref)

    if (!orderMap.has(normalizedId)) {
      orderMap.set(normalizedId, index)
    }
  })

  return orderMap
}

function getLegacyHomepageOrderValue(collection: CakeHomepageCollection) {
  return typeof collection.homepageOrder === 'number'
    ? collection.homepageOrder
    : Number.MAX_SAFE_INTEGER
}

function sortCakeCollectionsByConfiguredOrder(
  collections: CakeHomepageCollection[],
  orderMap: Map<string, number>
) {
  return [...collections].sort((firstCollection, secondCollection) => {
    const firstRank = orderMap.get(normalizeDocumentId(firstCollection._id))
    const secondRank = orderMap.get(normalizeDocumentId(secondCollection._id))
    const firstHasConfiguredRank = typeof firstRank === 'number'
    const secondHasConfiguredRank = typeof secondRank === 'number'

    if (firstHasConfiguredRank && secondHasConfiguredRank && firstRank !== secondRank) {
      return firstRank - secondRank
    }

    if (firstHasConfiguredRank !== secondHasConfiguredRank) {
      return firstHasConfiguredRank ? -1 : 1
    }

    const legacyOrderDifference =
      getLegacyHomepageOrderValue(firstCollection) - getLegacyHomepageOrderValue(secondCollection)

    if (legacyOrderDifference !== 0) {
      return legacyOrderDifference
    }

    return firstCollection.name.localeCompare(secondCollection.name)
  })
}

function sortCollectionsByConfiguredOrder(
  collections: HomepageCollection[],
  orderMap: Map<string, number>
) {
  return [...collections].sort((firstCollection, secondCollection) => {
    const firstRank = orderMap.get(normalizeDocumentId(firstCollection._id)) ?? Number.MAX_SAFE_INTEGER
    const secondRank = orderMap.get(normalizeDocumentId(secondCollection._id)) ?? Number.MAX_SAFE_INTEGER

    if (firstRank !== secondRank) {
      return firstRank - secondRank
    }

    return firstCollection.name.localeCompare(secondCollection.name)
  })
}

async function fetchCollectionsDisplayOrder(config: CacheConfig): Promise<CollectionsDisplayOrder | null> {
  try {
    const cacheConfig = {
      revalidate: config.revalidate,
      tags: config.tags ? [...config.tags] : undefined
    }

    return await cachedSanityFetch<CollectionsDisplayOrder | null>(
      COLLECTIONS_DISPLAY_ORDER_QUERY,
      {},
      cacheConfig
    )
  } catch (error) {
    console.error('Error fetching collections display order settings:', error)
    return null
  }
}

export async function getHomepageCollections(): Promise<HomepageCollection[]> {
  try {
    const config = getCacheConfig('cakeCollections')
    const [collections, orderSettings] = await Promise.all([
      cachedSanityFetch<CakeHomepageCollection[]>(HOMEPAGE_CAKE_COLLECTIONS_QUERY, {}, config),
      fetchCollectionsDisplayOrder(config)
    ])
    const orderMap = createOrderMap(orderSettings?.cakeCollectionsOrder)

    return sortCakeCollectionsByConfiguredOrder(collections || [], orderMap)
  } catch (error) {
    console.error('Error fetching homepage collections:', error)
    return []
  }
}

export async function getHomepageGiftHamperCollections(): Promise<HomepageCollection[]> {
  try {
    const config = getCacheConfig('giftHamperCollections')
    const [collections, orderSettings] = await Promise.all([
      cachedSanityFetch<HomepageCollection[]>(HOMEPAGE_GIFT_HAMPER_COLLECTIONS_QUERY, {}, config),
      fetchCollectionsDisplayOrder(config)
    ])
    const orderMap = createOrderMap(orderSettings?.giftHamperCollectionsOrder)

    return sortCollectionsByConfiguredOrder(collections || [], orderMap)
  } catch (error) {
    console.error('Error fetching homepage gift hamper collections:', error)
    return []
  }
}
