import { NextResponse } from 'next/server';
import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache';

interface CakeQueryResult {
  _id: string
  name: string
  size?: string
  pricing?: { standard?: number; individual?: number }
  category?: string
  slug?: { current: string }
  order?: number
}

interface GiftHamperQueryResult {
  _id: string
  name: string
  price?: number
  category?: string
  slug?: { current: string }
  order?: number
}

export async function GET() {
  try {
    const cakesConfig = getCacheConfig('cakes')
    const giftHampersConfig = getCacheConfig('giftHampers')
    const toRevalidateSeconds = (value?: number | false) =>
      typeof value === 'number' && Number.isFinite(value) ? value : 0
    const revalidateSeconds = Math.min(
      toRevalidateSeconds(cakesConfig.revalidate),
      toRevalidateSeconds(giftHampersConfig.revalidate)
    )
    
    // Fetch cakes
    const cakes = await cachedSanityFetch<CakeQueryResult[]>(`
      *[_type == "cake"] {
        _id,
        name,
        size,
        pricing,
        category,
        slug,
        order
      } | order(order asc, _createdAt desc)
    `, {}, cakesConfig);

    // Fetch gift hampers
    const giftHampers = await cachedSanityFetch<GiftHamperQueryResult[]>(`
      *[_type == "giftHamper"] {
        _id,
        name,
        price,
        category,
        slug,
        order
      } | order(order asc, _createdAt desc)
    `, {}, giftHampersConfig);

    // Transform data for easier use in the frontend
    const products = [
      ...cakes.map((cake) => ({
        id: cake._id,
        name: cake.name,
        type: 'cake',
        category: cake.category,
        size: cake.size,
        pricing: cake.pricing,
        slug: cake.slug?.current || '',
        displayName: `${cake.name} (${cake.size} inch)`,
        standardPrice: cake.pricing?.standard || 0,
        individualPrice: cake.pricing?.individual || 0,
      })),
      ...giftHampers.map((hamper) => ({
        id: hamper._id,
        name: hamper.name,
        type: 'gift-hamper',
        category: hamper.category,
        price: hamper.price || 0,
        slug: hamper.slug?.current || '',
        displayName: hamper.name,
        standardPrice: hamper.price || 0,
        individualPrice: hamper.price || 0,
      })),
    ];

    return NextResponse.json(
      { products },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${revalidateSeconds}, stale-while-revalidate=86400`
        }
      }
    );
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
