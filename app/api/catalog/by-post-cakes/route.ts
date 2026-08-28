import { NextResponse } from 'next/server'
import { getCatalogByPostCakesData } from '../../../cakes/catalogPageData'
import { logger } from '@/lib/logger'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

export async function GET() {
  try {
    const data = await getCatalogByPostCakesData()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    })
  } catch (error) {
    logger.error('Failed to fetch by-post cakes catalog data', {
      operation: 'catalog.by-post-cakes.fetch',
      ...toSafeOperationalError(error)
    })
    return NextResponse.json(
      { error: 'Failed to fetch by-post cakes catalog data' },
      {
        status: 500,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow'
        }
      }
    )
  }
}
