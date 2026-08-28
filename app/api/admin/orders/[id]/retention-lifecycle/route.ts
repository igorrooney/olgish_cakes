import { NextRequest } from 'next/server'
import { z } from 'zod'
import { verifyAdminPassword } from '@/lib/admin/credentials.server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import {
  OrderRetentionLifecycleError,
  recordSupabaseOrderRetentionCompletion
} from '@/lib/orders/supabase-orders'
import { withRateLimit } from '@/lib/rate-limit'
import {
  privateJsonResponse,
  requireSameOriginMutation
} from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

const isCalendarDate = (value: string) => {
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const requestSchema = z.object({
  password: z.string().min(1).max(256),
  effectiveOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isCalendarDate),
  evidenceBasis: z.enum([
    'order-status-record',
    'payment-provider-record',
    'invoice-accounting-record',
    'customer-correspondence'
  ]),
  confirmation: z.string().min(1).max(160)
}).strict()

const isValidOrderReference = (value: string) =>
  /^[A-Za-z0-9._-]{1,128}$/.test(value)

const getLifecycleErrorMessage = (error: OrderRetentionLifecycleError) => {
  if (error.code === 'RETENTION_ORDER_NOT_FOUND') {
    return 'Order not found.'
  }
  if (error.code === 'RETENTION_ORDER_NOT_TERMINAL') {
    return 'Only a genuinely terminal order can receive a retention deadline.'
  }
  if (error.code === 'RETENTION_ORDER_LEGAL_HOLD_ACTIVE') {
    return 'Review the legal hold before changing this order lifecycle.'
  }
  if (error.code === 'RETENTION_DELETION_CLAIM_ACTIVE') {
    return 'A retention deletion is already processing this order. Refresh before continuing.'
  }
  if (error.code === 'RETENTION_ORDER_CONFIRMATION_INVALID') {
    return 'Enter the exact confirmation phrase shown.'
  }
  if (error.code === 'RETENTION_ORDER_ALREADY_RECORDED') {
    return 'This order already has a different verified terminal date.'
  }
  return 'Enter a valid supported terminal date and evidence type.'
}

async function handleRequest(request: NextRequest, id: string) {
  if (!(await isAdminAuthenticated(request))) {
    return privateJsonResponse({ error: 'Unauthorized' }, 401)
  }

  if (!isValidOrderReference(id)) {
    return privateJsonResponse({ error: 'Order not found.' }, 404)
  }

  const body: unknown = await request.json().catch((): unknown => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return privateJsonResponse({ error: 'Invalid order retention request.' }, 400)
  }

  if (!verifyAdminPassword(parsed.data.password)) {
    return privateJsonResponse({ error: 'Invalid admin password' }, 401)
  }

  try {
    return privateJsonResponse(await recordSupabaseOrderRetentionCompletion({
      orderReference: id,
      effectiveOn: parsed.data.effectiveOn,
      evidenceBasis: parsed.data.evidenceBasis,
      confirmation: parsed.data.confirmation
    }))
  } catch (error) {
    if (error instanceof OrderRetentionLifecycleError && error.status < 500) {
      return privateJsonResponse({
        error: getLifecycleErrorMessage(error),
        code: error.code
      }, error.status)
    }

    logger.error('Admin order retention lifecycle update failed', {
      operation: 'admin.order-retention-lifecycle.record-completion',
      recordReference: id,
      ...toSafeOperationalError(error)
    })
    return privateJsonResponse({
      error: 'The order retention date could not be recorded safely.'
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
