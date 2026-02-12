import { groq } from 'next-sanity'

export const CAKES_FEATURED_OFFER_QUERY = groq`
  *[_type == "cakesFeaturedOffer" && _id == "cakesFeaturedOffer"][0] {
    isActive,
    eyebrow,
    title,
    description,
    ctaLabel,
    overrideImage {
      alt,
      asset->{
        url
      }
    },
    featuredCake->{
      name,
      slug,
      mainImage {
        alt,
        asset->{
          url
        }
      }
    }
  }
`
