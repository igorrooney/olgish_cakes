'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAbortableRequest } from '@/app/hooks/useAbortableRequest'
import type { AdminEnquiryType } from '@/lib/enquiries/supabase-enquiries'

type LegacyHealthRetentionScheduleFormProps =
  | {
      recordKind: 'enquiry'
      enquiryType: AdminEnquiryType
      recordReference: string
    }
  | {
      recordKind: 'order'
      recordReference: string
    }

interface ScheduleResponse {
  status?: unknown
  dueAt?: unknown
  error?: string
}

const isSuccessfulStatus = (value: unknown) =>
  value === 'scheduled' || value === 'already-scheduled'

async function scheduleHealthRetention(params: {
  endpoint: string
  credentials: {
    password: string
    confirmation: string
  }
  signal: AbortSignal
}) {
  const response = await fetch(params.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      password: params.credentials.password,
      confirmation: params.credentials.confirmation
    }),
    signal: params.signal
  })
  const data = await response.json().catch((): ScheduleResponse => ({}))

  if (
    !response.ok ||
    !isSuccessfulStatus(data.status) ||
    typeof data.dueAt !== 'string'
  ) {
    throw new Error(data.error || 'The dietary-health retention period could not be started.')
  }

  return data.dueAt
}

export function LegacyHealthRetentionScheduleForm(
  props: LegacyHealthRetentionScheduleFormProps
) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const disclosureId = useId()
  const triggerId = useId()
  const confirmationId = useId()
  const confirmationDescriptionId = useId()
  const passwordId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const credentialsRef = useRef<{
    password: string
    confirmation: string
  } | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const request = useAbortableRequest()
  const endpoint = props.recordKind === 'enquiry'
    ? `/api/admin/enquiries/${encodeURIComponent(props.enquiryType)}/${encodeURIComponent(props.recordReference)}/schedule-health-retention`
    : `/api/admin/orders/${encodeURIComponent(props.recordReference)}/schedule-health-retention`
  const confirmationPhrase = `START HEALTH RETENTION ${props.recordReference}`
  const mutation = useMutation({
    mutationFn: (params: { endpoint: string, signal: AbortSignal }) => {
      const credentials = credentialsRef.current
      if (!credentials) {
        throw new Error('The confirmation credentials are missing.')
      }
      return scheduleHealthRetention({
        ...params,
        credentials
      })
    },
    onSuccess: async () => {
      credentialsRef.current = null
      setPassword('')
      setConfirmation('')
      setIsOpen(false)
      triggerRef.current?.focus()
      if (props.recordKind === 'order') {
        await queryClient.invalidateQueries({
          queryKey: ['admin-order', props.recordReference]
        })
      }
      router.refresh()
    },
    onError: () => {
      credentialsRef.current = null
      setPassword('')
      setConfirmation('')
    },
    onSettled: () => {
      credentialsRef.current = null
    }
  })
  const canSubmit =
    !mutation.isPending &&
    password.length > 0 &&
    confirmation === confirmationPhrase

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    credentialsRef.current = {
      password,
      confirmation
    }
    mutation.mutate({
      endpoint,
      signal: request.start()
    })
  }

  const closeDisclosure = () => {
    request.abort()
    credentialsRef.current = null
    setPassword('')
    setConfirmation('')
    setIsOpen(false)
    mutation.reset()
    triggerRef.current?.focus()
  }

  return (
    <div className='mt-4'>
      <button
        ref={triggerRef}
        id={triggerId}
        type='button'
        className='btn btn-outline btn-warning btn-sm'
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
        Start 30-day health retention period
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
            <p className='font-semibold'>Health retention period started</p>
            <p className='mt-1 leading-6'>
              The protected evidence is refreshing with the server-generated deadline.
            </p>
          </div>
        </div>
      ) : null}

      {isOpen ? (
        <form
          id={disclosureId}
          className='mt-3 grid gap-3'
          aria-labelledby={triggerId}
          onSubmit={handleSubmit}
        >
          <div className='alert alert-warning items-start text-sm' role='alert'>
            <div>
              <p className='font-semibold'>Confirm that the operational purpose has ended.</p>
              <p className='mt-1 leading-6'>
                This starts a new 30-day period from the server time. It does not accept or infer a historical date.
                After the deadline, selected retention processing can permanently erase only the health content.
              </p>
            </div>
          </div>

          <div className='form-control w-full'>
            <label htmlFor={confirmationId} className='label-text mb-2'>
              Exact confirmation phrase
            </label>
            <input
              id={confirmationId}
              className='input input-bordered w-full'
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={confirmationPhrase}
              autoComplete='off'
              maxLength={160}
              aria-describedby={confirmationDescriptionId}
              required
            />
            <span
              id={confirmationDescriptionId}
              className='mt-2 text-xs text-base-content/65'
            >
              Type <span className='font-mono'>{confirmationPhrase}</span>
            </span>
          </div>

          <div className='form-control w-full'>
            <label htmlFor={passwordId} className='label-text mb-2'>Admin password</label>
            <input
              id={passwordId}
              type='password'
              className='input input-bordered w-full'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete='current-password'
              maxLength={256}
              required
            />
          </div>

          {mutation.isError ? (
            <div className='alert alert-error items-start text-sm' role='alert'>
              <span>{mutation.error instanceof Error
                ? mutation.error.message
                : 'The retention period could not be started.'}</span>
            </div>
          ) : null}

          <div className='flex flex-wrap gap-2'>
            <button
              type='submit'
              className='btn btn-warning btn-sm'
              disabled={!canSubmit}
            >
              {mutation.isPending ? 'Starting...' : 'Start 30-day period'}
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
