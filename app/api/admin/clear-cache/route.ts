import { NextRequest, NextResponse } from 'next/server'
import { invalidateCache } from '@/app/utils/fetchCakes'
import { verifyAdminAuthToken } from '@/lib/admin/auth-token'

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

    return NextResponse.json({
      success: true,
      message: pattern ? `Cache cleared for pattern: ${pattern}` : 'All cache cleared',
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
