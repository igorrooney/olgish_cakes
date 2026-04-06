import { NextResponse } from 'next/server'
import {
  getInstagramPostLimit,
  getInstagramRevalidateSeconds,
  getLatestInstagramPosts,
  isRecoverableInstagramError
} from '@/app/utils/fetchInstagramPosts'

const buildCacheControlHeader = (revalidateSeconds: number) =>
  `public, s-maxage=${revalidateSeconds}, stale-while-revalidate=${revalidateSeconds}`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get('limit')
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : undefined
  const limit = getInstagramPostLimit(parsedLimit)

  try {
    const posts = await getLatestInstagramPosts({ limit, signal: request.signal })
    const revalidateSeconds = getInstagramRevalidateSeconds()

    return NextResponse.json(
      { data: posts },
      { headers: { 'Cache-Control': buildCacheControlHeader(revalidateSeconds) } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (isRecoverableInstagramError(error)) {
      const revalidateSeconds = getInstagramRevalidateSeconds()

      console.warn(
        'Instagram API route warning. Refresh INSTAGRAM_ACCESS_TOKEN if the token has expired.',
        message
      )

      return NextResponse.json(
        { data: [] },
        { headers: { 'Cache-Control': buildCacheControlHeader(revalidateSeconds) } }
      )
    }

    console.error('Instagram API route error:', message)
    return NextResponse.json(
      { error: 'Unable to fetch Instagram posts' },
      { status: 500 }
    )
  }
}
