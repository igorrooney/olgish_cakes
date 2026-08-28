import { NextRequest } from 'next/server'
import { z } from 'zod'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { listPrivacyRetentionLifecycleIssues } from '@/lib/privacy-retention/lifecycle-review'
import { retentionRouteErrorResponse } from '@/lib/privacy-retention/http'
import { privateJsonResponse } from '@/lib/security/internal-route'
import { withRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20)
}).strict()

async function handleRequest(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return privateJsonResponse({ error: 'Unauthorized' }, 401)
  }

  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()))
  if (!parsed.success) {
    return privateJsonResponse({ error: 'Invalid lifecycle-review page.' }, 400)
  }

  try {
    return privateJsonResponse(await listPrivacyRetentionLifecycleIssues(parsed.data))
  } catch (error) {
    return retentionRouteErrorResponse(error, 'admin.privacy-retention.lifecycle-issues')
  }
}

export async function GET(request: NextRequest) {
  return withRateLimit(handleRequest, {
    windowMs: 60 * 1000,
    maxRequests: 30,
    distributedScope: 'admin-privacy-retention'
  })(request)
}
