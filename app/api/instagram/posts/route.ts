import { NextResponse } from 'next/server'
import {
  getInstagramPostLimit,
  getInstagramRevalidateSeconds,
  getLatestInstagramPosts
} from '@/app/utils/fetchInstagramPosts'

const buildCacheControlHeader = (revalidateSeconds: number) =>
  `public, s-maxage=${revalidateSeconds}, stale-while-revalidate=${revalidateSeconds}`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get('limit')
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : undefined
  const limit = getInstagramPostLimit(parsedLimit)

  try {
    const posts = await getLatestInstagramPosts({ limit })
    const revalidateSeconds = getInstagramRevalidateSeconds()

    return NextResponse.json(
      { data: posts },
      { headers: { 'Cache-Control': buildCacheControlHeader(revalidateSeconds) } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Instagram API route error:', message)
    return NextResponse.json(
      { error: 'Unable to fetch Instagram posts' },
      { status: 500 }
    )
  }
}
