export const testimonialQuery = `
  *[_type == "testimonial"] | order(date desc) {
    _id,
    customerName,
    cakeType,
    rating,
    date,
    title,
    text,
    cakeImage {
      asset->,
      alt
    },
    source
  }[$start...$end]
`

export const testimonialCountQuery = `
  count(*[_type == "testimonial"])
`

const studioProductCollectionAssignmentFields = `
  _id,
  _rev,
  name,
  collections[] {
    _ref
  }
`

export const STUDIO_CAKE_COLLECTION_ASSIGNMENT_OPTIONS_QUERY = `
  *[_type == "cake"] | order(name asc, _createdAt desc) {
    ${studioProductCollectionAssignmentFields}
  }
`

export const STUDIO_GIFT_HAMPER_COLLECTION_ASSIGNMENT_OPTIONS_QUERY = `
  *[_type == "giftHamper"] | order(name asc, _createdAt desc) {
    ${studioProductCollectionAssignmentFields}
  }
`

export const STUDIO_PRODUCT_COLLECTION_ASSIGNMENT_BY_IDS_QUERY = `
  *[_id in $documentIds] {
    ${studioProductCollectionAssignmentFields}
  }
`

export const STUDIO_PUBLISHED_DOCUMENT_EXISTS_QUERY = `
  count(*[_id == $documentId])
`
