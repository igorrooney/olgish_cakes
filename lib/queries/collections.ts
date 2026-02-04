import { groq } from 'next-sanity'

export const HOMEPAGE_COLLECTIONS_QUERY = groq`
  *[_type == "collection"] | order(homepageOrder asc, name asc) {
    _id,
    name,
    homepageOrder,
    image {
      asset,
      alt
    }
  }
`
