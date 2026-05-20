import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  clearAdminLoginFailures,
  createAdminSession,
  getAdminLoginThrottle,
  getAdminLoginThrottleKey,
  recordAdminLoginFailure,
  setAdminSessionCookie,
  validateAdminCredentials
} from '@/lib/admin-auth'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const formData = await request.formData()
  const username = String(formData.get('username') ?? '')
  const password = String(formData.get('password') ?? '')
  const throttleKey = getAdminLoginThrottleKey(request, username)

  if (getAdminLoginThrottle(throttleKey).isLocked) {
    return NextResponse.redirect(new URL('/admin/login?error=locked', request.url), 303)
  }

  if (!validateAdminCredentials(username, password)) {
    recordAdminLoginFailure(throttleKey)
    return NextResponse.redirect(new URL('/admin/login?error=1', request.url), 303)
  }

  clearAdminLoginFailures(throttleKey)

  const response = NextResponse.redirect(new URL('/admin', request.url), 303)
  setAdminSessionCookie(response, createAdminSession(username))

  return response
}
