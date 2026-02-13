import { type SchemaTypeDefinition } from 'sanity'
import cake from './schemas/cake'
import giftHamper from './schemas/giftHamper'
import collection from './schemas/collection'
import giftHamperCollection from './schemas/giftHamperCollection'
import collectionsDisplayOrder from './schemas/collectionsDisplayOrder'
import productsDisplayOrder from './schemas/productsDisplayOrder'
import testimonial from './schemas/testimonial'
import faq from './schemas/faq'
import marketSchedule from './schemas/marketSchedule'
import blogPost from './schemas/blogPost'
import order from './schemas/order'
import cakesFeaturedOffer from './schemas/cakesFeaturedOffer'
import ingredient from './schemas/ingredient'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [cake, giftHamper, collection, giftHamperCollection, collectionsDisplayOrder, productsDisplayOrder, testimonial, faq, marketSchedule, blogPost, order, cakesFeaturedOffer, ingredient],
}
