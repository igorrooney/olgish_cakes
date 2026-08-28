import { NextRequest } from 'next/server'
import { z } from 'zod'
import { verifyAdminPassword } from '@/lib/admin/credentials.server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import {
  AdminEnquiryRetentionLifecycleError,
  isAdminEnquiryType,
  isValidAdminEnquiryRecordReference,
  updateAdminEnquiryRetentionLifecycle
} from '@/lib/enquiries/supabase-enquiries'
import { logger } from '@/lib/logger'
import { withRateLimit } from '@/lib/rate-limit'
import {
  privateJsonResponse,
  requireSameOriginMutation
} from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

const requestSchema = z.object({
  password: z.string().min(1).max(256),
  action: z.enum(['record-contact', 'close', 'reopen', 'convert']),
  convertedOrderId: z.string().trim().min(1).max(128).regex(/^[A-Za-z0-9._-]+$/).optional()
}).strict().superRefine((value, context) => {
  if (value.action === 'convert' && !value.convertedOrderId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['convertedOrderId'],
      message: 'Order reference is required when converting an enquiry.'
    })
  }
  if (value.action !== 'convert' && value.convertedOrderId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['convertedOrderId'],
      message: 'An order reference is accepted only when converting an enquiry.'
    })
  }
})

async function handleLifecycleUpdate(
  request: NextRequest,
  typeValue: string,
  id: string
) {
  if (!(await isAdminAuthenticated(request))) {
    return privateJsonResponse({ error: 'Unauthorized' }, 401)
  }

  if (!isAdminEnquiryType(typeValue) || !isValidAdminEnquiryRecordReference(typeValue, id)) {
    return privateJsonResponse({ error: 'Enquiry not found' }, 404)
  }

  const bodyValue = await request.json().catch((): unknown => null)
  const parsed = requestSchema.safeParse(bodyValue)
  if (!parsed.success) {
    return privateJsonResponse({ error: 'Invalid retention-lifecycle request.' }, 400)
  }

  if (!verifyAdminPassword(parsed.data.password)) {
    return privateJsonResponse({ error: 'Invalid admin password' }, 401)
  }

  try {
    const result = await updateAdminEnquiryRetentionLifecycle(typeValue, id, {
      action: parsed.data.action,
      convertedOrderId: parsed.data.convertedOrderId
    })

    if (!result) {
      return privateJsonResponse({ error: 'Enquiry not found' }, 404)
    }

    return privateJsonResponse({
      status: 'updated',
      updatedAt: result.updatedAt
    })
  } catch (error) {
    if (error instanceof AdminEnquiryRetentionLifecycleError && error.status < 500) {
      return privateJsonResponse({
        error: error.code === 'RETENTION_ORDER_NOT_FOUND'
          ? 'The linked order was not found.'
          : error.code === 'RETENTION_LEGAL_HOLD_ACTIVE'
            ? 'Release the legal hold before changing this lifecycle.'
            : error.code === 'RETENTION_CONVERTED_LINK_IMMUTABLE'
              ? 'A converted enquiry must remain linked to its order. Create a new enquiry for later work.'
            : 'Enter a valid linked order reference.'
      }, error.status)
    }

    logger.error('Admin enquiry retention lifecycle update failed', {
      operation: 'admin.enquiry-retention-lifecycle.update',
      recordReference: id,
      ...toSafeOperationalError(error)
    })
    return privateJsonResponse({
      error: 'The enquiry retention lifecycle could not be updated safely.'
    }, 500)
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ type: string, id: string }> }
) {
  const originError = requireSameOriginMutation(request)
  if (originError) {
    return originError
  }

  const { type, id } = await context.params
  return withRateLimit(
    (limitedRequest) => handleLifecycleUpdate(limitedRequest, type, id),
    {
      windowMs: 60 * 1000,
      maxRequests: 10,
      distributedScope: 'admin-privacy-retention'
    }
  )(request)
}
