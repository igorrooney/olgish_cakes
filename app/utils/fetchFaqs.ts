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
  apiVersion: "2024-01-01",
  useCdn: false,
});

export async function getFaqs(): Promise<FAQ[]> {
  try {
    console.log("Fetching FAQs from Sanity...");
    const query = groq`*[_type == "faq"] | order(order asc) {
      _id,
      question,
      answer,
      order
    }`;

    console.log("Executing query:", query);
    const result = await client.fetch(query);
    console.log("Query result:", result);

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
