const testimonialFields = `
  _id,
  customerName,
  cakeType,
  rating,
  date,
  title,
  text,
  source
`

export const ALL_TESTIMONIALS_QUERY = `
  *[_type == "testimonial"] | order(date desc) {
    ${testimonialFields}
  }
`

export const FEATURED_TESTIMONIALS_QUERY = `
  *[_type == "testimonial"] | order(date desc) {
    ${testimonialFields},
    cakeImage {
      asset->,
      alt
    }
  }
`

export const TESTIMONIAL_STATS_QUERY = `
  *[_type == "testimonial"] {
    rating
  }
`

export const PAGINATED_TESTIMONIALS_QUERY = `
  *[
    _type == "testimonial" &&
    defined(_id) &&
    _id != "" &&
    defined(date) &&
    date != "" &&
    defined(text) &&
    text != "" &&
    defined(rating) &&
    rating >= 1 &&
    rating <= 5 &&
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
    text
  }
`
