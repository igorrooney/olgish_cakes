/**
 * Deliberately empty structured-data fallbacks.
 *
 * Reviews and aggregate ratings must come from an approved, source-specific
 * evidence record. Missing evidence means omitting the markup, never inventing
 * a testimonial or rating to make a schema look complete.
 */

export const DEFAULT_REVIEWS = [] as const
export const DEFAULT_KYIV_CAKE_REVIEW = null
export const DEFAULT_AGGREGATE_RATING = null
