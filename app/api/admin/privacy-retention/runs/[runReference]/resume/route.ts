import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  authorizeRetentionMutation,
  parseStrictJsonBody,
  retentionPasswordSchema,
  retentionRouteErrorResponse,
  retentionRunReferenceSchema
} from '@/lib/privacy-retention/http'
import { resumePrivacyRetentionRun } from '@/lib/privacy-retention/service'
import { withRateLimit } from '@/lib/rate-limit'
import {
  privateJsonResponse,
  requireSameOriginMutation
} from '@/lib/security/internal-route'

export const dynamic = 'force-dynamic'

const requestSchema = z.object({
  password: retentionPasswordSchema,
  confirmation: z.string().min(1).max(64)
}).strict()

async function handleResume(
  request: NextRequest,
  runReferenceValue: string
) {
  const body = await parseStrictJsonBody(request, requestSchema)
  if (!body) {
    return privateJsonResponse({ error: 'Invalid retention resume request.' }, 400)
  }

  const authorizationError = await authorizeRetentionMutation(request, body.password)
  if (authorizationError) {
    return authorizationError
  }

  const parsedReference = retentionRunReferenceSchema.safeParse(runReferenceValue)
  if (!parsedReference.success) {
    return privateJsonResponse({ error: 'Invalid run reference.' }, 400)
  }

  try {
    return privateJsonResponse(await resumePrivacyRetentionRun({
      runReference: parsedReference.data,
      confirmation: body.confirmation
    }))
  } catch (error) {
    return retentionRouteErrorResponse(
      error,
      'admin.privacy-retention.resume'
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ runReference: string }> }
) {
  const originError = requireSameOriginMutation(request)
  if (originError) {
    return originError
  }

  const { runReference } = await context.params
  return withRateLimit(
    (limitedRequest) => handleResume(limitedRequest, runReference),
    {
      windowMs: 60 * 1000,
      maxRequests: 5,
      distributedScope: 'admin-privacy-retention'
    }
  )(request)
}
