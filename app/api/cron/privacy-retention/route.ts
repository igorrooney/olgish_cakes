import { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import { discoverPrivacyRetentionCandidates } from '@/lib/privacy-retention/service'
import {
  isCronRequestAuthorized,
  privateJsonResponse
} from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isCronRequestAuthorized(request)) {
    return privateJsonResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    return privateJsonResponse(await discoverPrivacyRetentionCandidates())
  } catch (error) {
    logger.error('Privacy-retention discovery failed', {
      operation: 'cron.privacy-retention.discovery',
      ...toSafeOperationalError(error)
    })
    return privateJsonResponse({
      error: 'Privacy-retention discovery could not be completed safely.'
    }, 500)
  }
}
