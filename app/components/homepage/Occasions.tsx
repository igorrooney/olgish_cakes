import { OccasionsClient } from './OccasionsClient'
import { getHomepageCollections } from '@/app/utils/fetchCollections'
import type { HomepageCollection } from '@/app/types/collection'
import { urlFor } from '@/sanity/lib/image'
import type { DisplayCollection } from './occasions.types'

const buildDisplayCollections = (collections: HomepageCollection[]): DisplayCollection[] =>
  collections
    .map((collection) => {
      const image = collection.image

      if (!image?.asset?._ref) {
        return null
      }

      const imageAlt = image.alt?.trim() || collection.name

      return {
        _id: collection._id,
        name: collection.name,
        imageUrl: urlFor(image).width(480).height(480).url(),
        imageAlt
      }
    })
    .filter((collection): collection is DisplayCollection => collection !== null)

export async function Occasions() {
  const collections = await getHomepageCollections()
  const displayCollections = buildDisplayCollections(collections)

  if (displayCollections.length === 0) {
    return null
  }

  return <OccasionsClient collections={displayCollections} />
}
