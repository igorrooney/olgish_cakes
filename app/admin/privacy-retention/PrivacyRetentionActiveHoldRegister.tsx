'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent
} from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormFieldError } from '@/app/components/forms/FormFieldError'
import { useAbortableRequest } from '@/app/hooks/useAbortableRequest'
import type { PrivacyRetentionActiveHold } from '@/lib/privacy-retention/active-holds-contract'
import type { PrivacyRetentionHoldReason } from '@/lib/privacy-retention/types'
import { fetchPrivacyRetentionActiveHolds } from './active-holds-api'
import { removePrivacyRetentionHold } from './privacy-retention-api'

const pageSize = 20
const activeHoldQueryKey = ['admin', 'privacy-retention', 'active-holds'] as const

const holdReasonLabels: Record<PrivacyRetentionHoldReason, string> = {
  'active-complaint': 'Active complaint or dispute',
  'legal-claim': 'Active or anticipated legal claim',
  'regulatory-request': 'Regulatory or law-enforcement request',
  'fraud-investigation': 'Fraud or security investigation',
  'other-necessary-hold': 'Other documented necessary hold'
}

const recordTypeLabels: Record<PrivacyRetentionActiveHold['recordType'], string> = {
  'contact-enquiry': 'Contact enquiry',
  'custom-cake-enquiry': 'Custom-cake enquiry',
  'workshop-enquiry': 'Workshop enquiry',
  'event-photo-request': 'Event-photo request',
  order: 'Order',
  'security-batch': 'Security records'
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

export function PrivacyRetentionActiveHoldRegister() {
  const disclosureId = useId()
  const passwordId = useId()
  const confirmationId = useId()
  const errorId = useId()
  const queryClient = useQueryClient()
  const releaseRequest = useAbortableRequest()
  const credentialsRef = useRef<{
    password: string
    confirmation: string
  } | null>(null)
  const disclosureTriggerRef = useRef<HTMLButtonElement | null>(null)
  const passwordInputRef = useRef<HTMLInputElement | null>(null)
  const shouldRestoreFocusRef = useRef(false)
  const [page, setPage] = useState(1)
  const [activeHold, setActiveHold] = useState<PrivacyRetentionActiveHold | null>(null)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const confirmationPhrase = activeHold
    ? `REMOVE HOLD ${activeHold.recordReference}`
    : ''

  const query = useQuery({
    queryKey: [...activeHoldQueryKey, page],
    queryFn: ({ signal }) => fetchPrivacyRetentionActiveHolds({
      page,
      pageSize,
      signal
    }),
    staleTime: 30 * 1000
  })

  useEffect(() => {
    if (!activeHold && shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false
      disclosureTriggerRef.current?.focus()
    }
  }, [activeHold])

  useEffect(() => () => {
    credentialsRef.current = null
    disclosureTriggerRef.current = null
    passwordInputRef.current = null
  }, [])

  const releaseMutation = useMutation({
    mutationFn: (input: { candidateId: string, signal: AbortSignal }) => {
      const credentials = credentialsRef.current
      if (!credentials) {
        return Promise.reject(
          new Error('Re-enter the admin password and confirmation phrase.')
        )
      }

      return removePrivacyRetentionHold({
        candidateId: input.candidateId,
        signal: input.signal,
        ...credentials
      })
    },
    onSuccess: async (_result, variables) => {
      credentialsRef.current = null
      setPassword('')
      setConfirmation('')
      const released = activeHold?.candidateId === variables.candidateId
        ? activeHold.recordReference
        : 'the selected record'
      shouldRestoreFocusRef.current = true
      setActiveHold(null)
      setSuccessMessage(
        `The legal hold for ${released} was released. No record was deleted.`
      )
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'privacy-retention']
      })
    },
    onError: () => {
      credentialsRef.current = null
      setPassword('')
      setConfirmation('')
    },
    onSettled: () => {
      credentialsRef.current = null
      setPassword('')
      setConfirmation('')
    }
  })

  useEffect(() => {
    if (activeHold && releaseMutation.isError) {
      passwordInputRef.current?.focus()
    }
  }, [activeHold, releaseMutation.isError])

  const openRelease = (
    hold: PrivacyRetentionActiveHold,
    trigger: HTMLButtonElement
  ) => {
    releaseMutation.reset()
    credentialsRef.current = null
    disclosureTriggerRef.current = trigger
    setPassword('')
    setConfirmation('')
    setSuccessMessage('')
    setActiveHold(hold)
  }

  const closeRelease = () => {
    credentialsRef.current = null
    setPassword('')
    setConfirmation('')
    shouldRestoreFocusRef.current = true
    setActiveHold(null)
  }

  const handleRelease = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage('')
    if (
      !activeHold ||
      password.length === 0 ||
      confirmation !== confirmationPhrase
    ) {
      return
    }

    credentialsRef.current = { password, confirmation }
    setPassword('')
    setConfirmation('')
    releaseMutation.mutate({
      candidateId: activeHold.candidateId,
      signal: releaseRequest.start()
    })
  }

  if (query.isLoading) {
    return (
      <section
        className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm'
        aria-label='Active legal-hold register'
      >
        <div className='skeleton h-32 w-full rounded-box' aria-label='Loading active legal holds' />
      </section>
    )
  }

  if (query.isError || !query.data) {
    return (
      <section
        className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm'
        aria-labelledby='active-holds-error-heading'
      >
        <div className='alert alert-error items-start text-sm' role='alert'>
          <div>
            <h2 id='active-holds-error-heading' className='font-semibold'>The active legal-hold register could not be loaded.</h2>
            <p className='mt-1 leading-6'>Do not record the owner review until this register loads successfully.</p>
            <button
              type='button'
              className='btn btn-outline btn-sm mt-3 min-h-11'
              onClick={() => void query.refetch()}
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className='rounded-box border border-base-300 bg-base-100 p-5 shadow-sm'
      aria-labelledby='active-holds-heading'
    >
      <div>
        <div className='flex flex-wrap items-center gap-2'>
          <h2 id='active-holds-heading' className='text-xl font-semibold text-base-content'>Active legal-hold register</h2>
          <span className='badge badge-warning'>{query.data.holds.length} on this page</span>
        </div>
        <p className='mt-1 text-sm leading-6 text-base-content/70'>
          Review every active hold, including records that are not yet due for deletion. Each underlying record appears once even when its hold blocks uploads, health-information erasure or a linked order.
        </p>
      </div>

      {successMessage ? (
        <div
          className='alert alert-success mt-4 w-full items-start text-sm'
          role='status'
          aria-live='polite'
        >
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 shrink-0 stroke-current' fill='none' viewBox='0 0 24 24' aria-hidden='true'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <div className='min-w-0'>
            <p className='font-semibold'>Legal hold released</p>
            <p className='mt-1 leading-6'>{successMessage}</p>
          </div>
        </div>
      ) : null}

      {query.data.holds.length === 0 ? (
        <p className='mt-4 rounded-box border border-dashed border-base-300 p-5 text-sm text-base-content/70'>No active legal holds are recorded.</p>
      ) : (
        <ul className='mt-4 grid gap-3 tablet:grid-cols-2' aria-label='Active legal holds'>
          {query.data.holds.map((hold) => (
            <li key={hold.candidateId} className='rounded-box border border-warning/40 bg-warning/10 p-4'>
              <div className='flex flex-wrap items-start justify-between gap-2'>
                <div className='min-w-0'>
                  <p className='text-sm font-semibold text-base-content'>{recordTypeLabels[hold.recordType]}</p>
                  <p className='mt-1 break-all font-mono text-xs text-base-content/75'>{hold.recordReference}</p>
                </div>
                <span className={`badge ${hold.overdue ? 'badge-error' : 'badge-warning'}`}>
                  {hold.overdue ? 'Review overdue' : 'Active hold'}
                </span>
              </div>
              <dl className='mt-3 grid gap-2 text-sm'>
                <div>
                  <dt className='text-base-content/60'>Documented reason</dt>
                  <dd className='mt-1 font-semibold'>{holdReasonLabels[hold.reason]}</dd>
                </div>
                <div>
                  <dt className='text-base-content/60'>Review date</dt>
                  <dd className='mt-1 font-semibold'>{formatDate(hold.reviewAt)}</dd>
                </div>
              </dl>
              <div className='mt-4 flex flex-wrap gap-2'>
                {hold.detailHref ? (
                  <Link href={hold.detailHref} className='btn btn-outline btn-sm min-h-11'>Review record</Link>
                ) : null}
                <button
                  type='button'
                  className='btn btn-warning btn-sm min-h-11'
                  aria-expanded={activeHold?.candidateId === hold.candidateId}
                  aria-controls={disclosureId}
                  disabled={releaseMutation.isPending}
                  onClick={(event) => openRelease(hold, event.currentTarget)}
                >
                  Review hold
                  <span className='sr-only'> {hold.recordReference}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className='mt-4 flex items-center justify-between gap-3'>
        <button
          type='button'
          className='btn btn-ghost btn-sm min-h-11'
          disabled={page === 1 || query.isFetching || releaseMutation.isPending}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </button>
        <span className='text-sm text-base-content/65'>Page {query.data.page}</span>
        <button
          type='button'
          className='btn btn-ghost btn-sm min-h-11'
          disabled={!query.data.hasMore || query.isFetching || releaseMutation.isPending}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </div>

      {activeHold ? (
        <form
          id={disclosureId}
          className='mt-5 grid gap-4 rounded-box border border-warning/40 bg-warning/10 p-4'
          onSubmit={handleRelease}
        >
          <div>
            <h3 className='font-semibold'>Release the hold for {activeHold.recordReference}</h3>
            <p className='mt-1 text-sm leading-6 text-base-content/75'>Releasing this hold does not delete the record. A fresh retention preview is required before any later deletion.</p>
          </div>
          <div className='grid gap-4 tablet:grid-cols-2'>
            <label className='form-control w-full' htmlFor={passwordId}>
              <span className='label-text mb-2'>Admin password</span>
              <input
                ref={passwordInputRef}
                id={passwordId}
                className='input input-bordered w-full'
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete='current-password'
                required
              />
            </label>
            <label className='form-control w-full' htmlFor={confirmationId}>
              <span className='label-text mb-2'>Type <span className='font-mono'>{confirmationPhrase}</span></span>
              <input
                id={confirmationId}
                className='input input-bordered w-full font-mono'
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete='off'
                required
              />
            </label>
          </div>
          {releaseMutation.isError ? (
            <FormFieldError
              id={errorId}
              message='The legal hold could not be released safely. Re-enter both fields and try again.'
            />
          ) : null}
          <div className='flex flex-wrap gap-2'>
            <button
              type='submit'
              className='btn btn-warning min-h-11'
              disabled={
                releaseMutation.isPending ||
                password.length === 0 ||
                confirmation !== confirmationPhrase
              }
            >
              {releaseMutation.isPending ? 'Releasing hold...' : 'Release legal hold'}
            </button>
            <button
              type='button'
              className='btn btn-ghost min-h-11'
              disabled={releaseMutation.isPending}
              onClick={closeRelease}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
