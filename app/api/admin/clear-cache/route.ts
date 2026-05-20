import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { invalidateCache } from '@/app/utils/fetchCakes'
import { categoryLandingCanonicalPaths } from '@/app/cakes/categoryLandingConfig'
import { verifyAdminAuthToken } from '@/lib/admin/auth-token'

const publicPathsToRevalidate = [
  '/',
  '/cakes',
  '/cakes-by-post',
  '/faqs',
  '/blog',
  '/allergens',
  '/get-custom-quote',
  '/api/products',
  '/api/catalog/custom-cakes',
  '/api/catalog/by-post-cakes',
  '/api/form/occasion-options',
  ...categoryLandingCanonicalPaths
] as const

const sanityTagsToRevalidate = [
  'articles',
  'article',
  'cake-collections',
  'cakes',
  'cakes-by-post',
  'cakes-featured-offer',
  'faqs',
  'gift-hamper-collections',
  'gift-hampers',
  'ingredients',
  'market-schedule',
  'pages',
  'sitemaps',
  'stats',
  'testimonials'
] as const

function getAdminAuthToken(request: NextRequest): string {
  return request.cookies.get('admin_auth_token')?.value?.trim() || ''
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const authToken = getAdminAuthToken(request)

  if (await verifyAdminAuthToken(authToken)) {
    return true
  }

  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.ADMIN_SECRET_TOKEN?.trim()

  return Boolean(expectedToken) && authHeader === `Bearer ${expectedToken}`
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pattern } = body

    await invalidateCache(pattern)
    publicPathsToRevalidate.forEach((path) => {
      revalidatePath(path)
    })
    sanityTagsToRevalidate.forEach((tag) => {
      revalidateTag(tag, { expire: 0 })
    })

    return NextResponse.json({
      success: true,
      message: pattern ? `Website cache revalidated for pattern: ${pattern}` : 'Website cache revalidated',
      revalidated: {
        paths: publicPathsToRevalidate.length,
        tags: sanityTagsToRevalidate.length
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Admin cache clear error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Cache clear failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Admin cache management endpoint is active',
    usage: 'POST with optional pattern parameter'
  })
}
