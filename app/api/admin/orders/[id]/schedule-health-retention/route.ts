import { NextRequest } from 'next/server'
import { z } from 'zod'
import { verifyAdminPassword } from '@/lib/admin/credentials.server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import {
  LegacyHealthRetentionScheduleError,
  scheduleLegacyOrderHealthRetention
} from '@/lib/health-retention/schedule'
import { logger } from '@/lib/logger'
import { withRateLimit } from '@/lib/rate-limit'
import {
  privateJsonResponse,
  requireSameOriginMutation
} from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

const requestSchema = z.object({
  password: z.string().min(1).max(256),
  confirmation: z.string().min(1).max(160)
}).strict()

const isValidRecordReference = (value: string) =>
  value.length > 0 &&
  value.length <= 128 &&
  /^[A-Za-z0-9._-]+$/.test(value)

const getNoOpMessage = (status: string) => {
  if (status === 'no-active-information') {
    return 'No active dietary-health information exists for this order.'
  }
  if (status === 'already-withdrawn') {
    return 'The health information was already erased after consent withdrawal.'
  }
  return 'The health information was already erased under the retention schedule.'
}

const getScheduleErrorMessage = (error: LegacyHealthRetentionScheduleError) => {
  if (error.code === 'HEALTH_RETENTION_ORDER_NOT_FOUND') {
    return 'Order not found.'
  }
  if (error.code === 'HEALTH_RETENTION_RECORD_NOT_TERMINAL') {
    return 'Only a genuinely terminal order can start this retention period.'
  }
  if (error.code === 'HEALTH_RETENTION_LEGAL_HOLD_ACTIVE') {
    return 'Review the legal hold before starting this retention period.'
  }
  return 'A retention deletion is already processing this order. Refresh before continuing.'
}

async function handleSchedule(request: NextRequest, id: string) {
  if (!(await isAdminAuthenticated(request))) {
    return privateJsonResponse({ error: 'Unauthorized' }, 401)
  }
  if (!isValidRecordReference(id)) {
    return privateJsonResponse({ error: 'Order not found' }, 404)
  }

  const body: unknown = await request.json().catch((): unknown => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return privateJsonResponse({ error: 'Invalid health-retention request.' }, 400)
  }

  if (parsed.data.confirmation !== `START HEALTH RETENTION ${id}`) {
    return privateJsonResponse(
      { error: 'Enter the exact confirmation phrase shown.' },
      400
    )
  }
  if (!verifyAdminPassword(parsed.data.password)) {
    return privateJsonResponse({ error: 'Invalid admin password' }, 401)
  }

  try {
    const result = await scheduleLegacyOrderHealthRetention(id)

    if (result.status === 'not-found') {
      return privateJsonResponse({ error: 'Order not found' }, 404)
    }
    if (
      result.status === 'no-active-information' ||
      result.status === 'already-withdrawn' ||
      result.status === 'already-erased'
    ) {
      return privateJsonResponse(
        { error: getNoOpMessage(result.status) },
        409
      )
    }

    return privateJsonResponse({
      status: result.status,
      dueAt: result.dueAt
    })
  } catch (error) {
    if (error instanceof LegacyHealthRetentionScheduleError && error.status < 500) {
      return privateJsonResponse(
        { error: getScheduleErrorMessage(error) },
        error.status
      )
    }

    logger.error('Admin order health-retention scheduling failed', {
      operation: 'admin.order-health-retention.schedule',
      recordReference: id,
      ...toSafeOperationalError(error)
    })
    return privateJsonResponse(
      { error: 'The dietary-health retention period could not be started.' },
      500
    )
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
  const limitedHandler = withRateLimit(
    (limitedRequest) => handleSchedule(limitedRequest, id),
    {
      windowMs: 60 * 1000,
      maxRequests: 5,
      distributedScope: 'admin-health-retention-schedule'
    }
  )

  return limitedHandler(request)
}
