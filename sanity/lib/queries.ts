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
`;

export const testimonialCountQuery = `
  count(*[_type == "testimonial"])
`;
