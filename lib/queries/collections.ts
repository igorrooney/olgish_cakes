import { groq } from 'next-sanity'

export const HOMEPAGE_COLLECTIONS_QUERY = groq`
  *[_type == "collection" && showOnHomepage == true] | order(homepageOrder asc) {
    _id,
    name,
    homepageOrder,
    image {
      asset,
      alt
    }
  }
`
