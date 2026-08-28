import 'server-only'

import { randomBytes } from 'node:crypto'
import { getSupabaseAdminClient } from '@/lib/supabase-admin-client'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'
import {
  addCalendarMonths,
  privacyRetentionCategories,
  PRIVACY_RETENTION_MAX_PAGE,
  PRIVACY_RETENTION_MAX_SELECTION,
  PRIVACY_RETENTION_OWNER_LABEL,
  PRIVACY_RETENTION_PAGE_SIZE,
  PRIVACY_RETENTION_REVIEW_MONTHS
} from './policy'
import {
  createPrivacyRetentionRepository,
  getRetentionActionType,
  PrivacyRetentionRepositoryError,
  type PrivacyRetentionPersistedManualRun,
  type PrivacyRetentionRepository
} from './repository'
import {
  createPrivacyRetentionCandidateFingerprint,
  createPrivacyRetentionSnapshotToken,
  privacyRetentionFingerprintsMatch,
  PrivacyRetentionSnapshotError,
  verifyPrivacyRetentionSnapshotToken
} from './snapshot'
import type {
  PrivacyRetentionCandidate,
  PrivacyRetentionHoldReason,
  PrivacyRetentionHoldResponse,
  PrivacyRetentionOwnerReview,
  PrivacyRetentionPreview,
  PrivacyRetentionReviewResponse,
  PrivacyRetentionRunResponse,
  PrivacyRetentionRunStatus,
  PrivacyRetentionSelectionResult
} from './types'

const runReferencePattern = /^RET-\d{8}-[A-F0-9]{8}$/
const ownerReviewDueSoonDays = 30

export type PrivacyRetentionServiceDependencies = {
  repository?: PrivacyRetentionRepository
  now?: Date
  runReference?: string
  snapshotSecret?: string
  page?: number
}

export type ExecutePrivacyRetentionSelectionInput = {
  runReference: string
  snapshotToken: string
  confirmation: string
  candidateIds: string[]
  acknowledgedExternalCopies: boolean
}

export type RecordPrivacyRetentionReviewInput = {
  runReference: string
  confirmation: string
  reviewedSchedule: boolean
  reviewedExternalSystems: boolean
}

export type ResumePrivacyRetentionRunInput = {
  runReference: string
  confirmation: string
}

export type SetPrivacyRetentionHoldInput = {
  candidateId: string
  reason: PrivacyRetentionHoldReason
  reviewAt: string
}

export type ReleasePrivacyRetentionHoldInput = {
  candidateId: string
  confirmation: string
}

export class PrivacyRetentionServiceError extends Error {
  code: string
  status: number

  constructor(code: string, status: number) {
    super(code)
    this.name = 'PrivacyRetentionServiceError'
    this.code = code
    this.status = status
  }
}

const getRepository = (dependencies: PrivacyRetentionServiceDependencies) =>
  dependencies.repository || createPrivacyRetentionRepository(getSupabaseAdminClient())

const removeInternalCandidateRevision = (
  candidate: PrivacyRetentionCandidate
): PrivacyRetentionCandidate => {
  const publicCandidate = { ...candidate }
  delete publicCandidate.snapshotRevision
  return publicCandidate
}

export const createPrivacyRetentionRunReference = (now = new Date()) => {
  const date = [
    now.getUTCFullYear().toString().padStart(4, '0'),
    (now.getUTCMonth() + 1).toString().padStart(2, '0'),
    now.getUTCDate().toString().padStart(2, '0')
  ].join('')
  return `RET-${date}-${randomBytes(4).toString('hex').toUpperCase()}`
}

const getUniqueCandidateIds = (values: string[]) => {
  if (!Array.isArray(values) || values.length === 0 || values.length > PRIVACY_RETENTION_MAX_SELECTION) {
    throw new PrivacyRetentionServiceError('RETENTION_SELECTION_INVALID', 400)
  }

  const unique = Array.from(new Set(values))
  if (
    unique.length !== values.length ||
    unique.some((value) => typeof value !== 'string' || value.length === 0 || value.length > 160)
  ) {
    throw new PrivacyRetentionServiceError('RETENTION_SELECTION_INVALID', 400)
  }

  return unique
}

const assertRunConfirmation = (
  runReference: string,
  confirmation: string,
  prefix: 'DELETE' | 'RESUME' | 'REVIEW'
) => {
  if (!runReferencePattern.test(runReference)) {
    throw new PrivacyRetentionServiceError('RETENTION_RUN_REFERENCE_INVALID', 400)
  }
  if (confirmation !== `${prefix} ${runReference}`) {
    throw new PrivacyRetentionServiceError('RETENTION_CONFIRMATION_INVALID', 400)
  }
}

const buildOwnerReview = (
  history: PrivacyRetentionPreview['history'],
  now: Date
): PrivacyRetentionOwnerReview => {
  const lastReview = history.find((run) =>
    run.mode === 'owner-review' && run.status === 'completed' && Boolean(run.completedAt))

  if (!lastReview?.completedAt) {
    return {
      ownerLabel: PRIVACY_RETENTION_OWNER_LABEL,
      lastReviewedAt: null,
      nextReviewDueAt: null,
      status: 'not-recorded'
    }
  }

  const lastReviewedAt = new Date(lastReview.completedAt)
  const nextReviewDueAt = addCalendarMonths(
    lastReviewedAt,
    PRIVACY_RETENTION_REVIEW_MONTHS
  )
  const dueSoonAt = new Date(nextReviewDueAt)
  dueSoonAt.setUTCDate(dueSoonAt.getUTCDate() - ownerReviewDueSoonDays)
  const status = now > nextReviewDueAt
    ? 'overdue'
    : now >= dueSoonAt
      ? 'due-soon'
      : 'current'

  return {
    ownerLabel: PRIVACY_RETENTION_OWNER_LABEL,
    lastReviewedAt: lastReviewedAt.toISOString(),
    nextReviewDueAt: nextReviewDueAt.toISOString(),
    status
  }
}

export async function getPrivacyRetentionPreview(
  dependencies: PrivacyRetentionServiceDependencies = {}
): Promise<PrivacyRetentionPreview> {
  const repository = getRepository(dependencies)
  const now = dependencies.now || new Date()
  const page = dependencies.page || 1
  if (!Number.isInteger(page) || page < 1 || page > PRIVACY_RETENTION_MAX_PAGE) {
    throw new PrivacyRetentionServiceError('RETENTION_PAGE_INVALID', 400)
  }
  const [candidatePage, needsLifecycleReview, fullHistory] = await Promise.all([
    repository.listCandidatePage(now, page, PRIVACY_RETENTION_PAGE_SIZE),
    repository.countNeedsLifecycleReview(now),
    repository.listHistory(50)
  ])
  const candidates = candidatePage.candidates
  const runReference = dependencies.runReference || createPrivacyRetentionRunReference(now)
  const lastExecution = fullHistory.find((run) => run.mode === 'manual')
  const generatedAt = now.toISOString()

  return {
    generatedAt,
    runReference,
    snapshotToken: createPrivacyRetentionSnapshotToken({
      runReference,
      generatedAt,
      candidates,
      page: candidatePage.page,
      pageSize: candidatePage.pageSize,
      totalCandidates: candidatePage.totalCount,
      secret: dependencies.snapshotSecret
    }),
    confirmationPhrase: `DELETE ${runReference}`,
    ownerReview: buildOwnerReview(fullHistory, now),
    summary: {
      due: candidatePage.dueCount,
      held: candidatePage.heldCount,
      needsLifecycleReview,
      failedLastRun: lastExecution?.failedCount || 0
    },
    categoryCounts: candidatePage.categoryCounts,
    pagination: {
      page: candidatePage.page,
      pageSize: candidatePage.pageSize,
      totalCandidates: candidatePage.totalCount,
      totalPages: Math.max(1, Math.ceil(
        candidatePage.totalCount / candidatePage.pageSize
      )),
      hasPrevious: candidatePage.page > 1,
      hasMore: candidatePage.hasMore
    },
    categories: privacyRetentionCategories,
    candidates: candidates.map(removeInternalCandidateRevision),
    history: fullHistory.slice(0, 12)
  }
}

const getSafeFailureCode = (error: unknown) => {
  if (error instanceof PrivacyRetentionRepositoryError) {
    return error.code
  }
  return toSafeOperationalError(error).code
}

const getResultMessage = (status: PrivacyRetentionSelectionResult['status']) => {
  if (status === 'deleted') {
    return 'The selected retained information was removed.'
  }
  if (status === 'skipped') {
    return 'The item was no longer due, no longer present, or protected by a hold.'
  }
  return 'The selected item could not be removed safely.'
}

const getRunStatus = (
  succeededCount: number,
  failedCount: number,
  skippedCount: number
): Extract<PrivacyRetentionRunStatus, 'completed' | 'partial' | 'failed'> => {
  if (failedCount > 0 && succeededCount === 0 && skippedCount === 0) {
    return 'failed'
  }
  if (failedCount > 0 || skippedCount > 0) {
    return 'partial'
  }
  return 'completed'
}

const getPersistedResult = (
  candidateId: string,
  status: PrivacyRetentionSelectionResult['status']
): PrivacyRetentionSelectionResult => ({
  candidateId,
  status,
  message: getResultMessage(status)
})

const getTerminalRunResponse = (
  run: PrivacyRetentionPersistedManualRun
): PrivacyRetentionRunResponse => {
  if (
    run.status === 'pending' ||
    run.status === 'running' ||
    !run.completedAt ||
    run.actions.some((action) => action.outcome === 'pending')
  ) {
    throw new PrivacyRetentionServiceError('RETENTION_RUN_AUDIT_INVALID', 500)
  }

  return {
    status: run.status,
    runReference: run.runReference,
    completedAt: run.completedAt,
    selectedCount: run.selectedCount,
    succeededCount: run.succeededCount,
    failedCount: run.failedCount,
    results: run.actions.map((action) => {
      if (action.outcome === 'pending') {
        throw new PrivacyRetentionServiceError(
          'RETENTION_RUN_AUDIT_INVALID',
          500
        )
      }
      return getPersistedResult(action.candidateId, action.outcome)
    })
  }
}

const isRetryRequiredError = (error: unknown) =>
  error instanceof PrivacyRetentionRepositoryError &&
  error.code === 'RETENTION_CLAIM_RETRY_REQUIRED'

const executePersistedPrivacyRetentionRun = async (
  run: PrivacyRetentionPersistedManualRun,
  repository: PrivacyRetentionRepository,
  now: Date
): Promise<PrivacyRetentionRunResponse> => {
  if (run.status !== 'running') {
    return getTerminalRunResponse(run)
  }

  const resultsByCandidateId = new Map<string, PrivacyRetentionSelectionResult>()
  let succeededCount = run.actions.filter((action) => action.outcome === 'deleted').length
  let skippedCount = run.actions.filter((action) => action.outcome === 'skipped').length
  let failedCount = run.actions.filter((action) => action.outcome === 'failed').length

  for (const action of run.actions) {
    if (action.outcome !== 'pending') {
      resultsByCandidateId.set(
        action.candidateId,
        getPersistedResult(action.candidateId, action.outcome)
      )
      continue
    }

    try {
      const status = await repository.deleteCandidate(action.candidateId, now, run.runId)
      try {
        await repository.completeAction(run.runId, action.candidateId, status)
      } catch {
        throw new PrivacyRetentionServiceError(
          'RETENTION_RUN_RESUME_REQUIRED',
          409
        )
      }

      if (status === 'deleted') {
        succeededCount += 1
      } else {
        skippedCount += 1
      }
      resultsByCandidateId.set(
        action.candidateId,
        getPersistedResult(action.candidateId, status)
      )
    } catch (error) {
      if (
        error instanceof PrivacyRetentionServiceError ||
        isRetryRequiredError(error)
      ) {
        throw error instanceof PrivacyRetentionServiceError
          ? error
          : new PrivacyRetentionServiceError(
            'RETENTION_RUN_RESUME_REQUIRED',
            409
          )
      }

      const errorCode = getSafeFailureCode(error)
      try {
        await repository.completeAction(
          run.runId,
          action.candidateId,
          'failed',
          errorCode
        )
      } catch {
        throw new PrivacyRetentionServiceError(
          'RETENTION_RUN_RESUME_REQUIRED',
          409
        )
      }
      failedCount += 1
      resultsByCandidateId.set(
        action.candidateId,
        getPersistedResult(action.candidateId, 'failed')
      )
    }
  }

  const status = getRunStatus(succeededCount, failedCount, skippedCount)
  let completedAt: string
  try {
    completedAt = await repository.completeRun(run.runId, status, {
      succeeded: succeededCount,
      skipped: skippedCount,
      failed: failedCount
    }, now.toISOString())
  } catch {
    throw new PrivacyRetentionServiceError(
      'RETENTION_RUN_RESUME_REQUIRED',
      409
    )
  }

  return {
    status,
    runReference: run.runReference,
    completedAt,
    selectedCount: run.selectedCount,
    succeededCount,
    failedCount,
    results: run.actions.map((action) => {
      const result = resultsByCandidateId.get(action.candidateId)
      if (!result) {
        throw new PrivacyRetentionServiceError(
          'RETENTION_RUN_AUDIT_INVALID',
          500
        )
      }
      return result
    })
  }
}

const verifySnapshotForExecution = (
  input: ExecutePrivacyRetentionSelectionInput,
  dependencies: PrivacyRetentionServiceDependencies,
  now: Date
) => {
  try {
    const snapshot = verifyPrivacyRetentionSnapshotToken({
      token: input.snapshotToken,
      now,
      secret: dependencies.snapshotSecret
    })

    if (snapshot.runReference !== input.runReference) {
      throw new PrivacyRetentionServiceError(
        'RETENTION_PREVIEW_TOKEN_INVALID',
        409
      )
    }

    return snapshot
  } catch (error) {
    if (error instanceof PrivacyRetentionServiceError) {
      throw error
    }
    if (error instanceof PrivacyRetentionSnapshotError) {
      throw new PrivacyRetentionServiceError(
        error.code,
        error.code === 'RETENTION_SNAPSHOT_CONFIGURATION_ERROR' ? 500 : 409
      )
    }
    throw error
  }
}

export async function executePrivacyRetentionSelection(
  input: ExecutePrivacyRetentionSelectionInput,
  dependencies: PrivacyRetentionServiceDependencies = {}
): Promise<PrivacyRetentionRunResponse> {
  assertRunConfirmation(input.runReference, input.confirmation, 'DELETE')
  if (input.acknowledgedExternalCopies !== true) {
    throw new PrivacyRetentionServiceError('RETENTION_EXTERNAL_COPIES_ACKNOWLEDGEMENT_REQUIRED', 400)
  }
  const candidateIds = getUniqueCandidateIds(input.candidateIds)
  const now = dependencies.now || new Date()
  const snapshot = verifySnapshotForExecution(input, dependencies, now)
  const snapshotCutoff = new Date(snapshot.generatedAt)
  const repository = getRepository(dependencies)
  const currentCandidatePage = await repository.listCandidatePage(
    snapshotCutoff,
    snapshot.page,
    snapshot.pageSize
  )
  const currentCandidates = currentCandidatePage.candidates
  const currentFingerprint = createPrivacyRetentionCandidateFingerprint(
    currentCandidates
  )

  if (!privacyRetentionFingerprintsMatch(
    snapshot.fingerprint,
    currentFingerprint
  ) || snapshot.totalCandidates !== currentCandidatePage.totalCount) {
    throw new PrivacyRetentionServiceError('RETENTION_PREVIEW_STALE', 409)
  }

  const candidatesById = new Map(currentCandidates.map((candidate) => [candidate.id, candidate]))
  const selectedCandidates = candidateIds.map((candidateId) => candidatesById.get(candidateId))

  if (selectedCandidates.some((candidate) => !candidate)) {
    throw new PrivacyRetentionServiceError('RETENTION_PREVIEW_STALE', 409)
  }

  const candidates = selectedCandidates as PrivacyRetentionCandidate[]
  if (candidates.some((candidate) => candidate.held)) {
    throw new PrivacyRetentionServiceError('RETENTION_LEGAL_HOLD_ACTIVE', 409)
  }

  const selectedCategories = Array.from(new Set(candidates.map((candidate) => candidate.category)))
  try {
    await repository.createManualRun({
      runReference: input.runReference,
      mode: 'manual',
      initiator: 'admin',
      candidateCount: currentCandidatePage.totalCount,
      selectedCount: candidates.length,
      selectedCategories
    }, candidates.map((candidate) => ({
      candidate,
      actionType: getRetentionActionType(candidate)
    })))
  } catch (error) {
    if (
      error instanceof PrivacyRetentionRepositoryError &&
      error.code === 'RETENTION_RUN_RESUME_REQUIRED'
    ) {
      throw new PrivacyRetentionServiceError(
        'RETENTION_RUN_RESUME_REQUIRED',
        409
      )
    }
    throw error
  }

  const persistedRun = await repository.getManualRunForResume(input.runReference)
  if (!persistedRun) {
    throw new PrivacyRetentionServiceError('RETENTION_RUN_NOT_FOUND', 404)
  }
  return executePersistedPrivacyRetentionRun(persistedRun, repository, now)
}

export async function resumePrivacyRetentionRun(
  input: ResumePrivacyRetentionRunInput,
  dependencies: PrivacyRetentionServiceDependencies = {}
): Promise<PrivacyRetentionRunResponse> {
  assertRunConfirmation(input.runReference, input.confirmation, 'RESUME')
  const repository = getRepository(dependencies)
  const run = await repository.getManualRunForResume(input.runReference)

  if (!run) {
    throw new PrivacyRetentionServiceError('RETENTION_RUN_NOT_FOUND', 404)
  }

  return executePersistedPrivacyRetentionRun(
    run,
    repository,
    dependencies.now || new Date()
  )
}

export async function recordPrivacyRetentionOwnerReview(
  input: RecordPrivacyRetentionReviewInput,
  dependencies: PrivacyRetentionServiceDependencies = {}
): Promise<PrivacyRetentionReviewResponse> {
  assertRunConfirmation(input.runReference, input.confirmation, 'REVIEW')
  if (input.reviewedSchedule !== true || input.reviewedExternalSystems !== true) {
    throw new PrivacyRetentionServiceError('RETENTION_REVIEW_EVIDENCE_REQUIRED', 400)
  }
  const repository = getRepository(dependencies)
  const now = dependencies.now || new Date()
  const candidatePage = await repository.listCandidatePage(now, 1, 1)
  await repository.createRun({
    runReference: input.runReference,
    mode: 'owner-review',
    initiator: 'admin',
    candidateCount: candidatePage.totalCount,
    selectedCount: 0,
    selectedCategories: [],
    reviewedSchedule: true,
    reviewedExternalSystems: true
  })

  return {
    status: 'recorded',
    runReference: input.runReference,
    reviewedAt: now.toISOString(),
    nextReviewDueAt: addCalendarMonths(now, PRIVACY_RETENTION_REVIEW_MONTHS).toISOString()
  }
}

export async function discoverPrivacyRetentionCandidates(
  dependencies: PrivacyRetentionServiceDependencies = {}
) {
  const repository = getRepository(dependencies)
  const now = dependencies.now || new Date()
  const candidatePage = await repository.listCandidatePage(now, 1, 1)
  const runReference = dependencies.runReference || createPrivacyRetentionRunReference(now)
  await repository.createRun({
    runReference,
    mode: 'discovery',
    initiator: 'scheduled',
    candidateCount: candidatePage.totalCount,
    selectedCount: 0,
    selectedCategories: candidatePage.categoryCounts
      .filter((count) => count.total > 0)
      .map((count) => count.category)
  })

  return {
    status: 'completed' as const,
    runReference,
    discoveredAt: now.toISOString(),
    dueCount: candidatePage.dueCount,
    heldCount: candidatePage.heldCount
  }
}

export async function setPrivacyRetentionLegalHold(
  input: SetPrivacyRetentionHoldInput,
  dependencies: PrivacyRetentionServiceDependencies = {}
): Promise<PrivacyRetentionHoldResponse> {
  const repository = getRepository(dependencies)
  const now = dependencies.now || new Date()
  const reviewAt = new Date(input.reviewAt)

  if (Number.isNaN(reviewAt.getTime()) || reviewAt <= now) {
    throw new PrivacyRetentionServiceError('RETENTION_HOLD_REVIEW_DATE_INVALID', 400)
  }

  const wasUpdated = await repository.setLegalHold(
    input.candidateId,
    true,
    input.reason,
    reviewAt.toISOString()
  )
  if (!wasUpdated) {
    throw new PrivacyRetentionServiceError('RETENTION_RECORD_NOT_FOUND', 404)
  }

  return {
    status: 'held',
    candidateId: input.candidateId,
    updatedAt: now.toISOString()
  }
}

export async function releasePrivacyRetentionLegalHold(
  input: ReleasePrivacyRetentionHoldInput,
  dependencies: PrivacyRetentionServiceDependencies = {}
): Promise<PrivacyRetentionHoldResponse> {
  const repository = getRepository(dependencies)
  const now = dependencies.now || new Date()
  const hold = await repository.getLegalHold(input.candidateId)
  if (!hold.found || !hold.recordReference) {
    throw new PrivacyRetentionServiceError('RETENTION_RECORD_NOT_FOUND', 404)
  }
  if (input.confirmation !== `REMOVE HOLD ${hold.recordReference}`) {
    throw new PrivacyRetentionServiceError('RETENTION_CONFIRMATION_INVALID', 400)
  }
  if (!hold.holdActive) {
    return {
      status: 'released',
      candidateId: input.candidateId,
      updatedAt: now.toISOString()
    }
  }
  const wasUpdated = await repository.setLegalHold(
    input.candidateId,
    false,
    null,
    null
  )
  if (!wasUpdated) {
    throw new PrivacyRetentionServiceError('RETENTION_RECORD_NOT_FOUND', 404)
  }

  return {
    status: 'released',
    candidateId: input.candidateId,
    updatedAt: now.toISOString()
  }
}
