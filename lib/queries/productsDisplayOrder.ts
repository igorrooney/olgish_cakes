import { groq } from 'next-sanity'

export const PRODUCTS_DISPLAY_ORDER_QUERY = groq`
  *[_type == "productsDisplayOrder"][0] {
    cakesOrder[] {
      _ref
    },
    giftHampersOrder[] {
      _ref
    }
  }
`
