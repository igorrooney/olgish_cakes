import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { clearAdminSessionCookie } from '@/lib/admin-auth'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), 303)
  clearAdminSessionCookie(response)

  return response
}
