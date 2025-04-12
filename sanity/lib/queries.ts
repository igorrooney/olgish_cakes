export const testimonialQuery = `
  *[_type == "testimonial"] | order(date desc) {
    _id,
    customerName,
    cakeType,
    rating,
    date,
    text,
    cakeImage {
      asset->,
      alt
    },
    source
  }[$start...$end]
`;

export const testimonialCountQuery = `
  count(*[_type == "testimonial"])
`;
