import 'server-only'

import {
  getSupabaseAdminClient,
  type SupabaseAdminClient
} from '@/lib/supabase-admin-client'
import {
  buildEnquiryCandidateId,
  buildOrderCandidateId,
  buildSecurityCandidateId,
  type RetentionEnquiryType,
  type RetentionSecurityRecordType
} from './candidate-id'
import type {
  PrivacyRetentionActiveHold,
  PrivacyRetentionActiveHoldPage,
  PrivacyRetentionActiveHoldRecordType
} from './active-holds-contract'
import { isPrivacyRetentionHoldReason } from './policy'

type SafeRow = Record<string, unknown>

type EnquiryHoldConfig = {
  type: RetentionEnquiryType
  table: string
  recordType: Exclude<PrivacyRetentionActiveHoldRecordType, 'order' | 'security-batch'>
  referencePrefix: string
  detailType?: Exclude<RetentionEnquiryType, 'event-photo'>
}

const enquiryHoldConfigs: EnquiryHoldConfig[] = [
  {
    type: 'contact',
    table: 'contact_enquiries',
    recordType: 'contact-enquiry',
    referencePrefix: 'contact',
    detailType: 'contact'
  },
  {
    type: 'custom-cake',
    table: 'custom_cake_enquiries',
    recordType: 'custom-cake-enquiry',
    referencePrefix: 'custom-cake',
    detailType: 'custom-cake'
  },
  {
    type: 'workshop',
    table: 'workshop_enquiries',
    recordType: 'workshop-enquiry',
    referencePrefix: 'workshop',
    detailType: 'workshop'
  },
  {
    type: 'event-photo',
    table: 'event_photo_requests',
    recordType: 'event-photo-request',
    referencePrefix: 'event-photo'
  }
]

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const numericIdPattern = /^\d{1,20}$/
const orderReferencePattern = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,119}$/

export class PrivacyRetentionActiveHoldError extends Error {
  code: string

  constructor(code: string) {
    super(code)
    this.name = 'PrivacyRetentionActiveHoldError'
    this.code = code
  }
}

const asRows = (value: unknown): SafeRow[] => Array.isArray(value)
  ? value.filter((row): row is SafeRow =>
    typeof row === 'object' && row !== null && !Array.isArray(row))
  : []

const requireQuery = (error: unknown) => {
  if (error) {
    throw new PrivacyRetentionActiveHoldError('RETENTION_ACTIVE_HOLDS_LOAD_FAILED')
  }
}

const readId = (
  row: SafeRow,
  type: RetentionEnquiryType
): string | null => {
  const id = typeof row.id === 'number'
    ? String(row.id)
    : typeof row.id === 'string'
      ? row.id
      : ''
  const valid = type === 'contact' || type === 'workshop'
    ? numericIdPattern.test(id)
    : uuidPattern.test(id)

  return valid ? id : null
}

const readHoldEvidence = (row: SafeRow) => {
  const reason = row.legal_hold_reason
  const reviewAt = row.legal_hold_review_at
  if (
    typeof reason !== 'string' ||
    !isPrivacyRetentionHoldReason(reason) ||
    typeof reviewAt !== 'string' ||
    !Number.isFinite(new Date(reviewAt).getTime())
  ) {
    throw new PrivacyRetentionActiveHoldError('RETENTION_ACTIVE_HOLD_INVALID')
  }

  return { reason, reviewAt }
}

const listEnquiryHolds = async (
  client: SupabaseAdminClient,
  config: EnquiryHoldConfig,
  fetchLimit: number,
  nowMs: number
): Promise<PrivacyRetentionActiveHold[]> => {
  const { data, error } = await client
    .from(config.table)
    .select('id,legal_hold_reason,legal_hold_review_at')
    .eq('legal_hold', true)
    .order('legal_hold_review_at', { ascending: true })
    .order('id', { ascending: true })
    .range(0, fetchLimit - 1)

  requireQuery(error)

  return asRows(data).map((row) => {
    const id = readId(row, config.type)
    if (!id) {
      throw new PrivacyRetentionActiveHoldError('RETENTION_ACTIVE_HOLD_INVALID')
    }
    const evidence = readHoldEvidence(row)
    const recordReference = `${config.referencePrefix}-${id}`

    return {
      candidateId: buildEnquiryCandidateId(config.type, id),
      recordType: config.recordType,
      recordReference,
      reason: evidence.reason,
      reviewAt: evidence.reviewAt,
      overdue: new Date(evidence.reviewAt).getTime() <= nowMs,
      ...(config.detailType
        ? {
            detailHref: `/admin/enquiries/${config.detailType}/${encodeURIComponent(id)}`
          }
        : {})
    }
  })
}

const listOrderHolds = async (
  client: SupabaseAdminClient,
  fetchLimit: number,
  nowMs: number
): Promise<PrivacyRetentionActiveHold[]> => {
  const { data, error } = await client
    .from('orders')
    .select('id,order_number,legal_hold_reason,legal_hold_review_at')
    .eq('legal_hold', true)
    .order('legal_hold_review_at', { ascending: true })
    .order('id', { ascending: true })
    .range(0, fetchLimit - 1)

  requireQuery(error)

  return asRows(data).map((row) => {
    const id = typeof row.id === 'string' && uuidPattern.test(row.id)
      ? row.id
      : null
    const recordReference = typeof row.order_number === 'string'
      ? row.order_number.trim()
      : ''
    if (!id || !orderReferencePattern.test(recordReference)) {
      throw new PrivacyRetentionActiveHoldError('RETENTION_ACTIVE_HOLD_INVALID')
    }
    const evidence = readHoldEvidence(row)

    return {
      candidateId: buildOrderCandidateId(id),
      recordType: 'order',
      recordReference,
      reason: evidence.reason,
      reviewAt: evidence.reviewAt,
      overdue: new Date(evidence.reviewAt).getTime() <= nowMs,
      detailHref: `/admin/orders/${encodeURIComponent(id)}`
    }
  })
}

const securityRecordTypes: RetentionSecurityRecordType[] = [
  'enquiry-rate-limits',
  'admin-login-attempts',
  'event-photo-rate-limits'
]

const listSecurityHolds = async (
  client: SupabaseAdminClient,
  fetchLimit: number,
  nowMs: number
): Promise<PrivacyRetentionActiveHold[]> => {
  const { data, error } = await client
    .from('privacy_retention_security_holds')
    .select('record_type,reason,review_at')
    .order('review_at', { ascending: true })
    .order('record_type', { ascending: true })
    .range(0, fetchLimit - 1)

  requireQuery(error)

  return asRows(data).map((row) => {
    const recordType = row.record_type
    const reason = row.reason
    const reviewAt = row.review_at
    if (
      typeof recordType !== 'string' ||
      !securityRecordTypes.includes(recordType as RetentionSecurityRecordType) ||
      typeof reason !== 'string' ||
      !isPrivacyRetentionHoldReason(reason) ||
      typeof reviewAt !== 'string' ||
      !Number.isFinite(new Date(reviewAt).getTime())
    ) {
      throw new PrivacyRetentionActiveHoldError('RETENTION_ACTIVE_HOLD_INVALID')
    }

    return {
      candidateId: buildSecurityCandidateId(recordType as RetentionSecurityRecordType),
      recordType: 'security-batch',
      recordReference: recordType,
      reason,
      reviewAt,
      overdue: new Date(reviewAt).getTime() <= nowMs
    }
  })
}

export async function listPrivacyRetentionActiveHolds(input: {
  page: number
  pageSize: number
  now?: Date
  client?: SupabaseAdminClient
}): Promise<PrivacyRetentionActiveHoldPage> {
  const page = Math.max(1, Math.floor(input.page))
  const pageSize = Math.min(50, Math.max(1, Math.floor(input.pageSize)))
  const offset = (page - 1) * pageSize
  const fetchLimit = offset + pageSize + 1
  const now = input.now || new Date()
  const nowMs = now.getTime()
  const client = input.client || getSupabaseAdminClient()
  const groups = await Promise.all([
    ...enquiryHoldConfigs.map((config) =>
      listEnquiryHolds(client, config, fetchLimit, nowMs)),
    listOrderHolds(client, fetchLimit, nowMs),
    listSecurityHolds(client, fetchLimit, nowMs)
  ])
  const holds = Array.from(new Map(groups
    .flat()
    .map((hold) => [hold.candidateId, hold] as const)).values())
    .sort((first, second) =>
      first.reviewAt.localeCompare(second.reviewAt) ||
      first.candidateId.localeCompare(second.candidateId))

  return {
    holds: holds.slice(offset, offset + pageSize),
    page,
    pageSize,
    hasMore: holds.length > offset + pageSize
  }
}
