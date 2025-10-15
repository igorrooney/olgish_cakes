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

// Environment-specific cache duration: 24 hours in production, 1 hour in development
const CACHE_DURATION = process.env.NODE_ENV === 'production' 
  ? 24 * 60 * 60 * 1000  // 24 hours for production (testimonials don't change frequently)
  : 60 * 60 * 1000;       // 1 hour for development (faster iteration)

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
    return { count: cachedStats.count, averageRating: cachedStats.averageRating };
  }

  try {
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

    return { count, averageRating };
  } catch (error) {
    console.error("Error fetching testimonial stats:", error);
    // Return cached data if available, otherwise return defaults
    return cachedStats 
      ? { count: cachedStats.count, averageRating: cachedStats.averageRating }
      : { count: 0, averageRating: 5.0 };
  }
}
