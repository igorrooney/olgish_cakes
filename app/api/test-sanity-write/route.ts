import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/lib/client'

export async function GET(request: NextRequest) {
  try {
    // Security: Only allow in non-production or with admin secret
    const adminSecret = process.env.ADMIN_SECRET_TOKEN
    const authHeader = request.headers.get('authorization')
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // In production, require authentication
    if (!isDevelopment && adminSecret) {
      if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
        return NextResponse.json({
          error: 'Unauthorized',
          message: 'This endpoint requires authentication in production'
        }, { status: 401 })
      }
    }
    
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
      const orders = await serverClient.fetch(`*[_type == "order"] | order(_createdAt desc) [0...1]`)
      
      return NextResponse.json({
        success: true,
        hasToken: true,
        canRead: true,
        orderCount: orders.length,
        message: 'Sanity connection is working. Token has read permissions.',
        note: 'To test write permissions, submit an order through the website.'
      })
    } catch (readError) {
      return NextResponse.json({
        error: 'Failed to read from Sanity',
        hasToken: true,
        canRead: false,
        details: readError instanceof Error ? readError.message : 'Unknown error',
        message: 'Token might not have read permissions or project/dataset is wrong'
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json({
      error: 'Sanity diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

