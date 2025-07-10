import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

export interface Cake {
  _id: string;
  _createdAt: string;
  name: string;
  slug: {
    current: string;
  };
  description: string;
  shortDescription?: string;
  size: string;
  pricing: {
    standard: number;
    individual: number;
  };
  designs: {
    standard: Array<{
      _type: string;
      asset?: {
        _ref: string;
      };
      isMain?: boolean;
    }>;
  };
  category: string;
  ingredients: string[];
  allergens?: string[];
}

// Cache for expensive queries
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function getAllCakes(): Promise<Cake[]> {
  const cacheKey = "all-cakes";
  const cached = getCachedData<Cake[]>(cacheKey);
  if (cached) return cached;

  const query = `*[_type == "cake"] | order(_createdAt desc) {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    size,
    pricing,
    designs {
      standard[] {
        _type,
        asset,
        isMain
      }
    },
    category,
    ingredients,
    allergens
  }`;

  try {
    const data = await client.fetch(query);
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error fetching all cakes:", error);
    return [];
  }
}

export async function getFeaturedCakes(): Promise<Cake[]> {
  const cacheKey = "featured-cakes";
  const cached = getCachedData<Cake[]>(cacheKey);
  if (cached) return cached;

  const query = groq`*[_type == "cake" && isFeatured == true] | order(_createdAt desc) {
    _id,
    name,
    description,
    shortDescription,
    pricing,
    category,
    slug,
    designs {
      standard[] {
        asset {
          _ref
        },
        isMain
      }
    }
  }`;

  try {
    const data = await client.fetch(query);
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error fetching featured cakes:", error);
    return [];
  }
}

export async function getCakeBySlug(slug: string): Promise<Cake | null> {
  const cacheKey = `cake-${slug}`;
  const cached = getCachedData<Cake>(cacheKey);
  if (cached) return cached;

  const query = `*[_type == "cake" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    size,
    pricing,
    designs {
      standard[] {
        _type,
        asset,
        isMain,
        alt
      },
      individual[] {
        _type,
        asset,
        isMain,
        alt
      }
    },
    category,
    ingredients,
    allergens
  }`;

  try {
    const data = await client.fetch(query, { slug });
    if (data) {
      setCachedData(cacheKey, data);
    }
    return data;
  } catch (error) {
    console.error("Error fetching cake by slug:", error);
    return null;
  }
}

// Clear cache function for development
export function clearCache(): void {
  cache.clear();
}
