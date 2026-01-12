import { getClient } from "@/sanity/lib/client";
import { GiftHamper } from "@/types/giftHamper";
import { getRevalidateTime } from "./fetchCakes";
import { cachedSanityFetch, getCacheConfig } from "@/lib/sanity-cache";

export async function getAllGiftHampers(preview = false): Promise<GiftHamper[]> {
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
    if (preview) {
      // For preview, use direct fetch without caching
      const sanityClient = getClient(preview);
      return await sanityClient.fetch(query);
    }

    const config = getCacheConfig('giftHampers')
    const data = await cachedSanityFetch<GiftHamper[]>(query, {}, config)
    return data
  } catch (error) {
    console.error("Error fetching all gift hampers:", error);
    return [];
  }
}

export { getRevalidateTime };

export async function getGiftHamperBySlug(slug: string, preview = false): Promise<GiftHamper | null> {
  const query = `*[_type == "giftHamper" && slug.current == $slug][0] {
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
    allergens,
    seo {
      metaTitle,
      metaDescription,
      keywords,
      canonicalUrl,
      faq[] {
        question,
        answer
      }
    }
  }`;

  try {
    if (preview) {
      // For preview, use direct fetch without caching
      const sanityClient = getClient(preview);
      return await sanityClient.fetch(query, { slug });
    }

    const config = getCacheConfig('individualPages')
    const data = await cachedSanityFetch<GiftHamper | null>(query, { slug }, config)
    return data
  } catch (error) {
    console.error("Error fetching gift hamper by slug:", error);
    return null;
  }
}

export async function getFeaturedGiftHampers(preview = false): Promise<GiftHamper[]> {
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
    if (preview) {
      // For preview, use direct fetch without caching
      const sanityClient = getClient(preview);
      return await sanityClient.fetch(query);
    }

    const config = getCacheConfig('giftHampers')
    const data = await cachedSanityFetch<GiftHamper[]>(query, {}, config)
    return data
  } catch (e) {
    console.error("Error fetching featured hampers:", e);
    return [];
  }
}
