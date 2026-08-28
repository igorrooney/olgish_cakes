import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  authorizeRetentionMutation,
  parseStrictJsonBody,
  retentionPasswordSchema
} from '@/lib/privacy-retention/http'
import {
  closeEventPhotoRetentionLifecycle,
  PrivacyRetentionLifecycleReviewError
} from '@/lib/privacy-retention/lifecycle-review'
import { logger } from '@/lib/logger'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'
import {
  privateJsonResponse,
  requireSameOriginMutation
} from '@/lib/security/internal-route'
import { withRateLimit } from '@/lib/rate-limit'

const requestIdSchema = z.string().uuid()
const requestSchema = z.object({
  password: retentionPasswordSchema,
  confirmation: z.string().min(1).max(160)
}).strict()

const getSafeMessage = (code: string) => {
  if (code === 'RETENTION_EVENT_NOT_FOUND') {
    return 'The event-photo request was not found.'
  }
  if (code === 'RETENTION_EVENT_ALREADY_CLOSED') {
    return 'This event-photo request is already closed.'
  }
  if (code === 'RETENTION_EVENT_LEGAL_HOLD_ACTIVE') {
    return 'This event-photo request is protected by a legal hold.'
  }
  if (code === 'RETENTION_DELETION_CLAIM_ACTIVE') {
    return 'A retention operation is already processing this request.'
  }
  if (code === 'RETENTION_EVENT_CONFIRMATION_INVALID') {
    return 'Enter the exact event-photo confirmation phrase.'
  }
  return 'The event-photo lifecycle could not be updated safely.'
}

async function handleRequest(request: NextRequest, id: string) {
  const parsedId = requestIdSchema.safeParse(id)
  const body = await parseStrictJsonBody(request, requestSchema)
  if (!parsedId.success || !body) {
    return privateJsonResponse({ error: 'Invalid event-photo lifecycle request.' }, 400)
  }

  const authorizationError = await authorizeRetentionMutation(request, body.password)
  if (authorizationError) {
    return authorizationError
  }

  try {
    return privateJsonResponse(await closeEventPhotoRetentionLifecycle({
      requestId: parsedId.data,
      confirmation: body.confirmation
    }))
  } catch (error) {
    if (error instanceof PrivacyRetentionLifecycleReviewError && error.status < 500) {
      return privateJsonResponse({
        error: getSafeMessage(error.code),
        code: error.code
      }, error.status)
    }

    logger.error('Event-photo retention lifecycle update failed', {
      operation: 'admin.privacy-retention.event-photo.close',
      recordReference: id,
      ...toSafeOperationalError(error)
    })
    return privateJsonResponse({
      error: 'The event-photo lifecycle could not be updated safely.'
    }, 500)
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const originError = requireSameOriginMutation(request)
  if (originError) {
    return originError
  }

  const { id } = await context.params
  return withRateLimit(
    (limitedRequest) => handleRequest(limitedRequest, id),
    {
      windowMs: 60 * 1000,
      maxRequests: 5,
      distributedScope: 'admin-privacy-retention'
    }
  )(request)
}
