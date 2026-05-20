import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getRequiredEnv, isProduction } from '@/lib/env'
import {
  constantTimeEqual,
  decodeJsonToken,
  encodeJsonToken
} from '@/lib/crypto'

export const ADMIN_SESSION_COOKIE = 'events-admin-session'

const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000

const adminSessionSchema = z.object({
  username: z.string().min(1),
  expiresAt: z.number().int().positive()
})

export interface AdminSession {
  username: string
  expiresAt: number
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const expectedUsername = getRequiredEnv('ADMIN_USERNAME')
  const expectedPassword = getRequiredEnv('ADMIN_PASSWORD')

  return (
    constantTimeEqual(username, expectedUsername) &&
    constantTimeEqual(password, expectedPassword)
  )
}

export function createAdminSession(username: string): string {
  return encodeJsonToken(
    {
      username,
      expiresAt: Date.now() + ADMIN_SESSION_TTL_MS
    },
    getRequiredEnv('JWT_SECRET')
  )
}

export function readAdminSessionCookie(value: string | undefined): AdminSession | null {
  if (!value) {
    return null
  }

  const parsed = adminSessionSchema.safeParse(
    decodeJsonToken(value, getRequiredEnv('JWT_SECRET'))
  )

  if (!parsed.success || parsed.data.expiresAt <= Date.now()) {
    return null
  }

  return parsed.data
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()

  return readAdminSessionCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return session
}

export function requireAdminFromRequest(request: NextRequest): AdminSession | null {
  return readAdminSessionCookie(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
}

export function setAdminSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_MS / 1000
  })
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })
}
