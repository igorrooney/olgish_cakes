/**
 * Cache configuration for Sanity queries
 * All times are in seconds
 */
const NO_REVALIDATE = false

const blogCacheConfig = {
  revalidate: NO_REVALIDATE,
  tags: ['blog-posts']
} as const

export const SANITY_CACHE_CONFIG = {
  testimonials: {
    revalidate: NO_REVALIDATE,
    tags: ['testimonials']
  },
  testimonialStats: {
    revalidate: NO_REVALIDATE,
    tags: ['testimonials', 'stats']
  },
  cakes: {
    revalidate: NO_REVALIDATE,
    tags: ['cakes']
  },
  cakesFeaturedOffer: {
    revalidate: NO_REVALIDATE,
    tags: ['cakes', 'cakes-featured-offer']
  },
  giftHampers: {
    revalidate: NO_REVALIDATE,
    tags: ['gift-hampers']
  },
  collections: {
    revalidate: NO_REVALIDATE,
    tags: ['collections']
  },
  marketSchedule: {
    revalidate: NO_REVALIDATE,
    tags: ['market-schedule']
  },
  faqs: {
    revalidate: NO_REVALIDATE,
    tags: ['faqs']
  },
  blogPosts: blogCacheConfig,
  blogPost: blogCacheConfig,
  sitemaps: {
    revalidate: NO_REVALIDATE,
    tags: ['sitemaps']
  },
  individualPages: {
    revalidate: NO_REVALIDATE,
    tags: ['pages']
  }
} as const
