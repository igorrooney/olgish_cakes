import { groq } from 'next-sanity'

const COLLECTION_FIELDS = `
  _id,
  name,
  isFeatured,
  homepageOrder,
  image {
    asset,
    alt
  }
`

export const HOMEPAGE_CAKE_COLLECTIONS_QUERY = groq`
  *[_type == "collection"] | order(homepageOrder asc, name asc) {
    ${COLLECTION_FIELDS}
  }
`

export const HOMEPAGE_GIFT_HAMPER_COLLECTIONS_QUERY = groq`
  *[_type == "giftHamperCollection"] | order(homepageOrder asc, name asc) {
    ${COLLECTION_FIELDS}
  }
`
