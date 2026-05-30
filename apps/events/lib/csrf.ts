import type { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getRequiredEnv, isProduction } from '@/lib/env'
import { createRandomToken, decodeJsonToken, encodeJsonToken } from '@/lib/crypto'

const CSRF_COOKIE_NAME = 'events-csrf'
const CSRF_TOKEN_TTL_MS = 60 * 60 * 1000

const csrfPayloadSchema = z.object({
  nonce: z.string().min(20),
  expiresAt: z.number().int().positive()
})

export function createCsrfToken(): string {
  return encodeJsonToken(
    {
      nonce: createRandomToken(24),
      expiresAt: Date.now() + CSRF_TOKEN_TTL_MS
    },
    getRequiredEnv('CSRF_SECRET')
  )
}

export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: CSRF_TOKEN_TTL_MS / 1000
  })
}

export function validateCsrfToken(request: NextRequest, submittedToken: string): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value

  if (!cookieToken || cookieToken !== submittedToken) {
    return false
  }

  const payload = csrfPayloadSchema.safeParse(
    decodeJsonToken(submittedToken, getRequiredEnv('CSRF_SECRET'))
  )

  return payload.success && payload.data.expiresAt > Date.now()
}
