import { getClient } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { Cake } from "@/types/cake";
import { CakesFeaturedOffer } from "@/types/cakeFeaturedOffer";
import { cachedSanityFetch, getCacheConfig } from "@/lib/sanity-cache";
import { CAKES_FEATURED_OFFER_QUERY } from "@/lib/queries/cakes";

interface FeaturedOfferImageQueryResult {
  alt?: string
  asset?: {
    url?: string
  }
}

interface CakesFeaturedOfferQueryResult {
  isActive?: boolean
  eyebrow?: string
  title?: string
  description?: string
  ctaLabel?: string
  overrideImage?: FeaturedOfferImageQueryResult
  featuredCake?: {
    name?: string
    slug?: {
      current?: string
    }
    mainImage?: FeaturedOfferImageQueryResult
  }
}

// Helper function to validate Sanity environment variables at runtime
function validateSanityConfig() {
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  
  if (!dataset || !projectId) {
    throw new Error(
      `Missing required Sanity environment variables: ${
        !dataset ? 'NEXT_PUBLIC_SANITY_DATASET' : ''
      }${!dataset && !projectId ? ', ' : ''}${
        !projectId ? 'NEXT_PUBLIC_SANITY_PROJECT_ID' : ''
      }`
    );
  }
}

// Revalidation settings for backwards compatibility (no time-based revalidation)
const REVALIDATE_TIME = 0

function mapCakesFeaturedOffer(data: CakesFeaturedOfferQueryResult | null): CakesFeaturedOffer | null {
  if (data?.isActive === false) {
    return null
  }

  const cakeSlug = data?.featuredCake?.slug?.current

  if (!cakeSlug) {
    return null
  }

  const imageUrl = data.overrideImage?.asset?.url
    || data.featuredCake?.mainImage?.asset?.url
    || '/images/placeholder-cake.jpg'

  const imageAlt = data.overrideImage?.alt
    || data.featuredCake?.mainImage?.alt
    || `${data.featuredCake?.name || 'Featured cake'} by Olgish Cakes`

  return {
    eyebrow: data.eyebrow?.trim() || 'Featured',
    title: data.title?.trim() || 'FREE Honey Cake Offer',
    description: data.description?.trim() || 'For a limited time enjoy some honey cake on us.\nNo strings attached.',
    ctaLabel: data.ctaLabel?.trim() || 'Get free honey cake',
    cakeSlug,
    imageUrl,
    imageAlt
  }
}

export async function getAllCakes(preview = false): Promise<Cake[]> {
  // Validate Sanity environment variables at runtime
  validateSanityConfig();

  const query = `*[_type == "cake"] | order(order asc, _createdAt desc) {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    bestsellerCustomerStory,
    bestsellerStoryDetails,
    bestsellerShortDescription,
    size,
    pricing,
    order,
    isBestseller,
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
    if (preview) {
      // For preview, use direct fetch without caching
      const sanityClient = getClient(preview);
      return await sanityClient.fetch(query);
    }

    const config = getCacheConfig('cakes')
    const data = await cachedSanityFetch<Cake[]>(query, {}, config)
    return data
  } catch (error) {
    console.error("Error fetching all cakes:", error);
    return [];
  }
}

export async function getFeaturedCakes(preview = false): Promise<Cake[]> {
  // Validate Sanity environment variables at runtime
  validateSanityConfig();

  const query = groq`*[_type == "cake" && isFeatured == true] | order(order asc, _createdAt desc) {
    _id,
    name,
    description,
    shortDescription,
    pricing,
    category,
    slug,
    order,
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
    if (preview) {
      // For preview, use direct fetch without caching
      const sanityClient = getClient(preview);
      return await sanityClient.fetch(query);
    }

    const config = getCacheConfig('cakes')
    const data = await cachedSanityFetch<Cake[]>(query, {}, config)
    return data
  } catch (error) {
    console.error("Error fetching featured cakes:", error);
    return [];
  }
}

export async function getCakesFeaturedOffer(preview = false): Promise<CakesFeaturedOffer | null> {
  validateSanityConfig();

  try {
    if (preview) {
      const sanityClient = getClient(preview);
      const data = await sanityClient.fetch<CakesFeaturedOfferQueryResult | null>(CAKES_FEATURED_OFFER_QUERY);
      return mapCakesFeaturedOffer(data)
    }

    const config = getCacheConfig('cakesFeaturedOffer')
    const data = await cachedSanityFetch<CakesFeaturedOfferQueryResult | null>(
      CAKES_FEATURED_OFFER_QUERY,
      {},
      config
    )

    return mapCakesFeaturedOffer(data)
  } catch (error) {
    console.error("Error fetching cakes featured offer:", error);
    return null
  }
}

export async function getCakeBySlug(slug: string, preview = false): Promise<Cake | null> {
  // Validate Sanity environment variables at runtime
  validateSanityConfig();

  const query = `*[_type == "cake" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    size,
    pricing,
    order,
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
    if (preview) {
      // For preview, use direct fetch without caching
      const sanityClient = getClient(preview);
      return await sanityClient.fetch(query, { slug });
    }

    const config = getCacheConfig('individualPages')
    const data = await cachedSanityFetch<Cake | null>(query, { slug }, config)
    return data
  } catch (error) {
    console.error("Error fetching cake by slug:", error);
    return null;
  }
}

// Revalidation helper for backwards compatibility
export function getRevalidateTime(): number {
  return REVALIDATE_TIME;
}

// Cache invalidation - now handled by Next.js cache tags
// These functions are kept for backwards compatibility but don't do anything
// Cache invalidation should be done via revalidateTag() in API routes
export function clearCache(): void {
  // No-op: cache is now managed by Next.js
}

export async function invalidateCache(pattern?: string): Promise<void> {
  // No-op: cache is now managed by Next.js via tags
  // Use revalidateTag() from 'next/cache' in API routes instead
}

export function getCacheBustingKey(baseKey: string): string {
  // No-op: cache keys are managed automatically
  return baseKey;
}

export async function forceRefreshCakes(): Promise<Cake[]> {
  // Note: This will still use cache until revalidation period expires
  // For immediate refresh, use revalidateTag('cakes') from an API route
  return getAllCakes();
}
