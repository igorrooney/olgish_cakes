import { createHash } from 'crypto'
import type { EmailTemplateId } from './types'

export interface EmailAuditEntry {
  timestamp: string
  actorTokenHash: string
  templateId: EmailTemplateId
  recipient: string
  outcome: 'accepted' | 'rejected'
  reason?: string
  mode: string
  emailId?: string
}

const realSendAuditLog: EmailAuditEntry[] = []
const maxAuditEntries = 500

interface RateLimitRecord {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()
const maxRateLimitKeys = 500
function pruneRateLimitMap(now: number) {
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key)
    }
  }

  while (rateLimitMap.size > maxRateLimitKeys) {
    const oldestKey = rateLimitMap.keys().next().value
    if (typeof oldestKey !== 'string') {
      break
    }

    rateLimitMap.delete(oldestKey)
  }
}

function appendAuditEntry(entry: EmailAuditEntry) {
  realSendAuditLog.push(entry)
  if (realSendAuditLog.length > maxAuditEntries) {
    realSendAuditLog.splice(0, realSendAuditLog.length - maxAuditEntries)
  }
}

export function getEmailAuditLog(): EmailAuditEntry[] {
  return [...realSendAuditLog]
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex').slice(0, 16)
}

export function getAllowlistedRecipients(): string[] {
  const raw = process.env.EMAIL_TEST_RECIPIENT_ALLOWLIST || ''
  return raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0)
}

export function isRecipientAllowlisted(recipient: string): boolean {
  const normalized = recipient.trim().toLowerCase()
  if (normalized.length === 0) {
    return false
  }

  return getAllowlistedRecipients().some((value) => value === normalized)
}

export function isRealSendEnabled(): boolean {
  return process.env.EMAIL_REAL_SEND_ENABLED === 'true'
}

export function getRealSendRateLimitPerHour(): number {
  const parsed = Number.parseInt(process.env.EMAIL_REAL_SEND_RATE_LIMIT_PER_HOUR || '5', 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 5
  }

  return parsed
}


export function getSubjectPrefix(): string {
  const value = process.env.EMAIL_TEST_SUBJECT_PREFIX?.trim()
  return value && value.length > 0 ? value : '[TEST]'
}

export function recordRealSendAudit(entry: EmailAuditEntry) {
  appendAuditEntry(entry)
}

export function checkRealSendRateLimit(key: string): { allowed: boolean, retryAfterSeconds: number } {
  const now = Date.now()
  pruneRateLimitMap(now)

  const limit = getRealSendRateLimitPerHour()
  const windowMs = 60 * 60 * 1000
  const current = rateLimitMap.get(key)

  if (!current || now > current.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs
    })
    pruneRateLimitMap(now)
    return {
      allowed: true,
      retryAfterSeconds: 0
    }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(0, Math.ceil((current.resetAt - now) / 1000))
    }
  }

  current.count += 1
  return {
    allowed: true,
    retryAfterSeconds: 0
  }
}

export function getClientIpFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) {
      return first
    }
  }

  const realIp = headers.get('x-real-ip')?.trim()
  return realIp || 'unknown'
}

