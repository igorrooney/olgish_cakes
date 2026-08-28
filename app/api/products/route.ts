import { NextResponse } from 'next/server'
import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'
import { logger } from '@/lib/logger'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'
import { PRODUCTS_CAKES_QUERY } from '@/lib/queries/cakes'
import { PRODUCTS_GIFT_HAMPERS_QUERY } from '@/lib/queries/giftHampers'

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
    
    // Fetch cakes
    const cakes = await cachedSanityFetch<CakeQueryResult[]>(PRODUCTS_CAKES_QUERY, {}, cakesConfig)

    // Fetch gift hampers
    const giftHampers = await cachedSanityFetch<GiftHamperQueryResult[]>(
      PRODUCTS_GIFT_HAMPERS_QUERY,
      {},
      giftHampersConfig
    )

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
        individualPrice: cake.pricing?.individual || 0
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
        individualPrice: hamper.price || 0
      }))
    ]

    return NextResponse.json(
      { products },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )
  } catch (error) {
    logger.error('Failed to fetch products', {
      operation: 'products.fetch',
      ...toSafeOperationalError(error)
    })
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
