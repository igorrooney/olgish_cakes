import type { NextRequest, NextResponse } from 'next/server'

import {
  PUBLIC_REQUEST_EMAIL_RATE_LIMIT_MAX,
  PUBLIC_REQUEST_EMAIL_RATE_LIMIT_WINDOW_MS,
  PUBLIC_REQUEST_IP_RATE_LIMIT_MAX,
  PUBLIC_REQUEST_IP_RATE_LIMIT_WINDOW_MS,
  PUBLIC_UPLOAD_RATE_LIMIT_MAX,
  PUBLIC_UPLOAD_RATE_LIMIT_WINDOW_MS
} from '@/lib/constants'
import { signValue } from '@/lib/crypto'
import { getRequiredEnv } from '@/lib/env'
import { jsonError } from '@/lib/http'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

type PublicRateLimitAction = 'event-photo-upload-ip' | 'event-photo-request-ip' | 'event-photo-request-email'

interface PublicRateLimitRule {
  action: PublicRateLimitAction
  key: string
  maxAttempts: number
  windowMs: number
}

export interface PublicRateLimitResult {
  isLimited: boolean
  retryAfterSeconds: number
}

const PUBLIC_RATE_LIMIT_ATTEMPTS_TABLE = 'event_photo_rate_limit_attempts'

function getFirstHeaderValue(value: string | null): string | null {
  const firstValue = value?.split(',')[0]?.trim()
  return firstValue && firstValue.length > 0 ? firstValue : null
}

export function getPublicRateLimitIp(request: NextRequest): string {
  return (
    getFirstHeaderValue(request.headers.get('x-forwarded-for')) ??
    getFirstHeaderValue(request.headers.get('x-real-ip')) ??
    getFirstHeaderValue(request.headers.get('cf-connecting-ip')) ??
    getFirstHeaderValue(request.headers.get('true-client-ip')) ??
    'unknown'
  )
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function hashPublicRateLimitKey(action: PublicRateLimitAction, key: string): string {
  return signValue(`${action}:${key}`, getRequiredEnv('JWT_SECRET'))
}

async function recordPublicRateLimitAttempt(
  rule: PublicRateLimitRule,
  now = Date.now()
): Promise<PublicRateLimitResult> {
  const supabase = getSupabaseAdmin()
  const keyHash = hashPublicRateLimitKey(rule.action, rule.key)
  const cutoffIso = new Date(now - rule.windowMs).toISOString()

  const { error: deleteError } = await supabase
    .from(PUBLIC_RATE_LIMIT_ATTEMPTS_TABLE)
    .delete()
    .eq('action', rule.action)
    .eq('key_hash', keyHash)
    .lt('attempted_at', cutoffIso)

  if (deleteError) {
    throw new Error(`Could not clear stale public rate limit attempts: ${deleteError.message}`)
  }

  const { data, error: selectError } = await supabase
    .from(PUBLIC_RATE_LIMIT_ATTEMPTS_TABLE)
    .select('attempted_at')
    .eq('action', rule.action)
    .eq('key_hash', keyHash)
    .gte('attempted_at', cutoffIso)
    .order('attempted_at', { ascending: false })
    .limit(rule.maxAttempts)

  if (selectError) {
    throw new Error(`Could not load public rate limit attempts: ${selectError.message}`)
  }

  const attempts = data ?? []

  if (attempts.length >= rule.maxAttempts) {
    const oldestAttemptAt = attempts.at(-1)?.attempted_at
    const oldestAttemptTime = oldestAttemptAt ? new Date(oldestAttemptAt).getTime() : now
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldestAttemptTime + rule.windowMs - now) / 1000)
    )

    return {
      isLimited: true,
      retryAfterSeconds
    }
  }

  const { error: insertError } = await supabase
    .from(PUBLIC_RATE_LIMIT_ATTEMPTS_TABLE)
    .insert({
      action: rule.action,
      key_hash: keyHash,
      attempted_at: new Date(now).toISOString()
    })

  if (insertError) {
    throw new Error(`Could not record public rate limit attempt: ${insertError.message}`)
  }

  return {
    isLimited: false,
    retryAfterSeconds: 0
  }
}

export async function recordPublicUploadAttempt(
  request: NextRequest
): Promise<PublicRateLimitResult> {
  return recordPublicRateLimitAttempt({
    action: 'event-photo-upload-ip',
    key: getPublicRateLimitIp(request),
    maxAttempts: PUBLIC_UPLOAD_RATE_LIMIT_MAX,
    windowMs: PUBLIC_UPLOAD_RATE_LIMIT_WINDOW_MS
  })
}

export async function recordPublicRequestAttempt(
  request: NextRequest,
  email: string
): Promise<PublicRateLimitResult> {
  const ipResult = await recordPublicRateLimitAttempt({
    action: 'event-photo-request-ip',
    key: getPublicRateLimitIp(request),
    maxAttempts: PUBLIC_REQUEST_IP_RATE_LIMIT_MAX,
    windowMs: PUBLIC_REQUEST_IP_RATE_LIMIT_WINDOW_MS
  })

  if (ipResult.isLimited) {
    return ipResult
  }

  return recordPublicRateLimitAttempt({
    action: 'event-photo-request-email',
    key: normalizeEmail(email),
    maxAttempts: PUBLIC_REQUEST_EMAIL_RATE_LIMIT_MAX,
    windowMs: PUBLIC_REQUEST_EMAIL_RATE_LIMIT_WINDOW_MS
  })
}

export function publicRateLimitError(
  result: PublicRateLimitResult
): NextResponse<{ error: string }> {
  const response = jsonError(
    'Too many attempts. Please wait a few minutes and try again, or send the image directly to Olga on WhatsApp.',
    429
  )

  response.headers.set('retry-after', String(result.retryAfterSeconds))

  return response
}
