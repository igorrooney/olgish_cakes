import { groq } from 'next-sanity'

export const faqsQuery = groq`*[_type == "faq"] | order(order asc) {
  _id,
  question,
  answer,
  order
}`
