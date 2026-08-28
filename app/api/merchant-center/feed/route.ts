import { getAllCakes } from '@/app/utils/fetchCakes'
import { getAllGiftHampers } from '@/app/utils/fetchGiftHampers'
import {
  generateCakeMerchantItem,
  generateGiftHamperMerchantItem
} from '@/lib/merchant-center/feed-items'
import { privateJsonResponse } from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'
import { urlFor } from '@/sanity/lib/image'
import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'

interface MerchantImage {
  asset?: {
    _ref?: string
  }
}

const baseUrl = 'https://olgishcakes.co.uk'

function buildImageUrl(image: MerchantImage) {
  const imageReference = image.asset?._ref

  if (!imageReference) {
    return ''
  }

  return urlFor(imageReference).width(800).height(800).url()
}

function isGeneratedItem(item: string | null): item is string {
  return item !== null
}

const generateProductFeed = unstable_cache(
  async () => {
    const [cakes, giftHampers] = await Promise.all([
      getAllCakes(),
      getAllGiftHampers()
    ])
    const cakeItems = cakes
      .map((cake) => generateCakeMerchantItem(cake, baseUrl, buildImageUrl))
      .filter(isGeneratedItem)
    const hamperItems = giftHampers
      .map((hamper) => generateGiftHamperMerchantItem(hamper, baseUrl, buildImageUrl))
      .filter(isGeneratedItem)
    const items = [...cakeItems, ...hamperItems]

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Olgish Cakes - Ukrainian Bakery Products</title>
    <link>${baseUrl}</link>
    <description>Traditional Ukrainian cakes and gift hampers from Olgish Cakes in Leeds</description>
    <language>en-GB</language>
    <lastBuildDate>${new Date().toISOString()}</lastBuildDate>

    ${items.join('\n')}

  </channel>
</rss>`
  },
  ['merchant-center-feed-v2'],
  {
    tags: ['cakes', 'cakes-by-post', 'merchant-center-feed']
  }
)

export async function GET() {
  try {
    const xmlContent = await generateProductFeed()

    return new NextResponse(xmlContent, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=0'
      }
    })
  } catch (error) {
    const safeError = toSafeOperationalError(error)

    console.error('Merchant Center feed generation failed', {
      operation: 'merchant-center-feed',
      ...safeError
    })

    return privateJsonResponse({
      error: 'Failed to generate product feed',
      code: safeError.code
    }, 500)
  }
}
