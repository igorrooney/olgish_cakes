import { getAllCakes } from '@/app/utils/fetchCakes'
import { getAllGiftHampers } from '@/app/utils/fetchGiftHampers'
import {
  generateCakeMerchantItem,
  generateGiftHamperMerchantItem
} from '@/lib/merchant-center/feed-items'
import {
  isProductionEnvironment,
  productionRouteNotFound
} from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'
import { urlFor } from '@/sanity/lib/image'
import { NextRequest, NextResponse } from 'next/server'

interface MerchantImage {
  asset?: {
    _ref?: string
  }
}

const baseUrl = 'https://olgishcakes.co.uk'
const defaultLimit = 5
const maximumLimit = 50

function buildImageUrl(image: MerchantImage) {
  const imageReference = image.asset?._ref

  if (!imageReference) {
    return ''
  }

  return urlFor(imageReference).width(800).height(800).url()
}

function getLimit(requestUrl: URL) {
  const requestedLimit = Number.parseInt(requestUrl.searchParams.get('limit') || '', 10)

  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    return defaultLimit
  }

  return Math.min(requestedLimit, maximumLimit)
}

function isGeneratedItem(item: string | null): item is string {
  return item !== null
}

export async function GET(request: NextRequest) {
  if (isProductionEnvironment()) {
    return productionRouteNotFound()
  }

  try {
    const requestUrl = new URL(request.url)
    const limit = getLimit(requestUrl)
    const type = requestUrl.searchParams.get('type') || 'all'
    const [cakes, giftHampers] = await Promise.all([
      getAllCakes(),
      getAllGiftHampers()
    ])
    const cakeItems = type === 'cakes' || type === 'all'
      ? cakes
          .map((cake) => generateCakeMerchantItem(cake, baseUrl, buildImageUrl))
          .filter(isGeneratedItem)
      : []
    const hamperItems = type === 'hampers' || type === 'all'
      ? giftHampers
          .map((hamper) => generateGiftHamperMerchantItem(hamper, baseUrl, buildImageUrl))
          .filter(isGeneratedItem)
      : []
    const items = type === 'all'
      ? [
          ...cakeItems.slice(0, Math.ceil(limit / 2)),
          ...hamperItems.slice(0, Math.floor(limit / 2))
        ]
      : [...cakeItems, ...hamperItems].slice(0, limit)

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Olgish Cakes - Test Feed (${items.length} products)</title>
    <link>${baseUrl}</link>
    <description>Test feed for Google Merchant Center validation</description>
    <language>en-GB</language>
    <lastBuildDate>${new Date().toISOString()}</lastBuildDate>

    ${items.join('\n')}

  </channel>
</rss>`

    return new NextResponse(xmlContent, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    const safeError = toSafeOperationalError(error)

    console.error('Merchant Center test feed failed', {
      operation: 'merchant-center-test-feed',
      ...safeError
    })

    return NextResponse.json(
      {
        error: 'Failed to generate test product feed',
        code: safeError.code
      },
      { status: 500 }
    )
  }
}
