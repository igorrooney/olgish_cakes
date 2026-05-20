const articleImageFields = `
  alt,
  asset->{
    _id,
    url
  }
`

const articleTopicFields = `
  _id,
  title,
  "slug": slug.current,
  description,
  order
`

const articleMailDeliveryMethod = 'https://purl.org/goodrelations/v1#DeliveryModeMail'
const articleSupportedPostalCountryCodes = ['gb', 'uk', 'u.k.', 'united kingdom', 'great britain']

const articleProductFields = `
  _id,
  _type,
  name,
  "slug": slug.current,
  "price": select(
    _type == "giftHamper" => price,
    _type == "cake" => coalesce(newDesignPricingByServings.servings4To8, pricing.standard, pricing.individual),
    null
  ),
  "image": select(
    _type == "giftHamper" => coalesce(images[isMain == true][0], images[0]) {
      ${articleImageFields}
    },
    _type == "cake" => coalesce(mainImage, designs.standard[isMain == true][0], designs.standard[0]) {
      ${articleImageFields}
    }
  ),
  "isPostableToUk": select(
    (deliverySection.descriptionSource == "custom" || deliverySection.policySource == "custom") && defined(deliverySection.customPolicy) => (
      lower(coalesce(deliverySection.customPolicy.shippingDestinationCountry, "")) in ${JSON.stringify(articleSupportedPostalCountryCodes)} &&
      deliverySection.customPolicy.deliveryMethod == "${articleMailDeliveryMethod}"
    ),
    _type == "cake" => (
      lower(coalesce(*[_type == "cakesDeliverySection" && _id == "cakesDeliverySection"][0].policy.shippingDestinationCountry, "")) in ${JSON.stringify(articleSupportedPostalCountryCodes)} &&
      *[_type == "cakesDeliverySection" && _id == "cakesDeliverySection"][0].policy.deliveryMethod == "${articleMailDeliveryMethod}"
    ),
    _type == "giftHamper" => (
      lower(coalesce(*[_type == "giftHampersDeliverySection" && _id == "giftHampersDeliverySection"][0].policy.shippingDestinationCountry, "")) in ${JSON.stringify(articleSupportedPostalCountryCodes)} &&
      *[_type == "giftHampersDeliverySection" && _id == "giftHampersDeliverySection"][0].policy.deliveryMethod == "${articleMailDeliveryMethod}"
    ),
    false
  ),
  shortDescription,
  description
`

const articleSeoFields = `
  metaTitle,
  metaDescription,
  keywords,
  canonicalUrl
`

const publicArticleVisibilityFilter = `
  _type == "article" &&
  defined(slug.current) &&
  slug.current != "test" &&
  !(slug.current match "test-*") &&
  coalesce(publishedAt, _createdAt) <= now()
`

const articleArchiveFields = `
  _id,
  title,
  "slug": slug.current,
  summary,
  dek,
  "publishedAt": coalesce(publishedAt, _createdAt),
  editorialUpdatedAt,
  coverImage {
    ${articleImageFields}
  },
  cardImage {
    ${articleImageFields}
  },
  topic->{
    ${articleTopicFields}
  },
  primaryProduct->{
    ${articleProductFields}
  },
  seo {
    ${articleSeoFields}
  }
`

export const ARTICLE_TOPICS_QUERY = `
  *[_type == "articleTopic" && defined(slug.current)] | order(order asc, title asc) {
    ${articleTopicFields}
  }
`

export const ARTICLE_ARCHIVE_QUERY = `
  *[${publicArticleVisibilityFilter}] |
  order(publishedAt desc, _createdAt desc) {
    ${articleArchiveFields}
  }
`

export const ARTICLE_ARCHIVE_COUNT_QUERY = `
  count(*[
    ${publicArticleVisibilityFilter} &&
    ($topic == null || topic->slug.current == $topic)
  ])
`

export const ARTICLE_ARCHIVE_PAGE_QUERY = `
  *[
    ${publicArticleVisibilityFilter} &&
    ($topic == null || topic->slug.current == $topic)
  ] |
  order(publishedAt desc, _createdAt desc)[$start...$end] {
    ${articleArchiveFields}
  }
`

export const ARTICLE_BY_SLUG_QUERY = `
  *[
    ${publicArticleVisibilityFilter} &&
    slug.current == $slug
  ] |
  order(dateTime(coalesce(publishedAt, _createdAt)) desc, dateTime(_updatedAt) desc, _createdAt desc)[0] {
    ${articleArchiveFields},
    body,
    faqItems[] {
      _key,
      question,
      answer
    },
    relatedProducts[]->{
      ${articleProductFields}
    }
  }
`

export const ARTICLE_SLUGS_QUERY = `
  *[${publicArticleVisibilityFilter}] |
  order(coalesce(publishedAt, _createdAt) desc) {
    "slug": slug.current
  }
`

export const RECENTLY_PUBLISHED_ARTICLE_SLUGS_QUERY = `
  *[
    _type == "article" &&
    defined(slug.current) &&
    slug.current != "test" &&
    !(slug.current match "test-*") &&
    dateTime(coalesce(publishedAt, _createdAt)) > dateTime($since) &&
    dateTime(coalesce(publishedAt, _createdAt)) <= now()
  ] |
  order(dateTime(coalesce(publishedAt, _createdAt)) desc) {
    "slug": slug.current
  }
`
