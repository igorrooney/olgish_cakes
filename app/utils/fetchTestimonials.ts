import { cachedSanityFetch, getCacheConfig } from "@/lib/sanity-cache";
import { Testimonial } from "../types/testimonial";

/**
 * Fetch all testimonials from Sanity CMS
 * @returns Array of all testimonial objects sorted by date (newest first)
 * @example
 * const testimonials = await getAllTestimonials();
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    const query = `
      *[_type == "testimonial"] | order(date desc) {
        _id,
        customerName,
        cakeType,
        rating,
        date,
        text,
        source
      }
    `;

    const config = getCacheConfig('testimonials')
    const testimonials = await cachedSanityFetch<Testimonial[]>(query, {}, config)
    return testimonials
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}

/**
 * Fetch featured testimonials from Sanity CMS
 * @param limit - Maximum number of testimonials to return (default: 3)
 * @returns Array of testimonial objects sorted by date
 * @example
 * const testimonials = await getFeaturedTestimonials(5);
 */
export async function getFeaturedTestimonials(limit: number = 3): Promise<Testimonial[]> {
  try {
    // Fetch all and slice client-side for proper caching (same cache for all limits)
    const query = `
      *[_type == "testimonial"] | order(date desc) {
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

    const config = getCacheConfig('testimonials')
    const allTestimonials = await cachedSanityFetch<Testimonial[]>(query, {}, config)
    return allTestimonials.slice(0, limit)
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}

/**
 * Fetch testimonial statistics with caching to reduce Sanity queries
 * @returns Object containing total count and average rating of all testimonials
 * @example
 * const stats = await getAllTestimonialsStats();
 * // Returns: { count: 16, averageRating: 4.8 }
 */
export async function getAllTestimonialsStats(): Promise<{ count: number; averageRating: number }> {
  try {
    const queryStartTime = performance.now();
    const query = `
      *[_type == "testimonial"] {
        rating
      }
    `;

    const config = getCacheConfig('testimonialStats')
    const testimonials = await cachedSanityFetch<Array<{ rating: number }>>(query, {}, config)

    const count = testimonials.length
    const averageRating = count > 0
      ? testimonials.reduce((sum: number, t: { rating: number }) => sum + (t.rating || 0), 0) / count
      : 5.0

    const queryEndTime = performance.now();
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Testimonials] Stats fetched in ${(queryEndTime - queryStartTime).toFixed(2)}ms: ${count} testimonials, avg rating: ${averageRating.toFixed(1)}`);
    }

    return { count, averageRating }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error fetching testimonial stats:", error);
    }
    return { count: 0, averageRating: 5.0 };
  }
}
