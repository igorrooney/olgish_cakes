import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/lib/client'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'
import { ADMIN_CAKES_QUERY } from '@/lib/queries/cakes'

// GET - Fetch all cakes for admin selection
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const cakes = await serverClient.fetch(ADMIN_CAKES_QUERY)

    return NextResponse.json({
      success: true,
      cakes
    })

  } catch (error) {
    logger.error('Failed to fetch cakes', {
      operation: 'admin.cakes.fetch',
      ...toSafeOperationalError(error)
    })
    return NextResponse.json(
      { error: 'Failed to fetch cakes' },
      { status: 500 }
    )
  }
}
