import { groq } from 'next-sanity'

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
