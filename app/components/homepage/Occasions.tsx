import { OccasionsClient } from './OccasionsClient'
import { getHomepageCollections } from '@/app/utils/fetchCollections'
import { createCollectionQueryValueMap, normalizeDocumentId } from '@/app/utils/collectionQueryValue'
import { getCategoryLandingPathByQueryValue } from '@/app/cakes/categoryLandingConfig'
import type { HomepageCollection } from '@/app/types/collection'
import { urlFor } from '@/sanity/lib/image'
import type { DisplayCollection } from './occasions.types'

interface OccasionsProps {
  collections?: HomepageCollection[]
}

const buildDisplayCollections = (collections: HomepageCollection[]): DisplayCollection[] => {
  const queryValueById = createCollectionQueryValueMap(collections, 'cake')

  const displayCollections = collections
    .map((collection): DisplayCollection | null => {
      const image = collection.image

      if (!image?.asset?._ref) {
        return null
      }

      const normalizedId = normalizeDocumentId(collection._id)
      const queryValue = queryValueById.get(normalizedId)

      if (!queryValue) {
        return null
      }

      const imageAlt = image.alt?.trim() || collection.name
      const canonicalCategoryPath = getCategoryLandingPathByQueryValue(queryValue)
      const searchParams = new URLSearchParams({ collections: queryValue })

      return {
        _id: normalizedId,
        name: collection.name,
        imageUrl: urlFor(image).width(480).height(480).url(),
        imageAlt,
        href: canonicalCategoryPath ?? `/cakes?${searchParams.toString()}`
      }
    })
    .filter((collection): collection is DisplayCollection => collection !== null)

  return displayCollections
}

export async function Occasions({ collections }: OccasionsProps = {}) {
  const resolvedCollections = collections ?? await getHomepageCollections()
  const displayCollections = buildDisplayCollections(resolvedCollections)

  if (displayCollections.length === 0) {
    return null
  }

  return <OccasionsClient collections={displayCollections} />
}
