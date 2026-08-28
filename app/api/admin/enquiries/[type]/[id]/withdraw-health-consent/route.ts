import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword } from '@/lib/admin/credentials.server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import {
  isAdminEnquiryType,
  isValidAdminEnquiryRecordReference,
  withdrawAdminEnquiryDietaryHealthInformation
} from '@/lib/enquiries/supabase-enquiries'
import { logger } from '@/lib/logger'
import { withRateLimit } from '@/lib/rate-limit'
import { requireSameOriginMutation } from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

type WithdrawalRequestBody = {
  password?: unknown
  confirmation?: unknown
}

const readBody = async (request: NextRequest): Promise<WithdrawalRequestBody> => {
  const value = await request.json().catch((): unknown => null)
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as WithdrawalRequestBody
    : {}
}

async function handleWithdrawal(
  request: NextRequest,
  typeValue: string,
  id: string
) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (
    !isAdminEnquiryType(typeValue) ||
    !isValidAdminEnquiryRecordReference(typeValue, id)
  ) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 })
  }

  const body = await readBody(request)
  const password = typeof body.password === 'string' ? body.password : ''
  const confirmation = typeof body.confirmation === 'string' ? body.confirmation : ''

  if (confirmation !== id) {
    return NextResponse.json(
      { error: 'Enter the exact record reference to confirm withdrawal.' },
      { status: 400 }
    )
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 })
  }

  try {
    const result = await withdrawAdminEnquiryDietaryHealthInformation(typeValue, id)

    if (result.status === 'not-found') {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    if (result.status === 'no-active-information') {
      return NextResponse.json(
        { error: 'No active dietary-health information exists for this record.' },
        { status: 409 }
      )
    }

    return NextResponse.json({
      status: result.status,
      withdrawnAt: result.withdrawnAt
    })
  } catch (error) {
    logger.error('Admin enquiry health withdrawal failed', {
      operation: 'admin.enquiry-health-withdrawal',
      recordReference: id,
      ...toSafeOperationalError(error)
    })

    return NextResponse.json(
      { error: 'Dietary-health information could not be withdrawn.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext<'/api/admin/enquiries/[type]/[id]/withdraw-health-consent'>
) {
  const originError = requireSameOriginMutation(request)
  if (originError) {
    return originError
  }

  const { type, id } = await context.params
  const limitedHandler = withRateLimit(
    (limitedRequest) => handleWithdrawal(limitedRequest, type, id),
    {
      windowMs: 60 * 1000,
      maxRequests: 5,
      distributedScope: 'admin-health-withdrawal'
    }
  )

  return limitedHandler(request)
}
