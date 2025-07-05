import { client } from "@/sanity/lib/client";

export async function getFeaturedTestimonials(limit: number = 3) {
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
