import { NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import {
  getPrivacyRetentionRunDetails,
  PrivacyRetentionRunDetailsError
} from '@/lib/privacy-retention/run-details'
import { retentionRunReferenceSchema, retentionRouteErrorResponse } from '@/lib/privacy-retention/http'
import { privateJsonResponse } from '@/lib/security/internal-route'
import { withRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

async function handleRequest(
  request: NextRequest,
  runReferenceValue: string
) {
  if (!(await isAdminAuthenticated(request))) {
    return privateJsonResponse({ error: 'Unauthorized' }, 401)
  }

  const parsedReference = retentionRunReferenceSchema.safeParse(runReferenceValue)
  if (!parsedReference.success) {
    return privateJsonResponse({ error: 'Invalid run reference.' }, 400)
  }

  try {
    const details = await getPrivacyRetentionRunDetails(parsedReference.data)
    if (!details) {
      return privateJsonResponse({ error: 'Retention run not found.' }, 404)
    }

    return privateJsonResponse(details)
  } catch (error) {
    if (
      error instanceof PrivacyRetentionRunDetailsError &&
      error.code === 'RETENTION_RUN_REFERENCE_INVALID'
    ) {
      return privateJsonResponse({ error: 'Invalid run reference.' }, 400)
    }

    return retentionRouteErrorResponse(error, 'admin.privacy-retention.run-details')
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ runReference: string }> }
) {
  const { runReference } = await context.params
  const limitedHandler = withRateLimit(
    (limitedRequest) => handleRequest(limitedRequest, runReference),
    {
      windowMs: 60 * 1000,
      maxRequests: 30,
      distributedScope: 'admin-privacy-retention-run-details'
    }
  )
  const response = await limitedHandler(request)

  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}
