import { NextResponse } from 'next/server'
import { getCatalogCustomCakesData } from '../../../cakes/catalogPageData'

export async function GET() {
  try {
    const data = await getCatalogCustomCakesData()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    })
  } catch (error) {
    console.error('Failed to fetch custom cakes catalog data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch custom cakes catalog data' },
      {
        status: 500,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow'
        }
      }
    )
  }
}
