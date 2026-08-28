import type {
  PrivacyRetentionActiveHold,
  PrivacyRetentionActiveHoldPage,
  PrivacyRetentionActiveHoldRecordType
} from '@/lib/privacy-retention/active-holds-contract'
import { parsePrivacyRetentionCandidateId } from '@/lib/privacy-retention/candidate-id'
import type { PrivacyRetentionHoldReason } from '@/lib/privacy-retention/types'

const activeHoldRecordTypes: PrivacyRetentionActiveHoldRecordType[] = [
  'contact-enquiry',
  'custom-cake-enquiry',
  'workshop-enquiry',
  'event-photo-request',
  'order',
  'security-batch'
]

const holdReasons: PrivacyRetentionHoldReason[] = [
  'active-complaint',
  'legal-claim',
  'regulatory-request',
  'fraud-investigation',
  'other-necessary-hold'
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isSafeString = (value: unknown, maximumLength: number): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= maximumLength

const parseHold = (value: unknown): PrivacyRetentionActiveHold | null => {
  if (
    !isRecord(value) ||
    !isSafeString(value.candidateId, 160) ||
    !parsePrivacyRetentionCandidateId(value.candidateId) ||
    typeof value.recordType !== 'string' ||
    !activeHoldRecordTypes.includes(
      value.recordType as PrivacyRetentionActiveHoldRecordType
    ) ||
    !isSafeString(value.recordReference, 160) ||
    typeof value.reason !== 'string' ||
    !holdReasons.includes(value.reason as PrivacyRetentionHoldReason) ||
    !isSafeString(value.reviewAt, 64) ||
    !Number.isFinite(new Date(value.reviewAt).getTime()) ||
    typeof value.overdue !== 'boolean' ||
    !(
      value.detailHref === undefined ||
      (
        isSafeString(value.detailHref, 300) &&
        value.detailHref.startsWith('/admin/') &&
        !value.detailHref.startsWith('//')
      )
    )
  ) {
    return null
  }

  return {
    candidateId: value.candidateId,
    recordType: value.recordType as PrivacyRetentionActiveHoldRecordType,
    recordReference: value.recordReference,
    reason: value.reason as PrivacyRetentionHoldReason,
    reviewAt: value.reviewAt,
    overdue: value.overdue,
    ...(value.detailHref ? { detailHref: value.detailHref } : {})
  }
}

const parsePage = (value: unknown): PrivacyRetentionActiveHoldPage | null => {
  if (
    !isRecord(value) ||
    !Array.isArray(value.holds) ||
    typeof value.page !== 'number' ||
    !Number.isInteger(value.page) ||
    value.page < 1 ||
    typeof value.pageSize !== 'number' ||
    !Number.isInteger(value.pageSize) ||
    value.pageSize < 1 ||
    value.pageSize > 50 ||
    typeof value.hasMore !== 'boolean'
  ) {
    return null
  }

  const holds = value.holds.map(parseHold)
  if (holds.some((hold) => hold === null)) {
    return null
  }

  return {
    holds: holds as PrivacyRetentionActiveHold[],
    page: value.page,
    pageSize: value.pageSize,
    hasMore: value.hasMore
  }
}

export async function fetchPrivacyRetentionActiveHolds(input: {
  page: number
  pageSize: number
  signal: AbortSignal
}) {
  const search = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize)
  })
  const response = await fetch(
    `/api/admin/privacy-retention/holds/active?${search.toString()}`,
    {
      credentials: 'include',
      signal: input.signal
    }
  )

  if (!response.ok) {
    throw new Error('The active legal-hold register could not be loaded.')
  }

  const page = parsePage(await response.json().catch((): unknown => null))
  if (!page) {
    throw new Error('The active legal-hold response was invalid.')
  }

  return page
}
