import 'server-only'
import type { NextRequest, NextResponse } from 'next/server'
import type { SupabaseAdminClient } from './supabase-admin-client'

export type EnquiryRateLimitScope = 'workshop-enquiry' | 'custom-cake-enquiry'

type EnquiryRateLimitRpcRow = {
  allowed: boolean
  current_count: number
  remaining: number
  reset_at: string
  retry_after_seconds: number
}

type EnquiryRateLimitConfig = {
  scope: EnquiryRateLimitScope
  identifier: string
  maxRequests: number
  windowMs: number
  now?: number
}

type CleanupConfig = {
  now?: number
  cleanupIntervalMs?: number
  retentionMs?: number
  force?: boolean
}

export type EnquiryRateLimitResult = {
  limit: number
  currentCount: number
  remaining: number
  resetAt: number
  retryAfterSeconds: number
  rateLimited: boolean
}

type RpcError = {
  message?: string
}

type RateLimitClient = Pick<SupabaseAdminClient, 'rpc'>

const DEFAULT_CLEANUP_INTERVAL_MS = 15 * 60 * 1000
const DEFAULT_RETENTION_MS = 24 * 60 * 60 * 1000
let lastCleanupAttemptAt = 0

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isRateLimitRpcRow = (value: unknown): value is EnquiryRateLimitRpcRow => {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.allowed === 'boolean' &&
    typeof value.current_count === 'number' &&
    typeof value.remaining === 'number' &&
    typeof value.reset_at === 'string' &&
    typeof value.retry_after_seconds === 'number'
}

const parseRateLimitRow = (data: unknown): EnquiryRateLimitRpcRow => {
  if (!Array.isArray(data) || data.length !== 1 || !isRateLimitRpcRow(data[0])) {
    throw new Error('Invalid enquiry rate limit response')
  }

  return data[0]
}

const parseResetAt = (value: string) => {
  const parsed = Date.parse(value)

  if (Number.isNaN(parsed)) {
    throw new Error('Invalid enquiry rate limit reset time')
  }

  return parsed
}

const buildCleanupBefore = (now: number, retentionMs: number) =>
  new Date(now - retentionMs).toISOString()

export const getEnquiryRateLimitIdentifier = (
  request: Pick<NextRequest, 'headers'>
) => {
  const forwardedFor = request.headers.get('x-forwarded-for')

  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim()

    if (firstIp) {
      return firstIp
    }
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  return realIp || 'unknown'
}

export const applyEnquiryRateLimitHeaders = (
  response: NextResponse,
  result: EnquiryRateLimitResult
) => {
  response.headers.set('X-RateLimit-Limit', String(result.limit))
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))

  if (result.rateLimited) {
    response.headers.set('Retry-After', String(result.retryAfterSeconds))
  }

  return response
}

export const maybeCleanupEnquiryRateLimits = async (
  supabase: RateLimitClient,
  config: CleanupConfig = {}
) => {
  const now = config.now ?? Date.now()
  const cleanupIntervalMs = config.cleanupIntervalMs ?? DEFAULT_CLEANUP_INTERVAL_MS
  const retentionMs = config.retentionMs ?? DEFAULT_RETENTION_MS
  const force = config.force ?? false

  if (!force && (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined)) {
    return
  }

  if (!force && now - lastCleanupAttemptAt < cleanupIntervalMs) {
    return
  }

  lastCleanupAttemptAt = now
  const { error } = await supabase.rpc('cleanup_enquiry_rate_limits', {
    p_before: buildCleanupBefore(now, retentionMs)
  }) as { error: RpcError | null }

  if (error) {
    throw new Error(error.message || 'Failed to clean up enquiry rate limits')
  }
}

export const takeEnquiryRateLimit = async (
  supabase: RateLimitClient,
  config: EnquiryRateLimitConfig
): Promise<EnquiryRateLimitResult> => {
  const now = config.now ?? Date.now()
  const windowSeconds = Math.floor(config.windowMs / 1000)
  const { data, error } = await supabase.rpc('take_enquiry_rate_limit', {
    p_scope: config.scope,
    p_identifier: config.identifier,
    p_window_seconds: windowSeconds,
    p_max_requests: config.maxRequests,
    p_now: new Date(now).toISOString()
  }) as { data: unknown, error: RpcError | null }

  if (error) {
    throw new Error(error.message || 'Failed to apply enquiry rate limit')
  }

  void maybeCleanupEnquiryRateLimits(supabase).catch((cleanupError: unknown) => {
    console.error('Failed to clean up enquiry rate limits', cleanupError)
  })

  const row = parseRateLimitRow(data)

  return {
    limit: config.maxRequests,
    currentCount: row.current_count,
    remaining: row.remaining,
    resetAt: parseResetAt(row.reset_at),
    retryAfterSeconds: row.retry_after_seconds,
    rateLimited: !row.allowed
  }
}

export const __resetEnquiryRateLimitStateForTests = () => {
  lastCleanupAttemptAt = 0
}
