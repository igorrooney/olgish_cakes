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
  shortDescription,
  description
`

const articleSeoFields = `
  metaTitle,
  metaDescription,
  keywords,
  canonicalUrl,
  priority,
  changefreq
`

const articleArchiveFields = `
  _id,
  title,
  "slug": slug.current,
  summary,
  dek,
  "publishedAt": coalesce(publishedAt, _createdAt),
  editorialUpdatedAt,
  "modifiedAt": _updatedAt,
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
  *[_type == "article" && defined(slug.current) && coalesce(publishedAt, _createdAt) <= now()] |
  order(publishedAt desc, _createdAt desc) {
    ${articleArchiveFields}
  }
`

export const ARTICLE_ARCHIVE_COUNT_QUERY = `
  count(*[
    _type == "article" &&
    defined(slug.current) &&
    coalesce(publishedAt, _createdAt) <= now() &&
    ($topic == null || topic->slug.current == $topic)
  ])
`

export const ARTICLE_ARCHIVE_PAGE_QUERY = `
  *[
    _type == "article" &&
    defined(slug.current) &&
    coalesce(publishedAt, _createdAt) <= now() &&
    ($topic == null || topic->slug.current == $topic)
  ] |
  order(publishedAt desc, _createdAt desc)[$start...$end] {
    ${articleArchiveFields}
  }
`

export const ARTICLE_BY_SLUG_QUERY = `
  *[
    _type == "article" &&
    slug.current == $slug &&
    coalesce(publishedAt, _createdAt) <= now()
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
  *[_type == "article" && defined(slug.current) && coalesce(publishedAt, _createdAt) <= now()] |
  order(coalesce(publishedAt, _createdAt) desc) {
    "slug": slug.current
  }
`

export const RECENTLY_PUBLISHED_ARTICLE_SLUGS_QUERY = `
  *[
    _type == "article" &&
    defined(slug.current) &&
    dateTime(coalesce(publishedAt, _createdAt)) > dateTime($since) &&
    dateTime(coalesce(publishedAt, _createdAt)) <= now()
  ] |
  order(dateTime(coalesce(publishedAt, _createdAt)) desc) {
    "slug": slug.current
  }
`
