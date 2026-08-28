import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  authorizeRetentionMutation,
  parseStrictJsonBody,
  retentionCandidateIdSchema,
  retentionPasswordSchema,
  retentionRouteErrorResponse
} from '@/lib/privacy-retention/http'
import { isPrivacyRetentionHoldReason } from '@/lib/privacy-retention/policy'
import {
  releasePrivacyRetentionLegalHold,
  setPrivacyRetentionLegalHold
} from '@/lib/privacy-retention/service'
import {
  privateJsonResponse,
  requireSameOriginMutation
} from '@/lib/security/internal-route'
import { withRateLimit } from '@/lib/rate-limit'

const holdSchema = z.object({
  password: retentionPasswordSchema,
  candidateId: retentionCandidateIdSchema,
  reason: z.string().min(1).max(64),
  reviewAt: z.string().datetime()
}).strict()

const releaseSchema = z.object({
  password: retentionPasswordSchema,
  candidateId: retentionCandidateIdSchema,
  confirmation: z.string().min(1).max(220)
}).strict()

async function handleHold(request: NextRequest) {
  const body = await parseStrictJsonBody(request, holdSchema)
  if (!body || !isPrivacyRetentionHoldReason(body.reason)) {
    return privateJsonResponse({ error: 'Invalid legal-hold request.' }, 400)
  }

  const authorizationError = await authorizeRetentionMutation(request, body.password)
  if (authorizationError) {
    return authorizationError
  }

  try {
    return privateJsonResponse(await setPrivacyRetentionLegalHold({
      candidateId: body.candidateId,
      reason: body.reason,
      reviewAt: body.reviewAt
    }))
  } catch (error) {
    return retentionRouteErrorResponse(error, 'admin.privacy-retention.hold')
  }
}

async function handleRelease(request: NextRequest) {
  const body = await parseStrictJsonBody(request, releaseSchema)
  if (!body) {
    return privateJsonResponse({ error: 'Invalid legal-hold release request.' }, 400)
  }

  const authorizationError = await authorizeRetentionMutation(request, body.password)
  if (authorizationError) {
    return authorizationError
  }

  try {
    return privateJsonResponse(await releasePrivacyRetentionLegalHold({
      candidateId: body.candidateId,
      confirmation: body.confirmation
    }))
  } catch (error) {
    return retentionRouteErrorResponse(error, 'admin.privacy-retention.release-hold')
  }
}

export async function POST(request: NextRequest) {
  const originError = requireSameOriginMutation(request)
  if (originError) {
    return originError
  }

  return withRateLimit(handleHold, {
    windowMs: 60 * 1000,
    maxRequests: 5,
    distributedScope: 'admin-privacy-retention'
  })(request)
}

export async function DELETE(request: NextRequest) {
  const originError = requireSameOriginMutation(request)
  if (originError) {
    return originError
  }

  return withRateLimit(handleRelease, {
    windowMs: 60 * 1000,
    maxRequests: 5,
    distributedScope: 'admin-privacy-retention'
  })(request)
}
