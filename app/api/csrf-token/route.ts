import { NextResponse } from 'next/server'
import { generateCsrfToken, getCsrfTokenCookieName } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

/**
 * GET /api/csrf-token
 * Generates and returns a CSRF token for form submissions
 * The token is also set as an httpOnly cookie for validation
 * 
 * Security: Uses double-submit cookie pattern
 * - Token is returned in response body (for form submission)
 * - Token is also set as httpOnly cookie (for server validation)
 * - Both must match for request to be valid
 */
export async function GET() {
  try {
    const token = generateCsrfToken()

    const response = NextResponse.json({ token }, { status: 200 })

    // Set secure httpOnly cookie for CSRF validation
    response.cookies.set(getCsrfTokenCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Failed to generate CSRF token', error)

    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}
