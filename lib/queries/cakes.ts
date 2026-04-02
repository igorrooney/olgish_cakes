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

export const CAKE_BY_SLUG_QUERY = groq`
  *[_type == "cake" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    size,
    pricing,
    newDesignPricingByServings,
    order,
    fillingTypes[]->{
      _id,
      name,
      image {
        _type,
        alt,
        asset
      }
    },
    defaultFillingType->{
      _id,
      name,
      image {
        _type,
        alt,
        asset
      }
    },
    deliverySection {
      descriptionSource,
      customDescription,
      policySource,
      customPolicy {
        dispatchMinDays,
        dispatchMaxDays,
        shippingFeeGbp,
        shippingDestinationCountry,
        deliveryMethod
      }
    },
    mainImage {
      _type,
      asset
    },
    images {
      _type,
      asset
    },
    designs {
      standard[] {
        _type,
        asset,
        isMain,
        alt
      },
      individual[] {
        _type,
        asset,
        isMain,
        alt
      }
    },
    "category": coalesce(category, collections[0]->name, "Traditional"),
    collections[]->{
      _id,
      name,
      isFeatured
    },
    ingredients,
    ingredientReference->{
      _id,
      cakeName,
      ingredients
    },
    allergens,
    "cakesDeliverySection": *[_type == "cakesDeliverySection" && _id == "cakesDeliverySection"][0] {
      name,
      description,
      policy {
        dispatchMinDays,
        dispatchMaxDays,
        shippingFeeGbp,
        shippingDestinationCountry,
        deliveryMethod
      }
    }
  }
`
