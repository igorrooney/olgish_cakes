import 'server-only'

import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { verifyAdminPassword } from '@/lib/admin/credentials.server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { privateJsonResponse } from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'
import { PrivacyRetentionServiceError } from './service'
import {
  PRIVACY_RETENTION_SNAPSHOT_TOKEN_MAX_LENGTH,
  privacyRetentionSnapshotTokenPattern
} from './types'

export const retentionPasswordSchema = z.string().min(1).max(256)
export const retentionCandidateIdSchema = z.string().min(1).max(160)
export const retentionRunReferenceSchema = z.string().regex(/^RET-\d{8}-[A-F0-9]{8}$/)
export const retentionSnapshotTokenSchema = z.string()
  .min(1)
  .max(PRIVACY_RETENTION_SNAPSHOT_TOKEN_MAX_LENGTH)
  .regex(privacyRetentionSnapshotTokenPattern)

export async function parseStrictJsonBody<Schema extends z.ZodTypeAny>(
  request: NextRequest,
  schema: Schema
): Promise<z.infer<Schema> | null> {
  const body = await request.json().catch((): unknown => null)
  const result = schema.safeParse(body)
  return result.success ? result.data : null
}

export async function authorizeRetentionMutation(
  request: NextRequest,
  password: string
) {
  if (!(await isAdminAuthenticated(request))) {
    return privateJsonResponse({ error: 'Unauthorized' }, 401)
  }
  if (!verifyAdminPassword(password)) {
    return privateJsonResponse({ error: 'Invalid admin password' }, 401)
  }
  return null
}

const getServiceErrorMessage = (error: PrivacyRetentionServiceError) => {
  if (error.code === 'RETENTION_CONFIRMATION_INVALID') {
    return 'Enter the exact confirmation phrase shown for this retention action.'
  }
  if (error.code === 'RETENTION_SELECTION_INVALID') {
    return 'Select between 1 and 100 valid retention items.'
  }
  if (error.code === 'RETENTION_PREVIEW_STALE') {
    return 'The retention preview changed. Refresh it before continuing.'
  }
  if (error.code === 'RETENTION_PREVIEW_TOKEN_INVALID') {
    return 'The retention preview could not be verified. Refresh it before continuing.'
  }
  if (error.code === 'RETENTION_PREVIEW_EXPIRED') {
    return 'The retention preview expired. Refresh it before continuing.'
  }
  if (error.code === 'RETENTION_LEGAL_HOLD_ACTIVE') {
    return 'One or more selected records is protected by a legal hold.'
  }
  if (error.code === 'RETENTION_HOLD_REVIEW_DATE_INVALID') {
    return 'Choose a future legal-hold review date.'
  }
  if (error.code === 'RETENTION_REVIEW_EVIDENCE_REQUIRED') {
    return 'Confirm both owner-review checks before recording the review.'
  }
  if (error.code === 'RETENTION_EXTERNAL_COPIES_ACKNOWLEDGEMENT_REQUIRED') {
    return 'Confirm that independent processor, staff and backup copies require separate review.'
  }
  if (error.code === 'RETENTION_RECORD_NOT_FOUND') {
    return 'The retention record was not found.'
  }
  if (error.code === 'RETENTION_RUN_RESUME_REQUIRED') {
    return 'The run needs an explicit resume from its persisted run details before any further deletion.'
  }
  if (error.code === 'RETENTION_RUN_NOT_FOUND') {
    return 'The retention run was not found.'
  }
  return 'The privacy-retention request is invalid.'
}

export function retentionRouteErrorResponse(
  error: unknown,
  operation: string
) {
  if (error instanceof PrivacyRetentionServiceError && error.status < 500) {
    return privateJsonResponse({
      error: getServiceErrorMessage(error),
      code: error.code
    }, error.status)
  }

  logger.error('Privacy-retention operation failed', {
    operation,
    ...toSafeOperationalError(error)
  })
  return privateJsonResponse({
    error: 'The privacy-retention operation could not be completed safely.'
  }, 500)
}
