import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  authorizeRetentionMutation,
  parseStrictJsonBody,
  retentionPasswordSchema,
  retentionRouteErrorResponse,
  retentionRunReferenceSchema
} from '@/lib/privacy-retention/http'
import { recordPrivacyRetentionOwnerReview } from '@/lib/privacy-retention/service'
import {
  privateJsonResponse,
  requireSameOriginMutation
} from '@/lib/security/internal-route'
import { withRateLimit } from '@/lib/rate-limit'

const requestSchema = z.object({
  password: retentionPasswordSchema,
  confirmation: z.string().min(1).max(64),
  runReference: retentionRunReferenceSchema,
  reviewedSchedule: z.literal(true),
  reviewedExternalSystems: z.literal(true)
}).strict()

async function handleReview(request: NextRequest) {
  const body = await parseStrictJsonBody(request, requestSchema)
  if (!body) {
    return privateJsonResponse({ error: 'Invalid retention review request.' }, 400)
  }

  const authorizationError = await authorizeRetentionMutation(request, body.password)
  if (authorizationError) {
    return authorizationError
  }

  try {
    return privateJsonResponse(await recordPrivacyRetentionOwnerReview({
      runReference: body.runReference,
      confirmation: body.confirmation,
      reviewedSchedule: body.reviewedSchedule,
      reviewedExternalSystems: body.reviewedExternalSystems
    }))
  } catch (error) {
    return retentionRouteErrorResponse(error, 'admin.privacy-retention.review')
  }
}

export async function POST(request: NextRequest) {
  const originError = requireSameOriginMutation(request)
  if (originError) {
    return originError
  }

  return withRateLimit(handleReview, {
    windowMs: 60 * 1000,
    maxRequests: 5,
    distributedScope: 'admin-privacy-retention'
  })(request)
}
