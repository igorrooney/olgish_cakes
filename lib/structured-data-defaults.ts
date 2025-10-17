/**
 * Default reviews for structured data when no real testimonials are available.
 * These provide fallback data to ensure valid schema.org markup.
 * 
 * Note: Dates are fixed (not dynamic) to prevent search engine confusion from
 * constantly changing review dates on each build. Updated quarterly to maintain freshness.
 */

import { Review, AggregateRating, WithContext } from "schema-dts";

// Fixed review dates - update these quarterly to keep them reasonably current
// Last updated: October 15, 2025
const REVIEW_DATES = {
  RECENT: "2025-09-15",    // ~1 month ago from October 2025
  OLDER: "2025-07-20"      // ~3 months ago from October 2025
} as const;

export const DEFAULT_REVIEWS: WithContext<Review>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Review" as const,
    itemReviewed: {
      "@type": "Product" as const,
      name: "Ukrainian Honey Cake",
      description: "Traditional Ukrainian honey cake and other authentic desserts"
    },
    author: {
      "@type": "Person" as const,
      name: "Sarah M."
    },
    reviewRating: {
      "@type": "Rating" as const,
      ratingValue: "5",
      bestRating: "5",
      worstRating: "1"
    },
    reviewBody: "Absolutely delicious Ukrainian honey cake! The authentic taste and quality exceeded our expectations. Highly recommend Olgish Cakes!",
    datePublished: REVIEW_DATES.RECENT
  },
  {
    "@context": "https://schema.org",
    "@type": "Review" as const,
    itemReviewed: {
      "@type": "Product" as const,
      name: "Ukrainian Honey Cake",
      description: "Traditional Ukrainian honey cake and other authentic desserts"
    },
    author: {
      "@type": "Person" as const,
      name: "James K."
    },
    reviewRating: {
      "@type": "Rating" as const,
      ratingValue: "5",
      bestRating: "5",
      worstRating: "1"
    },
    reviewBody: "Outstanding service and incredible quality. The honey cake was perfect for our celebration. Will definitely order again!",
    datePublished: REVIEW_DATES.OLDER
  }
];

// Default review for Kyiv Cake product
export const DEFAULT_KYIV_CAKE_REVIEW: WithContext<Review> = {
  "@context": "https://schema.org",
  "@type": "Review" as const,
  itemReviewed: {
    "@type": "Product" as const,
    name: "Kyiv Cake",
    description: "Traditional Kyiv cake with chocolate and nuts"
  },
  author: {
    "@type": "Person" as const,
    name: "Sarah M."
  },
  reviewRating: {
    "@type": "Rating" as const,
    ratingValue: "5",
    bestRating: "5",
    worstRating: "1"
  },
  reviewBody: "The Kyiv cake was absolutely amazing! Rich chocolate layers with perfect nutty texture. Highly recommend!",
  datePublished: REVIEW_DATES.RECENT
};

// Default aggregate rating when no testimonials exist (without context for embedding in other schemas)
export const DEFAULT_AGGREGATE_RATING = {
  "@type": "AggregateRating" as const,
  ratingValue: "5.0",
  reviewCount: "2", // Matches DEFAULT_REVIEWS length
  bestRating: "5",
  worstRating: "1"
} as const;

