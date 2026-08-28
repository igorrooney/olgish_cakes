import { groq } from 'next-sanity'
import { PRODUCTS_DISPLAY_ORDER_QUERY } from './productsDisplayOrder'

export const SITEMAP_CAKES_QUERY = groq`
  *[_type == "cake" && !(slug.current match "test*") && !(slug.current match "*test*") && defined(slug.current)] {
    slug,
    _updatedAt
  }
`

export const SCHEMA_VALIDATION_CAKES_QUERY = groq`
  *[_type == "cake"] | order(name asc) [0...$limit] {
    _id,
    name,
    slug,
    pricing,
    allergens,
    ingredients,
    mainImage {
      asset-> {
        url
      }
    },
    description
  }
`

export const SITEMAP_PRODUCTS_CAKES_QUERY = groq`*[
  _type == "cake" &&
  defined(slug.current) &&
  slug.current != "test" &&
  !(slug.current match "test-*")
] {
  _id,
  name,
  slug,
  _updatedAt,
  pricing,
  mainImage,
  designs,
  category,
  shortDescription,
  description
}`

export const SITEMAP_CAKE_IMAGES_QUERY = groq`*[
  _type == "cake" &&
  defined(slug.current) &&
  slug.current != "test" &&
  !slug.current match "test-*"
] {
  slug,
  images[] {
    asset->{
      _id,
      url,
      metadata {
        dimensions
      }
    },
    alt
  },
  name,
  _updatedAt
}`

export const ADMIN_CAKES_QUERY = groq`
  *[_type == "cake"] | order(name asc) {
    _id,
    name,
    slug,
    size,
    pricing,
    "category": coalesce(category, collections[0]->name, "Traditional"),
    collections[]->{
      _id,
      name
    }
  }
`

export const PRODUCTS_CAKES_QUERY = groq`
  *[_type == "cake"] {
    _id,
    name,
    size,
    pricing,
    category,
    slug,
    order
  } | order(order asc, _createdAt desc)
`

export const ALL_CAKES_QUERY = groq`{
  "cakes": *[_type == "cake"] | order(order asc, _createdAt desc) {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    deliverySection {
      descriptionSource,
      policySource,
      customPolicy {
        dispatchMinDays,
        dispatchMaxDays,
        shippingFeeGbp,
        shippingDestinationCountry,
        deliveryMethod
      }
    },
    bestsellerCustomerStory,
    bestsellerStoryDetails,
    bestsellerShortDescription,
    size,
    pricing,
    newDesignPricingByServings,
    order,
    isBestseller,
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
        isMain
      },
      individual[] {
        _type,
        asset,
        isMain
      }
    },
    "category": coalesce(category, collections[0]->name, "Traditional"),
    collections[]->{
      _id,
      name,
      isFeatured
    },
    ingredients,
    allergens,
    "cakesDeliverySection": *[_type == "cakesDeliverySection" && _id == "cakesDeliverySection"][0] {
      policy {
        dispatchMinDays,
        dispatchMaxDays,
        shippingFeeGbp,
        shippingDestinationCountry,
        deliveryMethod
      }
    }
  },
  "displayOrder": ${PRODUCTS_DISPLAY_ORDER_QUERY}
}`

export const FEATURED_CAKES_QUERY = groq`
  *[_type == "cake" && isFeatured == true] | order(order asc, _createdAt desc) {
    _id,
    name,
    description,
    shortDescription,
    pricing,
    "category": coalesce(category, collections[0]->name, "Traditional"),
    collections[]->{
      _id,
      name,
      isFeatured
    },
    slug,
    order,
    mainImage {
      _type,
      asset
    },
    designs {
      standard[] {
        asset {
          _ref
        },
        isMain
      }
    }
  }
`

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
      policySource,
      customDescription,
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
    seo {
      metaTitle,
      metaDescription,
      keywords
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
