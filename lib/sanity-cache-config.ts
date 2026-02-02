/**
 * Cache configuration for Sanity queries
 * All times are in seconds
 */
const blogCacheConfig = {
  revalidate: 60 * 60, // 1 hour
  tags: ['blog-posts']
} as const

export const TESTIMONIALS_REVALIDATE = 43200
export const TESTIMONIAL_STATS_REVALIDATE = 43200

export const SANITY_CACHE_CONFIG = {
    testimonials: {
        revalidate: TESTIMONIALS_REVALIDATE,
        tags: ['testimonials']
    },
    testimonialStats: {
        revalidate: TESTIMONIAL_STATS_REVALIDATE,
        tags: ['testimonials', 'stats']
    },
    cakes: {
        revalidate: 60 * 60, // 1 hour
        tags: ['cakes']
    },
    giftHampers: {
        revalidate: 60 * 60, // 1 hour
        tags: ['gift-hampers']
    },
    collections: {
        revalidate: 60 * 60, // 1 hour
        tags: ['collections']
    },
    marketSchedule: {
        revalidate: 60 * 60, // 1 hour
        tags: ['market-schedule']
    },
    faqs: {
        revalidate: 24 * 60 * 60, // 24 hours
        tags: ['faqs']
    },
    blogPosts: blogCacheConfig,
    blogPost: blogCacheConfig,
    sitemaps: {
        revalidate: 6 * 60 * 60, // 6 hours
        tags: ['sitemaps']
    },
    individualPages: {
        revalidate: 60 * 60, // 1 hour
        tags: ['pages']
    }
} as const
