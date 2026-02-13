import { groq } from 'next-sanity'

const COLLECTION_FIELDS = `
  _id,
  name,
  isFeatured,
  image {
    asset,
    alt
  }
`

export const HOMEPAGE_CAKE_COLLECTIONS_QUERY = groq`
  *[_type == "collection"] | order(name asc) {
    ${COLLECTION_FIELDS}
  }
`

export const HOMEPAGE_GIFT_HAMPER_COLLECTIONS_QUERY = groq`
  *[_type == "giftHamperCollection"] | order(name asc) {
    ${COLLECTION_FIELDS}
  }
`

export const COLLECTIONS_DISPLAY_ORDER_QUERY = groq`
  *[_type == "collectionsDisplayOrder"][0] {
    cakeCollectionsOrder[] {
      _ref
    },
    giftHamperCollectionsOrder[] {
      _ref
    }
  }
`
