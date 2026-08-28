import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  authorizeRetentionMutation,
  parseStrictJsonBody,
  retentionCandidateIdSchema,
  retentionPasswordSchema,
  retentionRouteErrorResponse,
  retentionRunReferenceSchema,
  retentionSnapshotTokenSchema
} from '@/lib/privacy-retention/http'
import { executePrivacyRetentionSelection } from '@/lib/privacy-retention/service'
import { PRIVACY_RETENTION_MAX_SELECTION } from '@/lib/privacy-retention/policy'
import {
  privateJsonResponse,
  requireSameOriginMutation
} from '@/lib/security/internal-route'
import { withRateLimit } from '@/lib/rate-limit'

const requestSchema = z.object({
  password: retentionPasswordSchema,
  confirmation: z.string().min(1).max(64),
  runReference: retentionRunReferenceSchema,
  snapshotToken: retentionSnapshotTokenSchema,
  candidateIds: z.array(retentionCandidateIdSchema).min(1).max(PRIVACY_RETENTION_MAX_SELECTION),
  acknowledgedExternalCopies: z.literal(true)
}).strict()

async function handleRun(request: NextRequest) {
  const body = await parseStrictJsonBody(request, requestSchema)
  if (!body) {
    return privateJsonResponse({ error: 'Invalid retention request.' }, 400)
  }

  const authorizationError = await authorizeRetentionMutation(request, body.password)
  if (authorizationError) {
    return authorizationError
  }

  try {
    return privateJsonResponse(await executePrivacyRetentionSelection({
      runReference: body.runReference,
      snapshotToken: body.snapshotToken,
      confirmation: body.confirmation,
      candidateIds: body.candidateIds,
      acknowledgedExternalCopies: body.acknowledgedExternalCopies
    }))
  } catch (error) {
    return retentionRouteErrorResponse(error, 'admin.privacy-retention.execute')
  }
}

export async function POST(request: NextRequest) {
  const originError = requireSameOriginMutation(request)
  if (originError) {
    return originError
  }

  return withRateLimit(handleRun, {
    windowMs: 60 * 1000,
    maxRequests: 5,
    distributedScope: 'admin-privacy-retention'
  })(request)
}
