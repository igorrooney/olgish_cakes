/**
 * Cache configuration for Sanity queries
 * All times are in seconds
 */
export const SANITY_CACHE_CONFIG = {
    testimonials: {
        revalidate: 12 * 60 * 60, // 12 hours
        tags: ['testimonials']
    },
    testimonialStats: {
        revalidate: 12 * 60 * 60, // 12 hours
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
    marketSchedule: {
        revalidate: 60 * 60, // 1 hour
        tags: ['market-schedule']
    },
    faqs: {
        revalidate: 24 * 60 * 60, // 24 hours
        tags: ['faqs']
    },
    blogPosts: {
        revalidate: 60 * 60, // 1 hour
        tags: ['blog']
    },
    blogPost: {
        revalidate: 60 * 60, // 1 hour
        tags: ['blog']
    },
    sitemaps: {
        revalidate: 6 * 60 * 60, // 6 hours
        tags: ['sitemaps']
    },
    individualPages: {
        revalidate: 60 * 60, // 1 hour
        tags: ['pages']
    }
} as const
