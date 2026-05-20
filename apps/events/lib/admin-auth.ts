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
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000
const ADMIN_LOGIN_LOCK_MS = 15 * 60 * 1000
const ADMIN_LOGIN_MAX_FAILURES = 5

interface AdminLoginAttempt {
  failedCount: number
  firstFailedAt: number
  lockedUntil: number
}

const adminLoginAttempts = new Map<string, AdminLoginAttempt>()

const adminSessionSchema = z.object({
  username: z.string().min(1),
  expiresAt: z.number().int().positive()
})

export interface AdminSession {
  username: string
  expiresAt: number
}

export interface AdminLoginThrottle {
  isLocked: boolean
  retryAfterSeconds: number
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const expectedUsername = getRequiredEnv('ADMIN_USERNAME')
  const expectedPassword = getRequiredEnv('ADMIN_PASSWORD')

  return (
    constantTimeEqual(username, expectedUsername) &&
    constantTimeEqual(password, expectedPassword)
  )
}

export function getAdminLoginThrottleKey(request: NextRequest, username: string): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = request.headers.get('x-real-ip')?.trim()
  const ipAddress = forwardedFor || realIp || 'unknown'
  const normalizedUsername = username.trim().toLowerCase() || 'unknown'

  return `${ipAddress}:${normalizedUsername}`
}

export function getAdminLoginThrottle(key: string, now = Date.now()): AdminLoginThrottle {
  const attempt = adminLoginAttempts.get(key)

  if (!attempt) {
    return {
      isLocked: false,
      retryAfterSeconds: 0
    }
  }

  if (attempt.lockedUntil > now) {
    return {
      isLocked: true,
      retryAfterSeconds: Math.ceil((attempt.lockedUntil - now) / 1000)
    }
  }

  if (attempt.firstFailedAt + ADMIN_LOGIN_WINDOW_MS <= now) {
    adminLoginAttempts.delete(key)
  }

  return {
    isLocked: false,
    retryAfterSeconds: 0
  }
}

export function recordAdminLoginFailure(key: string, now = Date.now()): void {
  const existing = adminLoginAttempts.get(key)
  const shouldReset = !existing || existing.firstFailedAt + ADMIN_LOGIN_WINDOW_MS <= now
  const attempt = shouldReset
    ? {
        failedCount: 0,
        firstFailedAt: now,
        lockedUntil: 0
      }
    : existing

  attempt.failedCount += 1

  if (attempt.failedCount >= ADMIN_LOGIN_MAX_FAILURES) {
    attempt.lockedUntil = now + ADMIN_LOGIN_LOCK_MS
  }

  adminLoginAttempts.set(key, attempt)
}

export function clearAdminLoginFailures(key: string): void {
  adminLoginAttempts.delete(key)
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
