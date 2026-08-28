'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { FormFieldError } from '@/app/components/forms/FormFieldError'
import { useAbortableRequest } from '@/app/hooks/useAbortableRequest'
import type { PrivacyRetentionHoldReason } from '@/lib/privacy-retention/types'
import {
  addPrivacyRetentionHold,
  removePrivacyRetentionHold
} from './privacy-retention-api'
import {
  formatPrivacyRetentionHoldDate,
  getTomorrowInUk,
  privacyRetentionHoldReasons
} from './legal-hold-options'
import { PrivacyRetentionExpiredClaimHoldRecoveryForm } from './PrivacyRetentionExpiredClaimHoldRecoveryForm'

interface PrivacyRetentionLegalHoldFormProps {
  candidateId: string
  recordReference: string
  held: boolean
  holdReason?: PrivacyRetentionHoldReason
  holdReviewAt?: string
  refreshQueryKey?: readonly unknown[]
}

export function PrivacyRetentionLegalHoldForm({
  candidateId,
  recordReference,
  held,
  holdReason,
  holdReviewAt,
  refreshQueryKey
}: PrivacyRetentionLegalHoldFormProps) {
  const reasonId = useId()
  const reviewId = useId()
  const confirmationId = useId()
  const passwordId = useId()
  const errorId = useId()
  const router = useRouter()
  const queryClient = useQueryClient()
  const request = useAbortableRequest()
  const [reason, setReason] = useState<PrivacyRetentionHoldReason | ''>('')
  const [reviewAt, setReviewAt] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [password, setPassword] = useState('')
  const credentialsRef = useRef<{ password: string, confirmation: string } | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const releasePhrase = `REMOVE HOLD ${recordReference}`
  const minimumReviewDate = getTomorrowInUk()
  const reviewDateIsValid = reviewAt >= minimumReviewDate

  useEffect(() => () => {
    credentialsRef.current = null
  }, [])

  const mutation = useMutation({
    mutationFn: async (input: {
      action: 'hold' | 'release'
      reason?: PrivacyRetentionHoldReason
      reviewAt?: string
      signal: AbortSignal
    }) => {
      const credentials = credentialsRef.current
      if (!credentials) {
        throw new Error('Re-enter the admin password and confirmation.')
      }

      if (input.action === 'release') {
        await removePrivacyRetentionHold({
          candidateId,
          ...credentials,
          signal: input.signal
        })
        return 'released' as const
      }

      if (!input.reason || !input.reviewAt) {
        throw new Error('Choose a valid hold reason and future review date.')
      }

      await addPrivacyRetentionHold({
        candidateId,
        password: credentials.password,
        reason: input.reason,
        reviewAt: input.reviewAt,
        signal: input.signal
      })
      return 'held' as const
    },
    onSuccess: async (status) => {
      setReason('')
      setReviewAt('')
      setConfirmation('')
      setPassword('')
      setSuccessMessage(status === 'held'
        ? 'The legal hold was recorded. Routine deletion and ordinary record changes are paused.'
        : 'The legal hold was released. Review the record before making further changes.')
      await queryClient.invalidateQueries({ queryKey: ['admin', 'privacy-retention'] })
      if (refreshQueryKey) {
        await queryClient.invalidateQueries({ queryKey: refreshQueryKey })
      }
      router.refresh()
    },
    onSettled: () => {
      credentialsRef.current = null
      setConfirmation('')
      setPassword('')
    }
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage('')

    if (
      password.length === 0 ||
      (held && confirmation !== releasePhrase) ||
      (!held && (!reason || !reviewDateIsValid))
    ) {
      return
    }

    credentialsRef.current = { password, confirmation }
    setPassword('')
    setConfirmation('')
    mutation.mutate({
      action: held ? 'release' : 'hold',
      ...(!held && reason
        ? {
            reason,
            reviewAt: `${reviewAt}T12:00:00.000Z`
          }
        : {}),
      signal: request.start()
    })
  }

  return (
    <div className='mt-5 grid gap-4 border-t border-base-300 pt-5'>
      <div>
        <h4 className='font-semibold text-base-content'>Legal hold</h4>
        <p className='mt-1 text-sm leading-6 text-base-content/70'>
          Use a hold only for a documented complaint, claim, regulatory request or investigation. Every hold needs a review date.
        </p>
      </div>

      {held ? (
        <div className='alert alert-warning items-start text-sm' role='status'>
          <div>
            <p className='font-semibold'>Legal hold active</p>
            <p className='mt-1 leading-6'>
              Reason: {holdReason ? privacyRetentionHoldReasons.find((item) => item.value === holdReason)?.label : 'Protected audit record'}.
              Review date: {formatPrivacyRetentionHoldDate(holdReviewAt)}.
            </p>
          </div>
        </div>
      ) : null}

      <form className='grid gap-4' onSubmit={handleSubmit}>
        <fieldset className='grid gap-4' disabled={mutation.isPending}>
          {!held ? (
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
          ) : (
            <label className='form-control w-full' htmlFor={confirmationId}>
              <span className='label-text mb-2 font-semibold'>Type <span className='font-mono'>{releasePhrase}</span></span>
              <input
                id={confirmationId}
                className='input input-bordered w-full font-mono'
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete='off'
                required
              />
            </label>
          )}

          <label className='form-control w-full' htmlFor={passwordId}>
            <span className='label-text mb-2 font-semibold'>Admin password</span>
            <input
              id={passwordId}
              className='input input-bordered w-full'
              type='password'
              autoComplete='current-password'
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
                : 'The legal hold could not be updated safely.'}
            />
          ) : null}

          {successMessage ? (
            <div className='alert alert-success w-full items-start text-sm' role='status' aria-live='polite'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 shrink-0 stroke-current' fill='none' viewBox='0 0 24 24' aria-hidden='true'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              <div className='min-w-0'>
                <p className='font-semibold'>Legal hold updated</p>
                <p className='mt-1 leading-6'>{successMessage}</p>
              </div>
            </div>
          ) : null}

          <button
            type='submit'
            className={`btn w-full tablet:w-fit ${held ? 'btn-warning' : 'btn-outline'}`}
            disabled={
              mutation.isPending ||
              password.length === 0 ||
              (held ? confirmation !== releasePhrase : !reason || !reviewDateIsValid)
            }
          >
            {mutation.isPending
              ? 'Saving...'
              : held
                ? 'Release legal hold'
                : 'Place legal hold'}
          </button>
        </fieldset>
      </form>

      {!held ? (
        <PrivacyRetentionExpiredClaimHoldRecoveryForm
          candidateId={candidateId}
          recordReference={recordReference}
          refreshQueryKey={refreshQueryKey}
        />
      ) : null}
    </div>
  )
}
