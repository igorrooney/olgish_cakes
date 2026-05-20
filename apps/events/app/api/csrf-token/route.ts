import { NextResponse } from 'next/server'

import { createCsrfToken, setCsrfCookie } from '@/lib/csrf'

export async function GET(): Promise<NextResponse<{ csrfToken: string }>> {
  const csrfToken = createCsrfToken()
  const response = NextResponse.json({ csrfToken })
  setCsrfCookie(response, csrfToken)

  return response
}
