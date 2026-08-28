import { NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getPrivacyRetentionPreview } from '@/lib/privacy-retention/service'
import { retentionRouteErrorResponse } from '@/lib/privacy-retention/http'
import { privateJsonResponse } from '@/lib/security/internal-route'
import { withRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

async function handleRequest(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return privateJsonResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    const rawPage = request.nextUrl.searchParams.get('page') || '1'
    if (!/^\d{1,5}$/.test(rawPage)) {
      return privateJsonResponse({ error: 'Invalid retention page.' }, 400)
    }

    return privateJsonResponse(await getPrivacyRetentionPreview({
      page: Number.parseInt(rawPage, 10)
    }))
  } catch (error) {
    return retentionRouteErrorResponse(error, 'admin.privacy-retention.preview')
  }
}

export async function GET(request: NextRequest) {
  return withRateLimit(handleRequest, {
    windowMs: 60 * 1000,
    maxRequests: 30,
    distributedScope: 'admin-privacy-retention'
  })(request)
}
