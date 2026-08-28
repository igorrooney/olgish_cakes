import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuthToken } from '@/lib/admin/auth-token'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7).trim()
    const authenticated = await verifyAdminAuthToken(token)

    if (!authenticated) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: { username: process.env.ADMIN_USERNAME?.trim(), role: 'admin' }
    })
  } catch {
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 401 }
    )
  }
}
