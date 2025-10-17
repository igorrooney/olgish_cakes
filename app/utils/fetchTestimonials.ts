import { client } from "@/sanity/lib/client";
import { Testimonial } from "../types/testimonial";

/**
 * Fetch featured testimonials from Sanity CMS
 * @param limit - Maximum number of testimonials to return (default: 3)
 * @returns Array of testimonial objects sorted by date
 * @example
 * const testimonials = await getFeaturedTestimonials(5);
 */
export async function getFeaturedTestimonials(limit: number = 3): Promise<Testimonial[]> {
  try {
    const query = `
      *[_type == "testimonial"] | order(date desc) [0...${limit}] {
        _id,
        customerName,
        cakeType,
        rating,
        date,
        text,
        cakeImage {
          asset->,
          alt
        },
        source
      }
    `;

    const testimonials = await client.fetch(query);
    return testimonials;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}

// Cache for testimonial statistics
let cachedStats: { count: number; averageRating: number; timestamp: number } | null = null;

// Cache duration constants (in milliseconds)
const HOURS_IN_MS = 60 * 60 * 1000;
const CACHE_DURATION_PRODUCTION = 24 * HOURS_IN_MS;  // 24 hours for production
const CACHE_DURATION_DEVELOPMENT = 1 * HOURS_IN_MS;   // 1 hour for development

// Environment-specific cache duration: testimonials don't change frequently
const CACHE_DURATION = process.env.NODE_ENV === 'production' 
  ? CACHE_DURATION_PRODUCTION
  : CACHE_DURATION_DEVELOPMENT;

/**
 * Fetch testimonial statistics with caching to reduce Sanity queries
 * @returns Object containing total count and average rating of all testimonials
 * @example
 * const stats = await getAllTestimonialsStats();
 * // Returns: { count: 16, averageRating: 4.8 }
 */
export async function getAllTestimonialsStats(): Promise<{ count: number; averageRating: number }> {
  // Return cached stats if still valid
  if (cachedStats && Date.now() - cachedStats.timestamp < CACHE_DURATION) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Testimonials] Using cached stats:', cachedStats);
    }
    return { count: cachedStats.count, averageRating: cachedStats.averageRating };
  }

  try {
    const queryStartTime = performance.now();
    const query = `
      *[_type == "testimonial"] {
        rating
      }
    `;

    const testimonials = await client.fetch(query);
    const count = testimonials.length;
    const averageRating = count > 0 
      ? testimonials.reduce((sum: number, t: { rating: number }) => sum + (t.rating || 0), 0) / count
      : 5.0;

    // Update cache
    cachedStats = { count, averageRating, timestamp: Date.now() };

    const queryEndTime = performance.now();
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Testimonials] Stats fetched in ${(queryEndTime - queryStartTime).toFixed(2)}ms: ${count} testimonials, avg rating: ${averageRating.toFixed(1)}`);
    }

    return { count, averageRating };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error fetching testimonial stats:", error);
    }
    // Return cached data if available, otherwise return defaults
    return cachedStats 
      ? { count: cachedStats.count, averageRating: cachedStats.averageRating }
      : { count: 0, averageRating: 5.0 };
  }
}
