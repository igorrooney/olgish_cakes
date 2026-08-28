const displayableTestimonialFilter = `
  defined(_id) &&
  _id != "" &&
  defined(date) &&
  date != "" &&
  defined(text) &&
  text != "" &&
  defined(rating) &&
  rating >= 1 &&
  rating <= 5
`

const testimonialFields = `
  _id,
  _type,
  _createdAt,
  _updatedAt,
  customerName,
  cakeType,
  rating,
  date,
  title,
  text,
  source,
  sourceUrl,
  incentivised,
  incentiveDisclosure
`

export const ALL_TESTIMONIALS_QUERY = `
  *[_type == "testimonial" && ${displayableTestimonialFilter}] | order(date desc) {
    ${testimonialFields}
  }
`

export const FEATURED_TESTIMONIALS_QUERY = `
  *[_type == "testimonial" && ${displayableTestimonialFilter}] | order(date desc) {
    ${testimonialFields},
    cakeImage {
      asset->,
      alt
    }
  }
`

export const TESTIMONIAL_STATS_QUERY = `
  *[_type == "testimonial" && ${displayableTestimonialFilter}] {
    rating
  }
`

export const PAGINATED_TESTIMONIALS_QUERY = `
  *[
    _type == "testimonial" &&
    ${displayableTestimonialFilter} &&
    (
      !$hasCursor ||
      date < $cursorDate ||
      (date == $cursorDate && _id > $cursorId)
    )
  ] | order(date desc, _id asc) [0...$limit] {
    _id,
    customerName,
    rating,
    date,
    title,
    text,
    source,
    sourceUrl,
    incentivised,
    incentiveDisclosure
  }
`
