import dotenv from "dotenv";
import { createClient } from "@sanity/client";

dotenv.config({ path: "./.env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-03-31",
});

async function checkTestimonials() {
  try {
    const testimonials = await client.fetch('*[_type == "testimonial"]');
    console.log("Found testimonials:", testimonials.length);
    console.log("Testimonials:", JSON.stringify(testimonials, null, 2));
  } catch (error) {
    console.error("Error checking testimonials:", error);
  }
}

checkTestimonials();
