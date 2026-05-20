import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getRequiredEnv, isProduction } from '@/lib/env'
import {
  constantTimeEqual,
  decodeJsonToken,
  encodeJsonToken,
  signValue
} from '@/lib/crypto'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const ADMIN_SESSION_COOKIE = 'events-admin-session'

const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000
const ADMIN_LOGIN_LOCK_MS = 15 * 60 * 1000
const ADMIN_LOGIN_MAX_FAILURES = 5
const ADMIN_LOGIN_ATTEMPTS_TABLE = 'admin_login_attempts'

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

function getAdminLoginKeyHash(key: string): string {
  return signValue(key, getRequiredEnv('JWT_SECRET'))
}

export async function getAdminLoginThrottle(key: string, now = Date.now()): Promise<AdminLoginThrottle> {
  const supabase = getSupabaseAdmin()
  const keyHash = getAdminLoginKeyHash(key)
  const cutoffIso = new Date(now - ADMIN_LOGIN_WINDOW_MS).toISOString()
  const { data, error } = await supabase
    .from(ADMIN_LOGIN_ATTEMPTS_TABLE)
    .select('failed_at')
    .eq('key_hash', keyHash)
    .gte('failed_at', cutoffIso)
    .order('failed_at', { ascending: false })
    .limit(ADMIN_LOGIN_MAX_FAILURES)

  if (error) {
    throw new Error(`Could not load admin login attempts: ${error.message}`)
  }

  const failedAttempts = data ?? []

  if (failedAttempts.length < ADMIN_LOGIN_MAX_FAILURES) {
    return {
      isLocked: false,
      retryAfterSeconds: 0
    }
  }

  const latestFailureAt = failedAttempts[0]?.failed_at
  const latestFailureTime = latestFailureAt ? new Date(latestFailureAt).getTime() : 0
  const lockedUntil = latestFailureTime + ADMIN_LOGIN_LOCK_MS

  if (lockedUntil > now) {
    return {
      isLocked: true,
      retryAfterSeconds: Math.ceil((lockedUntil - now) / 1000)
    }
  }

  return {
    isLocked: false,
    retryAfterSeconds: 0
  }
}

export async function recordAdminLoginFailure(key: string, now = Date.now()): Promise<void> {
  const supabase = getSupabaseAdmin()
  const keyHash = getAdminLoginKeyHash(key)
  const cutoffIso = new Date(now - Math.max(ADMIN_LOGIN_WINDOW_MS, ADMIN_LOGIN_LOCK_MS)).toISOString()
  const { error: deleteError } = await supabase
    .from(ADMIN_LOGIN_ATTEMPTS_TABLE)
    .delete()
    .eq('key_hash', keyHash)
    .lt('failed_at', cutoffIso)

  if (deleteError) {
    throw new Error(`Could not clear stale admin login attempts: ${deleteError.message}`)
  }

  const { error: insertError } = await supabase
    .from(ADMIN_LOGIN_ATTEMPTS_TABLE)
    .insert({
      key_hash: keyHash,
      failed_at: new Date(now).toISOString()
    })

  if (insertError) {
    throw new Error(`Could not record admin login failure: ${insertError.message}`)
  }
}

export async function clearAdminLoginFailures(key: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from(ADMIN_LOGIN_ATTEMPTS_TABLE)
    .delete()
    .eq('key_hash', getAdminLoginKeyHash(key))

  if (error) {
    throw new Error(`Could not clear admin login attempts: ${error.message}`)
  }
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
