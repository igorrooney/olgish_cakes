import { groq } from 'next-sanity'

export const SANITY_DIAGNOSTIC_ORDERS_QUERY = groq`
  *[_type == "order"] | order(_createdAt desc) [0...1]
`
