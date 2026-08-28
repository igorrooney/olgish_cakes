import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { verifyAdminCredentials } from '@/lib/admin/credentials.server'
import { verifyAdminAuthToken } from '@/lib/admin/auth-token'
import { getAdminJwtSecret } from '@/lib/admin/jwt-secret.server'
import { withRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

type AdminAuthRouteOperation = 'admin.auth.login' | 'admin.auth.check'

function isNativeFormSubmission(request: NextRequest): boolean {
  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    ?.trim()
    .toLowerCase()

  return contentType === 'application/x-www-form-urlencoded' ||
    contentType === 'multipart/form-data'
}

function logAdminAuthRouteFailure(
  operation: AdminAuthRouteOperation,
  error: unknown
): void {
  logger.error('Admin authentication request failed', {
    operation,
    ...toSafeOperationalError(error)
  })
}

// Helper function to get environment variables with runtime validation
function getAdminCredentials() {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME?.trim()
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required')
  }

  const JWT_SECRET = getAdminJwtSecret()

  return { ADMIN_USERNAME, JWT_SECRET }
}

// POST - Admin login
async function handlePOST(request: NextRequest) {
  // The login page declares an explicit POST fallback so credentials can
  // never be serialized into its URL before React hydrates. Authentication
  // itself remains JSON-only and fails closed until the guarded client
  // handler is available.
  if (isNativeFormSubmission(request)) {
    const response = NextResponse.redirect(
      new URL('/admin/auth', request.url),
      303
    )
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return response
  }

  try {
    const body: unknown = await request.json()
    const username = body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>).username
      : undefined
    const password = body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>).password
      : undefined

    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Get admin credentials (validates environment variables at runtime)
    const { ADMIN_USERNAME, JWT_SECRET } = getAdminCredentials()

    // Verify credentials
    if (verifyAdminCredentials(username, password)) {
      // Create JWT token
      const secret = new TextEncoder().encode(JWT_SECRET)
      const token = await new SignJWT({
        username: ADMIN_USERNAME,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer('olgish-cakes') // Set issuer for verification
        .setAudience('olgish-cakes-admin') // Set audience for verification
        .setExpirationTime('24h')
        .setIssuedAt()
        .sign(secret)

      // Set secure cookie
      const response = NextResponse.json({
        success: true,
        message: 'Login successful'
      })

      response.cookies.set('admin_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      })

      return response
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
  } catch (error) {
    logAdminAuthRouteFailure('admin.auth.login', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Apply rate limiting: 5 login attempts per minute
export const POST = withRateLimit(handlePOST, {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 login attempts per minute
  distributedScope: 'admin-login'
})

// GET - Check auth status
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_auth_token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    getAdminCredentials()
    const authenticated = await verifyAdminAuthToken(token)

    return authenticated
      ? NextResponse.json({ authenticated: true }, { status: 200 })
      : NextResponse.json({ authenticated: false }, { status: 401 })
  } catch (error) {
    logAdminAuthRouteFailure('admin.auth.check', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
