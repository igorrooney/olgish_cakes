import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword } from '@/lib/admin/credentials.server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { withdrawSupabaseOrderDietaryHealthInformation } from '@/lib/orders/supabase-orders'
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

const isValidRecordReference = (value: string) =>
  value.length > 0 &&
  value.length <= 128 &&
  /^[A-Za-z0-9._-]+$/.test(value)

async function handleWithdrawal(request: NextRequest, id: string) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isValidRecordReference(id)) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const body = await readBody(request)
  const password = typeof body.password === 'string' ? body.password : ''
  const confirmation = typeof body.confirmation === 'string' ? body.confirmation : ''

  if (confirmation !== id) {
    return NextResponse.json(
      { error: 'Enter the exact order reference to confirm withdrawal.' },
      { status: 400 }
    )
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 })
  }

  try {
    const result = await withdrawSupabaseOrderDietaryHealthInformation(id)

    if (result.status === 'not-found') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (result.status === 'no-active-information') {
      return NextResponse.json(
        { error: 'No active dietary-health information exists for this order.' },
        { status: 409 }
      )
    }

    return NextResponse.json({
      status: result.status,
      withdrawnAt: result.withdrawnAt
    })
  } catch (error) {
    logger.error('Admin order health withdrawal failed', {
      operation: 'admin.order-health-withdrawal',
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
  context: RouteContext<'/api/admin/orders/[id]/withdraw-health-consent'>
) {
  const originError = requireSameOriginMutation(request)
  if (originError) {
    return originError
  }

  const { id } = await context.params
  const limitedHandler = withRateLimit(
    (limitedRequest) => handleWithdrawal(limitedRequest, id),
    {
      windowMs: 60 * 1000,
      maxRequests: 5,
      distributedScope: 'admin-health-withdrawal'
    }
  )

  return limitedHandler(request)
}
