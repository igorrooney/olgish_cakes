import 'server-only'

import { createHash } from 'node:crypto'
import type { SupabaseAdminClient } from '@/lib/supabase-admin-client'
import { getCustomCakeStorageBucket } from '@/lib/storage-buckets'
import {
  buildEnquiryCandidateId,
  buildEnquiryUploadCandidateId,
  buildHealthEnquiryCandidateId,
  buildHealthOrderCandidateId,
  buildOrderCandidateId,
  buildOrderUploadCandidateId,
  buildSecurityCandidateId,
  parsePrivacyRetentionCandidateId,
  type ParsedPrivacyRetentionCandidateId,
  type RetentionEnquiryType,
  type RetentionHealthEnquiryType,
  type RetentionSecurityRecordType
} from './candidate-id'
import {
  addCalendarMonths,
  ENQUIRY_RETENTION_MONTHS,
  privacyRetentionCategories,
  isPrivacyRetentionHoldReason,
  SECURITY_RECORD_RETENTION_DAYS,
  subtractCalendarDays,
  subtractCalendarMonths,
  UPLOAD_RETENTION_MONTHS
} from './policy'
import type {
  PrivacyRetentionCandidate,
  PrivacyRetentionCategoryCount,
  PrivacyRetentionHoldReason,
  PrivacyRetentionRunHistoryItem,
  PrivacyRetentionRunMode,
  PrivacyRetentionRunStatus,
  PrivacyRetentionResultStatus
} from './types'

const maximumCandidatesPerSource = 250
const storageDeletionBatchSize = 100
const orderImageBucket = getCustomCakeStorageBucket
const eventPhotoBucket = 'event-photo-temp-uploads'

type EnquiryTableConfig = {
  type: RetentionEnquiryType
  table: string
  recordType: string
  referencePrefix: string
}

const enquiryTables: EnquiryTableConfig[] = [
  {
    type: 'contact',
    table: 'contact_enquiries',
    recordType: 'Contact enquiry',
    referencePrefix: 'contact'
  },
  {
    type: 'custom-cake',
    table: 'custom_cake_enquiries',
    recordType: 'Custom-cake enquiry',
    referencePrefix: 'custom-cake'
  },
  {
    type: 'workshop',
    table: 'workshop_enquiries',
    recordType: 'Workshop enquiry',
    referencePrefix: 'workshop'
  },
  {
    type: 'event-photo',
    table: 'event_photo_requests',
    recordType: 'Event-photo request',
    referencePrefix: 'event-photo'
  }
]

type SecurityTableConfig = {
  type: RetentionSecurityRecordType
  table: string
  timestampColumn: string
  recordType: string
  revisionColumns: string
  revisionOrderColumns: string[]
}

const securityTables: SecurityTableConfig[] = [
  {
    type: 'enquiry-rate-limits',
    table: 'enquiry_rate_limits',
    timestampColumn: 'updated_at',
    recordType: 'Enquiry rate-limit records',
    revisionColumns: 'scope,identifier,window_start,updated_at',
    revisionOrderColumns: ['scope', 'identifier', 'window_start']
  },
  {
    type: 'admin-login-attempts',
    table: 'admin_login_attempts',
    timestampColumn: 'failed_at',
    recordType: 'Admin login-attempt records',
    revisionColumns: 'id,failed_at,cleared_at',
    revisionOrderColumns: ['id']
  },
  {
    type: 'event-photo-rate-limits',
    table: 'event_photo_rate_limit_attempts',
    timestampColumn: 'attempted_at',
    recordType: 'Event-photo rate-limit records',
    revisionColumns: 'id,attempted_at',
    revisionOrderColumns: ['id']
  }
]

type EnquiryRetentionRow = {
  id: string | number
  retention_due_at: string
  updated_at: string
  converted_order_id?: string | null
  legal_hold: boolean | null
  legal_hold_reason: PrivacyRetentionHoldReason | null
  legal_hold_review_at: string | null
  reference_image_bucket?: string | null
  reference_image_path?: string | null
  temp_image_bucket?: string | null
  temp_image_paths?: string[] | null
}

type EnquiryUploadRow = EnquiryRetentionRow & {
  upload_retention_due_at: string
}

type HealthRetentionRow = {
  id: string | number
  dietary_health_retention_due_at: string
  dietary_health_erased_at: string | null
  updated_at: string
  converted_order_id?: string | null
  legal_hold: boolean | null
  legal_hold_reason: PrivacyRetentionHoldReason | null
  legal_hold_review_at: string | null
  order_number?: string
}

type OrderRetentionRow = {
  id: string
  order_number: string
  status: string
  completed_at: string | null
  retention_due_at: string | null
  legal_hold: boolean | null
  legal_hold_reason: PrivacyRetentionHoldReason | null
  legal_hold_review_at: string | null
  updated_at: string
}

type OrderChildRow = {
  id: string
  order_id: string
  legacy_message?: unknown
  legacy_note?: unknown
}

type OrderAssetRow = {
  id: string
  asset_type: string | null
  asset_id: string | null
  asset_ref: string | null
  message_id?: string
  note_id?: string
  line_number?: number
  legacy_only?: boolean
  legacy_attachment?: unknown
  legacy_image?: unknown
}

type OrderAssetInventory = {
  rows: OrderAssetRow[]
  revisionParts: string[]
}

type SecurityHoldRow = {
  record_type: RetentionSecurityRecordType
  reason: PrivacyRetentionHoldReason
  review_at: string
}

type RetentionRunRow = {
  id: string
  run_reference: string
  run_mode: PrivacyRetentionRunMode
  status: PrivacyRetentionRunStatus
  selected_count: number | null
  succeeded_count: number | null
  failed_count: number | null
  started_at: string
  completed_at: string | null
}

type RetentionResumeRunRow = RetentionRunRow & {
  candidate_count: number | null
  skipped_count: number | null
}

type RetentionResumeActionRow = {
  candidate_id: string
  category: PrivacyRetentionCandidate['category']
  record_type: string
  record_reference: string
  due_at: string
  snapshot_revision: string
  action_type: string
  outcome: 'pending' | 'deleted' | 'skipped' | 'failed'
  error_code: string | null
  occurred_at: string
}

export type RetentionRunInsert = {
  runReference: string
  mode: PrivacyRetentionRunMode
  initiator: 'admin' | 'scheduled'
  candidateCount: number
  selectedCount: number
  selectedCategories: string[]
  reviewedSchedule?: boolean
  reviewedExternalSystems?: boolean
}

export type RetentionActionInsert = {
  candidate: PrivacyRetentionCandidate
  actionType: string
}

export type PrivacyRetentionManualRunInitialization = {
  runId: string
  recovered: boolean
  status: PrivacyRetentionRunStatus
  startedAt: string
  completedAt: string | null
}

export type PrivacyRetentionPersistedAction = {
  candidateId: string
  category: PrivacyRetentionCandidate['category']
  recordType: string
  recordReference: string
  dueAt: string
  snapshotRevision: string
  actionType: string
  outcome: 'pending' | 'deleted' | 'skipped' | 'failed'
  errorCode: string | null
  occurredAt: string
}

export type PrivacyRetentionPersistedManualRun = {
  runId: string
  runReference: string
  status: PrivacyRetentionRunStatus
  candidateCount: number
  selectedCount: number
  succeededCount: number
  skippedCount: number
  failedCount: number
  startedAt: string
  completedAt: string | null
  actions: PrivacyRetentionPersistedAction[]
}

export type RetentionRunCounts = {
  succeeded: number
  skipped: number
  failed: number
}

export type PrivacyRetentionLegalHoldState = {
  found: boolean
  recordReference: string | null
  holdActive: boolean
  holdReason: PrivacyRetentionHoldReason | null
  holdReviewAt: string | null
}

export type PrivacyRetentionCandidatePage = {
  candidates: PrivacyRetentionCandidate[]
  categoryCounts: PrivacyRetentionCategoryCount[]
  totalCount: number
  dueCount: number
  heldCount: number
  page: number
  pageSize: number
  hasMore: boolean
}

export class PrivacyRetentionRepositoryError extends Error {
  code: string

  constructor(code: string) {
    super(code)
    this.name = 'PrivacyRetentionRepositoryError'
    this.code = code
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asRows = <Row>(value: unknown): Row[] =>
  Array.isArray(value) ? value as Row[] : []

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0

const isPositiveInteger = (value: unknown): value is number =>
  isNonNegativeInteger(value) && value > 0

const isCandidateCategory = (
  value: unknown
): value is PrivacyRetentionCandidate['category'] =>
  typeof value === 'string' && privacyRetentionCategories.some(
    (category) => category.id === value
  )

const parseCandidatePageCandidate = (
  value: unknown
): PrivacyRetentionCandidate | null => {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !isCandidateCategory(value.category) ||
    typeof value.recordType !== 'string' ||
    typeof value.recordReference !== 'string' ||
    typeof value.dueAt !== 'string' ||
    typeof value.reason !== 'string' ||
    !Array.isArray(value.removes) ||
    !value.removes.every((item) => typeof item === 'string') ||
    !Array.isArray(value.retains) ||
    !value.retains.every((item) => typeof item === 'string') ||
    !isPositiveInteger(value.itemCount) ||
    typeof value.held !== 'boolean' ||
    typeof value.snapshotRevision !== 'string' ||
    !/^[0-9a-f]{64}$/.test(value.snapshotRevision) ||
    (
      value.holdReason !== undefined &&
      value.holdReason !== null &&
      (
        typeof value.holdReason !== 'string' ||
        !isPrivacyRetentionHoldReason(value.holdReason)
      )
    ) ||
    (
      value.holdReviewAt !== undefined &&
      value.holdReviewAt !== null &&
      typeof value.holdReviewAt !== 'string'
    )
  ) {
    return null
  }

  return {
    id: value.id,
    category: value.category,
    recordType: value.recordType,
    recordReference: value.recordReference,
    dueAt: value.dueAt,
    reason: value.reason,
    removes: value.removes,
    retains: value.retains,
    itemCount: value.itemCount,
    held: value.held,
    snapshotRevision: value.snapshotRevision,
    ...(value.holdReason ? { holdReason: value.holdReason } : {}),
    ...(value.holdReviewAt ? { holdReviewAt: value.holdReviewAt } : {})
  }
}

const parseCandidateCategoryCount = (
  value: unknown
): PrivacyRetentionCategoryCount | null => {
  if (
    !isRecord(value) ||
    !isCandidateCategory(value.category) ||
    !isNonNegativeInteger(value.total) ||
    !isNonNegativeInteger(value.due) ||
    !isNonNegativeInteger(value.held) ||
    value.total !== value.due + value.held
  ) {
    return null
  }

  return {
    category: value.category,
    total: value.total,
    due: value.due,
    held: value.held
  }
}

const parseCandidatePage = (value: unknown): PrivacyRetentionCandidatePage => {
  if (
    !isRecord(value) ||
    !Array.isArray(value.candidates) ||
    !Array.isArray(value.categoryCounts) ||
    !isNonNegativeInteger(value.totalCount) ||
    !isNonNegativeInteger(value.dueCount) ||
    !isNonNegativeInteger(value.heldCount) ||
    !isPositiveInteger(value.page) ||
    !isPositiveInteger(value.pageSize) ||
    typeof value.hasMore !== 'boolean'
  ) {
    throw new PrivacyRetentionRepositoryError(
      'RETENTION_CANDIDATE_PAGE_INVALID'
    )
  }

  const candidates = value.candidates.map(parseCandidatePageCandidate)
  const categoryCounts = value.categoryCounts.map(parseCandidateCategoryCount)
  if (
    candidates.some((candidate) => candidate === null) ||
    categoryCounts.some((count) => count === null)
  ) {
    throw new PrivacyRetentionRepositoryError(
      'RETENTION_CANDIDATE_PAGE_INVALID'
    )
  }
  const parsedCandidates = candidates as PrivacyRetentionCandidate[]
  const parsedCategoryCounts = categoryCounts as PrivacyRetentionCategoryCount[]
  const expectedCategories = privacyRetentionCategories.map((category) => category.id)
  const candidateIds = parsedCandidates.map((candidate) => candidate.id)
  const returnedCategories = parsedCategoryCounts.map((count) => count.category)
  const categoryTotal = parsedCategoryCounts.reduce(
    (total, count) => total + count.total,
    0
  )
  const categoryDue = parsedCategoryCounts.reduce(
    (total, count) => total + count.due,
    0
  )
  const categoryHeld = parsedCategoryCounts.reduce(
    (total, count) => total + count.held,
    0
  )
  const totalPages = Math.max(1, Math.ceil(value.totalCount / value.pageSize))
  const expectedPageCount = Math.min(
    value.pageSize,
    Math.max(0, value.totalCount - ((value.page - 1) * value.pageSize))
  )
  if (
    value.totalCount !== value.dueCount + value.heldCount ||
    candidates.length !== expectedPageCount ||
    new Set(candidateIds).size !== candidateIds.length ||
    returnedCategories.length !== expectedCategories.length ||
    new Set(returnedCategories).size !== returnedCategories.length ||
    expectedCategories.some((category) => !returnedCategories.includes(category)) ||
    categoryTotal !== value.totalCount ||
    categoryDue !== value.dueCount ||
    categoryHeld !== value.heldCount ||
    value.page > totalPages ||
    value.hasMore !== (value.page < totalPages)
  ) {
    throw new PrivacyRetentionRepositoryError(
      'RETENTION_CANDIDATE_PAGE_INVALID'
    )
  }

  return {
    candidates: parsedCandidates,
    categoryCounts: parsedCategoryCounts,
    totalCount: value.totalCount,
    dueCount: value.dueCount,
    heldCount: value.heldCount,
    page: value.page,
    pageSize: value.pageSize,
    hasMore: value.hasMore
  }
}

const createSnapshotRevision = (parts: string[]) => createHash('sha256')
  .update(JSON.stringify([...parts].sort()), 'utf8')
  .digest('hex')

const getNestedString = (
  value: unknown,
  path: string[]
): string | null => {
  let current: unknown = value

  for (const key of path) {
    if (!isRecord(current)) {
      return null
    }
    current = current[key]
  }

  return typeof current === 'string' && current.trim().length > 0
    ? current.trim()
    : null
}

const getPotentialAssetReferences = (row: OrderAssetRow): string[] => {
  const legacy = row.legacy_attachment ?? row.legacy_image
  const relationalType = row.asset_type
  const legacyType = getNestedString(legacy, ['asset', '_type'])

  if (relationalType && legacyType && relationalType !== legacyType) {
    throw new PrivacyRetentionRepositoryError(
      'RETENTION_STORAGE_REFERENCE_AMBIGUOUS'
    )
  }

  if (relationalType !== 'supabase-file' && legacyType !== 'supabase-file') {
    return []
  }

  return Array.from(new Set([
    row.asset_ref,
    row.asset_id,
    getNestedString(legacy, ['asset', '_ref']),
    getNestedString(legacy, ['asset', '_id'])
  ].filter((value): value is string => Boolean(value))))
}

const getLegacyAssetRows = (
  value: unknown,
  collectionKey: 'attachments' | 'images',
  ownerId: string
): OrderAssetRow[] => {
  if (!isRecord(value) || !Array.isArray(value[collectionKey])) {
    return []
  }

  return value[collectionKey]
    .filter(isRecord)
    .map((item, index) => ({
      id: `legacy-${ownerId}-${collectionKey}-${index}`,
      asset_type: null,
      asset_id: null,
      asset_ref: null,
      ...(collectionKey === 'attachments'
        ? { message_id: ownerId }
        : { note_id: ownerId }),
      line_number: index + 1,
      legacy_only: true,
      ...(collectionKey === 'attachments'
        ? { legacy_attachment: item }
        : { legacy_image: item })
    }))
}

const isSafeStoragePath = (
  path: string,
  allowedPrefixes: string[]
): boolean => {
  if (
    path.length === 0 ||
    path.length > 1024 ||
    path.startsWith('/') ||
    path.includes('\\') ||
    path.split('/').some((part) => part === '..' || part.length === 0)
  ) {
    return false
  }

  return allowedPrefixes.some((prefix) => path.startsWith(prefix))
}

const getEnquiryReference = (config: EnquiryTableConfig, id: string | number) =>
  `${config.referencePrefix}-${String(id)}`

const getCategoryDescription = (id: PrivacyRetentionCandidate['category']) =>
  privacyRetentionCategories.find((category) => category.id === id)?.description ||
  'The documented retention deadline has passed.'

const getActionType = (candidate: PrivacyRetentionCandidate): string => {
  if (candidate.category === 'expired-health-information') {
    return 'erase-health-information'
  }
  if (candidate.category === 'expired-enquiry-upload') {
    return 'delete-enquiry-upload'
  }
  if (candidate.category === 'expired-order-upload') {
    return 'delete-order-upload'
  }
  if (candidate.category === 'expired-order') {
    return 'delete-order-record'
  }
  if (candidate.category === 'expired-security-record') {
    return 'delete-security-batch'
  }
  return 'delete-enquiry-record'
}

const getEnquiryConfig = (type: RetentionEnquiryType) => {
  const config = enquiryTables.find((item) => item.type === type)
  if (!config) {
    throw new PrivacyRetentionRepositoryError('RETENTION_ENQUIRY_TYPE_INVALID')
  }
  return config
}

const assertDatabaseSuccess = (
  error: unknown,
  code: string
) => {
  if (error) {
    throw new PrivacyRetentionRepositoryError(code)
  }
}

const hasDatabaseErrorCode = (error: unknown, code: string) =>
  isRecord(error) && error.code === code

const toSafeCount = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : 0

const getEnquirySelectColumns = (type: RetentionEnquiryType) => {
  const base = [
    'id',
    'retention_due_at',
    'updated_at',
    'legal_hold',
    'legal_hold_reason',
    'legal_hold_review_at'
  ]

  if (type === 'custom-cake') {
    base.push('reference_image_bucket', 'reference_image_path')
  }

  if (type === 'event-photo') {
    base.push('temp_image_bucket', 'temp_image_paths')
  }

  return base.join(',')
}

const getEnquiryUploadSelectColumns = (type: 'custom-cake' | 'event-photo') => {
  const base = [
    'id',
    'upload_retention_due_at',
    'retention_due_at',
    'updated_at',
    'legal_hold',
    'legal_hold_reason',
    'legal_hold_review_at'
  ]

  if (type === 'custom-cake') {
    base.push('converted_order_id', 'reference_image_bucket', 'reference_image_path')
  } else {
    base.push('temp_image_bucket', 'temp_image_paths')
  }

  return base.join(',')
}

const getEnquiryUploadCount = (row: EnquiryRetentionRow) => {
  if (row.reference_image_path) {
    return 1
  }
  return Array.isArray(row.temp_image_paths) ? row.temp_image_paths.length : 0
}

const getLinkedOrderHold = async (
  client: SupabaseAdminClient,
  orderId: string | null | undefined
) => {
  if (!orderId) {
    return null
  }

  const { data, error } = await client
    .from('orders')
    .select('legal_hold,legal_hold_reason,legal_hold_review_at')
    .eq('id', orderId)
    .maybeSingle()
  assertDatabaseSuccess(error, 'RETENTION_LINKED_ORDER_HOLD_LOAD_FAILED')

  return data as Pick<OrderRetentionRow, 'legal_hold' | 'legal_hold_reason' | 'legal_hold_review_at'> | null
}

const getEnquiryCandidates = async (
  client: SupabaseAdminClient,
  nowIso: string,
  target?: Extract<ParsedPrivacyRetentionCandidateId, { kind: 'enquiry' }>
): Promise<PrivacyRetentionCandidate[]> => {
  const configs = target
    ? enquiryTables.filter((config) => config.type === target.enquiryType)
    : enquiryTables
  const groups = await Promise.all(configs.map(async (config) => {
    const candidates: PrivacyRetentionCandidate[] = []
    let unheldCount = 0
    let heldCount = 0
    let from = 0

    while (
      unheldCount < maximumCandidatesPerSource ||
      heldCount < maximumCandidatesPerSource
    ) {
      let query = client
        .from(config.table)
        .select(getEnquirySelectColumns(config.type))
        .eq('lifecycle_status', 'closed')
        .not('retention_due_at', 'is', null)
        .lte('retention_due_at', nowIso)
      if (target) {
        query = query.eq('id', target.recordId)
      }
      const { data, error } = await query
        .order('retention_due_at', { ascending: true })
        .order('id', { ascending: true })
        .range(from, from + maximumCandidatesPerSource - 1)

      assertDatabaseSuccess(error, 'RETENTION_ENQUIRY_LIST_FAILED')
      const page = asRows<EnquiryRetentionRow>(data)

      for (const row of page) {
        const uploadCount = getEnquiryUploadCount(row)
        const candidate: PrivacyRetentionCandidate = {
        id: buildEnquiryCandidateId(config.type, String(row.id)),
        category: 'expired-enquiry',
        recordType: config.recordType,
        recordReference: getEnquiryReference(config, row.id),
        dueAt: row.retention_due_at,
        reason: 'The documented enquiry-retention deadline has passed.',
        removes: [
          'The enquiry record and its customer information',
          ...(uploadCount > 0 ? ['Its remaining uploaded files'] : [])
        ],
        retains: ['Only the non-sensitive deletion audit entry'],
        itemCount: 1 + uploadCount,
        held: row.legal_hold === true,
        snapshotRevision: createSnapshotRevision([
          `parent:${row.updated_at}`,
          ...(row.reference_image_path
            ? [`path:${row.reference_image_path}`]
            : []),
          ...(Array.isArray(row.temp_image_paths)
            ? row.temp_image_paths.map((path) => `path:${path}`)
            : [])
        ]),
        ...(row.legal_hold_reason ? { holdReason: row.legal_hold_reason } : {}),
        ...(row.legal_hold_review_at ? { holdReviewAt: row.legal_hold_review_at } : {})
        }
        if (candidate.held) {
          if (heldCount < maximumCandidatesPerSource) {
            candidates.push(candidate)
            heldCount += 1
          }
        } else if (unheldCount < maximumCandidatesPerSource) {
          candidates.push(candidate)
          unheldCount += 1
        }
      }

      if (page.length < maximumCandidatesPerSource) {
        break
      }
      from += maximumCandidatesPerSource
    }

    return candidates
  }))

  return groups.flat()
}

const getEnquiryUploadCandidates = async (
  client: SupabaseAdminClient,
  nowIso: string,
  target?: Extract<ParsedPrivacyRetentionCandidateId, { kind: 'enquiry-upload' }>
): Promise<PrivacyRetentionCandidate[]> => {
  const uploadConfigs = enquiryTables.filter((config): config is EnquiryTableConfig & {
    type: 'custom-cake' | 'event-photo'
  } => (
    config.type === 'custom-cake' || config.type === 'event-photo'
  ) && (!target || config.type === target.enquiryType))

  const groups = await Promise.all(uploadConfigs.map(async (config) => {
    const candidates: PrivacyRetentionCandidate[] = []
    let unheldCount = 0
    let heldCount = 0
    let from = 0

    while (
      unheldCount < maximumCandidatesPerSource ||
      heldCount < maximumCandidatesPerSource
    ) {
      let query = client
        .from(config.table)
        .select(getEnquiryUploadSelectColumns(config.type))
        .not('upload_retention_due_at', 'is', null)
        .lte('upload_retention_due_at', nowIso)
      if (target) {
        query = query.eq('id', target.recordId)
      }
      const { data, error } = await query
        .order('upload_retention_due_at', { ascending: true })
        .order('id', { ascending: true })
        .range(from, from + maximumCandidatesPerSource - 1)

      assertDatabaseSuccess(error, 'RETENTION_ENQUIRY_UPLOAD_LIST_FAILED')
      const page = asRows<EnquiryUploadRow>(data)

      for (const row of page) {
        if (
          getEnquiryUploadCount(row) === 0 ||
          (row.retention_due_at && row.retention_due_at <= nowIso)
        ) {
          continue
        }
        const linkedOrder = config.type === 'custom-cake'
          ? await getLinkedOrderHold(client, row.converted_order_id)
          : null
        const held = row.legal_hold === true || linkedOrder?.legal_hold === true
        const holdReason = row.legal_hold_reason || linkedOrder?.legal_hold_reason
        const holdReviewAt = row.legal_hold_review_at || linkedOrder?.legal_hold_review_at
        const candidate: PrivacyRetentionCandidate = {
        id: buildEnquiryUploadCandidateId(config.type, String(row.id)),
        category: 'expired-enquiry-upload',
        recordType: `${config.recordType} upload`,
        recordReference: getEnquiryReference(config, row.id),
        dueAt: row.upload_retention_due_at,
        reason: 'The separate upload-retention deadline has passed.',
        removes: ['The stored uploaded file and its file metadata'],
        retains: ['The underlying enquiry or order record until its own deadline'],
        itemCount: getEnquiryUploadCount(row),
        held,
        snapshotRevision: createSnapshotRevision([
          `parent:${row.updated_at}`,
          ...(row.reference_image_path
            ? [`path:${row.reference_image_path}`]
            : []),
          ...(Array.isArray(row.temp_image_paths)
            ? row.temp_image_paths.map((path) => `path:${path}`)
            : [])
        ]),
        ...(holdReason ? { holdReason } : {}),
        ...(holdReviewAt ? { holdReviewAt } : {})
        }
        if (held) {
          if (heldCount < maximumCandidatesPerSource) {
            candidates.push(candidate)
            heldCount += 1
          }
        } else if (unheldCount < maximumCandidatesPerSource) {
          candidates.push(candidate)
          unheldCount += 1
        }
      }

      if (page.length < maximumCandidatesPerSource) {
        break
      }
      from += maximumCandidatesPerSource
    }

    return candidates
  }))

  return groups.flat(2)
}

const listOrderAssetInventory = async (
  client: SupabaseAdminClient,
  orderId: string
): Promise<OrderAssetInventory> => {
  const [
    { data: messages, error: messageError },
    { data: notes, error: noteError },
    { data: items, error: itemError }
  ] = await Promise.all([
    client.from('order_messages').select('id,order_id,legacy_message').eq('order_id', orderId),
    client.from('order_notes').select('id,order_id,legacy_note').eq('order_id', orderId),
    client.from('order_items').select('id').eq('order_id', orderId)
  ])

  assertDatabaseSuccess(messageError, 'RETENTION_ORDER_MESSAGES_LIST_FAILED')
  assertDatabaseSuccess(noteError, 'RETENTION_ORDER_NOTES_LIST_FAILED')
  assertDatabaseSuccess(itemError, 'RETENTION_ORDER_ITEMS_LIST_FAILED')

  const messageRows = asRows<OrderChildRow>(messages)
  const noteRows = asRows<OrderChildRow>(notes)
  const itemRows = asRows<{ id: string }>(items)
  const messageIds = messageRows.map((row) => row.id)
  const noteIds = noteRows.map((row) => row.id)
  const rows: OrderAssetRow[] = [
    ...messageRows.flatMap((row) => getLegacyAssetRows(
      row.legacy_message,
      'attachments',
      row.id
    )),
    ...noteRows.flatMap((row) => getLegacyAssetRows(
      row.legacy_note,
      'images',
      row.id
    ))
  ]
  const revisionParts = [
    ...messageIds.map((id) => `message:${id}`),
    ...noteIds.map((id) => `note:${id}`),
    ...itemRows.map((row) => `item:${row.id}`)
  ]

  if (messageIds.length > 0) {
    const { data, error } = await client
      .from('order_message_attachments')
      .select('id,message_id,line_number,asset_type,asset_id,asset_ref,legacy_attachment')
      .in('message_id', messageIds)

    assertDatabaseSuccess(error, 'RETENTION_ORDER_ATTACHMENTS_LIST_FAILED')
    const attachmentRows = asRows<OrderAssetRow>(data)
    rows.push(...attachmentRows)
    revisionParts.push(...attachmentRows.map((row) => `attachment:${row.id}`))
  }

  if (noteIds.length > 0) {
    const { data, error } = await client
      .from('order_note_images')
      .select('id,note_id,line_number,asset_type,asset_id,asset_ref,legacy_image')
      .in('note_id', noteIds)

    assertDatabaseSuccess(error, 'RETENTION_ORDER_IMAGES_LIST_FAILED')
    const imageRows = asRows<OrderAssetRow>(data)
    rows.push(...imageRows)
    revisionParts.push(...imageRows.map((row) => `image:${row.id}`))
  }

  for (const row of rows) {
    revisionParts.push(...getPotentialAssetReferences(row)
      .map((reference) => `storage:${reference}`))
  }

  const legacyRows = rows.filter((row) => row.legacy_only === true)
  for (const row of rows.filter((candidate) => candidate.legacy_only !== true)) {
    const matches = legacyRows.filter((legacy) =>
      legacy.line_number === row.line_number && (
        (row.message_id && legacy.message_id === row.message_id) ||
        (row.note_id && legacy.note_id === row.note_id)
      )
    )
    if (matches.length > 1) {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_STORAGE_REFERENCE_AMBIGUOUS'
      )
    }
    if (matches.length === 1) {
      const relationalReferences = getPotentialAssetReferences(row)
      const legacyReferences = getPotentialAssetReferences(matches[0])
      if (
        relationalReferences.length > 0 &&
        legacyReferences.length > 0 &&
        (
          relationalReferences.length !== legacyReferences.length ||
          relationalReferences.some((reference) =>
            !legacyReferences.includes(reference)
          )
        )
      ) {
        throw new PrivacyRetentionRepositoryError(
          'RETENTION_STORAGE_REFERENCE_AMBIGUOUS'
        )
      }
    }
  }

  return { rows, revisionParts }
}

const listOwnedOrderAssetPaths = async (
  client: SupabaseAdminClient,
  orderId: string,
  orderNumber: string
): Promise<string[]> => {
  const inventory = await listOrderAssetInventory(client, orderId)
  const prefixes = [`orders/${orderId}/`, `orders/${orderNumber}/`]
  const paths: string[] = []

  for (const row of inventory.rows) {
    const references = getPotentialAssetReferences(row)
    if (references.length > 1) {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_STORAGE_REFERENCE_AMBIGUOUS'
      )
    }
    if (references.length === 1) {
      const [reference] = references
      if (!isSafeStoragePath(reference, prefixes)) {
        throw new PrivacyRetentionRepositoryError(
          'RETENTION_STORAGE_PATH_OWNERSHIP_INVALID'
        )
      }
      paths.push(reference)
    }
  }

  return Array.from(new Set(paths))
}

type LinkedEnquiryRetentionSummary = {
  count: number
  held: boolean
  revisionParts: string[]
  holdReason?: PrivacyRetentionHoldReason
  holdReviewAt?: string
}

const getLinkedEnquiryRetentionSummary = async (
  client: SupabaseAdminClient,
  orderId: string
): Promise<LinkedEnquiryRetentionSummary> => {
  const configs = enquiryTables.filter((config) => config.type !== 'event-photo')
  const groups = await Promise.all(configs.map(async (config) => {
    const selectColumns = config.type === 'custom-cake'
      ? 'id,legal_hold,legal_hold_reason,legal_hold_review_at,reference_image_path'
      : 'id,legal_hold,legal_hold_reason,legal_hold_review_at'
    const { data, error } = await client
      .from(config.table)
      .select(selectColumns)
      .eq('converted_order_id', orderId)
      .eq('lifecycle_status', 'converted')
    assertDatabaseSuccess(error, 'RETENTION_LINKED_ENQUIRIES_LIST_FAILED')
    return asRows<Pick<EnquiryRetentionRow, 'id' | 'legal_hold' | 'legal_hold_reason' | 'legal_hold_review_at'>>(data)
  }))
  const rows = groups.flat()
  const heldRow = rows.find((row) => row.legal_hold === true)

  return {
    count: rows.length,
    held: Boolean(heldRow),
    revisionParts: rows.flatMap((row) => [
      `converted-enquiry:${String(row.id)}`,
      ...('reference_image_path' in row &&
        typeof row.reference_image_path === 'string'
        ? [`storage:${row.reference_image_path}`]
        : [])
    ]),
    ...(heldRow?.legal_hold_reason ? { holdReason: heldRow.legal_hold_reason } : {}),
    ...(heldRow?.legal_hold_review_at ? { holdReviewAt: heldRow.legal_hold_review_at } : {})
  }
}

const getOrderCandidates = async (
  client: SupabaseAdminClient,
  now: Date,
  targetOrderId?: string
): Promise<PrivacyRetentionCandidate[]> => {
  const nowIso = now.toISOString()
  const uploadCutoff = subtractCalendarMonths(now, UPLOAD_RETENTION_MONTHS).toISOString()
  const orderColumns = 'id,order_number,status,completed_at,retention_due_at,legal_hold,legal_hold_reason,legal_hold_review_at,updated_at'
  const orderCandidates: PrivacyRetentionCandidate[] = []
  let dueUnheldCount = 0
  let dueHeldCount = 0
  let dueCursorAt: string | null = null
  let dueCursorId: string | null = null

  while (
    dueUnheldCount < maximumCandidatesPerSource ||
    dueHeldCount < maximumCandidatesPerSource
  ) {
    let query = client
      .from('orders')
      .select(orderColumns)
      .in('status', ['completed', 'delivered', 'cancelled'])
      .not('retention_due_at', 'is', null)
      .lte('retention_due_at', nowIso)
      .order('retention_due_at', { ascending: true })
      .order('id', { ascending: true })
      .limit(maximumCandidatesPerSource)
    if (targetOrderId) {
      query = query.eq('id', targetOrderId)
    }
    if (dueCursorAt && dueCursorId) {
      query = query.or(
        `retention_due_at.gt.${dueCursorAt},and(retention_due_at.eq.${dueCursorAt},id.gt.${dueCursorId})`
      )
    }

    const { data, error } = await query
    assertDatabaseSuccess(error, 'RETENTION_ORDER_LIST_FAILED')
    const page = asRows<OrderRetentionRow>(data)

    for (const row of page) {
      const [linkedEnquiries, inventory] = await Promise.all([
        getLinkedEnquiryRetentionSummary(client, row.id),
        listOrderAssetInventory(client, row.id)
      ])
      const held = row.legal_hold === true || linkedEnquiries.held
      const holdReason = row.legal_hold_reason || linkedEnquiries.holdReason
      const holdReviewAt = row.legal_hold_review_at || linkedEnquiries.holdReviewAt
      const candidate: PrivacyRetentionCandidate = {
      id: buildOrderCandidateId(row.id),
      category: 'expired-order',
      recordType: 'Order record',
      recordReference: row.order_number,
      dueAt: row.retention_due_at || nowIso,
      reason: 'The six-year order and financial-record retention deadline has passed.',
        removes: [
          'The core order, customer, delivery, payment and accounting fields',
          'Every order item linked to the order',
          'Every customer/staff message and its attachment metadata',
          'Every internal note and its image metadata',
          'Any remaining Supabase-hosted order or converted-enquiry uploads',
        ...(linkedEnquiries.count > 0
          ? [`${linkedEnquiries.count} converted enquiry record${linkedEnquiries.count === 1 ? '' : 's'} retained with this order`]
          : [])
      ],
      retains: ['Only the non-sensitive deletion audit entry'],
      itemCount: 1 + linkedEnquiries.count,
      held,
      snapshotRevision: createSnapshotRevision([
        `parent:${row.updated_at}`,
        ...linkedEnquiries.revisionParts,
        ...inventory.revisionParts
      ]),
      ...(holdReason ? { holdReason } : {}),
      ...(holdReviewAt ? { holdReviewAt } : {})
      }

      if (held) {
        if (dueHeldCount < maximumCandidatesPerSource) {
          orderCandidates.push(candidate)
          dueHeldCount += 1
        }
      } else if (dueUnheldCount < maximumCandidatesPerSource) {
        orderCandidates.push(candidate)
        dueUnheldCount += 1
      }
    }

    const lastRow = page.at(-1)
    if (page.length < maximumCandidatesPerSource || !lastRow?.retention_due_at) {
      break
    }
    dueCursorAt = lastRow.retention_due_at
    dueCursorId = lastRow.id
  }

  const uploadCandidates: PrivacyRetentionCandidate[] = []
  let uploadUnheldCount = 0
  let uploadHeldCount = 0
  let cursorCompletedAt: string | null = null
  let cursorId: string | null = null

  while (
    uploadUnheldCount < maximumCandidatesPerSource ||
    uploadHeldCount < maximumCandidatesPerSource
  ) {
    let query = client
      .from('orders')
      .select(orderColumns)
      .in('status', ['completed', 'delivered', 'cancelled'])
      .not('completed_at', 'is', null)
      .lte('completed_at', uploadCutoff)
      .order('completed_at', { ascending: true })
      .order('id', { ascending: true })
      .limit(maximumCandidatesPerSource)

    if (targetOrderId) {
      query = query.eq('id', targetOrderId)
    }

    if (cursorCompletedAt && cursorId) {
      query = query.or(
        `completed_at.gt.${cursorCompletedAt},and(completed_at.eq.${cursorCompletedAt},id.gt.${cursorId})`
      )
    }

    const { data, error } = await query
    assertDatabaseSuccess(error, 'RETENTION_ORDER_UPLOAD_LIST_FAILED')
    const page = asRows<OrderRetentionRow>(data)

    for (const row of page) {
      if (
        !row.completed_at ||
        (row.retention_due_at !== null && row.retention_due_at <= nowIso)
      ) {
        continue
      }

      const [linkedEnquiries, inventory] = await Promise.all([
        getLinkedEnquiryRetentionSummary(client, row.id),
        listOrderAssetInventory(client, row.id)
      ])
      const references = Array.from(new Set(inventory.rows
        .flatMap(getPotentialAssetReferences)))
      if (references.length === 0) {
        continue
      }

      const dueAt = addCalendarMonths(
        new Date(row.completed_at),
        UPLOAD_RETENTION_MONTHS
      )
      const held = row.legal_hold === true || linkedEnquiries.held
      const holdReason = row.legal_hold_reason || linkedEnquiries.holdReason
      const holdReviewAt = row.legal_hold_review_at || linkedEnquiries.holdReviewAt

      const candidate: PrivacyRetentionCandidate = {
        id: buildOrderUploadCandidateId(row.id),
        category: 'expired-order-upload',
        recordType: 'Order uploads',
        recordReference: row.order_number,
        dueAt: dueAt.toISOString(),
        reason: 'The 24-month order-upload retention deadline has passed.',
        removes: ['Customer reference uploads, staff note images and their file metadata'],
        retains: ['The core order, payment and accounting record until its own deadline'],
        itemCount: references.length,
        held,
        snapshotRevision: createSnapshotRevision([
          `parent:${row.updated_at}`,
          ...linkedEnquiries.revisionParts,
          ...inventory.revisionParts
        ]),
        ...(holdReason ? { holdReason } : {}),
        ...(holdReviewAt ? { holdReviewAt } : {})
      }
      if (held) {
        if (uploadHeldCount < maximumCandidatesPerSource) {
          uploadCandidates.push(candidate)
          uploadHeldCount += 1
        }
      } else if (uploadUnheldCount < maximumCandidatesPerSource) {
        uploadCandidates.push(candidate)
        uploadUnheldCount += 1
      }
    }

    const lastRow = page.at(-1)
    if (page.length < maximumCandidatesPerSource || !lastRow?.completed_at) {
      break
    }
    cursorCompletedAt = lastRow.completed_at
    cursorId = lastRow.id
  }

  return [
    ...orderCandidates,
    ...uploadCandidates
  ]
}

const getSecurityRevisionParts = async (
  client: SupabaseAdminClient,
  config: SecurityTableConfig,
  cutoff: string
): Promise<string[]> => {
  const pageSize = 1000
  const parts: string[] = []
  let from = 0

  while (true) {
    let query = client
      .from(config.table)
      .select(config.revisionColumns)
      .lt(config.timestampColumn, cutoff)
      .order(config.timestampColumn, { ascending: true })

    for (const column of config.revisionOrderColumns) {
      query = query.order(column, { ascending: true })
    }

    const { data, error } = await query.range(from, from + pageSize - 1)
    assertDatabaseSuccess(error, 'RETENTION_SECURITY_REVISION_LIST_FAILED')
    const page = asRows<Record<string, unknown>>(data)
    parts.push(...page.map((row) => JSON.stringify(row)))

    if (page.length < pageSize) {
      break
    }
    from += pageSize
  }

  return parts
}

const getSecurityCandidates = async (
  client: SupabaseAdminClient,
  now: Date
): Promise<PrivacyRetentionCandidate[]> => {
  const cutoff = subtractCalendarDays(now, SECURITY_RECORD_RETENTION_DAYS).toISOString()
  const { data: holdData, error: holdError } = await client
    .from('privacy_retention_security_holds')
    .select('record_type,reason,review_at')
  assertDatabaseSuccess(holdError, 'RETENTION_SECURITY_HOLDS_LIST_FAILED')
  const holdsByType = new Map(asRows<SecurityHoldRow>(holdData)
    .map((hold) => [hold.record_type, hold] as const))
  const candidates = await Promise.all(securityTables.map(async (config) => {
    const revisionParts = await getSecurityRevisionParts(client, config, cutoff)
    const itemCount = revisionParts.length

    if (itemCount === 0) {
      return null
    }

    const hold = holdsByType.get(config.type)

    return {
      id: buildSecurityCandidateId(config.type),
      category: 'expired-security-record',
      recordType: config.recordType,
      recordReference: config.type,
      dueAt: cutoff,
      reason: 'These security records are older than the published 90-day period.',
      removes: [`${itemCount} expired security or abuse-prevention record${itemCount === 1 ? '' : 's'}`],
      retains: ['Newer security records and aggregate deletion counts'],
      itemCount,
      held: Boolean(hold),
      snapshotRevision: createSnapshotRevision(revisionParts),
      ...(hold ? { holdReason: hold.reason, holdReviewAt: hold.review_at } : {})
    } satisfies PrivacyRetentionCandidate
  }))

  return candidates.filter((candidate) => candidate !== null)
}

const getHealthCandidates = async (
  client: SupabaseAdminClient,
  nowIso: string,
  target?: Extract<
    ParsedPrivacyRetentionCandidateId,
    { kind: 'health-enquiry' | 'health-order' }
  >
): Promise<PrivacyRetentionCandidate[]> => {
  const healthEnquiryConfigs = enquiryTables.filter((config): config is
    EnquiryTableConfig & { type: RetentionHealthEnquiryType } =>
    (
      config.type === 'contact' ||
      config.type === 'custom-cake' ||
      config.type === 'workshop'
    ) && (
      !target ||
      target.kind !== 'health-enquiry' ||
      config.type === target.enquiryType
    )
  )
  const selectedEnquiryConfigs = target?.kind === 'health-order'
    ? []
    : healthEnquiryConfigs
  const enquiryGroups = await Promise.all(selectedEnquiryConfigs.map(async (config) => {
    const candidates: PrivacyRetentionCandidate[] = []
    let unheldCount = 0
    let heldCount = 0
    let from = 0

    while (
      unheldCount < maximumCandidatesPerSource ||
      heldCount < maximumCandidatesPerSource
    ) {
      let query = client
        .from(config.table)
        .select([
          'id',
          'dietary_health_retention_due_at',
          'dietary_health_erased_at',
          'updated_at',
          'converted_order_id',
          'legal_hold',
          'legal_hold_reason',
          'legal_hold_review_at'
        ].join(','))
        .not('dietary_health_retention_due_at', 'is', null)
        .is('dietary_health_erased_at', null)
        .lte('dietary_health_retention_due_at', nowIso)
      if (target?.kind === 'health-enquiry') {
        query = query.eq('id', target.recordId)
      }
      const { data, error } = await query
        .order('dietary_health_retention_due_at', { ascending: true })
        .order('id', { ascending: true })
        .range(from, from + maximumCandidatesPerSource - 1)
      assertDatabaseSuccess(error, 'RETENTION_HEALTH_ENQUIRY_LIST_FAILED')
      const page = asRows<HealthRetentionRow>(data)

      for (const row of page) {
        const linkedOrder = await getLinkedOrderHold(client, row.converted_order_id)
        const held = row.legal_hold === true || linkedOrder?.legal_hold === true
        const holdReason = row.legal_hold_reason || linkedOrder?.legal_hold_reason
        const holdReviewAt = row.legal_hold_review_at || linkedOrder?.legal_hold_review_at
        const candidate: PrivacyRetentionCandidate = {
        id: buildHealthEnquiryCandidateId(config.type, String(row.id)),
        category: 'expired-health-information',
        recordType: 'Enquiry health information',
        recordReference: getEnquiryReference(config, row.id),
        dueAt: row.dietary_health_retention_due_at,
        reason: 'The short operational retention deadline for protected dietary-health information has passed.',
        removes: ['The dietary-health information supplied with this enquiry'],
        retains: ['Consent and erasure evidence without the dietary-health wording'],
        itemCount: 1,
        held,
        snapshotRevision: createSnapshotRevision([
          `parent:${row.updated_at}`,
          `due:${row.dietary_health_retention_due_at}`
        ]),
        ...(holdReason ? { holdReason } : {}),
        ...(holdReviewAt ? { holdReviewAt } : {})
        }
        if (held) {
          if (heldCount < maximumCandidatesPerSource) {
            candidates.push(candidate)
            heldCount += 1
          }
        } else if (unheldCount < maximumCandidatesPerSource) {
          candidates.push(candidate)
          unheldCount += 1
        }
      }
      if (page.length < maximumCandidatesPerSource) {
        break
      }
      from += maximumCandidatesPerSource
    }

    return candidates
  }))

  const orderCandidates: PrivacyRetentionCandidate[] = []
  if (target?.kind === 'health-enquiry') {
    return enquiryGroups.flat()
  }
  let orderUnheldCount = 0
  let orderHeldCount = 0
  let orderFrom = 0
  while (
    orderUnheldCount < maximumCandidatesPerSource ||
    orderHeldCount < maximumCandidatesPerSource
  ) {
    let query = client
      .from('orders')
      .select([
        'id',
        'order_number',
        'dietary_health_retention_due_at',
        'dietary_health_erased_at',
        'updated_at',
        'legal_hold',
        'legal_hold_reason',
        'legal_hold_review_at'
      ].join(','))
      .not('dietary_health_retention_due_at', 'is', null)
      .is('dietary_health_erased_at', null)
      .lte('dietary_health_retention_due_at', nowIso)
    if (target?.kind === 'health-order') {
      query = query.eq('id', target.orderId)
    }
    const { data, error } = await query
      .order('dietary_health_retention_due_at', { ascending: true })
      .order('id', { ascending: true })
      .range(orderFrom, orderFrom + maximumCandidatesPerSource - 1)
    assertDatabaseSuccess(error, 'RETENTION_HEALTH_ORDER_LIST_FAILED')
    const page = asRows<HealthRetentionRow>(data)

    for (const row of page) {
      const linkedEnquiries = await getLinkedEnquiryRetentionSummary(
        client,
        String(row.id)
      )
      const held = row.legal_hold === true || linkedEnquiries.held
      const holdReason = row.legal_hold_reason || linkedEnquiries.holdReason
      const holdReviewAt = row.legal_hold_review_at || linkedEnquiries.holdReviewAt

      const candidate: PrivacyRetentionCandidate = {
        id: buildHealthOrderCandidateId(String(row.id)),
        category: 'expired-health-information',
        recordType: 'Order health information',
        recordReference: row.order_number || String(row.id),
        dueAt: row.dietary_health_retention_due_at,
        reason: 'The short operational retention deadline for protected dietary-health information has passed.',
        removes: ['The dietary-health information supplied with this order'],
        retains: ['Consent and erasure evidence without the dietary-health wording'],
        itemCount: 1,
        held,
        snapshotRevision: createSnapshotRevision([
          `parent:${row.updated_at}`,
          `due:${row.dietary_health_retention_due_at}`,
          ...linkedEnquiries.revisionParts
        ]),
        ...(holdReason ? { holdReason } : {}),
        ...(holdReviewAt ? { holdReviewAt } : {})
      }
      if (held) {
        if (orderHeldCount < maximumCandidatesPerSource) {
          orderCandidates.push(candidate)
          orderHeldCount += 1
        }
      } else if (orderUnheldCount < maximumCandidatesPerSource) {
        orderCandidates.push(candidate)
        orderUnheldCount += 1
      }
    }
    if (page.length < maximumCandidatesPerSource) {
      break
    }
    orderFrom += maximumCandidatesPerSource
  }

  return [...enquiryGroups.flat(), ...orderCandidates]
}

const countRows = async (
  client: SupabaseAdminClient,
  table: string,
  configure: (query: ReturnType<SupabaseAdminClient['from']>) => unknown
): Promise<number> => {
  const query = client.from(table)
  const configured = configure(query) as {
    then: (
      onFulfilled: (result: { count: number | null, error: unknown }) => unknown
    ) => Promise<unknown>
  }
  const result = await Promise.resolve(configured) as { count: number | null, error: unknown }
  assertDatabaseSuccess(result.error, 'RETENTION_LIFECYCLE_COUNT_FAILED')
  return toSafeCount(result.count)
}

const countNeedsLifecycleReview = async (
  client: SupabaseAdminClient,
  now: Date
): Promise<number> => {
  const staleOpenCutoff = subtractCalendarMonths(now, ENQUIRY_RETENTION_MONTHS).toISOString()
  const enquiryCounts = await Promise.all(enquiryTables.map(async (config) => {
    const [
      missingDeadlineCount,
      staleOpenCount,
      cleanedEventCount,
      missingHealthDeadlineCount
    ] = await Promise.all([
      countRows(client, config.table, (query) => query
        .select('id', { count: 'exact', head: true })
        .in('lifecycle_status', ['closed', 'converted'])
        .is('retention_due_at', null)),
      countRows(client, config.table, (query) => query
        .select('id', { count: 'exact', head: true })
        .eq('lifecycle_status', 'open')
        .lte('created_at', staleOpenCutoff)),
      config.type === 'event-photo'
        ? countRows(client, config.table, (query) => query
          .select('id', { count: 'exact', head: true })
          .eq('lifecycle_status', 'open')
          .not('files_deleted_at', 'is', null)
          .gt('created_at', staleOpenCutoff))
        : Promise.resolve(0),
      config.type !== 'event-photo'
        ? countRows(client, config.table, (query) => query
          .select('id', { count: 'exact', head: true })
          .in('lifecycle_status', ['closed', 'converted'])
          .not('dietary_health_information', 'is', null)
          .eq('dietary_health_consent', true)
          .is('dietary_health_withdrawn_at', null)
          .is('dietary_health_erased_at', null)
          .is('dietary_health_retention_due_at', null))
        : Promise.resolve(0)
    ])

    return missingDeadlineCount + staleOpenCount + cleanedEventCount +
      missingHealthDeadlineCount
  }))
  const [orderCount, missingOrderHealthDeadlineCount] = await Promise.all([
    countRows(client, 'orders', (query) => query
      .select('id', { count: 'exact', head: true })
      .is('retention_due_at', null)
      .in('status', ['completed', 'delivered', 'cancelled'])),
    countRows(client, 'orders', (query) => query
      .select('id', { count: 'exact', head: true })
      .in('status', ['completed', 'delivered', 'cancelled'])
      .not('metadata->>dietaryHealthInformation', 'is', null)
      .eq('metadata->>dietaryHealthConsent', 'true')
      .is('metadata->>dietaryHealthWithdrawnAt', null)
      .is('dietary_health_erased_at', null)
      .is('dietary_health_retention_due_at', null))
  ])

  return enquiryCounts.reduce((sum, count) => sum + count, 0) + orderCount +
    missingOrderHealthDeadlineCount
}

const mapRunHistory = (row: RetentionRunRow): PrivacyRetentionRunHistoryItem => ({
  runReference: row.run_reference,
  mode: row.run_mode,
  status: row.status,
  startedAt: row.started_at,
  ...(row.completed_at ? { completedAt: row.completed_at } : {}),
  selectedCount: toSafeCount(row.selected_count),
  succeededCount: toSafeCount(row.succeeded_count),
  failedCount: toSafeCount(row.failed_count)
})

const listRunRowsByStatus = async (
  client: SupabaseAdminClient,
  statuses: PrivacyRetentionRunStatus[],
  maximumRows?: number
): Promise<RetentionRunRow[]> => {
  const pageSize = 250
  const rows: RetentionRunRow[] = []
  let from = 0

  while (maximumRows === undefined || rows.length < maximumRows) {
    const remaining = maximumRows === undefined
      ? pageSize
      : Math.min(pageSize, maximumRows - rows.length)
    const { data, error } = await client
      .from('privacy_retention_runs')
      .select('id,run_reference,run_mode,status,selected_count,succeeded_count,failed_count,started_at,completed_at')
      .in('status', statuses)
      .order('started_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, from + remaining - 1)
    assertDatabaseSuccess(error, 'RETENTION_HISTORY_LIST_FAILED')
    const page = asRows<RetentionRunRow>(data)
    rows.push(...page)

    if (page.length < remaining) {
      break
    }
    from += page.length
  }

  return rows
}

const getActionPayload = (actions: RetentionActionInsert[]) => {
  if (actions.length === 0 || actions.some(({ candidate }) =>
    !candidate.snapshotRevision ||
    !/^[0-9a-f]{64}$/.test(candidate.snapshotRevision)
  )) {
    throw new PrivacyRetentionRepositoryError(
      'RETENTION_ACTION_SNAPSHOT_INVALID'
    )
  }
  if (actions.some(({ candidate, actionType }) =>
    getActionType(candidate) !== actionType
  )) {
    throw new PrivacyRetentionRepositoryError(
      'RETENTION_ACTION_TYPE_INVALID'
    )
  }

  return actions.map(({ candidate, actionType }) => ({
    candidate_id: candidate.id,
    category: candidate.category,
    record_type: candidate.recordType,
    record_reference: candidate.recordReference,
    action_type: actionType,
    due_at: candidate.dueAt,
    snapshot_revision: candidate.snapshotRevision,
    selected: true,
    outcome: 'pending'
  }))
}

const runReferencePattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/
const safeReferencePattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/
const safeErrorCodePattern = /^[A-Z][A-Z0-9_]{0,63}$/
const actionTypeByCategory: Record<PrivacyRetentionCandidate['category'], string> = {
  'expired-enquiry': 'delete-enquiry-record',
  'expired-enquiry-upload': 'delete-enquiry-upload',
  'expired-order-upload': 'delete-order-upload',
  'expired-order': 'delete-order-record',
  'expired-health-information': 'erase-health-information',
  'expired-security-record': 'delete-security-batch'
}
const isSafeTimestamp = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= 64 &&
  !Number.isNaN(Date.parse(value))

const mapPersistedAction = (value: unknown): PrivacyRetentionPersistedAction => {
  if (!isRecord(value)) {
    throw new PrivacyRetentionRepositoryError('RETENTION_RESUME_ACTION_INVALID')
  }
  const row = value as unknown as RetentionResumeActionRow
  const parsedCandidate = typeof row.candidate_id === 'string'
    ? parsePrivacyRetentionCandidateId(row.candidate_id)
    : null
  if (
    !parsedCandidate ||
    parsedCandidate.category !== row.category ||
    typeof row.record_type !== 'string' ||
    row.record_type.length < 1 ||
    row.record_type.length > 96 ||
    typeof row.record_reference !== 'string' ||
    !safeReferencePattern.test(row.record_reference) ||
    !isSafeTimestamp(row.due_at) ||
    typeof row.snapshot_revision !== 'string' ||
    !/^[0-9a-f]{64}$/.test(row.snapshot_revision) ||
    typeof row.action_type !== 'string' ||
    !/^[a-z][a-z0-9-]{0,63}$/.test(row.action_type) ||
    actionTypeByCategory[row.category] !== row.action_type ||
    !['pending', 'deleted', 'skipped', 'failed'].includes(row.outcome) ||
    !(
      (row.outcome === 'failed' &&
        typeof row.error_code === 'string' &&
        safeErrorCodePattern.test(row.error_code)) ||
      (row.outcome !== 'failed' && row.error_code === null)
    ) ||
    !isSafeTimestamp(row.occurred_at)
  ) {
    throw new PrivacyRetentionRepositoryError('RETENTION_RESUME_ACTION_INVALID')
  }

  return {
    candidateId: row.candidate_id,
    category: row.category,
    recordType: row.record_type,
    recordReference: row.record_reference,
    dueAt: row.due_at,
    snapshotRevision: row.snapshot_revision,
    actionType: row.action_type,
    outcome: row.outcome,
    errorCode: row.error_code,
    occurredAt: row.occurred_at
  }
}

const loadEnquiryRow = async (
  client: SupabaseAdminClient,
  parsed: Extract<ParsedPrivacyRetentionCandidateId, { kind: 'enquiry' | 'enquiry-upload' }>
) => {
  const config = getEnquiryConfig(parsed.enquiryType)
  const columns = parsed.kind === 'enquiry-upload'
    ? getEnquiryUploadSelectColumns(parsed.enquiryType)
    : getEnquirySelectColumns(parsed.enquiryType)
  const { data, error } = await client
    .from(config.table)
    .select(columns)
    .eq('id', parsed.recordId)
    .maybeSingle()

  assertDatabaseSuccess(error, 'RETENTION_ENQUIRY_LOAD_FAILED')
  return {
    config,
    row: data ? data as unknown as EnquiryUploadRow : null
  }
}

type StorageDeletionPlan = {
  bucket: string
  paths: string[]
  allowedPrefixes: string[]
}

type DeletionClaimRow = {
  status: 'claimed' | 'busy' | 'skipped' | 'completed'
  claim_token: string | null
  irreversible_started: boolean
  cutoff_at: string | null
  terminal_outcome: Extract<PrivacyRetentionResultStatus, 'deleted' | 'skipped'> | null
}

const assertStoragePlan = (plan: StorageDeletionPlan) => {
  if (plan.paths.some((path) => !isSafeStoragePath(path, plan.allowedPrefixes))) {
    throw new PrivacyRetentionRepositoryError('RETENTION_STORAGE_PATH_INVALID')
  }
}

const getCandidateStoragePlans = async (
  client: SupabaseAdminClient,
  parsed: ParsedPrivacyRetentionCandidateId
): Promise<StorageDeletionPlan[]> => {
  if (parsed.kind === 'enquiry' || parsed.kind === 'enquiry-upload') {
    const { row } = await loadEnquiryRow(client, parsed)
    if (!row) {
      return []
    }

    if (parsed.enquiryType === 'custom-cake' && row.reference_image_path) {
      if (row.reference_image_bucket !== orderImageBucket()) {
        throw new PrivacyRetentionRepositoryError('RETENTION_STORAGE_BUCKET_INVALID')
      }
      return [{
        bucket: orderImageBucket(),
        paths: [row.reference_image_path],
        allowedPrefixes: ['enquiries/']
      }]
    }

    if (
      parsed.enquiryType === 'event-photo' &&
      Array.isArray(row.temp_image_paths) &&
      row.temp_image_paths.length > 0
    ) {
      if (row.temp_image_bucket !== eventPhotoBucket) {
        throw new PrivacyRetentionRepositoryError('RETENTION_STORAGE_BUCKET_INVALID')
      }
      return [{
        bucket: eventPhotoBucket,
        paths: row.temp_image_paths,
        allowedPrefixes: ['incoming/']
      }]
    }

    return []
  }

  if (parsed.kind !== 'order' && parsed.kind !== 'order-upload') {
    return []
  }

  const { data: orderData, error: orderError } = await client
    .from('orders')
    .select('id,order_number')
    .eq('id', parsed.orderId)
    .maybeSingle()
  assertDatabaseSuccess(orderError, 'RETENTION_ORDER_IDENTITY_LOAD_FAILED')
  if (!isRecord(orderData) ||
    orderData.id !== parsed.orderId ||
    typeof orderData.order_number !== 'string'
  ) {
    throw new PrivacyRetentionRepositoryError('RETENTION_ORDER_IDENTITY_INVALID')
  }

  const plans: StorageDeletionPlan[] = []
  const orderPaths = await listOwnedOrderAssetPaths(
    client,
    parsed.orderId,
    orderData.order_number
  )
  if (orderPaths.length > 0) {
    plans.push({
      bucket: orderImageBucket(),
      paths: orderPaths,
      allowedPrefixes: [
        `orders/${parsed.orderId}/`,
        `orders/${orderData.order_number}/`
      ]
    })
  }

  if (parsed.kind === 'order') {
    const { data, error } = await client
      .from('custom_cake_enquiries')
      .select('reference_image_bucket,reference_image_path')
      .eq('converted_order_id', parsed.orderId)
      .not('reference_image_path', 'is', null)
    assertDatabaseSuccess(error, 'RETENTION_CONVERTED_ENQUIRY_FILES_LIST_FAILED')
    const rows = asRows<Pick<EnquiryRetentionRow, 'reference_image_bucket' | 'reference_image_path'>>(data)
    const enquiryPaths = rows
      .map((row) => row.reference_image_path)
      .filter((path): path is string => Boolean(path))
    if (rows.some((row) => row.reference_image_bucket !== orderImageBucket())) {
      throw new PrivacyRetentionRepositoryError('RETENTION_STORAGE_BUCKET_INVALID')
    }
    if (enquiryPaths.length > 0) {
      plans.push({
        bucket: orderImageBucket(),
        paths: enquiryPaths,
        allowedPrefixes: ['enquiries/']
      })
    }
  }

  plans.forEach(assertStoragePlan)
  return plans
}

const getRpcRow = (value: unknown): Record<string, unknown> | null => {
  const row = Array.isArray(value) ? value[0] : value
  return isRecord(row) ? row : null
}

const loadActionSnapshotRevision = async (
  client: SupabaseAdminClient,
  runId: string,
  candidateId: string
): Promise<string> => {
  const { data, error } = await client
    .from('privacy_retention_actions')
    .select('snapshot_revision')
    .eq('run_id', runId)
    .eq('candidate_id', candidateId)
    .maybeSingle()
  assertDatabaseSuccess(error, 'RETENTION_ACTION_SNAPSHOT_LOAD_FAILED')
  const revision = isRecord(data) && typeof data.snapshot_revision === 'string'
    ? data.snapshot_revision
    : ''
  if (!/^[0-9a-f]{64}$/.test(revision)) {
    throw new PrivacyRetentionRepositoryError(
      'RETENTION_ACTION_SNAPSHOT_INVALID'
    )
  }
  return revision
}

const getCurrentCandidateRevision = async (
  client: SupabaseAdminClient,
  candidateId: string,
  cutoffAt: string
): Promise<string | null> => {
  const { data, error } = await client.rpc(
    'get_privacy_retention_candidate_revision',
    {
      p_candidate_id: candidateId,
      p_cutoff: cutoffAt
    }
  )
  assertDatabaseSuccess(error, 'RETENTION_CANDIDATE_REVISION_LOAD_FAILED')

  return typeof data === 'string' && /^[0-9a-f]{64}$/.test(data)
    ? data
    : null
}

const claimDeletionCandidate = async (
  client: SupabaseAdminClient,
  candidateId: string,
  now: Date,
  runId: string
): Promise<DeletionClaimRow> => {
  const { data, error } = await client.rpc('claim_privacy_retention_candidate', {
    p_candidate_id: candidateId,
    p_run_id: runId,
    p_now: now.toISOString()
  })
  assertDatabaseSuccess(error, 'RETENTION_CLAIM_FAILED')
  const row = getRpcRow(data)
  if (
    !row ||
    !['claimed', 'busy', 'skipped', 'completed'].includes(String(row.status))
  ) {
    throw new PrivacyRetentionRepositoryError('RETENTION_CLAIM_RESPONSE_INVALID')
  }
  const cutoffAt = typeof row.cutoff_at === 'string' ? row.cutoff_at : null
  if (row.status === 'claimed' && (
    !cutoffAt ||
    Number.isNaN(new Date(cutoffAt).getTime())
  )) {
    throw new PrivacyRetentionRepositoryError('RETENTION_CLAIM_CUTOFF_INVALID')
  }
  const terminalOutcome = row.terminal_outcome === 'deleted' ||
    row.terminal_outcome === 'skipped'
    ? row.terminal_outcome
    : null
  if (row.status === 'completed' && terminalOutcome === null) {
    throw new PrivacyRetentionRepositoryError('RETENTION_CLAIM_RESPONSE_INVALID')
  }
  return {
    status: row.status as DeletionClaimRow['status'],
    claim_token: typeof row.claim_token === 'string' ? row.claim_token : null,
    irreversible_started: row.irreversible_started === true,
    cutoff_at: cutoffAt,
    terminal_outcome: terminalOutcome
  }
}

const beginExternalDeletion = async (
  client: SupabaseAdminClient,
  candidateId: string,
  claimToken: string,
  plan: StorageDeletionPlan
) => {
  const { data, error } = await client.rpc('begin_privacy_retention_external_deletion', {
    p_candidate_id: candidateId,
    p_claim_token: claimToken,
    p_bucket: plan.bucket,
    p_paths: plan.paths
  })
  assertDatabaseSuccess(error, 'RETENTION_EXTERNAL_DELETE_BEGIN_FAILED')
  if (data !== true) {
    throw new PrivacyRetentionRepositoryError('RETENTION_CLAIM_TOKEN_MISMATCH')
  }
}

const releaseDeletionClaim = async (
  client: SupabaseAdminClient,
  candidateId: string,
  claimToken: string,
  errorCode: string
) => {
  const { data, error } = await client.rpc('release_privacy_retention_deletion_claim', {
    p_candidate_id: candidateId,
    p_claim_token: claimToken,
    p_error_code: errorCode
  })
  assertDatabaseSuccess(error, 'RETENTION_CLAIM_RELEASE_FAILED')
  if (data !== true) {
    throw new PrivacyRetentionRepositoryError(
      'RETENTION_CLAIM_RELEASE_FAILED'
    )
  }
}

const finalizeDeletionCandidate = async (
  client: SupabaseAdminClient,
  candidateId: string,
  claimToken: string,
  cutoffAt: string
): Promise<PrivacyRetentionResultStatus> => {
  const { data, error } = await client.rpc('finalize_privacy_retention_deletion', {
    p_candidate_id: candidateId,
    p_claim_token: claimToken,
    p_cutoff_at: cutoffAt
  })
  assertDatabaseSuccess(error, 'RETENTION_FINALIZE_FAILED')
  const row = getRpcRow(data)
  return row?.status === 'deleted' ? 'deleted' : 'skipped'
}

const deleteClaimedCandidate = async (
  client: SupabaseAdminClient,
  candidateId: string,
  parsed: ParsedPrivacyRetentionCandidateId,
  now: Date,
  runId: string
): Promise<PrivacyRetentionResultStatus> => {
  const claim = await claimDeletionCandidate(client, candidateId, now, runId)
  if (claim.status === 'completed' && claim.terminal_outcome) {
    return claim.terminal_outcome
  }
  if (claim.status === 'busy') {
    throw new PrivacyRetentionRepositoryError(
      'RETENTION_CLAIM_RETRY_REQUIRED'
    )
  }
  if (claim.status !== 'claimed' || !claim.claim_token) {
    return 'skipped'
  }
  if (!claim.cutoff_at) {
    throw new PrivacyRetentionRepositoryError('RETENTION_CLAIM_CUTOFF_INVALID')
  }

  let externalDeletionStarted = false
  try {
    const [expectedRevision, currentRevision] = await Promise.all([
      loadActionSnapshotRevision(client, runId, candidateId),
      getCurrentCandidateRevision(client, candidateId, claim.cutoff_at)
    ])
    if (currentRevision !== expectedRevision) {
      throw new PrivacyRetentionRepositoryError('RETENTION_PREVIEW_STALE')
    }

    const rawPlans = await getCandidateStoragePlans(client, parsed)
    const plansByBucket = new Map<string, StorageDeletionPlan>()
    for (const plan of rawPlans) {
      assertStoragePlan(plan)
      const current = plansByBucket.get(plan.bucket)
      plansByBucket.set(plan.bucket, {
        bucket: plan.bucket,
        paths: Array.from(new Set([...(current?.paths || []), ...plan.paths])),
        allowedPrefixes: Array.from(new Set([
          ...(current?.allowedPrefixes || []),
          ...plan.allowedPrefixes
        ]))
      })
    }
    const plans = Array.from(plansByBucket.values())

    if (plans.length > 1) {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_STORAGE_BUCKET_AMBIGUOUS'
      )
    }

    if (plans.length > 0) {
      const [plan] = plans
      await beginExternalDeletion(client, candidateId, claim.claim_token, plan)
      externalDeletionStarted = true
      for (let index = 0; index < plan.paths.length; index += storageDeletionBatchSize) {
        const batch = plan.paths.slice(index, index + storageDeletionBatchSize)
        const { error } = await client.storage.from(plan.bucket).remove(batch)
        assertDatabaseSuccess(error, 'RETENTION_STORAGE_DELETE_FAILED')
      }
    }

    return await finalizeDeletionCandidate(
      client,
      candidateId,
      claim.claim_token,
      claim.cutoff_at
    )
  } catch (error) {
    const errorCode = error instanceof PrivacyRetentionRepositoryError
      ? error.code
      : 'RETENTION_OPERATION_FAILED'
    let claimReleased = false
    try {
      await releaseDeletionClaim(client, candidateId, claim.claim_token, errorCode)
      claimReleased = true
    } catch {
      // Preserve the original safe failure. A still-present claim prevents a
      // competing lifecycle/hold mutation and remains recoverable by retry.
    }
    if (!claimReleased || externalDeletionStarted || claim.irreversible_started) {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_CLAIM_RETRY_REQUIRED'
      )
    }
    throw error
  }
}

export interface PrivacyRetentionRepository {
  listCandidatePage: (
    now: Date,
    page: number,
    pageSize: number
  ) => Promise<PrivacyRetentionCandidatePage>
  listCandidates: (now: Date) => Promise<PrivacyRetentionCandidate[]>
  countNeedsLifecycleReview: (now: Date) => Promise<number>
  listHistory: (limit?: number) => Promise<PrivacyRetentionRunHistoryItem[]>
  createRun: (input: RetentionRunInsert) => Promise<string>
  createManualRun: (
    input: RetentionRunInsert,
    actions: RetentionActionInsert[]
  ) => Promise<PrivacyRetentionManualRunInitialization>
  getManualRunForResume: (
    runReference: string
  ) => Promise<PrivacyRetentionPersistedManualRun | null>
  completeAction: (
    runId: string,
    candidateId: string,
    status: PrivacyRetentionResultStatus,
    errorCode?: string
  ) => Promise<void>
  completeRun: (
    runId: string,
    status: PrivacyRetentionRunStatus,
    counts: RetentionRunCounts,
    completedAt: string
  ) => Promise<string>
  deleteCandidate: (
    candidateId: string,
    now: Date,
    runId?: string
  ) => Promise<PrivacyRetentionResultStatus>
  setLegalHold: (
    candidateId: string,
    hold: boolean,
    reason: PrivacyRetentionHoldReason | null,
    reviewAt: string | null
  ) => Promise<boolean>
  getLegalHold: (
    candidateId: string
  ) => Promise<PrivacyRetentionLegalHoldState>
}

export const createPrivacyRetentionRepository = (
  client: SupabaseAdminClient
): PrivacyRetentionRepository => ({
  async listCandidatePage(now, page, pageSize) {
    const { data, error } = await client.rpc(
      'list_privacy_retention_candidate_page',
      {
        p_cutoff: now.toISOString(),
        p_page: page,
        p_page_size: pageSize
      }
    )
    assertDatabaseSuccess(error, 'RETENTION_CANDIDATE_PAGE_LIST_FAILED')

    return parseCandidatePage(data)
  },

  async listCandidates(now) {
    const nowIso = now.toISOString()
    const [enquiries, enquiryUploads, orders, security, health] = await Promise.all([
      getEnquiryCandidates(client, nowIso),
      getEnquiryUploadCandidates(client, nowIso),
      getOrderCandidates(client, now),
      getSecurityCandidates(client, now),
      getHealthCandidates(client, nowIso)
    ])

    return [...enquiries, ...enquiryUploads, ...orders, ...security, ...health]
      .sort((first, second) => first.dueAt.localeCompare(second.dueAt))
  },

  async countNeedsLifecycleReview(now) {
    return countNeedsLifecycleReview(client, now)
  },

  async listHistory(limit = 12) {
    const safeLimit = Math.max(1, Math.min(limit, 50))
    const [unresolved, recentTerminal] = await Promise.all([
      listRunRowsByStatus(client, ['pending', 'running']),
      listRunRowsByStatus(
        client,
        ['completed', 'partial', 'failed'],
        safeLimit
      )
    ])
    const sortNewestFirst = (rows: RetentionRunRow[]) => rows.sort(
      (first, second) =>
        second.started_at.localeCompare(first.started_at) ||
        second.id.localeCompare(first.id)
    )
    const unresolvedById = new Map(
      sortNewestFirst(unresolved).map((row) => [row.id, row] as const)
    )
    const terminalWithoutUnresolved = recentTerminal.filter((row) =>
      !unresolvedById.has(row.id)
    )

    return [
      ...unresolvedById.values(),
      ...sortNewestFirst(terminalWithoutUnresolved)
    ].map(mapRunHistory)
  },

  async createRun(input) {
    if (input.mode === 'manual') {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_MANUAL_RUN_REQUIRES_ATOMIC_ACTIONS'
      )
    }
    const { data, error } = await client.rpc('create_privacy_retention_run', {
      p_run_reference: input.runReference,
      p_run_mode: input.mode,
      p_initiator: input.initiator,
      p_selected_categories: input.selectedCategories,
      p_candidate_count: input.candidateCount,
      p_selected_count: input.selectedCount,
      p_reviewed_schedule: input.reviewedSchedule === true,
      p_reviewed_external_systems: input.reviewedExternalSystems === true
    })
    assertDatabaseSuccess(error, 'RETENTION_RUN_CREATE_FAILED')
    const row = getRpcRow(data)
    if (!row || typeof row.run_id !== 'string') {
      throw new PrivacyRetentionRepositoryError('RETENTION_RUN_ID_MISSING')
    }
    return row.run_id
  },

  async createManualRun(input, actions) {
    if (
      input.mode !== 'manual' ||
      actions.length !== input.selectedCount ||
      input.selectedCount < 1 ||
      input.selectedCount > 100
    ) {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_MANUAL_RUN_INITIALIZATION_INVALID'
      )
    }

    const { data, error } = await client.rpc(
      'create_privacy_retention_manual_run',
      {
        p_run_reference: input.runReference,
        p_initiator: input.initiator,
        p_selected_categories: input.selectedCategories,
        p_candidate_count: input.candidateCount,
        p_selected_count: input.selectedCount,
        p_actions: getActionPayload(actions)
      }
    )
    if (hasDatabaseErrorCode(error, '23505')) {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_RUN_RESUME_REQUIRED'
      )
    }
    assertDatabaseSuccess(error, 'RETENTION_MANUAL_RUN_CREATE_FAILED')
    const row = getRpcRow(data)
    if (
      !row ||
      typeof row.run_id !== 'string' ||
      typeof row.recovered !== 'boolean' ||
      typeof row.run_status !== 'string' ||
      !['running', 'completed', 'partial', 'failed'].includes(row.run_status) ||
      typeof row.started_at !== 'string' ||
      (row.completed_at !== null && typeof row.completed_at !== 'string')
    ) {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_MANUAL_RUN_RESPONSE_INVALID'
      )
    }

    return {
      runId: row.run_id,
      recovered: row.recovered,
      status: row.run_status as PrivacyRetentionRunStatus,
      startedAt: row.started_at,
      completedAt: typeof row.completed_at === 'string'
        ? row.completed_at
        : null
    }
  },

  async getManualRunForResume(runReference) {
    if (!runReferencePattern.test(runReference)) {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_RUN_REFERENCE_INVALID'
      )
    }
    const { data: runData, error: runError } = await client
      .from('privacy_retention_runs')
      .select('id,run_reference,run_mode,status,candidate_count,selected_count,succeeded_count,skipped_count,failed_count,started_at,completed_at')
      .eq('run_reference', runReference)
      .maybeSingle()
    assertDatabaseSuccess(runError, 'RETENTION_RESUME_RUN_LOAD_FAILED')
    if (runData === null) {
      return null
    }
    if (!isRecord(runData)) {
      throw new PrivacyRetentionRepositoryError('RETENTION_RESUME_RUN_INVALID')
    }
    const run = runData as unknown as RetentionResumeRunRow
    if (
      typeof run.id !== 'string' ||
      run.run_reference !== runReference ||
      run.run_mode !== 'manual' ||
      !['running', 'completed', 'partial', 'failed'].includes(run.status) ||
      !isSafeTimestamp(run.started_at) ||
      !(run.completed_at === null || isSafeTimestamp(run.completed_at))
    ) {
      throw new PrivacyRetentionRepositoryError('RETENTION_RESUME_RUN_INVALID')
    }

    const { data: actionData, error: actionError } = await client
      .from('privacy_retention_actions')
      .select('candidate_id,category,record_type,record_reference,due_at,snapshot_revision,action_type,outcome,error_code,occurred_at')
      .eq('run_id', run.id)
      .order('occurred_at', { ascending: true })
      .order('id', { ascending: true })
      .limit(101)
    assertDatabaseSuccess(actionError, 'RETENTION_RESUME_ACTIONS_LOAD_FAILED')
    const actionRows = asRows<RetentionResumeActionRow>(actionData)
    if (actionRows.length > 100) {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_RESUME_ACTION_LIMIT_EXCEEDED'
      )
    }
    const actions = actionRows.map(mapPersistedAction)
    const candidateCount = toSafeCount(run.candidate_count)
    const selectedCount = toSafeCount(run.selected_count)
    const succeededCount = toSafeCount(run.succeeded_count)
    const skippedCount = toSafeCount(run.skipped_count)
    const failedCount = toSafeCount(run.failed_count)
    const terminal = run.status !== 'running'

    if (
      selectedCount < 1 ||
      selectedCount > candidateCount ||
      actions.length !== selectedCount ||
      (terminal && run.completed_at === null) ||
      (!terminal && run.completed_at !== null) ||
      (terminal && actions.some((action) => action.outcome === 'pending')) ||
      (terminal && (
        actions.filter((action) => action.outcome === 'deleted').length !== succeededCount ||
        actions.filter((action) => action.outcome === 'skipped').length !== skippedCount ||
        actions.filter((action) => action.outcome === 'failed').length !== failedCount
      ))
    ) {
      throw new PrivacyRetentionRepositoryError(
        actions.length < selectedCount
          ? 'RETENTION_RUN_AUDIT_INITIALIZATION_INCOMPLETE'
          : 'RETENTION_RESUME_RUN_INVALID'
      )
    }

    return {
      runId: run.id,
      runReference: run.run_reference,
      status: run.status,
      candidateCount,
      selectedCount,
      succeededCount,
      skippedCount,
      failedCount,
      startedAt: run.started_at,
      completedAt: run.completed_at,
      actions
    }
  },

  async completeAction(runId, candidateId, status, errorCode) {
    const { data, error } = await client.rpc('complete_privacy_retention_action', {
      p_run_id: runId,
      p_candidate_id: candidateId,
      p_outcome: status,
      p_error_code: errorCode || null
    })
    assertDatabaseSuccess(error, 'RETENTION_ACTION_UPDATE_FAILED')
    if (data !== true) {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_ACTION_UPDATE_COUNT_MISMATCH'
      )
    }
  },

  async completeRun(runId, status, counts, _completedAt) {
    const { data, error } = await client.rpc('complete_privacy_retention_run', {
      p_run_id: runId,
      p_status: status,
      p_succeeded_count: counts.succeeded,
      p_skipped_count: counts.skipped,
      p_failed_count: counts.failed
    })
    assertDatabaseSuccess(error, 'RETENTION_RUN_UPDATE_FAILED')
    const row = getRpcRow(data)
    if (
      row?.completed !== true ||
      typeof row.completed_at !== 'string'
    ) {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_RUN_UPDATE_COUNT_MISMATCH'
      )
    }
    return row.completed_at
  },

  async deleteCandidate(candidateId, now, runId) {
    const parsed = parsePrivacyRetentionCandidateId(candidateId)
    if (!parsed) {
      throw new PrivacyRetentionRepositoryError('RETENTION_CANDIDATE_ID_INVALID')
    }
    if (!runId || !/^[0-9a-fA-F-]{36}$/.test(runId)) {
      throw new PrivacyRetentionRepositoryError('RETENTION_RUN_ID_REQUIRED')
    }

    return deleteClaimedCandidate(client, candidateId, parsed, now, runId)
  },

  async setLegalHold(candidateId, hold, reason, reviewAt) {
    const parsed = parsePrivacyRetentionCandidateId(candidateId)
    if (!parsed) {
      throw new PrivacyRetentionRepositoryError('RETENTION_CANDIDATE_ID_INVALID')
    }
    if (hold && (!reason || !reviewAt)) {
      throw new PrivacyRetentionRepositoryError('RETENTION_HOLD_DETAILS_REQUIRED')
    }
    if (!hold && (reason !== null || reviewAt !== null)) {
      throw new PrivacyRetentionRepositoryError('RETENTION_HOLD_RELEASE_INVALID')
    }

    const { data, error } = await client.rpc('set_privacy_retention_legal_hold', {
      p_candidate_id: candidateId,
      p_hold: hold,
      p_reason: hold ? reason : null,
      p_review_at: hold ? reviewAt : null
    })
    assertDatabaseSuccess(error, 'RETENTION_HOLD_UPDATE_FAILED')
    return getRpcRow(data)?.updated === true
  },

  async getLegalHold(candidateId) {
    const parsed = parsePrivacyRetentionCandidateId(candidateId)
    if (!parsed) {
      throw new PrivacyRetentionRepositoryError('RETENTION_CANDIDATE_ID_INVALID')
    }
    const { data, error } = await client.rpc(
      'get_privacy_retention_legal_hold',
      { p_candidate_id: candidateId }
    )
    assertDatabaseSuccess(error, 'RETENTION_HOLD_LOAD_FAILED')
    const row = getRpcRow(data)
    if (!row || typeof row.found !== 'boolean') {
      throw new PrivacyRetentionRepositoryError(
        'RETENTION_HOLD_RESPONSE_INVALID'
      )
    }
    return {
      found: row.found,
      recordReference: typeof row.record_reference === 'string'
        ? row.record_reference
        : null,
      holdActive: row.hold_active === true,
      holdReason: typeof row.hold_reason === 'string'
        ? row.hold_reason as PrivacyRetentionHoldReason
        : null,
      holdReviewAt: typeof row.hold_review_at === 'string'
        ? row.hold_review_at
        : null
    }
  }
})

export const getRetentionActionType = getActionType
export const getRetentionCategoryDescription = getCategoryDescription
