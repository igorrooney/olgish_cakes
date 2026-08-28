import { getClient } from '@/sanity/lib/client'
import { GiftHamper } from '@/types/giftHamper'
import { getRevalidateTime } from './fetchCakes'
import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'
import {
  ALL_GIFT_HAMPERS_QUERY,
  FEATURED_GIFT_HAMPERS_QUERY,
  GIFT_HAMPER_BY_SLUG_QUERY
} from '@/lib/queries/giftHampers'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

interface ProductReference {
  _ref: string
}

interface ProductsDisplayOrder {
  giftHampersOrder?: ProductReference[]
}

interface GiftHampersQueryResult {
  giftHampers?: GiftHamper[]
  displayOrder?: ProductsDisplayOrder | null
}

function normalizeDocumentId(documentId: string) {
  return documentId.startsWith('drafts.')
    ? documentId.slice('drafts.'.length)
    : documentId
}

function createManualOrderMap(references: ProductReference[] | undefined): Map<string, number> {
  const manualOrderMap = new Map<string, number>()

  if (!references) {
    return manualOrderMap
  }

  references.forEach((reference, index) => {
    if (!reference?._ref) {
      return
    }

    const normalizedId = normalizeDocumentId(reference._ref)

    if (!manualOrderMap.has(normalizedId)) {
      manualOrderMap.set(normalizedId, index)
    }
  })

  return manualOrderMap
}

function sortGiftHampersByDisplayOrder(
  giftHampers: GiftHamper[],
  references: ProductReference[] | undefined
) {
  const manualOrderMap = createManualOrderMap(references)

  return [...giftHampers].sort((firstGiftHamper, secondGiftHamper) => {
    const firstManualRank = manualOrderMap.get(normalizeDocumentId(firstGiftHamper._id)) ?? Number.MAX_SAFE_INTEGER
    const secondManualRank = manualOrderMap.get(normalizeDocumentId(secondGiftHamper._id)) ?? Number.MAX_SAFE_INTEGER

    if (firstManualRank !== secondManualRank) {
      return firstManualRank - secondManualRank
    }

    const nameComparison = firstGiftHamper.name.localeCompare(secondGiftHamper.name)

    if (nameComparison !== 0) {
      return nameComparison
    }

    const firstCreatedAt = Date.parse(firstGiftHamper._createdAt)
    const secondCreatedAt = Date.parse(secondGiftHamper._createdAt)
    const hasValidCreatedAt = Number.isFinite(firstCreatedAt) && Number.isFinite(secondCreatedAt)

    if (hasValidCreatedAt && firstCreatedAt !== secondCreatedAt) {
      return secondCreatedAt - firstCreatedAt
    }

    return firstGiftHamper.name.localeCompare(secondGiftHamper.name)
  })
}

function extractGiftHampersAndOrder(
  data: GiftHampersQueryResult | GiftHamper[] | null
) {
  if (Array.isArray(data)) {
    return {
      giftHampers: data,
      references: undefined
    }
  }

  return {
    giftHampers: data?.giftHampers ?? [],
    references: data?.displayOrder?.giftHampersOrder
  }
}

export async function getAllGiftHampers(preview = false): Promise<GiftHamper[]> {
  const query = ALL_GIFT_HAMPERS_QUERY

  try {
    if (preview) {
      // For preview, use direct fetch without caching
      const sanityClient = getClient(preview);
      const data = await sanityClient.fetch<GiftHampersQueryResult | GiftHamper[]>(query);
      const {
        giftHampers,
        references
      } = extractGiftHampersAndOrder(data)

      return sortGiftHampersByDisplayOrder(giftHampers, references)
    }

    const config = getCacheConfig('giftHampers')
    const data = await cachedSanityFetch<GiftHampersQueryResult | GiftHamper[]>(query, {}, config)
    const {
      giftHampers,
      references
    } = extractGiftHampersAndOrder(data)

    return sortGiftHampersByDisplayOrder(giftHampers, references)
  } catch (error) {
    console.error('Sanity read failed', {
      operation: 'sanity.fetch-all-gift-hampers',
      ...toSafeOperationalError(error)
    })
    return []
  }
}

export { getRevalidateTime }

export async function getGiftHamperBySlug(slug: string, preview = false): Promise<GiftHamper | null> {
  const query = GIFT_HAMPER_BY_SLUG_QUERY

  try {
    if (preview) {
      // For preview, use direct fetch without caching
      const sanityClient = getClient(preview);
      return await sanityClient.fetch(query, { slug });
    }

    const config = getCacheConfig('individualPages')
    const data = await cachedSanityFetch<GiftHamper | null>(query, { slug }, config)
    return data
  } catch (error) {
    console.error('Sanity read failed', {
      operation: 'sanity.fetch-gift-hamper-by-slug',
      recordReference: slug,
      ...toSafeOperationalError(error)
    })
    return null
  }
}

export async function getFeaturedGiftHampers(preview = false): Promise<GiftHamper[]> {
  const query = FEATURED_GIFT_HAMPERS_QUERY
  
  try {
    if (preview) {
      // For preview, use direct fetch without caching
      const sanityClient = getClient(preview);
      const data = await sanityClient.fetch<GiftHampersQueryResult | GiftHamper[]>(query);
      const {
        giftHampers,
        references
      } = extractGiftHampersAndOrder(data)

      return sortGiftHampersByDisplayOrder(giftHampers, references)
    }

    const config = getCacheConfig('giftHampers')
    const data = await cachedSanityFetch<GiftHampersQueryResult | GiftHamper[]>(query, {}, config)
    const {
      giftHampers,
      references
    } = extractGiftHampersAndOrder(data)

    return sortGiftHampersByDisplayOrder(giftHampers, references)
  } catch (error) {
    console.error('Sanity read failed', {
      operation: 'sanity.fetch-featured-gift-hampers',
      ...toSafeOperationalError(error)
    })
    return []
  }
}
