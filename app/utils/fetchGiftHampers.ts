import { getClient, USE_REAL_TIME_DATA } from "@/sanity/lib/client";
import { GiftHamper } from "@/types/giftHamper";
import { getRevalidateTime } from "./fetchCakes";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = USE_REAL_TIME_DATA
  ? 0
  : process.env.NODE_ENV === "development"
    ? 30 * 1000
    : 5 * 60 * 1000;

function getCachedData<T>(key: string): T | null {
  if (USE_REAL_TIME_DATA) return null;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  if (USE_REAL_TIME_DATA) return;
  cache.set(key, { data, timestamp: Date.now() });
}

export async function getAllGiftHampers(preview = false): Promise<GiftHamper[]> {
  const cacheKey = `all-gift-hampers-${preview ? "preview" : "published"}`;
  const cached = getCachedData<GiftHamper[]>(cacheKey);
  if (cached && !preview) return cached;

  const query = `*[_type == "giftHamper"] | order(order asc, _createdAt desc) {
    _id,
    _createdAt,
    name,
    slug,
    shortDescription,
    description,
    price,
    order,
    images[] { _type, asset, alt, isMain, caption },
    isFeatured,
    category,
    ingredients,
    allergens
  }`;

  try {
    const sanityClient = getClient(preview);
    const data = await sanityClient.fetch(query);
    if (!preview) setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error fetching all gift hampers:", error);
    return [];
  }
}

export { getRevalidateTime };

export async function getFeaturedGiftHampers(preview = false): Promise<GiftHamper[]> {
  const cacheKey = `featured-gift-hampers-${preview ? "preview" : "published"}`;
  const cached = getCachedData<GiftHamper[]>(cacheKey);
  if (cached && !preview) return cached;

  const query = `*[_type == "giftHamper" && isFeatured == true] | order(order asc, _createdAt desc) {
    _id,
    name,
    slug,
    price,
    order,
    images[] { _type, asset, alt, isMain },
    category
  }`;
  try {
    const sanityClient = getClient(preview);
    const data = await sanityClient.fetch(query);
    if (!preview) setCachedData(cacheKey, data);
    return data;
  } catch (e) {
    console.error("Error fetching featured hampers:", e);
    return [];
  }
}
