import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/lib/client'
import {
  isProductionEnvironment,
  productionRouteNotFound
} from '@/lib/security/internal-route'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'
import { SANITY_DIAGNOSTIC_ORDERS_QUERY } from '@/lib/queries/orders'

export async function GET(_request: NextRequest) {
  if (isProductionEnvironment()) {
    return productionRouteNotFound()
  }

  try {
    // Check if token is set
    const hasToken = !!process.env.SANITY_API_TOKEN
    
    if (!hasToken) {
      return NextResponse.json({
        error: 'SANITY_API_TOKEN not set',
        hasToken: false,
        message: 'Cannot write to Sanity without API token'
      }, { status: 500 })
    }

    // Try to fetch existing orders (read operation)
    try {
      const orders = await serverClient.fetch(SANITY_DIAGNOSTIC_ORDERS_QUERY)
      
      return NextResponse.json({
        success: true,
        hasToken: true,
        canRead: true,
        orderCount: orders.length,
        message: 'Sanity connection is working. Token has read permissions.',
        note: 'To test write permissions, submit an order through the website.'
      })
    } catch (readError) {
      const safeError = toSafeOperationalError(readError)

      console.error('Sanity diagnostic read failed', {
        operation: 'sanity-diagnostic-read',
        ...safeError
      })

      return NextResponse.json({
        error: 'Failed to read from Sanity',
        hasToken: true,
        canRead: false,
        code: safeError.code
      }, { status: 500 })
    }

  } catch (error) {
    const safeError = toSafeOperationalError(error)

    console.error('Sanity diagnostic failed', {
      operation: 'sanity-diagnostic',
      ...safeError
    })

    return NextResponse.json({
      error: 'Sanity diagnostic failed',
      code: safeError.code
    }, { status: 500 })
  }
}

