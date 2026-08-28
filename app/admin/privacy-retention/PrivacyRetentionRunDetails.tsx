'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent
} from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormFieldError } from '@/app/components/forms/FormFieldError'
import { useAbortableRequest } from '@/app/hooks/useAbortableRequest'
import {
  assessPrivacyRetentionRunAudit,
  type PrivacyRetentionRunActionDetail,
  type PrivacyRetentionRunActionOutcome,
  type PrivacyRetentionRunDetailMode,
  type PrivacyRetentionRunDetails,
  type PrivacyRetentionRunDetailStatus
} from '@/lib/privacy-retention/run-details-contract'
import { resumePrivacyRetentionRun } from './privacy-retention-api'

const runReferencePattern = /^RET-\d{8}-[A-F0-9]{8}$/
const safeCandidateIdPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/
const safeReferencePattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/
const safeSlugPattern = /^[a-z][a-z0-9-]{0,63}$/
const safeRecordTypePattern = /^[A-Za-z][A-Za-z0-9 -]{0,95}$/
const safeErrorCodePattern = /^[A-Z][A-Z0-9_]{0,63}$/

const modes: PrivacyRetentionRunDetailMode[] = [
  'discovery',
  'manual',
  'owner-review'
]
const statuses: PrivacyRetentionRunDetailStatus[] = [
  'pending',
  'running',
  'completed',
  'partial',
  'failed'
]
const outcomes: PrivacyRetentionRunActionOutcome[] = [
  'pending',
  'deleted',
  'skipped',
  'failed'
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0

const isTimestamp = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 64 && !Number.isNaN(Date.parse(value))

const isMode = (value: unknown): value is PrivacyRetentionRunDetailMode =>
  typeof value === 'string' && modes.includes(value as PrivacyRetentionRunDetailMode)

const isStatus = (value: unknown): value is PrivacyRetentionRunDetailStatus =>
  typeof value === 'string' && statuses.includes(value as PrivacyRetentionRunDetailStatus)

const isOutcome = (value: unknown): value is PrivacyRetentionRunActionOutcome =>
  typeof value === 'string' && outcomes.includes(value as PrivacyRetentionRunActionOutcome)

const parseAction = (value: unknown): PrivacyRetentionRunActionDetail | null => {
  if (
    !isRecord(value) ||
    typeof value.candidateId !== 'string' ||
    !safeCandidateIdPattern.test(value.candidateId) ||
    typeof value.category !== 'string' ||
    !safeSlugPattern.test(value.category) ||
    typeof value.recordType !== 'string' ||
    !safeRecordTypePattern.test(value.recordType) ||
    typeof value.recordReference !== 'string' ||
    !safeReferencePattern.test(value.recordReference) ||
    typeof value.action !== 'string' ||
    !safeSlugPattern.test(value.action) ||
    !isOutcome(value.outcome) ||
    !(
      (value.outcome === 'failed' && typeof value.errorCode === 'string' && safeErrorCodePattern.test(value.errorCode)) ||
      (value.outcome !== 'failed' && value.errorCode === null)
    ) ||
    !isTimestamp(value.occurredAt)
  ) {
    return null
  }

  return {
    candidateId: value.candidateId,
    category: value.category,
    recordType: value.recordType,
    recordReference: value.recordReference,
    action: value.action,
    outcome: value.outcome,
    errorCode: value.errorCode,
    occurredAt: value.occurredAt
  }
}

const parseRunDetails = (value: unknown): PrivacyRetentionRunDetails | null => {
  if (
    !isRecord(value) ||
    typeof value.runReference !== 'string' ||
    !runReferencePattern.test(value.runReference) ||
    !isMode(value.mode) ||
    !isStatus(value.status) ||
    !isTimestamp(value.startedAt) ||
    !(value.completedAt === null || isTimestamp(value.completedAt)) ||
    !isTimestamp(value.updatedAt) ||
    !isRecord(value.counts) ||
    !isNonNegativeInteger(value.counts.candidates) ||
    !isNonNegativeInteger(value.counts.selected) ||
    !isNonNegativeInteger(value.counts.succeeded) ||
    !isNonNegativeInteger(value.counts.skipped) ||
    !isNonNegativeInteger(value.counts.failed) ||
    typeof value.auditInitialisationIncomplete !== 'boolean' ||
    !Array.isArray(value.actions) ||
    value.counts.selected > value.counts.candidates ||
    value.counts.succeeded + value.counts.skipped + value.counts.failed > value.counts.selected ||
    (
      (value.status === 'pending' || value.status === 'running')
        ? value.completedAt !== null
        : value.completedAt === null
    )
  ) {
    return null
  }

  const actions = value.actions.map(parseAction)
  if (actions.some((action) => action === null)) {
    return null
  }

  const details: PrivacyRetentionRunDetails = {
    runReference: value.runReference,
    mode: value.mode,
    status: value.status,
    startedAt: value.startedAt,
    completedAt: value.completedAt,
    updatedAt: value.updatedAt,
    counts: {
      candidates: value.counts.candidates,
      selected: value.counts.selected,
      succeeded: value.counts.succeeded,
      skipped: value.counts.skipped,
      failed: value.counts.failed
    },
    auditInitialisationIncomplete: value.auditInitialisationIncomplete,
    actions: actions as PrivacyRetentionRunActionDetail[]
  }

  const assessment = assessPrivacyRetentionRunAudit(details)
  if (
    !assessment.valid ||
    assessment.auditInitialisationIncomplete !== details.auditInitialisationIncomplete
  ) {
    return null
  }

  return details
}

const fetchRunDetails = async (
  runReference: string,
  signal: AbortSignal
): Promise<PrivacyRetentionRunDetails> => {
  const response = await fetch(
    `/api/admin/privacy-retention/runs/${encodeURIComponent(runReference)}`,
    {
      credentials: 'include',
      signal
    }
  )

  if (!response.ok) {
    throw new Error('The retention run details could not be loaded.')
  }

  const details = parseRunDetails(await response.json().catch((): unknown => null))
  if (!details || details.runReference !== runReference) {
    throw new Error('The retention run details response was invalid.')
  }

  return details
}

const formatLabel = (value: string) => value
  .split('-')
  .filter(Boolean)
  .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
  .join(' ')

const formatDate = (value: string | null) => {
  if (!value) {
    return 'Not completed'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date)
}

const getOutcomeBadge = (outcome: PrivacyRetentionRunActionOutcome) => {
  if (outcome === 'deleted') {
    return 'badge-success'
  }
  if (outcome === 'pending') {
    return 'badge-info'
  }
  if (outcome === 'skipped') {
    return 'badge-warning'
  }
  return 'badge-error'
}

export function PrivacyRetentionRunDetailsView({
  runReference
}: {
  runReference: string
}) {
  const titleId = useId()
  const descriptionId = useId()
  const resumePasswordId = useId()
  const resumeConfirmationId = useId()
  const resumeErrorId = useId()
  const queryClient = useQueryClient()
  const resumeRequest = useAbortableRequest()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const resumeTriggerRef = useRef<HTMLButtonElement>(null)
  const resumePasswordRef = useRef<HTMLInputElement>(null)
  const resumeSuccessRef = useRef<HTMLDivElement>(null)
  const resumePendingRef = useRef(false)
  const resumeCredentialsRef = useRef<{
    password: string
    confirmation: string
  } | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isResumeOpen, setIsResumeOpen] = useState(false)
  const [resumePassword, setResumePassword] = useState('')
  const [resumeConfirmation, setResumeConfirmation] = useState('')
  const [resumeSuccess, setResumeSuccess] = useState('')
  const resumePhrase = `RESUME ${runReference}`
  const runQueryKey = ['admin', 'privacy-retention', 'run-details', runReference] as const
  const query = useQuery({
    queryKey: runQueryKey,
    queryFn: ({ signal }) => fetchRunDetails(runReference, signal),
    enabled: isOpen,
    staleTime: 0
  })
  const resumeMutation = useMutation({
    mutationFn: (variables: { runReference: string, signal: AbortSignal }) => {
      const credentials = resumeCredentialsRef.current
      if (!credentials) {
        throw new Error('Resume credentials are unavailable.')
      }

      return resumePrivacyRetentionRun({
        ...variables,
        ...credentials
      })
    },
    onSuccess: async (result) => {
      resumeCredentialsRef.current = null
      setResumePassword('')
      setResumeConfirmation('')
      setIsResumeOpen(false)
      setResumeSuccess(
        `Run ${result.runReference} finished with status ${formatLabel(result.status)}: ${result.succeededCount} deleted, ${result.failedCount} failed and ${result.selectedCount - result.succeededCount - result.failedCount} skipped.`
      )
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'privacy-retention']
      })
    },
    onError: () => {
      resumeCredentialsRef.current = null
      setResumePassword('')
      setResumeConfirmation('')
    },
    onSettled: () => {
      resumeCredentialsRef.current = null
    }
  })
  const resetResumeMutation = resumeMutation.reset
  resumePendingRef.current = resumeMutation.isPending

  useEffect(() => () => {
    resumeCredentialsRef.current = null
  }, [])

  useEffect(() => {
    if (isResumeOpen && !resumeMutation.isPending) {
      resumePasswordRef.current?.focus()
    }
  }, [isResumeOpen, resumeMutation.isError, resumeMutation.isPending])

  useEffect(() => {
    if (resumeSuccess) {
      resumeSuccessRef.current?.focus()
    }
  }, [resumeSuccess])

  const close = useCallback(() => {
    if (resumePendingRef.current) {
      return
    }
    const dialog = dialogRef.current
    if (dialog?.open && typeof dialog.close === 'function') {
      dialog.close()
    } else {
      dialog?.removeAttribute('open')
    }
    resumeCredentialsRef.current = null
    setResumePassword('')
    setResumeConfirmation('')
    setIsResumeOpen(false)
    setResumeSuccess('')
    resetResumeMutation()
    setIsOpen(false)
    triggerRef.current?.focus()
  }, [resetResumeMutation])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal()
      } else {
        dialog.setAttribute('open', '')
      }
    }
    closeRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !resumePendingRef.current) {
        event.preventDefault()
        close()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [close, isOpen])

  const cancelResume = () => {
    if (resumeMutation.isPending) {
      return
    }
    resumeCredentialsRef.current = null
    setResumePassword('')
    setResumeConfirmation('')
    setIsResumeOpen(false)
    resumeMutation.reset()
    resumeTriggerRef.current?.focus()
  }

  const handleResume = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResumeSuccess('')

    if (
      resumePassword.length === 0 ||
      resumeConfirmation !== resumePhrase ||
      resumeMutation.isPending
    ) {
      return
    }

    resumeCredentialsRef.current = {
      password: resumePassword,
      confirmation: resumeConfirmation
    }
    setResumePassword('')
    setResumeConfirmation('')
    resumeMutation.mutate({
      runReference,
      signal: resumeRequest.start()
    })
  }

  return (
    <>
      <button
        ref={triggerRef}
        type='button'
        className='btn btn-outline btn-sm whitespace-nowrap'
        aria-haspopup='dialog'
        onClick={() => setIsOpen(true)}
      >
        View results
      </button>

      {isOpen ? (
        <dialog
          ref={dialogRef}
          className='modal modal-open'
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          onCancel={(event) => {
            event.preventDefault()
            close()
          }}
        >
          <div className='modal-box max-h-[min(90vh,56rem)] max-w-5xl overflow-y-auto rounded-box'>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0'>
                <h2 id={titleId} className='text-xl font-semibold text-base-content'>Retention run results</h2>
                <p id={descriptionId} className='mt-1 break-all font-mono text-xs text-base-content/65'>{runReference}</p>
              </div>
              <button
                ref={closeRef}
                type='button'
                className='btn btn-circle btn-ghost btn-sm shrink-0'
                aria-label='Close run results'
                disabled={resumeMutation.isPending}
                onClick={close}
              >
                <svg viewBox='0 0 24 24' className='h-4 w-4 stroke-current' fill='none' aria-hidden='true'>
                  <path d='M6 6l12 12M18 6L6 18' strokeWidth='2' strokeLinecap='round' />
                </svg>
              </button>
            </div>

            {query.isLoading ? (
              <div className='mt-6 grid gap-3' role='status' aria-label='Loading retention run results'>
                <div className='skeleton h-24 w-full rounded-box' />
                <div className='skeleton h-40 w-full rounded-box' />
                <span className='sr-only'>Loading retention run results...</span>
              </div>
            ) : null}

            {query.isError ? (
              <div className='alert alert-error mt-6 items-start text-sm' role='alert'>
                <div>
                  <p className='font-semibold'>The retention run results could not be loaded.</p>
                  <p className='mt-1 leading-6'>No execution was retried. Check the connection and try loading this audit record again.</p>
                  <button
                    type='button'
                    className='btn btn-outline btn-sm mt-3'
                    disabled={query.isFetching}
                    onClick={() => void query.refetch()}
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : null}

            {query.data ? (
              <div className='mt-6 grid gap-5'>
                <dl className='grid gap-3 rounded-box border border-base-300 bg-base-200/40 p-4 text-sm tablet:grid-cols-3'>
                  <div><dt className='text-base-content/60'>Mode</dt><dd className='mt-1 font-semibold'>{formatLabel(query.data.mode)}</dd></div>
                  <div><dt className='text-base-content/60'>Status</dt><dd className='mt-1 font-semibold'>{formatLabel(query.data.status)}</dd></div>
                  <div><dt className='text-base-content/60'>Last updated</dt><dd className='mt-1 font-semibold'>{formatDate(query.data.updatedAt)}</dd></div>
                  <div><dt className='text-base-content/60'>Started</dt><dd className='mt-1'>{formatDate(query.data.startedAt)}</dd></div>
                  <div><dt className='text-base-content/60'>Completed</dt><dd className='mt-1'>{formatDate(query.data.completedAt)}</dd></div>
                  <div>
                    <dt className='text-base-content/60'>Candidates / selected</dt>
                    <dd className='mt-1 tabular-nums'>{query.data.counts.candidates} / {query.data.counts.selected}</dd>
                  </div>
                  <div><dt className='text-base-content/60'>Deleted</dt><dd className='mt-1 tabular-nums'>{query.data.counts.succeeded}</dd></div>
                  <div><dt className='text-base-content/60'>Skipped</dt><dd className='mt-1 tabular-nums'>{query.data.counts.skipped}</dd></div>
                  <div><dt className='text-base-content/60'>Failed</dt><dd className='mt-1 tabular-nums'>{query.data.counts.failed}</dd></div>
                </dl>

                {resumeSuccess ? (
                  <div
                    ref={resumeSuccessRef}
                    className='alert alert-success w-full items-start text-sm'
                    role='status'
                    aria-live='polite'
                    tabIndex={-1}
                  >
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 shrink-0 stroke-current' fill='none' viewBox='0 0 24 24' aria-hidden='true'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    <div className='min-w-0'>
                      <p className='font-semibold'>Persisted run finalised</p>
                      <p className='mt-1 leading-6'>{resumeSuccess}</p>
                    </div>
                  </div>
                ) : null}

                {query.data.auditInitialisationIncomplete ? (
                  <div className='alert alert-warning w-full items-start text-sm' role='alert'>
                    <svg viewBox='0 0 24 24' className='h-5 w-5 shrink-0 stroke-current' fill='none' aria-hidden='true'>
                      <path d='M12 9v4m0 4h.01M10.3 4.6l-7.7 13.3A1.4 1.4 0 003.8 20h16.4a1.4 1.4 0 001.2-2.1L13.7 4.6a2 2 0 00-3.4 0z' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                    <div>
                      <p className='font-semibold'>Audit initialisation incomplete</p>
                      <p className='mt-1 leading-6'>
                        {query.data.actions.length} of {query.data.counts.selected} selected item-level audit records {query.data.actions.length === 1 ? 'is' : 'are'} available. Do not retry or treat these results as complete. Refresh until every selected action is present, or escalate the run for recovery.
                      </p>
                    </div>
                  </div>
                ) : null}

                {query.data.mode === 'manual' &&
                query.data.status === 'running' &&
                !query.data.auditInitialisationIncomplete ? (
                  <section className='rounded-box border border-warning/40 bg-warning/10 p-4' aria-labelledby={`${titleId}-resume-heading`}>
                    <div className='flex flex-wrap items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <h3 id={`${titleId}-resume-heading`} className='font-semibold text-base-content'>Persisted run needs resumption</h3>
                        <p className='mt-1 text-sm leading-6 text-base-content/75'>
                          This resumes only the {query.data.actions.filter((action) => action.outcome === 'pending').length} pending {query.data.actions.filter((action) => action.outcome === 'pending').length === 1 ? 'item' : 'items'} from the exact saved selection. Completed outcomes and immutable revision evidence are reused. The selection cannot be expanded or replaced here.
                        </p>
                      </div>
                      {!isResumeOpen ? (
                        <button
                          ref={resumeTriggerRef}
                          type='button'
                          className='btn btn-warning btn-sm min-h-11'
                          aria-expanded='false'
                          aria-controls={`${titleId}-resume-form`}
                          onClick={() => {
                            resumeMutation.reset()
                            setResumeSuccess('')
                            setIsResumeOpen(true)
                          }}
                        >
                          Review and resume
                        </button>
                      ) : null}
                    </div>

                    {isResumeOpen ? (
                      <form
                        id={`${titleId}-resume-form`}
                        className='mt-4 grid gap-4 border-t border-warning/30 pt-4'
                        onSubmit={handleResume}
                      >
                        <p className='text-sm leading-6 text-base-content/75'>
                          Check the pending rows below, then enter the admin password and exact phrase. A server-side revision and legal-hold check runs again before each pending action.
                        </p>
                        <div className='grid gap-4 tablet:grid-cols-2'>
                          <label className='form-control w-full' htmlFor={resumePasswordId}>
                            <span className='label-text mb-2'>Admin password</span>
                            <input
                              ref={resumePasswordRef}
                              id={resumePasswordId}
                              className={`input input-bordered w-full ${resumeMutation.isError ? 'input-error' : ''}`}
                              type='password'
                              value={resumePassword}
                              onChange={(event) => setResumePassword(event.target.value)}
                              autoComplete='current-password'
                              aria-describedby={resumeMutation.isError ? resumeErrorId : undefined}
                              required
                            />
                          </label>
                          <label className='form-control w-full' htmlFor={resumeConfirmationId}>
                            <span className='label-text mb-2'>Type <span className='break-all font-mono'>{resumePhrase}</span></span>
                            <input
                              id={resumeConfirmationId}
                              className={`input input-bordered w-full font-mono ${resumeMutation.isError ? 'input-error' : ''}`}
                              value={resumeConfirmation}
                              onChange={(event) => setResumeConfirmation(event.target.value)}
                              autoComplete='off'
                              aria-describedby={resumeMutation.isError ? resumeErrorId : undefined}
                              required
                            />
                          </label>
                        </div>
                        {resumeMutation.isError ? (
                          <FormFieldError
                            id={resumeErrorId}
                            message='The persisted run could not be resumed safely. Re-enter both fields, refresh the audit record and investigate before trying again.'
                          />
                        ) : null}
                        <div className='flex flex-wrap gap-2'>
                          <button
                            type='submit'
                            className='btn btn-warning min-h-11'
                            disabled={
                              resumeMutation.isPending ||
                              resumePassword.length === 0 ||
                              resumeConfirmation !== resumePhrase
                            }
                          >
                            {resumeMutation.isPending ? 'Resuming persisted run...' : 'Resume pending items'}
                          </button>
                          <button
                            type='button'
                            className='btn btn-ghost min-h-11'
                            disabled={resumeMutation.isPending}
                            onClick={cancelResume}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </section>
                ) : null}

                {query.data.actions.length === 0 ? (
                  query.data.auditInitialisationIncomplete ? null : (
                    <div className='rounded-box border border-dashed border-base-300 p-5 text-sm text-base-content/70'>
                      No item-level actions were recorded for this run. Discovery and owner-review runs normally have no deletion actions.
                    </div>
                  )
                ) : (
                  <div className='overflow-x-auto rounded-box border border-base-300'>
                    <table className='table'>
                      <caption className='sr-only'>Safe item-level outcomes for {runReference}</caption>
                      <thead>
                        <tr>
                          <th>Record</th>
                          <th>Category and action</th>
                          <th>Outcome</th>
                          <th>Recorded</th>
                        </tr>
                      </thead>
                      <tbody>
                        {query.data.actions.map((action, index) => (
                          <tr key={`${action.candidateId}-${action.occurredAt}-${index}`}>
                            <td>
                              <p className='font-semibold'>{action.recordType}</p>
                              <p className='mt-1 font-mono text-xs'>{action.recordReference}</p>
                              <p className='mt-1 break-all font-mono text-xs text-base-content/55'>{action.candidateId}</p>
                            </td>
                            <td>
                              <p>{formatLabel(action.category)}</p>
                              <p className='mt-1 text-xs text-base-content/60'>{formatLabel(action.action)}</p>
                            </td>
                            <td>
                              <span className={`badge ${getOutcomeBadge(action.outcome)}`}>{formatLabel(action.outcome)}</span>
                              {action.errorCode ? <p className='mt-2 font-mono text-xs text-error'>{action.errorCode}</p> : null}
                            </td>
                            <td>{formatDate(action.occurredAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}

            <div className='modal-action'>
              {query.data ? (
                <button
                  type='button'
                  className='btn btn-outline'
                  disabled={query.isFetching || resumeMutation.isPending}
                  onClick={() => void query.refetch()}
                >
                  {query.isFetching ? 'Refreshing...' : 'Refresh results'}
                </button>
              ) : null}
              <button type='button' className='btn' disabled={resumeMutation.isPending} onClick={close}>Close</button>
            </div>
          </div>
          <button
            type='button'
            className='modal-backdrop'
            aria-label='Close run results'
            disabled={resumeMutation.isPending}
            onClick={close}
          />
        </dialog>
      ) : null}
    </>
  )
}
