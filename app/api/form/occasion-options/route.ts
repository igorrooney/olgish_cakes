import { NextResponse } from 'next/server'
import { buildOccasionOptionsFromCollections } from '@/app/components/homepage/formOptions'
import { getHomepageCollections } from '@/app/utils/fetchCollections'

export async function GET() {
  try {
    const collections = await getHomepageCollections()
    const occasionOptions = buildOccasionOptionsFromCollections(collections)

    return NextResponse.json(
      { occasionOptions },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
          'X-Robots-Tag': 'noindex, nofollow'
        }
      }
    )
  } catch (error) {
    console.error('Failed to fetch occasion options:', error)

    return NextResponse.json(
      { error: 'Failed to fetch occasion options' },
      {
        status: 500,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow'
        }
      }
    )
  }
}