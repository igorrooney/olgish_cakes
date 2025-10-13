import { createClient } from "@sanity/client";
import { groq } from "next-sanity";

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-03-31",
  useCdn: false,
});

export async function getFaqs(): Promise<FAQ[]> {
  try {

    const query = groq`*[_type == "faq"] | order(order asc) {
      _id,
      question,
      answer,
      order
    }`;

    const result = await client.fetch(query);

    if (!Array.isArray(result)) {
      console.error("Unexpected result format:", result);
      return [];
    }

    return result;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    throw error;
  }
}
