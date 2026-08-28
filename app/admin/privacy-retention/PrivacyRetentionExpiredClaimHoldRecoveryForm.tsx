'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent
} from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { FormFieldError } from '@/app/components/forms/FormFieldError'
import { useAbortableRequest } from '@/app/hooks/useAbortableRequest'
import type { PrivacyRetentionHoldReason } from '@/lib/privacy-retention/types'
import {
  getTomorrowInUk,
  privacyRetentionHoldReasons
} from './legal-hold-options'
import { recoverExpiredClaimAndPlaceHold } from './privacy-retention-claim-recovery-api'

interface PrivacyRetentionExpiredClaimHoldRecoveryFormProps {
  candidateId: string
  recordReference: string
  refreshQueryKey?: readonly unknown[]
}

interface RecoveryCredentials {
  password: string
  confirmation: string
}

export function PrivacyRetentionExpiredClaimHoldRecoveryForm({
  candidateId,
  recordReference,
  refreshQueryKey
}: PrivacyRetentionExpiredClaimHoldRecoveryFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const request = useAbortableRequest()
  const disclosureId = useId()
  const triggerId = useId()
  const reasonId = useId()
  const reviewId = useId()
  const confirmationId = useId()
  const confirmationDescriptionId = useId()
  const passwordId = useId()
  const errorId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const credentialsRef = useRef<RecoveryCredentials | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState<PrivacyRetentionHoldReason | ''>('')
  const [reviewAt, setReviewAt] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [password, setPassword] = useState('')
  const minimumReviewDate = getTomorrowInUk()
  const reviewDateIsValid = reviewAt >= minimumReviewDate
  const confirmationPhrase = `RECOVER CLAIM AND HOLD ${recordReference}`

  useEffect(() => () => {
    credentialsRef.current = null
  }, [])

  const clearCredentials = () => {
    credentialsRef.current = null
    setPassword('')
    setConfirmation('')
  }

  const mutation = useMutation({
    mutationFn: (input: {
      reason: PrivacyRetentionHoldReason
      reviewAt: string
      signal: AbortSignal
    }) => {
      const credentials = credentialsRef.current
      if (!credentials) {
        throw new Error('Re-enter the admin password and confirmation phrase.')
      }

      return recoverExpiredClaimAndPlaceHold({
        candidateId,
        reason: input.reason,
        reviewAt: input.reviewAt,
        credentials,
        signal: input.signal
      })
    },
    onSuccess: async () => {
      clearCredentials()
      setReason('')
      setReviewAt('')
      setIsOpen(false)
      triggerRef.current?.focus()
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'privacy-retention']
      })
      if (refreshQueryKey) {
        await queryClient.invalidateQueries({ queryKey: refreshQueryKey })
      }
      router.refresh()
    },
    onError: () => {
      clearCredentials()
    },
    onSettled: () => {
      clearCredentials()
    }
  })

  const canSubmit =
    !mutation.isPending &&
    reason !== '' &&
    reviewDateIsValid &&
    password.length > 0 &&
    confirmation === confirmationPhrase

  const closeDisclosure = () => {
    request.abort()
    clearCredentials()
    setReason('')
    setReviewAt('')
    setIsOpen(false)
    mutation.reset()
    triggerRef.current?.focus()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || !reason) {
      return
    }

    credentialsRef.current = { password, confirmation }
    setPassword('')
    setConfirmation('')
    mutation.mutate({
      reason,
      reviewAt: `${reviewAt}T12:00:00.000Z`,
      signal: request.start()
    })
  }

  return (
    <div className='rounded-box border border-warning/30 bg-warning/10 p-4'>
      <p className='text-sm leading-6 text-base-content/80'>
        If a legal hold failed because a deletion worker crashed, use the guarded recovery only after its claim lease has expired.
      </p>
      <button
        ref={triggerRef}
        id={triggerId}
        type='button'
        className='btn btn-outline btn-warning btn-sm mt-3'
        aria-expanded={isOpen}
        aria-controls={disclosureId}
        onClick={() => {
          if (isOpen) {
            closeDisclosure()
          } else {
            mutation.reset()
            setIsOpen(true)
          }
        }}
      >
        Recover expired claim and place hold
      </button>

      {mutation.isSuccess ? (
        <div
          className='alert alert-success mt-3 w-full items-start text-sm'
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
          <div className='min-w-0'>
            <p className='font-semibold'>Legal hold placed safely</p>
            <p className='mt-1 leading-6'>
              The expired reversible claim was cancelled and the hold was recorded atomically.
            </p>
          </div>
        </div>
      ) : null}

      {isOpen ? (
        <form
          id={disclosureId}
          className='mt-4 grid gap-4'
          aria-labelledby={triggerId}
          onSubmit={handleSubmit}
        >
          <div className='alert alert-warning items-start text-sm' role='alert'>
            <div>
              <p className='font-semibold'>This action is deliberately narrow.</p>
              <p className='mt-1 leading-6'>
                It refuses live claims and any claim where deletion may already have started. It can cancel only one expired, reversible claim and records the hold in the same database transaction.
              </p>
            </div>
          </div>

          <div className='grid gap-4 tablet:grid-cols-2'>
            <label className='form-control w-full' htmlFor={reasonId}>
              <span className='label-text mb-2 font-semibold'>Documented reason</span>
              <select
                id={reasonId}
                className='select select-bordered w-full'
                value={reason}
                onChange={(event) => setReason(event.target.value as PrivacyRetentionHoldReason | '')}
                required
              >
                <option value=''>Choose a reason</option>
                {privacyRetentionHoldReasons.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className='form-control w-full' htmlFor={reviewId}>
              <span className='label-text mb-2 font-semibold'>Review date</span>
              <input
                id={reviewId}
                className={`input input-bordered w-full ${reviewAt && !reviewDateIsValid ? 'input-error' : ''}`.trim()}
                type='date'
                min={minimumReviewDate}
                value={reviewAt}
                onChange={(event) => setReviewAt(event.target.value)}
                required
              />
            </label>
          </div>

          <label className='form-control w-full' htmlFor={confirmationId}>
            <span className='label-text mb-2 font-semibold'>Exact confirmation phrase</span>
            <input
              id={confirmationId}
              className='input input-bordered w-full font-mono'
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete='off'
              maxLength={220}
              aria-describedby={confirmationDescriptionId}
              required
            />
            <span
              id={confirmationDescriptionId}
              className='mt-2 text-xs text-base-content/65'
            >
              Type <span className='font-mono'>{confirmationPhrase}</span>
            </span>
          </label>

          <label className='form-control w-full' htmlFor={passwordId}>
            <span className='label-text mb-2 font-semibold'>Admin password</span>
            <input
              id={passwordId}
              className='input input-bordered w-full'
              type='password'
              autoComplete='current-password'
              maxLength={256}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {mutation.isError ? (
            <FormFieldError
              id={errorId}
              message={mutation.error instanceof Error
                ? mutation.error.message
                : 'The deletion claim could not be recovered safely.'}
            />
          ) : null}

          <div className='flex flex-wrap gap-2'>
            <button
              type='submit'
              className='btn btn-warning btn-sm'
              disabled={!canSubmit}
            >
              {mutation.isPending
                ? 'Recovering...'
                : 'Recover claim and place hold'}
            </button>
            <button
              type='button'
              className='btn btn-ghost btn-sm'
              disabled={mutation.isPending}
              onClick={closeDisclosure}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
