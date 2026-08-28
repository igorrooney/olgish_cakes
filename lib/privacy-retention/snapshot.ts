import 'server-only'

import {
  createHash,
  createHmac,
  timingSafeEqual
} from 'node:crypto'
import { getAdminJwtSecret } from '@/lib/admin/jwt-secret.server'
import type { PrivacyRetentionCandidate } from './types'
import {
  PRIVACY_RETENTION_SNAPSHOT_TOKEN_MAX_LENGTH,
  privacyRetentionSnapshotTokenPattern
} from './types'

export const PRIVACY_RETENTION_SNAPSHOT_VERSION = 2
export const PRIVACY_RETENTION_SNAPSHOT_MAX_AGE_MS = 30 * 60 * 1000

export type PrivacyRetentionSnapshotPayload = {
  version: typeof PRIVACY_RETENTION_SNAPSHOT_VERSION
  runReference: string
  generatedAt: string
  fingerprint: string
  page: number
  pageSize: number
  totalCandidates: number
}

type PrivacyRetentionSnapshotErrorCode =
  | 'RETENTION_PREVIEW_TOKEN_INVALID'
  | 'RETENTION_PREVIEW_EXPIRED'
  | 'RETENTION_SNAPSHOT_CONFIGURATION_ERROR'

export class PrivacyRetentionSnapshotError extends Error {
  code: PrivacyRetentionSnapshotErrorCode

  constructor(code: PrivacyRetentionSnapshotErrorCode) {
    super(code)
    this.name = 'PrivacyRetentionSnapshotError'
    this.code = code
  }
}

const runReferencePattern = /^RET-\d{8}-[A-F0-9]{8}$/
const fingerprintPattern = /^[a-f0-9]{64}$/

const compareStrings = (left: string, right: string) => {
  if (left < right) {
    return -1
  }
  if (left > right) {
    return 1
  }
  return 0
}

const getSnapshotSecret = (injectedSecret?: string) => {
  try {
    return getAdminJwtSecret(injectedSecret)
  } catch {
    throw new PrivacyRetentionSnapshotError(
      'RETENTION_SNAPSHOT_CONFIGURATION_ERROR'
    )
  }
}

const sortStrings = (values: string[]) => [...values].sort(compareStrings)

const canonicalizeCandidate = (candidate: PrivacyRetentionCandidate) => ({
  id: candidate.id,
  category: candidate.category,
  recordType: candidate.recordType,
  recordReference: candidate.recordReference,
  dueAt: candidate.dueAt,
  reason: candidate.reason,
  itemCount: candidate.itemCount,
  held: candidate.held,
  holdReason: candidate.holdReason || null,
  holdReviewAt: candidate.holdReviewAt || null,
  snapshotRevision: candidate.snapshotRevision || null,
  removes: sortStrings(candidate.removes),
  retains: sortStrings(candidate.retains)
})

export const createPrivacyRetentionCandidateFingerprint = (
  candidates: PrivacyRetentionCandidate[]
) => {
  const canonicalCandidates = candidates
    .map(canonicalizeCandidate)
    .sort((left, right) => {
      const idComparison = compareStrings(left.id, right.id)
      if (idComparison !== 0) {
        return idComparison
      }

      return compareStrings(JSON.stringify(left), JSON.stringify(right))
    })

  return createHash('sha256')
    .update(JSON.stringify(canonicalCandidates), 'utf8')
    .digest('hex')
}

const createSignature = (encodedPayload: string, secret: string) =>
  createHmac('sha256', secret)
    .update(encodedPayload, 'utf8')
    .digest('base64url')

export const createPrivacyRetentionSnapshotToken = (input: {
  runReference: string
  generatedAt: string
  candidates: PrivacyRetentionCandidate[]
  page?: number
  pageSize?: number
  totalCandidates?: number
  secret?: string
}) => {
  const payload: PrivacyRetentionSnapshotPayload = {
    version: PRIVACY_RETENTION_SNAPSHOT_VERSION,
    runReference: input.runReference,
    generatedAt: input.generatedAt,
    fingerprint: createPrivacyRetentionCandidateFingerprint(input.candidates),
    page: input.page || 1,
    pageSize: input.pageSize || 50,
    totalCandidates: input.totalCandidates === undefined
      ? input.candidates.length
      : input.totalCandidates
  }
  const encodedPayload = Buffer.from(
    JSON.stringify(payload),
    'utf8'
  ).toString('base64url')
  const signature = createSignature(
    encodedPayload,
    getSnapshotSecret(input.secret)
  )

  return `${encodedPayload}.${signature}`
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isSnapshotPayload = (
  value: unknown
): value is PrivacyRetentionSnapshotPayload => {
  if (!isRecord(value) || Object.keys(value).length !== 7) {
    return false
  }

  return value.version === PRIVACY_RETENTION_SNAPSHOT_VERSION &&
    typeof value.runReference === 'string' &&
    runReferencePattern.test(value.runReference) &&
    typeof value.generatedAt === 'string' &&
    typeof value.fingerprint === 'string' &&
    fingerprintPattern.test(value.fingerprint) &&
    Number.isInteger(value.page) &&
    (value.page as number) > 0 &&
    Number.isInteger(value.pageSize) &&
    (value.pageSize as number) > 0 &&
    (value.pageSize as number) <= 100 &&
    Number.isInteger(value.totalCandidates) &&
    (value.totalCandidates as number) >= 0
}

const assertValidSignature = (
  encodedPayload: string,
  encodedSignature: string,
  secret: string
) => {
  const expectedSignature = Buffer.from(
    createSignature(encodedPayload, secret),
    'base64url'
  )
  const suppliedSignature = Buffer.from(encodedSignature, 'base64url')

  if (
    suppliedSignature.toString('base64url') !== encodedSignature ||
    expectedSignature.length !== suppliedSignature.length ||
    !timingSafeEqual(expectedSignature, suppliedSignature)
  ) {
    throw new PrivacyRetentionSnapshotError('RETENTION_PREVIEW_TOKEN_INVALID')
  }
}

export const verifyPrivacyRetentionSnapshotToken = (input: {
  token: string
  now: Date
  secret?: string
}): PrivacyRetentionSnapshotPayload => {
  if (
    input.token.length > PRIVACY_RETENTION_SNAPSHOT_TOKEN_MAX_LENGTH ||
    !privacyRetentionSnapshotTokenPattern.test(input.token)
  ) {
    throw new PrivacyRetentionSnapshotError('RETENTION_PREVIEW_TOKEN_INVALID')
  }

  const [encodedPayload, encodedSignature] = input.token.split('.')
  const secret = getSnapshotSecret(input.secret)

  assertValidSignature(encodedPayload, encodedSignature, secret)

  if (
    Buffer.from(encodedPayload, 'base64url').toString('base64url') !==
    encodedPayload
  ) {
    throw new PrivacyRetentionSnapshotError('RETENTION_PREVIEW_TOKEN_INVALID')
  }

  let parsedPayload: unknown
  try {
    parsedPayload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as unknown
  } catch {
    throw new PrivacyRetentionSnapshotError('RETENTION_PREVIEW_TOKEN_INVALID')
  }

  if (!isSnapshotPayload(parsedPayload)) {
    throw new PrivacyRetentionSnapshotError('RETENTION_PREVIEW_TOKEN_INVALID')
  }

  const generatedAt = new Date(parsedPayload.generatedAt)
  if (
    Number.isNaN(generatedAt.getTime()) ||
    generatedAt.toISOString() !== parsedPayload.generatedAt
  ) {
    throw new PrivacyRetentionSnapshotError('RETENTION_PREVIEW_TOKEN_INVALID')
  }

  const ageMs = input.now.getTime() - generatedAt.getTime()
  if (ageMs < 0) {
    throw new PrivacyRetentionSnapshotError('RETENTION_PREVIEW_TOKEN_INVALID')
  }
  if (ageMs > PRIVACY_RETENTION_SNAPSHOT_MAX_AGE_MS) {
    throw new PrivacyRetentionSnapshotError('RETENTION_PREVIEW_EXPIRED')
  }

  return parsedPayload
}

export const privacyRetentionFingerprintsMatch = (
  left: string,
  right: string
) => {
  if (!fingerprintPattern.test(left) || !fingerprintPattern.test(right)) {
    return false
  }

  return timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'))
}
