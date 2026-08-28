import 'server-only'

import { getSupabaseAdminClient, type SupabaseAdminClient } from '@/lib/supabase-admin-client'
import { ENQUIRY_RETENTION_MONTHS, subtractCalendarMonths } from './policy'

export type PrivacyRetentionLifecycleIssueCode =
  | 'stale-open-enquiry'
  | 'missing-enquiry-deadline'
  | 'event-files-cleared-open'
  | 'missing-order-deadline'
  | 'missing-health-deadline'

export interface PrivacyRetentionLifecycleIssue {
  id: string
  recordType: 'contact' | 'custom-cake' | 'workshop' | 'event-photo' | 'order'
  recordReference: string
  createdAt: string
  issueCode: PrivacyRetentionLifecycleIssueCode
  issueLabel: string
  detailHref?: string
  action: 'open-detail' | 'close-event-now'
}

export interface PrivacyRetentionLifecycleIssuePage {
  issues: PrivacyRetentionLifecycleIssue[]
  page: number
  pageSize: number
  hasMore: boolean
}

export class PrivacyRetentionLifecycleReviewError extends Error {
  code: string
  status: number

  constructor(code: string, status: number) {
    super(code)
    this.name = 'PrivacyRetentionLifecycleReviewError'
    this.code = code
    this.status = status
  }
}

const enquiryConfigs = [
  { type: 'contact', table: 'contact_enquiries', label: 'Contact enquiry' },
  { type: 'custom-cake', table: 'custom_cake_enquiries', label: 'Custom-cake enquiry' },
  { type: 'workshop', table: 'workshop_enquiries', label: 'Workshop enquiry' },
  { type: 'event-photo', table: 'event_photo_requests', label: 'Event-photo request' }
] as const

type SafeRow = Record<string, unknown>

const asRows = (value: unknown): SafeRow[] => Array.isArray(value)
  ? value.filter((row): row is SafeRow => typeof row === 'object' && row !== null && !Array.isArray(row))
  : []

const requireQuery = (error: unknown) => {
  if (error) {
    throw new Error('RETENTION_LIFECYCLE_ISSUES_LOAD_FAILED')
  }
}

const readString = (row: SafeRow, field: string) =>
  typeof row[field] === 'string' ? row[field] : ''

const getEnquiryReference = (type: typeof enquiryConfigs[number]['type'], id: string) =>
  `${type}-${id}`

const getEnquiryHref = (
  type: Exclude<typeof enquiryConfigs[number]['type'], 'event-photo'>,
  id: string
) => `/admin/enquiries/${encodeURIComponent(type)}/${encodeURIComponent(id)}`

const mapEnquiryIssue = (
  config: typeof enquiryConfigs[number],
  row: SafeRow,
  issueCode: Exclude<PrivacyRetentionLifecycleIssueCode, 'missing-order-deadline'>
): PrivacyRetentionLifecycleIssue | null => {
  const id = readString(row, 'id') || (typeof row.id === 'number' ? String(row.id) : '')
  const createdAt = readString(row, 'created_at')
  if (!id || !createdAt) {
    return null
  }

  const issueLabel = issueCode === 'stale-open-enquiry'
    ? 'Still open after 24 months; review the last contact and outcome.'
    : issueCode === 'event-files-cleared-open'
      ? 'Temporary files were cleared, but the request lifecycle is still open.'
      : issueCode === 'missing-health-deadline'
        ? 'Protected dietary-health information has no recorded erasure deadline.'
        : 'Closed or converted record has no reliable retention deadline.'

  return {
    id: `${config.type}:${id}:${issueCode}`,
    recordType: config.type,
    recordReference: getEnquiryReference(config.type, id),
    createdAt,
    issueCode,
    issueLabel,
    ...(config.type === 'event-photo'
      ? {}
      : { detailHref: getEnquiryHref(config.type, id) }),
    action: config.type === 'event-photo' ? 'close-event-now' : 'open-detail'
  }
}

const listEnquiryIssues = async (
  client: SupabaseAdminClient,
  config: typeof enquiryConfigs[number],
  staleOpenCutoff: string,
  fetchLimit: number
) => {
  const baseColumns = config.type === 'event-photo'
    ? 'id,created_at,lifecycle_status,retention_due_at,files_deleted_at'
    : 'id,created_at,lifecycle_status,retention_due_at'
  const [missingResult, staleResult, cleanedResult, healthResult] = await Promise.all([
    client
      .from(config.table)
      .select(baseColumns)
      .in('lifecycle_status', ['closed', 'converted'])
      .is('retention_due_at', null)
      .order('created_at', { ascending: true })
      .range(0, fetchLimit - 1),
    client
      .from(config.table)
      .select(baseColumns)
      .eq('lifecycle_status', 'open')
      .lte('created_at', staleOpenCutoff)
      .order('created_at', { ascending: true })
      .range(0, fetchLimit - 1),
    config.type === 'event-photo'
      ? client
        .from(config.table)
        .select(baseColumns)
        .eq('lifecycle_status', 'open')
        .not('files_deleted_at', 'is', null)
        .gt('created_at', staleOpenCutoff)
        .order('created_at', { ascending: true })
        .range(0, fetchLimit - 1)
      : Promise.resolve({ data: [], error: null }),
    config.type !== 'event-photo'
      ? client
        .from(config.table)
        .select(baseColumns)
        .in('lifecycle_status', ['closed', 'converted'])
        .not('dietary_health_information', 'is', null)
        .eq('dietary_health_consent', true)
        .is('dietary_health_withdrawn_at', null)
        .is('dietary_health_erased_at', null)
        .is('dietary_health_retention_due_at', null)
        .order('created_at', { ascending: true })
        .range(0, fetchLimit - 1)
      : Promise.resolve({ data: [], error: null })
  ])

  requireQuery(missingResult.error)
  requireQuery(staleResult.error)
  requireQuery(cleanedResult.error)
  requireQuery(healthResult.error)

  return [
    ...asRows(missingResult.data).map((row) => mapEnquiryIssue(config, row, 'missing-enquiry-deadline')),
    ...asRows(staleResult.data).map((row) => mapEnquiryIssue(config, row, 'stale-open-enquiry')),
    ...asRows(cleanedResult.data).map((row) => mapEnquiryIssue(config, row, 'event-files-cleared-open')),
    ...asRows(healthResult.data).map((row) => mapEnquiryIssue(config, row, 'missing-health-deadline'))
  ].filter((issue): issue is PrivacyRetentionLifecycleIssue => issue !== null)
}

const mapOrderIssue = (
  row: SafeRow,
  issueCode: Extract<
    PrivacyRetentionLifecycleIssueCode,
    'missing-order-deadline' | 'missing-health-deadline'
  >
): PrivacyRetentionLifecycleIssue | null => {
  const id = readString(row, 'id')
  const orderNumber = readString(row, 'order_number')
  const createdAt = readString(row, 'created_at')
  if (!id || !orderNumber || !createdAt) {
    return null
  }

  return {
    id: `order:${id}:${issueCode}`,
    recordType: 'order',
    recordReference: orderNumber,
    createdAt,
    issueCode,
    issueLabel: issueCode === 'missing-health-deadline'
      ? 'Protected dietary-health information has no recorded erasure deadline.'
      : 'Terminal order has no verified completion date or financial retention deadline.',
    detailHref: `/admin/orders/${encodeURIComponent(id)}`,
    action: 'open-detail'
  }
}

const listOrderIssues = async (
  client: SupabaseAdminClient,
  fetchLimit: number
): Promise<PrivacyRetentionLifecycleIssue[]> => {
  const columns = 'id,order_number,created_at,status,retention_due_at'
  const [retentionResult, healthResult] = await Promise.all([
    client
      .from('orders')
      .select(columns)
      .is('retention_due_at', null)
      .in('status', ['completed', 'delivered', 'cancelled'])
      .order('created_at', { ascending: true })
      .range(0, fetchLimit - 1),
    client
      .from('orders')
      .select(columns)
      .in('status', ['completed', 'delivered', 'cancelled'])
      .not('metadata->>dietaryHealthInformation', 'is', null)
      .eq('metadata->>dietaryHealthConsent', 'true')
      .is('metadata->>dietaryHealthWithdrawnAt', null)
      .is('dietary_health_erased_at', null)
      .is('dietary_health_retention_due_at', null)
      .order('created_at', { ascending: true })
      .range(0, fetchLimit - 1)
  ])

  requireQuery(retentionResult.error)
  requireQuery(healthResult.error)

  return [
    ...asRows(retentionResult.data).map((row) => mapOrderIssue(row, 'missing-order-deadline')),
    ...asRows(healthResult.data).map((row) => mapOrderIssue(row, 'missing-health-deadline'))
  ].filter((issue): issue is PrivacyRetentionLifecycleIssue => issue !== null)
}

export async function listPrivacyRetentionLifecycleIssues(input: {
  page: number
  pageSize: number
  now?: Date
  client?: SupabaseAdminClient
}): Promise<PrivacyRetentionLifecycleIssuePage> {
  const page = Math.max(1, Math.floor(input.page))
  const pageSize = Math.min(50, Math.max(1, Math.floor(input.pageSize)))
  const offset = (page - 1) * pageSize
  const fetchLimit = offset + pageSize + 1
  const now = input.now || new Date()
  const staleOpenCutoff = subtractCalendarMonths(now, ENQUIRY_RETENTION_MONTHS).toISOString()
  const client = input.client || getSupabaseAdminClient()
  const groups = await Promise.all([
    ...enquiryConfigs.map((config) => listEnquiryIssues(client, config, staleOpenCutoff, fetchLimit)),
    listOrderIssues(client, fetchLimit)
  ])
  const uniqueIssues = Array.from(new Map(groups
    .flat()
    .map((issue) => [issue.id, issue] as const)).values())
    .sort((first, second) => first.createdAt.localeCompare(second.createdAt) || first.id.localeCompare(second.id))

  return {
    issues: uniqueIssues.slice(offset, offset + pageSize),
    page,
    pageSize,
    hasMore: uniqueIssues.length > offset + pageSize
  }
}

const eventLifecycleErrorStatuses: Record<string, number> = {
  RETENTION_EVENT_NOT_FOUND: 404,
  RETENTION_EVENT_ALREADY_CLOSED: 409,
  RETENTION_EVENT_LEGAL_HOLD_ACTIVE: 409,
  RETENTION_DELETION_CLAIM_ACTIVE: 409,
  RETENTION_EVENT_CONFIRMATION_INVALID: 400
}

export async function closeEventPhotoRetentionLifecycle(input: {
  requestId: string
  confirmation: string
  client?: SupabaseAdminClient
}) {
  const client = input.client || getSupabaseAdminClient()
  const { data, error } = await client.rpc('close_event_photo_retention_lifecycle', {
    p_request_id: input.requestId,
    p_confirmation: input.confirmation
  })

  if (error) {
    const message = typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
      ? error.message
      : ''
    const code = Object.keys(eventLifecycleErrorStatuses).find((item) => message.includes(item))
    if (code) {
      throw new PrivacyRetentionLifecycleReviewError(code, eventLifecycleErrorStatuses[code])
    }
    throw new PrivacyRetentionLifecycleReviewError('RETENTION_EVENT_CLOSE_FAILED', 500)
  }

  const row: unknown = Array.isArray(data) ? data[0] : data
  if (
    typeof row !== 'object' ||
    row === null ||
    Array.isArray(row) ||
    !('status' in row) ||
    row.status !== 'closed' ||
    !('closed_at' in row) ||
    typeof row.closed_at !== 'string' ||
    !('retention_due_at' in row) ||
    typeof row.retention_due_at !== 'string'
  ) {
    throw new PrivacyRetentionLifecycleReviewError('RETENTION_EVENT_CLOSE_FAILED', 500)
  }

  return {
    status: 'closed' as const,
    closedAt: row.closed_at,
    retentionDueAt: row.retention_due_at
  }
}
