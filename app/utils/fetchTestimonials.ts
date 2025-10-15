import { client } from "@/sanity/lib/client";
import { Testimonial } from "../types/testimonial";

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

export async function getAllTestimonialsStats(): Promise<{ count: number; averageRating: number }> {
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

    return { count, averageRating };
  } catch (error) {
    console.error("Error fetching testimonial stats:", error);
    return { count: 0, averageRating: 5.0 };
  }
}
