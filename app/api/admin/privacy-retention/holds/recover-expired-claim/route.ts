import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  authorizeRetentionMutation,
  parseStrictJsonBody,
  retentionCandidateIdSchema,
  retentionPasswordSchema
} from '@/lib/privacy-retention/http'
import {
  PrivacyRetentionClaimRecoveryError,
  recoverExpiredPrivacyRetentionClaimAndPlaceHold
} from '@/lib/privacy-retention/claim-recovery'
import { isPrivacyRetentionHoldReason } from '@/lib/privacy-retention/policy'
import { logger } from '@/lib/logger'
import { withRateLimit } from '@/lib/rate-limit'
import {
  privateJsonResponse,
  requireSameOriginMutation
} from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

const requestSchema = z.object({
  password: retentionPasswordSchema,
  candidateId: retentionCandidateIdSchema,
  reason: z.string().min(1).max(64),
  reviewAt: z.string().datetime(),
  confirmation: z.string().min(1).max(220)
}).strict()

const getRecoveryErrorMessage = (
  error: PrivacyRetentionClaimRecoveryError
) => {
  if (error.code === 'RETENTION_CONFIRMATION_INVALID') {
    return 'Enter the exact recovery confirmation phrase shown.'
  }
  if (error.code === 'RETENTION_HOLD_REVIEW_DATE_INVALID') {
    return 'Choose a future legal-hold review date.'
  }
  if (error.code === 'RETENTION_RECORD_NOT_FOUND') {
    return 'The retention record was not found.'
  }
  if (error.code === 'RETENTION_HOLD_RECOVERY_ALREADY_HELD') {
    return 'This record is already protected by a legal hold.'
  }
  if (error.code === 'RETENTION_HOLD_RECOVERY_EXPIRED_CLAIM_REQUIRED') {
    return 'No expired reversible deletion claim exists for this record. Use the normal legal-hold action.'
  }
  if (error.code === 'RETENTION_HOLD_RECOVERY_CLAIM_LIVE') {
    return 'A live deletion claim is still active. Wait for its lease to expire or review the active retention run.'
  }
  return 'Deletion may already have started, so this claim cannot be cancelled automatically.'
}

async function handleRecovery(request: NextRequest) {
  const body = await parseStrictJsonBody(request, requestSchema)
  if (!body || !isPrivacyRetentionHoldReason(body.reason)) {
    return privateJsonResponse({ error: 'Invalid legal-hold recovery request.' }, 400)
  }

  const authorizationError = await authorizeRetentionMutation(request, body.password)
  if (authorizationError) {
    return authorizationError
  }

  try {
    const result = await recoverExpiredPrivacyRetentionClaimAndPlaceHold({
      candidateId: body.candidateId,
      reason: body.reason,
      reviewAt: body.reviewAt,
      confirmation: body.confirmation
    })

    return privateJsonResponse({
      status: result.status,
      recordReference: result.recordReference,
      claimRecovered: result.claimRecovered,
      holdReviewAt: result.holdReviewAt,
      recoveredAt: result.recoveredAt
    })
  } catch (error) {
    if (error instanceof PrivacyRetentionClaimRecoveryError && error.status < 500) {
      return privateJsonResponse({ error: getRecoveryErrorMessage(error) }, error.status)
    }

    logger.error('Privacy-retention claim recovery failed', {
      operation: 'admin.privacy-retention.claim-recovery-hold',
      ...toSafeOperationalError(error)
    })
    return privateJsonResponse({
      error: 'The deletion claim could not be recovered safely.'
    }, 500)
  }
}

export async function POST(request: NextRequest) {
  const originError = requireSameOriginMutation(request)
  if (originError) {
    return originError
  }

  return withRateLimit(handleRecovery, {
    windowMs: 60 * 1000,
    maxRequests: 5,
    distributedScope: 'admin-privacy-retention'
  })(request)
}
