import { groq } from "next-sanity";
import { cachedSanityFetch, getCacheConfig } from "@/lib/sanity-cache";

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

export async function getFaqs(): Promise<FAQ[]> {
  try {
    const query = groq`*[_type == "faq"] | order(order asc) {
      _id,
      question,
      answer,
      order
    }`;

    const config = getCacheConfig('faqs')
    const result = await cachedSanityFetch<FAQ[]>(query, {}, config);

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
