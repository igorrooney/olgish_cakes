import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/lib/client'
import { RECENTLY_PUBLISHED_ARTICLE_SLUGS_QUERY } from '@/lib/queries/articles'

const DEFAULT_LOOKBACK_MINUTES = 45
const MIN_LOOKBACK_MINUTES = 5
const MAX_LOOKBACK_MINUTES = 1440

function getCronAuthorizationToken() {
  return process.env.CRON_SECRET || process.env.REVALIDATE_SECRET
}

function isAuthorized(request: NextRequest) {
  const expectedToken = getCronAuthorizationToken()
  const authHeader = request.headers.get('authorization')

  return Boolean(expectedToken) && authHeader === `Bearer ${expectedToken}`
}

function getLookbackMinutes(request: NextRequest) {
  const rawValue = request.nextUrl.searchParams.get('lookbackMinutes')

  if (rawValue === null) {
    return DEFAULT_LOOKBACK_MINUTES
  }

  const parsedValue = Number.parseInt(rawValue, 10)

  if (!Number.isFinite(parsedValue)) {
    return DEFAULT_LOOKBACK_MINUTES
  }

  return Math.min(MAX_LOOKBACK_MINUTES, Math.max(MIN_LOOKBACK_MINUTES, parsedValue))
}

async function getDueArticleSlugs(lookbackMinutes: number) {
  const since = new Date(Date.now() - (lookbackMinutes * 60 * 1000)).toISOString()

  return serverClient.fetch<Array<{ slug: string }>>(RECENTLY_PUBLISHED_ARTICLE_SLUGS_QUERY, { since })
}

async function handleRequest(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const lookbackMinutes = getLookbackMinutes(request)
  const dueArticles = await getDueArticleSlugs(lookbackMinutes)
  const slugs = Array.from(new Set(dueArticles.map((article) => article.slug)))

  if (slugs.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No newly due articles required revalidation.',
      lookbackMinutes,
      revalidatedCount: 0,
      slugs: []
    })
  }

  revalidatePath('/blog')

  slugs.forEach((slug) => {
    revalidatePath(`/blog/${slug}`)
  })

  revalidateTag('articles', 'max')
  revalidateTag('article', 'max')
  revalidateTag('sitemaps', 'max')

  return NextResponse.json({
    success: true,
    message: 'Revalidated newly due articles.',
    lookbackMinutes,
    revalidatedCount: slugs.length,
    slugs
  })
}

export async function GET(request: NextRequest) {
  return handleRequest(request)
}

export async function POST(request: NextRequest) {
  return handleRequest(request)
}
