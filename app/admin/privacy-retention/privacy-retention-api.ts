import type {
  PrivacyRetentionCandidate,
  PrivacyRetentionCategory,
  PrivacyRetentionCategoryCount,
  PrivacyRetentionCategoryId,
  PrivacyRetentionHoldReason,
  PrivacyRetentionOwnerReview,
  PrivacyRetentionOwnerReviewStatus,
  PrivacyRetentionPagination,
  PrivacyRetentionPreview,
  PrivacyRetentionRunHistoryItem,
  PrivacyRetentionRunMode,
  PrivacyRetentionRunStatus,
  PrivacyRetentionRunResponse,
  PrivacyRetentionSelectionResult,
  PrivacyRetentionSummary
} from '@/lib/privacy-retention/types'
import {
  PRIVACY_RETENTION_SNAPSHOT_TOKEN_MAX_LENGTH,
  privacyRetentionSnapshotTokenPattern
} from '@/lib/privacy-retention/types'

interface RunRetentionPayload {
  password: string
  confirmation: string
  runReference: string
  snapshotToken: string
  candidateIds: string[]
  acknowledgedExternalCopies: true
  signal: AbortSignal
}

interface RecordRetentionReviewPayload {
  password: string
  confirmation: string
  runReference: string
  reviewedSchedule: true
  reviewedExternalSystems: true
  signal: AbortSignal
}

interface AddRetentionHoldPayload {
  password: string
  candidateId: string
  reason: PrivacyRetentionHoldReason
  reviewAt: string
  signal: AbortSignal
}

interface RemoveRetentionHoldPayload {
  password: string
  candidateId: string
  confirmation: string
  signal: AbortSignal
}

interface ResumeRetentionRunPayload {
  password: string
  confirmation: string
  runReference: string
  signal: AbortSignal
}

const PREVIEW_ENDPOINT = '/api/admin/privacy-retention'
const RUN_ENDPOINT = '/api/admin/privacy-retention/runs'
const REVIEW_ENDPOINT = '/api/admin/privacy-retention/review'
const HOLDS_ENDPOINT = '/api/admin/privacy-retention/holds'

const categoryIds: PrivacyRetentionCategoryId[] = [
  'expired-enquiry',
  'expired-enquiry-upload',
  'expired-order-upload',
  'expired-order',
  'expired-health-information',
  'expired-security-record'
]
const ownerReviewStatuses: PrivacyRetentionOwnerReviewStatus[] = [
  'current',
  'due-soon',
  'overdue',
  'not-recorded'
]
const runModes: PrivacyRetentionRunMode[] = ['discovery', 'manual', 'owner-review']
const runStatuses: PrivacyRetentionRunStatus[] = ['pending', 'running', 'completed', 'partial', 'failed']
const completedRunStatuses: PrivacyRetentionRunResponse['status'][] = ['completed', 'partial', 'failed']
const holdReasons: PrivacyRetentionHoldReason[] = [
  'active-complaint',
  'legal-claim',
  'regulatory-request',
  'fraud-investigation',
  'other-necessary-hold'
]
const resultStatuses: PrivacyRetentionSelectionResult['status'][] = ['deleted', 'failed', 'skipped']

const serverClientErrorCodes = [
  'RETENTION_CONFIRMATION_INVALID',
  'RETENTION_EXTERNAL_COPIES_ACKNOWLEDGEMENT_REQUIRED',
  'RETENTION_LEGAL_HOLD_ACTIVE',
  'RETENTION_PREVIEW_EXPIRED',
  'RETENTION_PREVIEW_STALE',
  'RETENTION_PREVIEW_TOKEN_INVALID',
  'RETENTION_RUN_NOT_FOUND',
  'RETENTION_RUN_REFERENCE_INVALID',
  'RETENTION_RUN_RESUME_REQUIRED',
  'RETENTION_SELECTION_INVALID'
] as const

type ServerClientErrorCode = typeof serverClientErrorCodes[number]
type LocalClientErrorCode =
  | 'RETENTION_REQUEST_REJECTED'
  | 'RETENTION_RESPONSE_INVALID'
  | 'RETENTION_SERVER_ERROR'
  | 'RETENTION_TRANSPORT_ERROR'
export type PrivacyRetentionClientErrorCode =
  | ServerClientErrorCode
  | LocalClientErrorCode

const serverClientErrorCodeSet = new Set<string>(serverClientErrorCodes)

export class PrivacyRetentionClientError extends Error {
  readonly code: PrivacyRetentionClientErrorCode
  readonly status: number | null

  constructor(code: PrivacyRetentionClientErrorCode, status: number | null) {
    super(code)
    this.name = 'PrivacyRetentionClientError'
    this.code = code
    this.status = status
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isString = (value: unknown): value is string => typeof value === 'string'

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

const isNonNegativeInteger = (value: unknown): value is number =>
  isNonNegativeNumber(value) && Number.isInteger(value)

const isPositiveInteger = (value: unknown): value is number =>
  isNonNegativeInteger(value) && value > 0

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString)

const isCategoryId = (value: unknown): value is PrivacyRetentionCategoryId =>
  isString(value) && categoryIds.includes(value as PrivacyRetentionCategoryId)

const isOwnerReviewStatus = (value: unknown): value is PrivacyRetentionOwnerReviewStatus =>
  isString(value) && ownerReviewStatuses.includes(value as PrivacyRetentionOwnerReviewStatus)

const isRunMode = (value: unknown): value is PrivacyRetentionRunMode =>
  isString(value) && runModes.includes(value as PrivacyRetentionRunMode)

const isRunStatus = (value: unknown): value is PrivacyRetentionRunStatus =>
  isString(value) && runStatuses.includes(value as PrivacyRetentionRunStatus)

const isCompletedRunStatus = (value: unknown): value is PrivacyRetentionRunResponse['status'] =>
  isString(value) && completedRunStatuses.includes(value as PrivacyRetentionRunResponse['status'])

const isHoldReason = (value: unknown): value is PrivacyRetentionHoldReason =>
  isString(value) && holdReasons.includes(value as PrivacyRetentionHoldReason)

const isResultStatus = (value: unknown): value is PrivacyRetentionSelectionResult['status'] =>
  isString(value) && resultStatuses.includes(value as PrivacyRetentionSelectionResult['status'])

const parseOwnerReview = (value: unknown): PrivacyRetentionOwnerReview | null => {
  if (!isRecord(value)) {
    return null
  }

  if (
    !isString(value.ownerLabel) ||
    !(value.lastReviewedAt === null || isString(value.lastReviewedAt)) ||
    !(value.nextReviewDueAt === null || isString(value.nextReviewDueAt)) ||
    !isOwnerReviewStatus(value.status)
  ) {
    return null
  }

  return {
    ownerLabel: value.ownerLabel,
    lastReviewedAt: value.lastReviewedAt,
    nextReviewDueAt: value.nextReviewDueAt,
    status: value.status
  }
}

const parseSummary = (value: unknown): PrivacyRetentionSummary | null => {
  if (!isRecord(value)) {
    return null
  }

  if (
    !isNonNegativeNumber(value.due) ||
    !isNonNegativeNumber(value.held) ||
    !isNonNegativeNumber(value.needsLifecycleReview) ||
    !isNonNegativeNumber(value.failedLastRun)
  ) {
    return null
  }

  return {
    due: value.due,
    held: value.held,
    needsLifecycleReview: value.needsLifecycleReview,
    failedLastRun: value.failedLastRun
  }
}

const parseCategory = (value: unknown): PrivacyRetentionCategory | null => {
  if (
    !isRecord(value) ||
    !isCategoryId(value.id) ||
    !isString(value.label) ||
    !isString(value.description)
  ) {
    return null
  }

  return {
    id: value.id,
    label: value.label,
    description: value.description
  }
}

const parseCategoryCount = (
  value: unknown
): PrivacyRetentionCategoryCount | null => {
  if (
    !isRecord(value) ||
    !isCategoryId(value.category) ||
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

const parsePagination = (value: unknown): PrivacyRetentionPagination | null => {
  if (
    !isRecord(value) ||
    !isPositiveInteger(value.page) ||
    !isPositiveInteger(value.pageSize) ||
    !isNonNegativeInteger(value.totalCandidates) ||
    !isPositiveInteger(value.totalPages) ||
    typeof value.hasPrevious !== 'boolean' ||
    typeof value.hasMore !== 'boolean' ||
    value.page > value.totalPages ||
    value.totalPages !== Math.max(1, Math.ceil(value.totalCandidates / value.pageSize)) ||
    value.hasPrevious !== (value.page > 1) ||
    value.hasMore !== (value.page < value.totalPages)
  ) {
    return null
  }

  return {
    page: value.page,
    pageSize: value.pageSize,
    totalCandidates: value.totalCandidates,
    totalPages: value.totalPages,
    hasPrevious: value.hasPrevious,
    hasMore: value.hasMore
  }
}

const parseCandidate = (value: unknown): PrivacyRetentionCandidate | null => {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isCategoryId(value.category) ||
    !isString(value.recordType) ||
    !isString(value.recordReference) ||
    !isString(value.dueAt) ||
    !isString(value.reason) ||
    !isStringArray(value.removes) ||
    !isStringArray(value.retains) ||
    !isPositiveInteger(value.itemCount) ||
    typeof value.held !== 'boolean' ||
    !(value.holdReason === undefined || isHoldReason(value.holdReason)) ||
    !(value.holdReviewAt === undefined || isString(value.holdReviewAt))
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
    holdReason: value.holdReason,
    holdReviewAt: value.holdReviewAt
  }
}

const parseHistory = (value: unknown): PrivacyRetentionRunHistoryItem | null => {
  if (
    !isRecord(value) ||
    !isString(value.runReference) ||
    !isRunMode(value.mode) ||
    !isRunStatus(value.status) ||
    !isString(value.startedAt) ||
    !(value.completedAt === undefined || isString(value.completedAt)) ||
    !isNonNegativeNumber(value.selectedCount) ||
    !isNonNegativeNumber(value.succeededCount) ||
    !isNonNegativeNumber(value.failedCount)
  ) {
    return null
  }

  return {
    runReference: value.runReference,
    mode: value.mode,
    status: value.status,
    startedAt: value.startedAt,
    completedAt: value.completedAt,
    selectedCount: value.selectedCount,
    succeededCount: value.succeededCount,
    failedCount: value.failedCount
  }
}

const parseRunResult = (value: unknown): PrivacyRetentionSelectionResult | null => {
  if (
    !isRecord(value) ||
    !isString(value.candidateId) ||
    !isString(value.message) ||
    !isResultStatus(value.status)
  ) {
    return null
  }

  return {
    candidateId: value.candidateId,
    status: value.status,
    message: value.message
  }
}

const parsePreview = (value: unknown): PrivacyRetentionPreview | null => {
  if (
    !isRecord(value) ||
    !isString(value.generatedAt) ||
    !isString(value.runReference) ||
    !isString(value.snapshotToken) ||
    value.snapshotToken.length > PRIVACY_RETENTION_SNAPSHOT_TOKEN_MAX_LENGTH ||
    !privacyRetentionSnapshotTokenPattern.test(value.snapshotToken) ||
    !isString(value.confirmationPhrase) ||
    !Array.isArray(value.categories) ||
    !Array.isArray(value.categoryCounts) ||
    !Array.isArray(value.candidates) ||
    !Array.isArray(value.history)
  ) {
    return null
  }

  const ownerReview = parseOwnerReview(value.ownerReview)
  const summary = parseSummary(value.summary)
  const categories = value.categories.map(parseCategory)
  const categoryCounts = value.categoryCounts.map(parseCategoryCount)
  const candidates = value.candidates.map(parseCandidate)
  const history = value.history.map(parseHistory)
  const pagination = parsePagination(value.pagination)
  if (
    !ownerReview ||
    !summary ||
    !pagination ||
    categories.some((category) => category === null) ||
    categoryCounts.some((count) => count === null) ||
    candidates.some((candidate) => candidate === null) ||
    history.some((entry) => entry === null)
  ) {
    return null
  }
  const parsedCategories = categories as PrivacyRetentionCategory[]
  const parsedCategoryCounts = categoryCounts as PrivacyRetentionCategoryCount[]
  const parsedCandidates = candidates as PrivacyRetentionCandidate[]
  const parsedCategoryIds = parsedCategories.map((category) => category.id)
  const countedCategoryIds = parsedCategoryCounts.map((count) => count.category)
  const expectedPageCount = Math.min(
    pagination.pageSize,
    Math.max(
      0,
      pagination.totalCandidates - ((pagination.page - 1) * pagination.pageSize)
    )
  )

  if (
    new Set(parsedCategoryIds).size !== categoryIds.length ||
    categoryIds.some((category) => !parsedCategoryIds.includes(category)) ||
    new Set(countedCategoryIds).size !== categoryIds.length ||
    categoryIds.some((category) => !countedCategoryIds.includes(category)) ||
    parsedCategoryCounts.reduce((sum, count) => sum + count.total, 0) !== pagination.totalCandidates ||
    parsedCategoryCounts.reduce((sum, count) => sum + count.due, 0) !== summary.due ||
    parsedCategoryCounts.reduce((sum, count) => sum + count.held, 0) !== summary.held ||
    new Set(parsedCandidates.map((candidate) => candidate.id)).size !== parsedCandidates.length ||
    parsedCandidates.length !== expectedPageCount
  ) {
    return null
  }

  return {
    generatedAt: value.generatedAt,
    runReference: value.runReference,
    snapshotToken: value.snapshotToken,
    confirmationPhrase: value.confirmationPhrase,
    ownerReview,
    summary,
    categoryCounts: parsedCategoryCounts,
    pagination,
    categories: parsedCategories,
    candidates: parsedCandidates,
    history: history as PrivacyRetentionRunHistoryItem[]
  }
}

const parseRunResponse = (value: unknown): PrivacyRetentionRunResponse | null => {
  if (
    !isRecord(value) ||
    !isCompletedRunStatus(value.status) ||
    !isString(value.runReference) ||
    !isString(value.completedAt) ||
    !isNonNegativeNumber(value.selectedCount) ||
    !isNonNegativeNumber(value.succeededCount) ||
    !isNonNegativeNumber(value.failedCount) ||
    !Array.isArray(value.results)
  ) {
    return null
  }

  const results = value.results.map(parseRunResult)

  if (results.some((result) => result === null)) {
    return null
  }

  return {
    status: value.status,
    runReference: value.runReference,
    completedAt: value.completedAt,
    selectedCount: value.selectedCount,
    succeededCount: value.succeededCount,
    failedCount: value.failedCount,
    results: results as PrivacyRetentionSelectionResult[]
  }
}

const parseSafeServerErrorCode = async (
  response: Response
): Promise<ServerClientErrorCode | null> => {
  const body: unknown = await response.json().catch((): unknown => null)

  if (
    !isRecord(body) ||
    !isString(body.code) ||
    !serverClientErrorCodeSet.has(body.code)
  ) {
    return null
  }

  return body.code as ServerClientErrorCode
}

const postJson = async (
  endpoint: string,
  method: 'POST' | 'DELETE',
  body: Record<string, unknown>,
  signal: AbortSignal
) => {
  let response: Response

  try {
    response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body),
      signal
    })
  } catch {
    throw new PrivacyRetentionClientError('RETENTION_TRANSPORT_ERROR', null)
  }

  if (!response.ok) {
    const code = await parseSafeServerErrorCode(response)
    throw new PrivacyRetentionClientError(
      code || (response.status >= 500
        ? 'RETENTION_SERVER_ERROR'
        : 'RETENTION_REQUEST_REJECTED'),
      response.status
    )
  }

  return response
}

export async function fetchPrivacyRetentionPreview(
  page: number,
  signal: AbortSignal
) {
  const response = await fetch(`${PREVIEW_ENDPOINT}?page=${encodeURIComponent(page)}`, {
    credentials: 'include',
    signal
  })

  if (!response.ok) {
    throw new Error('The retention preview could not be loaded.')
  }

  const preview = parsePreview(await response.json())

  if (!preview) {
    throw new Error('The retention preview response was invalid.')
  }

  return preview
}

export async function runPrivacyRetention(payload: RunRetentionPayload) {
  const response = await postJson(RUN_ENDPOINT, 'POST', {
    password: payload.password,
    confirmation: payload.confirmation,
    runReference: payload.runReference,
    snapshotToken: payload.snapshotToken,
    candidateIds: payload.candidateIds,
    acknowledgedExternalCopies: payload.acknowledgedExternalCopies
  }, payload.signal)
  const result = parseRunResponse(await response.json())

  if (!result) {
    throw new PrivacyRetentionClientError(
      'RETENTION_RESPONSE_INVALID',
      response.status
    )
  }

  return result
}

export async function resumePrivacyRetentionRun(payload: ResumeRetentionRunPayload) {
  const response = await postJson(
    `${RUN_ENDPOINT}/${encodeURIComponent(payload.runReference)}/resume`,
    'POST',
    {
      password: payload.password,
      confirmation: payload.confirmation
    },
    payload.signal
  )
  const result = parseRunResponse(await response.json())

  if (!result || result.runReference !== payload.runReference) {
    throw new PrivacyRetentionClientError(
      'RETENTION_RESPONSE_INVALID',
      response.status
    )
  }

  return result
}

export async function recordPrivacyRetentionReview(payload: RecordRetentionReviewPayload) {
  await postJson(REVIEW_ENDPOINT, 'POST', {
    password: payload.password,
    confirmation: payload.confirmation,
    runReference: payload.runReference,
    reviewedSchedule: payload.reviewedSchedule,
    reviewedExternalSystems: payload.reviewedExternalSystems
  }, payload.signal)
}

export async function addPrivacyRetentionHold(payload: AddRetentionHoldPayload) {
  await postJson(HOLDS_ENDPOINT, 'POST', {
    password: payload.password,
    candidateId: payload.candidateId,
    reason: payload.reason,
    reviewAt: payload.reviewAt
  }, payload.signal)
}

export async function removePrivacyRetentionHold(payload: RemoveRetentionHoldPayload) {
  await postJson(HOLDS_ENDPOINT, 'DELETE', {
    password: payload.password,
    candidateId: payload.candidateId,
    confirmation: payload.confirmation
  }, payload.signal)
}
