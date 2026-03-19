import { NextResponse } from 'next/server'
import { getCatalogByPostCakesData } from '../../../cakes/catalogPageData'

export async function GET() {
  try {
    const data = await getCatalogByPostCakesData()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    })
  } catch (error) {
    console.error('Failed to fetch by-post cakes catalog data:', error)
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
