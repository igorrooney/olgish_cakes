'use client'

import {
  useId,
  useMemo,
  useRef,
  useState,
  useEffect,
  type FormEvent
} from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAbortableRequest } from '@/app/hooks/useAbortableRequest'
import type {
  PrivacyRetentionCandidate,
  PrivacyRetentionCategory,
  PrivacyRetentionCategoryCount,
  PrivacyRetentionHoldReason,
  PrivacyRetentionRunHistoryItem,
  PrivacyRetentionRunResponse
} from '@/lib/privacy-retention/types'
import { PRIVACY_RETENTION_MAX_SELECTION } from '@/lib/privacy-retention/policy'
import {
  addPrivacyRetentionHold,
  fetchPrivacyRetentionPreview,
  PrivacyRetentionClientError,
  recordPrivacyRetentionReview,
  removePrivacyRetentionHold,
  runPrivacyRetention
} from './privacy-retention-api'
import { PrivacyRetentionLifecycleReviewQueue } from './PrivacyRetentionLifecycleReviewQueue'
import { PrivacyRetentionActiveHoldRegister } from './PrivacyRetentionActiveHoldRegister'
import { PrivacyRetentionRunDetailsView } from './PrivacyRetentionRunDetails'
import { PrivacyRetentionExpiredClaimHoldRecoveryForm } from './PrivacyRetentionExpiredClaimHoldRecoveryForm'

const RETENTION_QUERY_KEY = ['admin', 'privacy-retention'] as const

const holdReasons: Array<{ value: PrivacyRetentionHoldReason, label: string }> = [
  { value: 'active-complaint', label: 'Active complaint or dispute' },
  { value: 'legal-claim', label: 'Active or anticipated legal claim' },
  { value: 'regulatory-request', label: 'Regulatory or law-enforcement request' },
  { value: 'fraud-investigation', label: 'Fraud or security investigation' },
  { value: 'other-necessary-hold', label: 'Other documented necessary hold' }
]

interface SelectionCheckboxProps {
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  label: string
  describedBy?: string
  onChange: (checked: boolean) => void
}

function SelectionCheckbox({
  checked,
  indeterminate = false,
  disabled = false,
  label,
  describedBy,
  onChange
}: SelectionCheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <label className='flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-base-content'>
      <input
        ref={checkboxRef}
        type='checkbox'
        className='checkbox checkbox-primary'
        checked={checked}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  )
}

function SuccessNotice({ children }: { children: React.ReactNode }) {
  return (
    <div
      className='alert alert-success w-full items-start text-sm'
      role='status'
      aria-live='polite'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='h-5 w-5 shrink-0 stroke-current'
        fill='none'
        viewBox='0 0 24 24'
        aria-hidden='true'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
      <div className='min-w-0 leading-6'>{children}</div>
    </div>
  )
}

const formatDate = (value: string | null | undefined, includeTime = false) => {
  if (!value) {
    return 'Not recorded'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' as const } : {})
  }).format(date)
}

const formatStatus = (value: string) => value
  .split('-')
  .filter(Boolean)
  .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
  .join(' ')

const getOwnerStatusBadge = (status: string) => {
  if (status === 'current') {
    return 'badge-success'
  }

  if (status === 'due-soon') {
    return 'badge-warning'
  }

  return 'badge-error'
}

const getRunStatusBadge = (status: string) => {
  if (status === 'completed') {
    return 'badge-success'
  }

  if (status === 'pending' || status === 'running') {
    return 'badge-info'
  }

  return status === 'partial' ? 'badge-warning' : 'badge-error'
}

type RunErrorNotice = {
  requiresPersistedRunCheck: boolean
  message: string
}

const getRunErrorNotice = (error: unknown): RunErrorNotice => {
  if (!(error instanceof PrivacyRetentionClientError)) {
    return {
      requiresPersistedRunCheck: true,
      message: 'The browser did not receive a definitive result. Open and resolve the persisted run details, then reload this page. Deletion selection stays locked until then.'
    }
  }

  if (
    error.code === 'RETENTION_RUN_RESUME_REQUIRED' ||
    error.code === 'RETENTION_RESPONSE_INVALID' ||
    error.code === 'RETENTION_TRANSPORT_ERROR' ||
    error.status === null ||
    error.status >= 500
  ) {
    return {
      requiresPersistedRunCheck: true,
      message: 'The browser did not receive a definitive result. Open and resolve the persisted run details, then reload this page. Deletion selection stays locked until then.'
    }
  }

  if (
    error.code === 'RETENTION_PREVIEW_EXPIRED' ||
    error.code === 'RETENTION_PREVIEW_STALE' ||
    error.code === 'RETENTION_PREVIEW_TOKEN_INVALID'
  ) {
    return {
      requiresPersistedRunCheck: false,
      message: 'The retention preview is no longer current. Refresh it, review the candidates again and start a new selective deletion.'
    }
  }

  if (error.code === 'RETENTION_LEGAL_HOLD_ACTIVE') {
    return {
      requiresPersistedRunCheck: false,
      message: 'A selected record is now protected by a legal hold. Refresh the preview and review the remaining candidates.'
    }
  }

  if (error.status === 401) {
    return {
      requiresPersistedRunCheck: false,
      message: 'The admin session or password was not accepted. Sign in again if needed, then start a fresh review.'
    }
  }

  if (error.status === 403) {
    return {
      requiresPersistedRunCheck: false,
      message: 'The same-origin security check rejected this request. Reload this admin page before trying again.'
    }
  }

  if (error.status === 429) {
    return {
      requiresPersistedRunCheck: false,
      message: 'Too many retention attempts were made. Wait a minute, then refresh and start a fresh review.'
    }
  }

  if (error.code === 'RETENTION_CONFIRMATION_INVALID') {
    return {
      requiresPersistedRunCheck: false,
      message: 'The exact confirmation phrase was rejected. Refresh the preview and review the selection before trying again.'
    }
  }

  if (error.code === 'RETENTION_SELECTION_INVALID') {
    return {
      requiresPersistedRunCheck: false,
      message: 'The selected records were rejected. Refresh the preview and choose the deletion candidates again.'
    }
  }

  if (error.code === 'RETENTION_EXTERNAL_COPIES_ACKNOWLEDGEMENT_REQUIRED') {
    return {
      requiresPersistedRunCheck: false,
      message: 'The independent-copy acknowledgement was not accepted. Refresh and review all deletion checks again.'
    }
  }

  return {
    requiresPersistedRunCheck: false,
    message: 'The deletion request was rejected and no deletion was confirmed. Refresh the preview and review the candidates before trying again.'
  }
}

function RetentionLoadingState() {
  return (
    <div className='grid gap-6' role='status' aria-label='Loading privacy retention centre'>
      <div className='grid gap-3 tablet:grid-cols-2 xl:grid-cols-4'>
        {['due', 'held', 'review', 'failed'].map((item) => (
          <div key={item} className='skeleton h-28 rounded-box' />
        ))}
      </div>
      <div className='skeleton h-72 rounded-box' />
      <span className='sr-only'>Loading retention records...</span>
    </div>
  )
}

function DataEffectDetails({ candidate }: { candidate: PrivacyRetentionCandidate }) {
  return (
    <details className='collapse collapse-arrow rounded-box border border-base-300 bg-base-100'>
      <summary className='collapse-title min-h-11 py-3 text-sm font-semibold'>View exact data effect</summary>
      <div className='collapse-content grid gap-4 text-sm tablet:grid-cols-2'>
        <div>
          <h4 className='font-semibold text-error'>Permanently removes</h4>
          <ul className='mt-2 list-disc space-y-1 pl-5 text-base-content/75'>
            {candidate.removes.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h4 className='font-semibold text-base-content'>Retains</h4>
          {candidate.retains.length > 0 ? (
            <ul className='mt-2 list-disc space-y-1 pl-5 text-base-content/75'>
              {candidate.retains.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : (
            <p className='mt-2 text-base-content/70'>Nothing from this retention candidate.</p>
          )}
        </div>
      </div>
    </details>
  )
}

interface CandidateGroupProps {
  category: PrivacyRetentionCategory
  categoryCount: PrivacyRetentionCategoryCount
  candidates: PrivacyRetentionCandidate[]
  selectedIds: Set<string>
  onToggleCategory: (categoryId: PrivacyRetentionCategory['id'], checked: boolean) => void
  onToggleCandidate: (candidateId: string, checked: boolean) => void
  onOpenHold: (candidateId: string, action: 'add' | 'remove') => void
  selectionAtLimit: boolean
  selectionDisabled: boolean
  disabled: boolean
}

function CandidateGroup({
  category,
  categoryCount,
  candidates,
  selectedIds,
  onToggleCategory,
  onToggleCandidate,
  onOpenHold,
  selectionAtLimit,
  selectionDisabled,
  disabled
}: CandidateGroupProps) {
  const availableCandidates = candidates.filter((candidate) => !candidate.held)
  const selectedCount = availableCandidates.filter((candidate) => selectedIds.has(candidate.id)).length
  const allSelected = availableCandidates.length > 0 && selectedCount === availableCandidates.length
  const partiallySelected = selectedCount > 0 && !allSelected

  return (
    <section className='rounded-box border border-base-300 bg-base-100 shadow-sm' aria-labelledby={`category-${category.id}`}>
      <div className='grid gap-4 border-b border-base-300 p-4 tablet:grid-cols-[minmax(0,1fr)_auto] tablet:items-center tablet:p-5'>
        <div>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 id={`category-${category.id}`} className='text-lg font-semibold text-base-content'>{category.label}</h3>
            <span className='badge badge-outline'>{categoryCount.total} globally</span>
            <span className='badge badge-ghost'>{candidates.length} on this page</span>
            {categoryCount.held > 0 ? <span className='badge badge-warning'>{categoryCount.held} held</span> : null}
          </div>
          <p className='mt-1 max-w-3xl text-sm leading-6 text-base-content/70'>{category.description}</p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <SelectionCheckbox
            checked={allSelected}
            indeterminate={partiallySelected}
            disabled={availableCandidates.length === 0 || selectionDisabled}
            label={`Select all visible in ${category.label}`}
            onChange={(checked) => onToggleCategory(category.id, checked)}
          />
          {selectedCount > 0 ? (
            <button
              type='button'
              className='btn btn-ghost btn-sm min-h-10'
              disabled={selectionDisabled}
              onClick={() => onToggleCategory(category.id, false)}
            >
              Clear {selectedCount} selected
            </button>
          ) : null}
        </div>
      </div>

      {candidates.length === 0 ? (
        <p className='p-5 text-sm text-base-content/70'>No records from this category are shown on this page.</p>
      ) : (
        <div className='overflow-x-auto p-3 tablet:p-0'>
          <table className='table block w-full tablet:table'>
            <caption className='sr-only'>{category.label} deletion candidates</caption>
            <thead className='hidden tablet:table-header-group'>
              <tr>
                <th className='w-52'>Select record</th>
                <th>Retention deadline</th>
                <th>Deletion effect</th>
                <th className='w-44'>Legal hold</th>
              </tr>
            </thead>
            <tbody className='grid gap-3 tablet:table-row-group'>
              {candidates.map((candidate) => {
                const holdDescriptionId = `hold-${candidate.id}`

                return (
                  <tr
                    key={candidate.id}
                    className={`grid gap-3 rounded-box border p-3 align-top tablet:table-row tablet:border-0 tablet:p-0 ${candidate.held ? 'border-warning/40 bg-warning/10' : 'border-base-300'}`}
                  >
                    <td className='block tablet:table-cell'>
                      <SelectionCheckbox
                        checked={!candidate.held && selectedIds.has(candidate.id)}
                        disabled={selectionDisabled || candidate.held || (selectionAtLimit && !selectedIds.has(candidate.id))}
                        label={`${candidate.recordType} ${candidate.recordReference}`}
                        describedBy={candidate.held ? holdDescriptionId : undefined}
                        onChange={(checked) => onToggleCandidate(candidate.id, checked)}
                      />
                    </td>
                    <td className='block tablet:table-cell'>
                      <span className='text-xs font-semibold uppercase tracking-wide text-base-content/60 tablet:hidden'>Retention deadline</span>
                      <p className='mt-1 font-semibold tablet:mt-0'>{formatDate(candidate.dueAt)}</p>
                      <p className='mt-1 max-w-md text-sm leading-6 text-base-content/70'>{candidate.reason}</p>
                    </td>
                    <td className='block min-w-72 tablet:table-cell'>
                      <p className='mb-2 text-sm font-semibold text-base-content/75'>
                        Affected items: {candidate.itemCount}
                      </p>
                      <DataEffectDetails candidate={candidate} />
                    </td>
                    <td className='block tablet:table-cell'>
                      <span className='text-xs font-semibold uppercase tracking-wide text-base-content/60 tablet:hidden'>Legal hold</span>
                      {candidate.held ? (
                        <div id={holdDescriptionId} className='mt-1 tablet:mt-0'>
                          <span className='badge badge-warning'>Held</span>
                          <p className='mt-2 text-xs leading-5 text-base-content/70'>
                            Review {formatDate(candidate.holdReviewAt)}. The documented reason is kept in the protected audit record.
                          </p>
                          <button
                            type='button'
                            className='btn btn-outline btn-warning btn-xs mt-3 min-h-9'
                            disabled={disabled}
                            onClick={() => onOpenHold(candidate.id, 'remove')}
                          >
                            Review or release hold
                          </button>
                        </div>
                      ) : (
                        <button
                          type='button'
                          className='btn btn-outline btn-sm mt-1 min-h-10 tablet:mt-0'
                          disabled={disabled}
                          onClick={() => onOpenHold(candidate.id, 'add')}
                        >
                          Place legal hold
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function RunHistory({ history }: { history: PrivacyRetentionRunHistoryItem[] }) {
  return (
    <section className='rounded-box border border-base-300 bg-base-100 shadow-sm' aria-labelledby='retention-history-heading'>
      <div className='border-b border-base-300 p-5'>
        <h2 id='retention-history-heading' className='text-xl font-semibold text-base-content'>Retention run history</h2>
        <p className='mt-1 text-sm text-base-content/70'>Counts and references only. Deleted content is never copied into this log.</p>
      </div>
      {history.length === 0 ? (
        <div className='p-8 text-center'>
          <p className='font-semibold text-base-content'>No retention runs recorded</p>
          <p className='mt-1 text-sm text-base-content/60'>The first completed review or deletion run will appear here.</p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='table'>
            <thead>
              <tr>
                <th>Run reference</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Started</th>
                <th className='text-right'>Selected / deleted / failed</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.runReference}>
                  <td className='font-mono text-xs'>{item.runReference}</td>
                  <td>{formatStatus(item.mode)}</td>
                  <td><span className={`badge ${getRunStatusBadge(item.status)}`}>{formatStatus(item.status)}</span></td>
                  <td>
                    <p>{formatDate(item.startedAt, true)}</p>
                    {item.completedAt ? <p className='mt-1 text-xs text-base-content/60'>Finished {formatDate(item.completedAt, true)}</p> : null}
                  </td>
                  <td className='text-right tabular-nums'>{item.selectedCount} / {item.succeededCount} / {item.failedCount}</td>
                  <td><PrivacyRetentionRunDetailsView runReference={item.runReference} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export function PrivacyRetentionCentre() {
  const queryClient = useQueryClient()
  const runPanelId = useId()
  const reviewPanelId = useId()
  const holdPanelId = useId()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [page, setPage] = useState(1)
  const [isRunConfirmationOpen, setIsRunConfirmationOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [activeHold, setActiveHold] = useState<{ candidateId: string, action: 'add' | 'remove' } | null>(null)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [acknowledgedExternalCopies, setAcknowledgedExternalCopies] = useState(false)
  const [reviewedSchedule, setReviewedSchedule] = useState(false)
  const [reviewedExternalSystems, setReviewedExternalSystems] = useState(false)
  const [holdPassword, setHoldPassword] = useState('')
  const [holdReason, setHoldReason] = useState<PrivacyRetentionHoldReason | ''>('')
  const [holdReviewAt, setHoldReviewAt] = useState('')
  const [holdConfirmation, setHoldConfirmation] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [runRecoveryNotice, setRunRecoveryNotice] = useState<string | null>(null)
  const [runRejectionNotice, setRunRejectionNotice] = useState<string | null>(null)
  const [lastRunResult, setLastRunResult] = useState<PrivacyRetentionRunResponse | null>(null)
  const runRequest = useAbortableRequest()
  const reviewRequest = useAbortableRequest()
  const addHoldRequest = useAbortableRequest()
  const removeHoldRequest = useAbortableRequest()
  const runCredentialsRef = useRef<{ password: string, confirmation: string } | null>(null)
  const reviewCredentialsRef = useRef<{ password: string, confirmation: string } | null>(null)
  const addHoldPasswordRef = useRef<string | null>(null)
  const removeHoldCredentialsRef = useRef<{ password: string, confirmation: string } | null>(null)

  useEffect(() => () => {
    runCredentialsRef.current = null
    reviewCredentialsRef.current = null
    addHoldPasswordRef.current = null
    removeHoldCredentialsRef.current = null
  }, [])

  const previewQuery = useQuery({
    queryKey: [...RETENTION_QUERY_KEY, page],
    queryFn: ({ signal }) => fetchPrivacyRetentionPreview(page, signal),
    staleTime: 30 * 1000,
    retry: false,
    refetchOnWindowFocus: false
  })

  useEffect(() => {
    const effectivePage = previewQuery.data?.pagination.page
    if (effectivePage && effectivePage !== page) {
      setSelectedIds(new Set())
      setIsRunConfirmationOpen(false)
      setPassword('')
      setConfirmation('')
      setAcknowledgedExternalCopies(false)
      runCredentialsRef.current = null
      setPage(effectivePage)
    }
  }, [page, previewQuery.data?.pagination.page])

  const refreshPreview = async () => {
    await queryClient.invalidateQueries({ queryKey: RETENTION_QUERY_KEY })
  }

  const runMutation = useMutation({
    mutationFn: (variables: {
      runReference: string
      snapshotToken: string
      candidateIds: string[]
      acknowledgedExternalCopies: true
      signal: AbortSignal
    }) => {
      const credentials = runCredentialsRef.current

      if (!credentials) {
        throw new Error('Deletion credentials are unavailable.')
      }

      return runPrivacyRetention({ ...variables, ...credentials })
    },
    onSuccess: async (result) => {
      setRunRecoveryNotice(null)
      setRunRejectionNotice(null)
      setLastRunResult(result)
      setSelectedIds(new Set())
      setIsRunConfirmationOpen(false)
      setPassword('')
      setConfirmation('')
      setAcknowledgedExternalCopies(false)
      setReviewedSchedule(false)
      setReviewedExternalSystems(false)
      setSuccessMessage(
        `Retention run ${result.runReference} completed: ${result.succeededCount} deleted, ${result.failedCount} failed and ${result.selectedCount - result.succeededCount - result.failedCount} skipped.`
      )
      await refreshPreview()
    },
    onError: async (error) => {
      const notice = getRunErrorNotice(error)
      setSelectedIds(new Set())
      setIsRunConfirmationOpen(false)
      setPassword('')
      setConfirmation('')
      setAcknowledgedExternalCopies(false)
      runCredentialsRef.current = null
      setRunRecoveryNotice(notice.requiresPersistedRunCheck ? notice.message : null)
      setRunRejectionNotice(notice.requiresPersistedRunCheck ? null : notice.message)
      await refreshPreview()
    },
    onSettled: () => {
      runCredentialsRef.current = null
    }
  })

  const reviewMutation = useMutation({
    mutationFn: (variables: {
      runReference: string
      reviewedSchedule: true
      reviewedExternalSystems: true
      signal: AbortSignal
    }) => {
      const credentials = reviewCredentialsRef.current

      if (!credentials) {
        throw new Error('Review credentials are unavailable.')
      }

      return recordPrivacyRetentionReview({ ...variables, ...credentials })
    },
    onSuccess: async () => {
      setIsReviewOpen(false)
      setPassword('')
      setConfirmation('')
      setReviewedSchedule(false)
      setReviewedExternalSystems(false)
      setSuccessMessage('The owner retention review was recorded and the next review date was scheduled.')
      await refreshPreview()
    },
    onError: () => {
      setPassword('')
      setConfirmation('')
    },
    onSettled: () => {
      reviewCredentialsRef.current = null
    }
  })

  const addHoldMutation = useMutation({
    mutationFn: (variables: {
      candidateId: string
      reason: PrivacyRetentionHoldReason
      reviewAt: string
      signal: AbortSignal
    }) => {
      const holdRequestPassword = addHoldPasswordRef.current

      if (!holdRequestPassword) {
        throw new Error('Hold credentials are unavailable.')
      }

      return addPrivacyRetentionHold({
        ...variables,
        password: holdRequestPassword
      })
    },
    onSuccess: async (_result, variables) => {
      setSelectedIds((current) => {
        const next = new Set(current)
        next.delete(variables.candidateId)
        return next
      })
      setActiveHold(null)
      setHoldPassword('')
      setHoldReason('')
      setHoldReviewAt('')
      setSuccessMessage('The legal hold was recorded. This candidate is excluded from deletion.')
      await refreshPreview()
    },
    onError: () => {
      setHoldPassword('')
    },
    onSettled: () => {
      addHoldPasswordRef.current = null
    }
  })

  const removeHoldMutation = useMutation({
    mutationFn: (variables: { candidateId: string, signal: AbortSignal }) => {
      const credentials = removeHoldCredentialsRef.current

      if (!credentials) {
        throw new Error('Hold-release credentials are unavailable.')
      }

      return removePrivacyRetentionHold({ ...variables, ...credentials })
    },
    onSuccess: async () => {
      setActiveHold(null)
      setHoldPassword('')
      setHoldConfirmation('')
      setSuccessMessage('The legal hold was released. Review the candidate before selecting it for deletion.')
      await refreshPreview()
    },
    onError: () => {
      setHoldPassword('')
      setHoldConfirmation('')
    },
    onSettled: () => {
      removeHoldCredentialsRef.current = null
    }
  })

  const preview = previewQuery.data
  const eligibleCandidates = useMemo(
    () => preview?.candidates.filter((candidate) => !candidate.held) ?? [],
    [preview]
  )
  const eligibleIds = useMemo(
    () => new Set(eligibleCandidates.map((candidate) => candidate.id)),
    [eligibleCandidates]
  )
  const selectedCandidates = useMemo(
    () => eligibleCandidates.filter((candidate) => selectedIds.has(candidate.id)),
    [eligibleCandidates, selectedIds]
  )
  const bulkSelectionCount = Math.min(
    eligibleCandidates.length,
    PRIVACY_RETENTION_MAX_SELECTION
  )
  const allSelected = bulkSelectionCount > 0 && selectedCandidates.length === bulkSelectionCount
  const partiallySelected = selectedCandidates.length > 0 && !allSelected
  const activeHoldCandidate = preview?.candidates.find((candidate) => candidate.id === activeHold?.candidateId) ?? null
  const reviewConfirmationPhrase = preview ? `REVIEW ${preview.runReference}` : ''
  const releaseHoldPhrase = activeHoldCandidate ? `REMOVE HOLD ${activeHoldCandidate.recordReference}` : ''
  const isBusy = runMutation.isPending || reviewMutation.isPending || addHoldMutation.isPending || removeHoldMutation.isPending
  const deletionSelectionDisabled = isBusy || Boolean(runRecoveryNotice)

  const closeAllActionPanels = () => {
    if (isBusy) {
      return
    }
    runRequest.abort()
    reviewRequest.abort()
    addHoldRequest.abort()
    removeHoldRequest.abort()
    setIsRunConfirmationOpen(false)
    setIsReviewOpen(false)
    setActiveHold(null)
    setPassword('')
    setConfirmation('')
    setAcknowledgedExternalCopies(false)
    setReviewedSchedule(false)
    setReviewedExternalSystems(false)
    setHoldPassword('')
    setHoldReason('')
    setHoldReviewAt('')
    setHoldConfirmation('')
    runCredentialsRef.current = null
    reviewCredentialsRef.current = null
    addHoldPasswordRef.current = null
    removeHoldCredentialsRef.current = null
    runMutation.reset()
    reviewMutation.reset()
    addHoldMutation.reset()
    removeHoldMutation.reset()
  }

  const changePage = (nextPage: number) => {
    if (isBusy || !preview || nextPage < 1 || nextPage > preview.pagination.totalPages) {
      return
    }

    closeAllActionPanels()
    setSelectedIds(new Set())
    setSuccessMessage(null)
    setLastRunResult(null)
    setPage(nextPage)
  }

  const resetIrreversibleRunConfirmation = () => {
    const wasOpen = isRunConfirmationOpen

    runRequest.abort()
    runCredentialsRef.current = null
    setIsRunConfirmationOpen(false)
    setAcknowledgedExternalCopies(false)
    runMutation.reset()

    if (wasOpen) {
      setPassword('')
      setConfirmation('')
    }
  }

  const toggleCandidate = (candidateId: string, checked: boolean) => {
    if (deletionSelectionDisabled || !eligibleIds.has(candidateId)) {
      return
    }

    setSuccessMessage(null)
    setRunRejectionNotice(null)
    resetIrreversibleRunConfirmation()
    setSelectedIds((current) => {
      const next = new Set(
        Array.from(current).filter((selectedId) => eligibleIds.has(selectedId))
      )

      if (checked) {
        if (next.size < PRIVACY_RETENTION_MAX_SELECTION) {
          next.add(candidateId)
        }
      } else {
        next.delete(candidateId)
      }

      return next
    })
  }

  const toggleAll = (checked: boolean) => {
    if (deletionSelectionDisabled) {
      return
    }
    setSuccessMessage(null)
    setRunRejectionNotice(null)
    resetIrreversibleRunConfirmation()
    setSelectedIds(checked
      ? new Set(eligibleCandidates
        .slice(0, PRIVACY_RETENTION_MAX_SELECTION)
        .map((candidate) => candidate.id))
      : new Set())
  }

  const toggleCategory = (categoryId: PrivacyRetentionCategory['id'], checked: boolean) => {
    if (deletionSelectionDisabled) {
      return
    }
    const categoryCandidateIds = eligibleCandidates
      .filter((candidate) => candidate.category === categoryId)
      .map((candidate) => candidate.id)

    setSuccessMessage(null)
    setRunRejectionNotice(null)
    resetIrreversibleRunConfirmation()
    setSelectedIds((current) => {
      const next = new Set(
        Array.from(current).filter((selectedId) => eligibleIds.has(selectedId))
      )

      categoryCandidateIds.forEach((candidateId) => {
        if (checked) {
          if (next.size < PRIVACY_RETENTION_MAX_SELECTION) {
            next.add(candidateId)
          }
        } else {
          next.delete(candidateId)
        }
      })

      return next
    })
  }

  const openRunConfirmation = () => {
    if (deletionSelectionDisabled) {
      return
    }
    closeAllActionPanels()
    setSuccessMessage(null)
    setRunRejectionNotice(null)
    setLastRunResult(null)
    setIsRunConfirmationOpen(true)
  }

  const openReview = () => {
    if (isBusy) {
      return
    }
    closeAllActionPanels()
    setSuccessMessage(null)
    setIsReviewOpen(true)
  }

  const openHold = (candidateId: string, action: 'add' | 'remove') => {
    if (isBusy) {
      return
    }
    closeAllActionPanels()
    setSuccessMessage(null)
    setActiveHold({ candidateId, action })
  }

  const handleRun = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !preview ||
      selectedCandidates.length === 0 ||
      confirmation !== preview.confirmationPhrase ||
      !acknowledgedExternalCopies
    ) {
      return
    }

    runCredentialsRef.current = { password, confirmation }
    setPassword('')
    setConfirmation('')
    runMutation.mutate({
      runReference: preview.runReference,
      snapshotToken: preview.snapshotToken,
      candidateIds: selectedCandidates.map((candidate) => candidate.id),
      acknowledgedExternalCopies: true,
      signal: runRequest.start()
    })
  }

  const handleReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !preview ||
      confirmation !== reviewConfirmationPhrase ||
      !reviewedSchedule ||
      !reviewedExternalSystems
    ) {
      return
    }

    reviewCredentialsRef.current = { password, confirmation }
    setPassword('')
    setConfirmation('')
    reviewMutation.mutate({
      runReference: preview.runReference,
      reviewedSchedule: true,
      reviewedExternalSystems: true,
      signal: reviewRequest.start()
    })
  }

  const handleAddHold = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!activeHoldCandidate || !holdReason || !holdReviewAt) {
      return
    }

    const reviewDate = new Date(`${holdReviewAt}T00:00:00.000Z`)

    if (Number.isNaN(reviewDate.getTime())) {
      return
    }

    addHoldPasswordRef.current = holdPassword
    setHoldPassword('')
    addHoldMutation.mutate({
      candidateId: activeHoldCandidate.id,
      reason: holdReason,
      reviewAt: reviewDate.toISOString(),
      signal: addHoldRequest.start()
    })
  }

  const handleRemoveHold = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!activeHoldCandidate || holdConfirmation !== releaseHoldPhrase) {
      return
    }

    removeHoldCredentialsRef.current = {
      password: holdPassword,
      confirmation: holdConfirmation
    }
    setHoldPassword('')
    setHoldConfirmation('')
    removeHoldMutation.mutate({
      candidateId: activeHoldCandidate.id,
      signal: removeHoldRequest.start()
    })
  }

  if (previewQuery.isPending) {
    return <RetentionLoadingState />
  }

  if (previewQuery.isError || !preview) {
    return (
      <div className='alert alert-error items-start' role='alert'>
        <div>
          <p className='font-semibold'>The privacy retention centre could not be loaded.</p>
          <p className='mt-1 text-sm leading-6'>No records have been changed. Check the secure connection and try again.</p>
          <button type='button' className='btn btn-outline btn-sm mt-3' onClick={() => previewQuery.refetch()}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <header className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm tablet:p-6'>
        <div className='grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center'>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='badge badge-primary badge-outline'>Privacy operations</span>
              <span className='badge badge-warning'>Irreversible deletion</span>
            </div>
            <h1 className='mt-3 text-3xl font-semibold text-base-content'>Privacy retention centre</h1>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-base-content/70'>
              Review every due record, choose exactly what may be removed and preserve evidence without exposing customer messages, health information or filenames.
            </p>
          </div>
          <div className='rounded-box border border-base-300 bg-base-200 p-4 text-sm xl:min-w-72'>
            <p className='font-semibold text-base-content'>Preview {preview.runReference}</p>
            <p className='mt-1 text-base-content/70'>Generated {formatDate(preview.generatedAt, true)}</p>
            <p className='mt-1 text-xs text-base-content/60'>Refresh before acting if the preview is no longer current.</p>
          </div>
        </div>
      </header>

      {successMessage ? <SuccessNotice>{successMessage}</SuccessNotice> : null}

      {preview.summary.failedLastRun > 0 ? (
        <div className='alert alert-warning items-start text-sm' role='alert'>
          <div>
            <p className='font-semibold'>The previous run needs attention.</p>
            <p className='mt-1 leading-6'>{preview.summary.failedLastRun} deletion {preview.summary.failedLastRun === 1 ? 'item failed' : 'items failed'}. Review the run history before starting another run.</p>
          </div>
        </div>
      ) : null}

      <section className='grid gap-3 tablet:grid-cols-2 xl:grid-cols-4' aria-label='Retention summary'>
        {[
          { label: 'Due candidates', value: preview.summary.due, hint: 'Across all candidate pages', tone: 'text-error' },
          { label: 'Due candidates held', value: preview.summary.held, hint: 'Across all candidate pages', tone: 'text-warning' },
          { label: 'Lifecycle review', value: preview.summary.needsLifecycleReview, hint: 'Needs a reliable deadline', tone: 'text-info' },
          { label: 'Last-run failures', value: preview.summary.failedLastRun, hint: 'Requires follow-up', tone: preview.summary.failedLastRun > 0 ? 'text-error' : 'text-success' }
        ].map((item) => (
          <article key={item.label} className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm'>
            <p className='text-xs uppercase tracking-wide text-base-content/60'>{item.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
            <p className='mt-2 text-sm text-base-content/60'>{item.hint}</p>
          </article>
        ))}
      </section>

      {preview.summary.needsLifecycleReview > 0 ? (
        <PrivacyRetentionLifecycleReviewQueue />
      ) : null}

      <PrivacyRetentionActiveHoldRegister />

      <section className='grid gap-4 rounded-box border border-base-300 bg-base-100 p-5 shadow-sm xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center' aria-labelledby='owner-review-heading'>
        <div>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 id='owner-review-heading' className='text-xl font-semibold text-base-content'>Owner retention review</h2>
            <span className={`badge ${getOwnerStatusBadge(preview.ownerReview.status)}`}>{formatStatus(preview.ownerReview.status)}</span>
          </div>
          <dl className='mt-3 grid gap-3 text-sm tablet:grid-cols-3'>
            <div><dt className='text-base-content/60'>Accountable owner</dt><dd className='mt-1 font-semibold'>{preview.ownerReview.ownerLabel}</dd></div>
            <div><dt className='text-base-content/60'>Last reviewed</dt><dd className='mt-1 font-semibold'>{formatDate(preview.ownerReview.lastReviewedAt)}</dd></div>
            <div><dt className='text-base-content/60'>Next review due</dt><dd className='mt-1 font-semibold'>{formatDate(preview.ownerReview.nextReviewDueAt)}</dd></div>
          </dl>
        </div>
        <button
          type='button'
          className='btn btn-outline min-h-11'
          aria-expanded={isReviewOpen}
          aria-controls={reviewPanelId}
          disabled={isBusy}
          onClick={openReview}
        >
          Record owner review
        </button>
      </section>

      {isReviewOpen ? (
        <form id={reviewPanelId} className='rounded-box border border-primary/30 bg-primary/10 p-5' onSubmit={handleReview}>
          <h2 className='text-xl font-semibold text-base-content'>Confirm owner review</h2>
          <p className='mt-2 text-sm leading-6 text-base-content/75'>
            This records that the owner reviewed the current schedule and candidate summary. It does not delete any records.
          </p>
          <fieldset className='mt-4 grid gap-3 rounded-box border border-base-300 bg-base-100 p-4'>
            <legend className='px-2 text-sm font-semibold'>Required review checks</legend>
            <label className='flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6'>
              <input
                type='checkbox'
                className='checkbox checkbox-primary mt-1'
                checked={reviewedSchedule}
                onChange={(event) => setReviewedSchedule(event.target.checked)}
                required
              />
              <span>We reviewed the retention schedule, lifecycle warnings, due candidates, legal holds and previous failures.</span>
            </label>
            <label className='flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6'>
              <input
                type='checkbox'
                className='checkbox checkbox-primary mt-1'
                checked={reviewedExternalSystems}
                onChange={(event) => setReviewedExternalSystems(event.target.checked)}
                required
              />
              <span>We checked the relevant processor accounts, mailboxes, staff devices and backup-retention obligations.</span>
            </label>
          </fieldset>
          <div className='mt-4 grid gap-4 tablet:grid-cols-2'>
            <label className='form-control w-full'>
              <span className='label-text mb-2'>Admin password</span>
              <input className='input input-bordered w-full' type='password' autoComplete='current-password' value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            <label className='form-control w-full'>
              <span className='label-text mb-2'>Type <span className='font-mono'>{reviewConfirmationPhrase}</span></span>
              <input className='input input-bordered w-full font-mono' autoComplete='off' value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
            </label>
          </div>
          {reviewMutation.isError ? <div className='alert alert-error mt-4 text-sm' role='alert'>The owner review could not be recorded safely.</div> : null}
          <div className='mt-4 flex flex-wrap gap-2'>
            <button type='submit' className='btn btn-primary' disabled={reviewMutation.isPending || password.length === 0 || confirmation !== reviewConfirmationPhrase || !reviewedSchedule || !reviewedExternalSystems}>
              {reviewMutation.isPending ? 'Recording review...' : 'Record reviewed schedule'}
            </button>
            <button type='button' className='btn btn-ghost' disabled={reviewMutation.isPending} onClick={closeAllActionPanels}>Cancel</button>
          </div>
        </form>
      ) : null}

      <section className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm' aria-labelledby='selection-heading'>
        <div className='grid gap-4 tablet:grid-cols-[minmax(0,1fr)_auto] tablet:items-center'>
          <div>
            <h2 id='selection-heading' className='text-xl font-semibold text-base-content'>Choose deletion candidates</h2>
            <p className='mt-1 text-sm leading-6 text-base-content/70'>Nothing is selected automatically. Legal holds cannot be selected.</p>
            <p className='mt-1 text-xs leading-5 text-base-content/60'>Selection applies only to this page. Each run is limited to {PRIVACY_RETENTION_MAX_SELECTION} candidates so every result can be reviewed safely.</p>
          </div>
          <SelectionCheckbox
            checked={allSelected}
            indeterminate={partiallySelected}
            disabled={eligibleCandidates.length === 0 || deletionSelectionDisabled}
            label={allSelected
              ? `Clear ${selectedCandidates.length} visible selected records`
              : eligibleCandidates.length > PRIVACY_RETENTION_MAX_SELECTION
                ? `Select first ${PRIVACY_RETENTION_MAX_SELECTION} visible due records`
                : 'Select all visible due records'}
            onChange={toggleAll}
          />
        </div>
        <div className='mt-4 flex flex-wrap items-center gap-2 border-t border-base-300 pt-4' aria-live='polite'>
          <span className='badge badge-primary badge-lg'>{selectedCandidates.length} selected</span>
          {selectedCandidates.length > 0 ? (
            <button type='button' className='btn btn-ghost btn-sm min-h-10' onClick={() => toggleAll(false)}>Clear selection</button>
          ) : null}
        </div>
      </section>

      {runRecoveryNotice ? (
        <div className='alert alert-warning items-start text-sm' role='alert'>
          <div>
            <p className='font-semibold'>Check the persisted run before taking another action</p>
            <p className='mt-1 leading-6'>{runRecoveryNotice}</p>
          </div>
        </div>
      ) : null}

      {runRejectionNotice ? (
        <div className='alert alert-warning items-start text-sm' role='alert'>
          <div>
            <p className='font-semibold'>Deletion request rejected</p>
            <p className='mt-1 leading-6'>{runRejectionNotice}</p>
          </div>
        </div>
      ) : null}

      <nav className='flex flex-wrap items-center justify-between gap-3 rounded-box border border-base-300 bg-base-100 p-4' aria-label='Retention candidate pages'>
        <p className='text-sm text-base-content/75'>
          Page {preview.pagination.page} of {preview.pagination.totalPages}{' '}
          ({preview.pagination.totalCandidates} candidates globally). Changing page clears the current selection.
        </p>
        <div className='join'>
          <button
            type='button'
            className='btn btn-outline btn-sm join-item min-h-10'
            disabled={!preview.pagination.hasPrevious || isBusy}
            onClick={() => changePage(preview.pagination.page - 1)}
          >
            Previous
          </button>
          <button
            type='button'
            className='btn btn-outline btn-sm join-item min-h-10'
            disabled={!preview.pagination.hasMore || isBusy}
            onClick={() => changePage(preview.pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </nav>

      {preview.candidates.length === 0 ? (
        <section className='rounded-box border border-dashed border-base-300 bg-base-100 p-8 text-center' aria-label='No deletion candidates'>
          <p className='text-lg font-semibold text-base-content'>No records are due for deletion</p>
          <p className='mt-2 text-sm leading-6 text-base-content/70'>Record the owner review if the schedule and external systems have also been checked.</p>
        </section>
      ) : (
        <div className='grid gap-4'>
          {preview.categories.map((category) => (
            <CandidateGroup
              key={category.id}
              category={category}
              categoryCount={preview.categoryCounts.find(
                (count) => count.category === category.id
              ) || { category: category.id, total: 0, due: 0, held: 0 }}
              candidates={preview.candidates.filter((candidate) => candidate.category === category.id)}
              selectedIds={selectedIds}
              onToggleCategory={toggleCategory}
              onToggleCandidate={toggleCandidate}
              onOpenHold={openHold}
              selectionAtLimit={selectedCandidates.length >= PRIVACY_RETENTION_MAX_SELECTION}
              selectionDisabled={deletionSelectionDisabled}
              disabled={isBusy}
            />
          ))}
        </div>
      )}

      {activeHold && activeHoldCandidate ? (
        <section id={holdPanelId} className='rounded-box border border-warning/40 bg-warning/10 p-5' aria-labelledby='hold-action-heading'>
          <h2 id='hold-action-heading' className='text-xl font-semibold text-base-content'>
            {activeHold.action === 'add' ? 'Place legal hold' : 'Review or release legal hold'}
          </h2>
          <p className='mt-2 text-sm leading-6 text-base-content/75'>
            {activeHoldCandidate.recordType} <span className='font-mono'>{activeHoldCandidate.recordReference}</span>. A hold prevents this candidate from being included in a deletion run.
          </p>
          {activeHold.action === 'add' ? (
            <div className='mt-4 grid gap-4'>
              <form className='grid gap-4' onSubmit={handleAddHold}>
                <div className='grid gap-4 tablet:grid-cols-3'>
                  <label className='form-control w-full'>
                    <span className='label-text mb-2'>Documented reason</span>
                    <select className='select select-bordered w-full' value={holdReason} onChange={(event) => setHoldReason(event.target.value as PrivacyRetentionHoldReason | '')} required>
                      <option value=''>Choose a reason</option>
                      {holdReasons.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
                    </select>
                  </label>
                  <label className='form-control w-full'>
                    <span className='label-text mb-2'>Hold review date</span>
                    <input className='input input-bordered w-full' type='date' value={holdReviewAt} onChange={(event) => setHoldReviewAt(event.target.value)} required />
                  </label>
                  <label className='form-control w-full'>
                    <span className='label-text mb-2'>Admin password</span>
                    <input className='input input-bordered w-full' type='password' autoComplete='current-password' value={holdPassword} onChange={(event) => setHoldPassword(event.target.value)} required />
                  </label>
                </div>
                {addHoldMutation.isError ? <div className='alert alert-error text-sm' role='alert'>The legal hold could not be recorded safely.</div> : null}
                <div className='flex flex-wrap gap-2'>
                  <button type='submit' className='btn btn-warning' disabled={addHoldMutation.isPending || !holdReason || !holdReviewAt || holdPassword.length === 0}>
                    {addHoldMutation.isPending ? 'Recording hold...' : 'Record legal hold'}
                  </button>
                  <button type='button' className='btn btn-ghost' disabled={addHoldMutation.isPending} onClick={closeAllActionPanels}>Cancel</button>
                </div>
              </form>
              <PrivacyRetentionExpiredClaimHoldRecoveryForm
                candidateId={activeHoldCandidate.id}
                recordReference={activeHoldCandidate.recordReference}
              />
            </div>
          ) : (
            <form className='mt-4 grid gap-4' onSubmit={handleRemoveHold}>
              <div className='alert alert-warning items-start text-sm' role='alert'>
                Releasing the hold does not delete anything. It only makes this candidate selectable again after a fresh preview.
              </div>
              <div className='grid gap-4 tablet:grid-cols-2'>
                <label className='form-control w-full'>
                  <span className='label-text mb-2'>Admin password</span>
                  <input className='input input-bordered w-full' type='password' autoComplete='current-password' value={holdPassword} onChange={(event) => setHoldPassword(event.target.value)} required />
                </label>
                <label className='form-control w-full'>
                  <span className='label-text mb-2'>Type <span className='font-mono'>{releaseHoldPhrase}</span></span>
                  <input className='input input-bordered w-full font-mono' autoComplete='off' value={holdConfirmation} onChange={(event) => setHoldConfirmation(event.target.value)} required />
                </label>
              </div>
              {removeHoldMutation.isError ? <div className='alert alert-error text-sm' role='alert'>The legal hold could not be released safely.</div> : null}
              <div className='flex flex-wrap gap-2'>
                <button type='submit' className='btn btn-warning' disabled={removeHoldMutation.isPending || holdPassword.length === 0 || holdConfirmation !== releaseHoldPhrase}>
                  {removeHoldMutation.isPending ? 'Releasing hold...' : 'Release legal hold'}
                </button>
                <button type='button' className='btn btn-ghost' disabled={removeHoldMutation.isPending} onClick={closeAllActionPanels}>Cancel</button>
              </div>
            </form>
          )}
        </section>
      ) : null}

      <section className='rounded-box border border-error/30 bg-error/10 p-5' aria-labelledby='deletion-action-heading'>
        <div className='grid gap-4 tablet:grid-cols-[minmax(0,1fr)_auto] tablet:items-center'>
          <div>
            <h2 id='deletion-action-heading' className='text-xl font-semibold text-base-content'>Confirm a selective deletion run</h2>
            <p className='mt-1 text-sm leading-6 text-base-content/75'>
              Continue only after opening the data-effect disclosure for each selected candidate. The next step requires the admin password and the exact generated phrase.
            </p>
          </div>
          <button
            type='button'
            className='btn btn-error min-h-11'
            aria-expanded={isRunConfirmationOpen}
            aria-controls={runPanelId}
            disabled={selectedCandidates.length === 0 || deletionSelectionDisabled}
            onClick={openRunConfirmation}
          >
            Review {selectedCandidates.length} selected {selectedCandidates.length === 1 ? 'candidate' : 'candidates'}
          </button>
        </div>

        {isRunConfirmationOpen ? (
          <form id={runPanelId} className='mt-5 border-t border-error/30 pt-5' onSubmit={handleRun}>
            <h3 className='text-lg font-semibold text-base-content'>Final irreversible-deletion check</h3>
            <div className='mt-3 rounded-box border border-base-300 bg-base-100 p-4'>
              <p className='text-sm font-semibold'>{selectedCandidates.length} selected deletion {selectedCandidates.length === 1 ? 'candidate' : 'candidates'}</p>
              <ul className='mt-3 grid gap-2 text-sm tablet:grid-cols-2'>
                {selectedCandidates.map((candidate) => (
                  <li key={candidate.id} className='rounded-box border border-base-300 p-3'>
                    <p>
                      <span className='font-semibold'>{candidate.recordType}</span>{' '}
                      <span className='font-mono text-xs'>{candidate.recordReference}</span>
                    </p>
                    <p className='mt-1 text-xs text-base-content/70'>Affected items: {candidate.itemCount}</p>
                    <p className='mt-2 text-xs font-semibold uppercase tracking-wide text-error'>Removes</p>
                    <ul className='mt-1 list-disc space-y-1 pl-5 text-xs leading-5 text-base-content/75'>
                      {candidate.removes.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    <p className='mt-2 text-xs font-semibold uppercase tracking-wide text-base-content/60'>Retains</p>
                    {candidate.retains.length > 0 ? (
                      <ul className='mt-1 list-disc space-y-1 pl-5 text-xs leading-5 text-base-content/75'>
                        {candidate.retains.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    ) : (
                      <p className='mt-1 text-xs text-base-content/70'>Nothing from this candidate.</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className='alert alert-warning mt-4 items-start text-sm' role='note'>
              <div>
                <p className='font-semibold'>Independent copies are not removed by this run</p>
                <p className='mt-1 leading-6'>
                  Check Resend and mailboxes, Telegram, staff devices, processor logs and backup expiry separately. Deleted live data can remain in protected backups until those backups expire.
                </p>
              </div>
            </div>
            <label className='mt-4 flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6 text-base-content'>
              <input
                type='checkbox'
                className='checkbox checkbox-error mt-1 shrink-0'
                checked={acknowledgedExternalCopies}
                onChange={(event) => setAcknowledgedExternalCopies(event.target.checked)}
                required
              />
              <span>I understand that this run removes only the live records listed above and that processor copies, staff-held copies and protected backups require separate review.</span>
            </label>
            <div className='mt-4 grid gap-4 tablet:grid-cols-2'>
              <label className='form-control w-full'>
                <span className='label-text mb-2'>Admin password</span>
                <input className='input input-bordered w-full' type='password' autoComplete='current-password' value={password} onChange={(event) => setPassword(event.target.value)} required />
              </label>
              <label className='form-control w-full'>
                <span className='label-text mb-2'>Type <span className='font-mono'>{preview.confirmationPhrase}</span></span>
                <input className='input input-bordered w-full font-mono' autoComplete='off' value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
              </label>
            </div>
            <div className='mt-4 flex flex-wrap gap-2'>
              <button type='submit' className='btn btn-error' disabled={runMutation.isPending || password.length === 0 || confirmation !== preview.confirmationPhrase || selectedCandidates.length === 0 || !acknowledgedExternalCopies}>
                {runMutation.isPending ? 'Deleting selected records...' : 'Permanently delete selected records'}
              </button>
              <button type='button' className='btn btn-ghost' disabled={runMutation.isPending} onClick={closeAllActionPanels}>Cancel</button>
            </div>
          </form>
        ) : null}
      </section>

      {lastRunResult ? (
        <section className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm' aria-labelledby='last-retention-result-heading'>
          <h2 id='last-retention-result-heading' className='text-xl font-semibold text-base-content'>Latest selected-run results</h2>
          <p className='mt-1 text-sm leading-6 text-base-content/70'>Run <span className='font-mono'>{lastRunResult.runReference}</span>. Review every outcome before leaving this page.</p>
          <ul className='mt-4 grid gap-2'>
            {lastRunResult.results.map((result) => (
              <li key={result.candidateId} className='rounded-box border border-base-300 p-3 text-sm'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <span className='font-mono text-xs'>{result.candidateId}</span>
                  <span className={`badge ${result.status === 'deleted' ? 'badge-success' : result.status === 'skipped' ? 'badge-warning' : 'badge-error'}`}>{formatStatus(result.status)}</span>
                </div>
                <p className='mt-2 leading-6 text-base-content/75'>{result.message}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <RunHistory history={preview.history} />
    </div>
  )
}
