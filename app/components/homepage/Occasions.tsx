import { OccasionsClient } from './OccasionsClient'
import { getHomepageCollections } from '@/app/utils/fetchCollections'
import { createCollectionQueryValueMap, normalizeDocumentId } from '@/app/utils/collectionQueryValue'
import type { HomepageCollection } from '@/app/types/collection'
import { urlFor } from '@/sanity/lib/image'
import type { DisplayCollection } from './occasions.types'

const buildDisplayCollections = (collections: HomepageCollection[]): DisplayCollection[] => {
  const queryValueById = createCollectionQueryValueMap(collections, 'cake')

  return collections
    .map((collection) => {
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
      const searchParams = new URLSearchParams({ collections: queryValue })

      return {
        _id: normalizedId,
        name: collection.name,
        imageUrl: urlFor(image).width(480).height(480).url(),
        imageAlt,
        href: `/cakes?${searchParams.toString()}`
      }
    })
    .filter((collection): collection is DisplayCollection => collection !== null)
}

export async function Occasions() {
  const collections = await getHomepageCollections()
  const displayCollections = buildDisplayCollections(collections)

  if (displayCollections.length === 0) {
    return null
  }

  return <OccasionsClient collections={displayCollections} />
}
