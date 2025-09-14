import { client, getClient, USE_REAL_TIME_DATA } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { Cake } from "@/types/cake";

// Cache configuration based on real-time setting
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = USE_REAL_TIME_DATA
  ? 0
  : process.env.NODE_ENV === "development"
    ? 30 * 1000
    : 5 * 60 * 1000;

// Revalidation settings
const REVALIDATE_TIME = USE_REAL_TIME_DATA ? 0 : process.env.NODE_ENV === "development" ? 0 : 300;

function getCachedData<T>(key: string): T | null {
  if (USE_REAL_TIME_DATA) {
    return null; // No caching for real-time data
  }

  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  if (!USE_REAL_TIME_DATA) {
    cache.set(key, { data, timestamp: Date.now() });
  }
}

export async function getAllCakes(preview = false): Promise<Cake[]> {
  const cacheKey = `all-cakes-${preview ? "preview" : "published"}`;
  const cached = getCachedData<Cake[]>(cacheKey);
  if (cached && !preview) return cached;

  const query = `*[_type == "cake"] | order(_createdAt desc) {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    size,
    pricing,
    mainImage {
      _type,
      asset
    },
    images {
      _type,
      asset
    },
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
    const sanityClient = getClient(preview);
    const data = await sanityClient.fetch(query);

    if (!preview) {
      setCachedData(cacheKey, data);
    }
    return data;
  } catch (error) {
    console.error("Error fetching all cakes:", error);
    return [];
  }
}

export async function getFeaturedCakes(preview = false): Promise<Cake[]> {
  const cacheKey = `featured-cakes-${preview ? "preview" : "published"}`;
  const cached = getCachedData<Cake[]>(cacheKey);
  if (cached && !preview) return cached;

  const query = groq`*[_type == "cake" && isFeatured == true] | order(_createdAt desc) {
    _id,
    name,
    description,
    shortDescription,
    pricing,
    category,
    slug,
    mainImage {
      _type,
      asset
    },
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
    const sanityClient = getClient(preview);
    const data = await sanityClient.fetch(query);

    if (!preview) {
      setCachedData(cacheKey, data);
    }
    return data;
  } catch (error) {
    console.error("Error fetching featured cakes:", error);
    return [];
  }
}

export async function getCakeBySlug(slug: string, preview = false): Promise<Cake | null> {
  const cacheKey = `cake-${slug}-${preview ? "preview" : "published"}`;
  const cached = getCachedData<Cake>(cacheKey);
  if (cached && !preview) return cached;

  const query = `*[_type == "cake" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    size,
    pricing,
    mainImage {
      _type,
      asset
    },
    images {
      _type,
      asset
    },
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
    const sanityClient = getClient(preview);
    const data = await sanityClient.fetch(query, { slug });

    if (data && !preview) {
      setCachedData(cacheKey, data);
    }
    return data;
  } catch (error) {
    console.error("Error fetching cake by slug:", error);
    return null;
  }
}

// Revalidation helper
export function getRevalidateTime(): number {
  return REVALIDATE_TIME;
}

// Clear cache function
export function clearCache(): void {
  cache.clear();
  console.log("Cache cleared");
}

// Cache invalidation
export async function invalidateCache(pattern?: string): Promise<void> {
  if (pattern) {
    // Clear specific cache entries
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
    console.log(`Cache cleared for pattern: ${pattern}`);
  } else {
    // Clear all cache
    cache.clear();
    console.log("All cache cleared");
  }
}
