import { groq } from 'next-sanity'
import { PRODUCTS_DISPLAY_ORDER_QUERY } from './productsDisplayOrder'

export const SITEMAP_GIFT_HAMPERS_QUERY = groq`
  *[_type == "giftHamper" && !(slug.current match "test*") && !(slug.current match "*test*") && defined(slug.current)] {
    slug,
    _updatedAt
  }
`

export const SITEMAP_PRODUCTS_GIFT_HAMPERS_QUERY = groq`*[
  _type == "giftHamper" &&
  defined(slug.current) &&
  slug.current != "test" &&
  !(slug.current match "test-*")
] {
  slug,
  _updatedAt
}`

export const SITEMAP_GIFT_HAMPER_IMAGES_QUERY = groq`*[
  _type == "giftHamper" &&
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
  _updatedAt
}`

export const PRODUCTS_GIFT_HAMPERS_QUERY = groq`
  *[_type == "giftHamper"] {
    _id,
    name,
    price,
    category,
    slug,
    order
  } | order(order asc, _createdAt desc)
`

export const GIFT_HAMPER_OG_QUERY = groq`
  *[_type == "giftHamper" && slug.current == $slug][0] {
    name,
    slug,
    price,
    images[]{asset->{url}, alt, isMain}
  }
`

export const ALL_GIFT_HAMPERS_QUERY = groq`{
  "giftHampers": *[_type == "giftHamper"] | order(name asc, _createdAt desc) {
    _id,
    _createdAt,
    name,
    slug,
    shortDescription,
    description,
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
    price,
    images[] { _type, asset, alt, isMain, caption },
    isFeatured,
    "category": coalesce(category, collections[0]->name, "Gift Hampers"),
    collections[]->{
      _id,
      name,
      isFeatured
    },
    ingredients,
    allergens,
    "giftHampersDeliverySection": *[_type == "giftHampersDeliverySection" && _id == "giftHampersDeliverySection"][0] {
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

export const FEATURED_GIFT_HAMPERS_QUERY = groq`{
  "giftHampers": *[_type == "giftHamper" && isFeatured == true] | order(name asc, _createdAt desc) {
    _id,
    _createdAt,
    name,
    slug,
    price,
    images[] { _type, asset, alt, isMain },
    "category": coalesce(category, collections[0]->name, "Gift Hampers"),
    collections[]->{
      _id,
      name,
      isFeatured
    }
  },
  "displayOrder": ${PRODUCTS_DISPLAY_ORDER_QUERY}
}`

export const GIFT_HAMPER_BY_SLUG_QUERY = groq`
  *[_type == "giftHamper" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    shortDescription,
    description,
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
    price,
    order,
    images[] { _type, asset, alt, isMain, caption },
    isFeatured,
    "category": coalesce(category, collections[0]->name, "Gift Hampers"),
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
    seo {
      metaTitle,
      metaDescription,
      faq[] {
        question,
        answer
      }
    },
    "giftHampersDeliverySection": *[_type == "giftHampersDeliverySection" && _id == "giftHampersDeliverySection"][0] {
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
