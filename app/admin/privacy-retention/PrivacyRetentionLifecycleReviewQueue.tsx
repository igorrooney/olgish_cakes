'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormFieldError } from '@/app/components/forms/FormFieldError'
import { useAbortableRequest } from '@/app/hooks/useAbortableRequest'
import type {
  PrivacyRetentionLifecycleIssue,
  PrivacyRetentionLifecycleIssueCode,
  PrivacyRetentionLifecycleIssuePage
} from '@/lib/privacy-retention/lifecycle-review'

const pageSize = 20

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const issueCodes: PrivacyRetentionLifecycleIssueCode[] = [
  'stale-open-enquiry',
  'missing-enquiry-deadline',
  'event-files-cleared-open',
  'missing-order-deadline'
]

const recordTypes: PrivacyRetentionLifecycleIssue['recordType'][] = [
  'contact',
  'custom-cake',
  'workshop',
  'event-photo',
  'order'
]

const parseIssue = (value: unknown): PrivacyRetentionLifecycleIssue | null => {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.recordType !== 'string' ||
    !recordTypes.includes(value.recordType as PrivacyRetentionLifecycleIssue['recordType']) ||
    typeof value.recordReference !== 'string' ||
    typeof value.createdAt !== 'string' ||
    typeof value.issueCode !== 'string' ||
    !issueCodes.includes(value.issueCode as PrivacyRetentionLifecycleIssueCode) ||
    typeof value.issueLabel !== 'string' ||
    !(value.detailHref === undefined || typeof value.detailHref === 'string') ||
    (value.action !== 'open-detail' && value.action !== 'close-event-now')
  ) {
    return null
  }

  return {
    id: value.id,
    recordType: value.recordType as PrivacyRetentionLifecycleIssue['recordType'],
    recordReference: value.recordReference,
    createdAt: value.createdAt,
    issueCode: value.issueCode as PrivacyRetentionLifecycleIssueCode,
    issueLabel: value.issueLabel,
    ...(value.detailHref ? { detailHref: value.detailHref } : {}),
    action: value.action
  }
}

const parsePage = (value: unknown): PrivacyRetentionLifecycleIssuePage | null => {
  if (
    !isRecord(value) ||
    !Array.isArray(value.issues) ||
    typeof value.page !== 'number' ||
    typeof value.pageSize !== 'number' ||
    typeof value.hasMore !== 'boolean'
  ) {
    return null
  }

  const issues = value.issues.map(parseIssue)
  if (issues.some((issue) => issue === null)) {
    return null
  }

  return {
    issues: issues as PrivacyRetentionLifecycleIssue[],
    page: value.page,
    pageSize: value.pageSize,
    hasMore: value.hasMore
  }
}

const fetchIssues = async (page: number, signal: AbortSignal) => {
  const response = await fetch(
    `/api/admin/privacy-retention/lifecycle-issues?page=${page}&pageSize=${pageSize}`,
    { credentials: 'include', signal }
  )
  if (!response.ok) {
    throw new Error('The lifecycle-review queue could not be loaded.')
  }

  const parsed = parsePage(await response.json().catch((): unknown => null))
  if (!parsed) {
    throw new Error('The lifecycle-review response was invalid.')
  }
  return parsed
}

const closeEventRequest = async (input: {
  requestId: string
  password: string
  confirmation: string
  signal: AbortSignal
}) => {
  const response = await fetch(
    `/api/admin/privacy-retention/lifecycle-issues/event-photo/${encodeURIComponent(input.requestId)}/close`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        password: input.password,
        confirmation: input.confirmation
      }),
      signal: input.signal
    }
  )
  const body: unknown = await response.json().catch((): unknown => null)
  if (!response.ok || !isRecord(body) || body.status !== 'closed') {
    throw new Error(isRecord(body) && typeof body.error === 'string'
      ? body.error
      : 'The event-photo lifecycle could not be updated safely.')
  }
}

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
}

const getEventRequestId = (issue: PrivacyRetentionLifecycleIssue) => {
  const prefix = 'event-photo-'
  return issue.recordReference.startsWith(prefix)
    ? issue.recordReference.slice(prefix.length)
    : ''
}

export function PrivacyRetentionLifecycleReviewQueue() {
  const passwordId = useId()
  const confirmationId = useId()
  const errorId = useId()
  const queryClient = useQueryClient()
  const closeRequest = useAbortableRequest()
  const credentialsRef = useRef<{ password: string, confirmation: string } | null>(null)
  const disclosureTriggerRef = useRef<HTMLButtonElement | null>(null)
  const shouldRestoreFocusRef = useRef(false)
  const [page, setPage] = useState(1)
  const [activeIssue, setActiveIssue] = useState<PrivacyRetentionLifecycleIssue | null>(null)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const query = useQuery({
    queryKey: ['admin', 'privacy-retention', 'lifecycle-issues', page],
    queryFn: ({ signal }) => fetchIssues(page, signal),
    staleTime: 30 * 1000
  })
  const eventRequestId = activeIssue ? getEventRequestId(activeIssue) : ''
  const confirmationPhrase = eventRequestId ? `CLOSE EVENT ${eventRequestId}` : ''

  useEffect(() => {
    if (!activeIssue && shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false
      disclosureTriggerRef.current?.focus()
    }
  }, [activeIssue])

  useEffect(() => () => {
    credentialsRef.current = null
  }, [])

  const mutation = useMutation({
    mutationFn: (input: { requestId: string, signal: AbortSignal }) => {
      const credentials = credentialsRef.current
      if (!credentials) {
        return Promise.reject(new Error('Re-enter the admin password and confirmation.'))
      }

      return closeEventRequest({ ...input, ...credentials })
    },
    onSuccess: async () => {
      shouldRestoreFocusRef.current = true
      setActiveIssue(null)
      setSuccessMessage('The event-photo request was closed using the server time. Its 24-month retention deadline was recorded; no customer data was deleted.')
      await queryClient.invalidateQueries({ queryKey: ['admin', 'privacy-retention'] })
    },
    onSettled: () => {
      credentialsRef.current = null
      setPassword('')
      setConfirmation('')
    }
  })

  const handleClose = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage('')
    if (!eventRequestId || !password || confirmation !== confirmationPhrase) {
      return
    }

    credentialsRef.current = { password, confirmation }
    setPassword('')
    setConfirmation('')
    mutation.mutate({
      requestId: eventRequestId,
      signal: closeRequest.start()
    })
  }

  if (query.isLoading) {
    return <div className='skeleton h-32 w-full rounded-box' aria-label='Loading lifecycle review queue' />
  }

  if (query.isError || !query.data) {
    return (
      <div className='alert alert-error items-start text-sm' role='alert'>
        <div>
          <p className='font-semibold'>The lifecycle-review queue could not be loaded.</p>
          <button type='button' className='btn btn-outline btn-sm mt-3' onClick={() => void query.refetch()}>Try again</button>
        </div>
      </div>
    )
  }

  return (
    <section className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm' aria-labelledby='lifecycle-review-heading'>
      <div>
        <h2 id='lifecycle-review-heading' className='text-xl font-semibold text-base-content'>Lifecycle review queue</h2>
        <p className='mt-1 text-sm leading-6 text-base-content/70'>
          These records are protected from deletion until a reliable lifecycle event is recorded. Do not guess historical dates.
        </p>
      </div>

      {successMessage ? (
        <div className='alert alert-success mt-4 w-full items-start text-sm' role='status' aria-live='polite'>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 shrink-0 stroke-current' fill='none' viewBox='0 0 24 24' aria-hidden='true'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <div className='min-w-0'><p className='font-semibold'>Lifecycle updated</p><p className='mt-1 leading-6'>{successMessage}</p></div>
        </div>
      ) : null}

      {query.data.issues.length === 0 ? (
        <p className='mt-4 rounded-box border border-dashed border-base-300 p-5 text-sm text-base-content/70'>No lifecycle issues on this page.</p>
      ) : (
        <div className='mt-4 overflow-x-auto rounded-box border border-base-300'>
          <table className='table'>
            <thead>
              <tr><th>Record</th><th>Created</th><th>Why it needs review</th><th>Action</th></tr>
            </thead>
            <tbody>
              {query.data.issues.map((issue) => (
                <tr key={issue.id}>
                  <td><span className='font-mono text-xs'>{issue.recordReference}</span></td>
                  <td>{formatDate(issue.createdAt)}</td>
                  <td className='min-w-72 text-sm leading-6'>{issue.issueLabel}</td>
                  <td>
                    {issue.detailHref ? (
                      <Link href={issue.detailHref} className='btn btn-outline btn-sm'>Review record</Link>
                    ) : (
                      <button
                        type='button'
                        className='btn btn-outline btn-sm'
                        disabled={mutation.isPending}
                        onClick={(event) => {
                          mutation.reset()
                          credentialsRef.current = null
                          disclosureTriggerRef.current = event.currentTarget
                          setPassword('')
                          setConfirmation('')
                          setActiveIssue(issue)
                        }}
                      >
                        Record closure now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className='mt-4 flex items-center justify-between gap-3'>
        <button type='button' className='btn btn-ghost btn-sm' disabled={page === 1 || query.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
        <span className='text-sm text-base-content/65'>Page {query.data.page}</span>
        <button type='button' className='btn btn-ghost btn-sm' disabled={!query.data.hasMore || query.isFetching} onClick={() => setPage((current) => current + 1)}>Next</button>
      </div>

      {activeIssue && eventRequestId ? (
        <form className='mt-5 grid gap-4 rounded-box border border-warning/40 bg-warning/10 p-4' onSubmit={handleClose}>
          <div>
            <h3 className='font-semibold'>Close {activeIssue.recordReference} now</h3>
            <p className='mt-1 text-sm leading-6 text-base-content/75'>This records the current server time only. It does not claim a historical closure date and does not delete the request.</p>
          </div>
          <label className='form-control w-full' htmlFor={confirmationId}>
            <span className='label-text mb-2'>Type <span className='font-mono'>{confirmationPhrase}</span></span>
            <input id={confirmationId} className='input input-bordered w-full font-mono' value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete='off' required />
          </label>
          <label className='form-control w-full' htmlFor={passwordId}>
            <span className='label-text mb-2'>Admin password</span>
            <input id={passwordId} className='input input-bordered w-full' type='password' value={password} onChange={(event) => setPassword(event.target.value)} autoComplete='current-password' required />
          </label>
          {mutation.isError ? <FormFieldError id={errorId} message={mutation.error instanceof Error ? mutation.error.message : 'The event-photo lifecycle could not be updated.'} /> : null}
          <div className='flex flex-wrap gap-2'>
            <button type='submit' className='btn btn-warning' disabled={mutation.isPending || !password || confirmation !== confirmationPhrase}>{mutation.isPending ? 'Recording...' : 'Record closure now'}</button>
            <button
              type='button'
              className='btn btn-ghost'
              disabled={mutation.isPending}
              onClick={() => {
                credentialsRef.current = null
                setPassword('')
                setConfirmation('')
                shouldRestoreFocusRef.current = true
                setActiveIssue(null)
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
