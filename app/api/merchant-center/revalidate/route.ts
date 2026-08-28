import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import {
  isBearerTokenAuthorized,
  isProductionEnvironment,
  privateJsonResponse,
  productionRouteNotFound
} from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

function isAuthorized(request: NextRequest): boolean {
  return isBearerTokenAuthorized(
    request,
    process.env.MERCHANT_CENTER_REVALIDATE_TOKEN
  )
}

function revalidateMerchantCenterFeed(): void {
  revalidateTag('cakes', 'max')
  revalidateTag('cakes-by-post', 'max')
  revalidateTag('gift-hampers', 'max')
  revalidateTag('merchant-center-feed', 'max')
}

async function handleRevalidation(request: NextRequest) {
  if (!isAuthorized(request)) {
    return privateJsonResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    revalidateMerchantCenterFeed()

    return privateJsonResponse({
      success: true,
      message: 'Merchant Center feed cache revalidated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const safeError = toSafeOperationalError(error)

    console.error('Merchant Center revalidation failed', {
      operation: 'merchant-center-revalidate',
      ...safeError
    })

    return privateJsonResponse({
      error: 'Failed to revalidate feed cache',
      code: safeError.code
    }, 500)
  }
}

export async function POST(request: NextRequest) {
  return handleRevalidation(request)
}

export async function GET(request: NextRequest) {
  if (isProductionEnvironment()) {
    return productionRouteNotFound()
  }

  return handleRevalidation(request)
}
