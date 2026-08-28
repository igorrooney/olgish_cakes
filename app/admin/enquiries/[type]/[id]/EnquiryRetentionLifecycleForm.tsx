'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormFieldError } from '@/app/components/forms/FormFieldError'
import { useAbortableRequest } from '@/app/hooks/useAbortableRequest'
import type {
  AdminEnquiryDetail,
  AdminEnquiryType
} from '@/lib/enquiries/supabase-enquiries'

type RetentionLifecycle = AdminEnquiryDetail['retentionLifecycle']
type RetentionLifecycleAction = 'record-contact' | 'close' | 'reopen' | 'convert'

interface EnquiryRetentionLifecycleFormProps {
  type: AdminEnquiryType
  recordReference: string
  lifecycle: RetentionLifecycle
}

interface RetentionLifecycleResponse {
  status?: unknown
  updatedAt?: unknown
  error?: unknown
}

const orderReferencePattern = /^[A-Za-z0-9._-]{1,128}$/

const actionLabels: Record<RetentionLifecycleAction, string> = {
  'record-contact': 'Record contact now',
  close: 'Close enquiry',
  reopen: 'Reopen enquiry',
  convert: 'Link to an order'
}

const submitLabels: Record<RetentionLifecycleAction, string> = {
  'record-contact': 'Record contact',
  close: 'Close enquiry',
  reopen: 'Reopen enquiry',
  convert: 'Link enquiry to order'
}

const statusLabels: Record<RetentionLifecycle['status'], string> = {
  open: 'Open',
  closed: 'Closed',
  converted: 'Converted to order'
}

const statusBadgeClasses: Record<RetentionLifecycle['status'], string> = {
  open: 'badge-info',
  closed: 'badge-neutral',
  converted: 'badge-success'
}

const formatDateTime = (value?: string) => {
  if (!value) {
    return 'Not recorded'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getAvailableActions = (
  status: RetentionLifecycle['status']
): RetentionLifecycleAction[] => {
  if (status === 'open') {
    return ['record-contact', 'close', 'convert']
  }

  if (status === 'closed') {
    return ['record-contact', 'reopen', 'convert']
  }

  return ['record-contact']
}

const getActionHelp = (
  action: RetentionLifecycleAction,
  status: RetentionLifecycle['status']
) => {
  if (action === 'record-contact') {
    if (status === 'closed') {
      return 'Records the current server time and recalculates the 24-month retention deadline from this latest contact.'
    }

    return 'Records the current server time as the most recent customer contact.'
  }

  if (action === 'close') {
    return 'Starts the documented 24-month retention period. Nothing is deleted by this action.'
  }

  if (action === 'reopen') {
    return 'Removes the current retention deadline. Reopening a converted enquiry also removes its order link.'
  }

  return 'Connects this enquiry permanently to an existing order. The order must be completed before its six-year financial retention deadline is calculated.'
}

const getSuccessMessage = (action: RetentionLifecycleAction) => {
  if (action === 'record-contact') {
    return 'Customer contact recorded.'
  }

  if (action === 'close') {
    return 'Enquiry closed and its retention deadline calculated.'
  }

  if (action === 'reopen') {
    return 'Enquiry reopened and removed from retention processing.'
  }

  return 'Enquiry linked to the order.'
}

const getSafeErrorMessage = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0
    ? value
    : 'The enquiry lifecycle could not be updated.'

const parseRetentionLifecycleResponse = (
  value: unknown
): RetentionLifecycleResponse => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  const record = value as Record<string, unknown>
  return {
    status: record.status,
    updatedAt: record.updatedAt,
    error: record.error
  }
}

async function updateRetentionLifecycle(params: {
  type: AdminEnquiryType
  recordReference: string
  password: string
  action: RetentionLifecycleAction
  convertedOrderId?: string
  signal: AbortSignal
}) {
  const response = await fetch(
    `/api/admin/enquiries/${encodeURIComponent(params.type)}/${encodeURIComponent(params.recordReference)}/retention-lifecycle`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        password: params.password,
        action: params.action,
        ...(params.action === 'convert' && params.convertedOrderId
          ? { convertedOrderId: params.convertedOrderId }
          : {})
      }),
      signal: params.signal
    }
  )
  const dataValue: unknown = await response.json().catch((): unknown => null)
  const data = parseRetentionLifecycleResponse(dataValue)

  if (
    !response.ok ||
    data.status !== 'updated' ||
    typeof data.updatedAt !== 'string'
  ) {
    throw new Error(getSafeErrorMessage(data.error))
  }

  return data.updatedAt
}

function SuccessNotice({ message }: { message: string }) {
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
      <div className='min-w-0'>
        <p className='font-semibold'>Lifecycle updated</p>
        <p className='mt-1 leading-6'>{message}</p>
      </div>
    </div>
  )
}

function RetentionExplanation({ lifecycle }: { lifecycle: RetentionLifecycle }) {
  if (lifecycle.status === 'open') {
    return (
      <p className='text-sm leading-6 text-base-content/70'>
        This enquiry is not queued for routine deletion. Record each reply, then close it when the enquiry ends or link it to an order.
      </p>
    )
  }

  if (lifecycle.status === 'closed') {
    return (
      <p className='text-sm leading-6 text-base-content/70'>
        The enquiry becomes eligible for the retention review after its deadline. The retention centre will still require an explicit selection before deletion.
      </p>
    )
  }

  return (
    <p className='text-sm leading-6 text-base-content/70'>
      The core enquiry permanently follows the linked order&apos;s six-year financial retention deadline. Record later work as a new enquiry; uploaded files can have their own earlier 24-month deadline.
    </p>
  )
}

export function EnquiryRetentionLifecycleForm({
  type,
  recordReference,
  lifecycle
}: EnquiryRetentionLifecycleFormProps) {
  const router = useRouter()
  const actionId = useId()
  const actionHelpId = useId()
  const orderId = useId()
  const orderHelpId = useId()
  const orderErrorId = useId()
  const passwordId = useId()
  const passwordHelpId = useId()
  const submitErrorId = useId()
  const [action, setAction] = useState<RetentionLifecycleAction>('record-contact')
  const [convertedOrderId, setConvertedOrderId] = useState('')
  const [password, setPassword] = useState('')
  const passwordRef = useRef('')
  const [successMessage, setSuccessMessage] = useState('')
  const request = useAbortableRequest()
  const availableActions = getAvailableActions(lifecycle.status)
  const normalizedOrderId = convertedOrderId.trim()
  const hasInvalidOrderId = action === 'convert' &&
    normalizedOrderId.length > 0 &&
    !orderReferencePattern.test(normalizedOrderId)

  useEffect(() => () => {
    passwordRef.current = ''
  }, [])

  const mutation = useMutation({
    mutationFn: (input: Omit<Parameters<typeof updateRetentionLifecycle>[0], 'password'>) => {
      if (!passwordRef.current) {
        return Promise.reject(new Error('Re-enter the admin password.'))
      }

      return updateRetentionLifecycle({ ...input, password: passwordRef.current })
    },
    onSuccess: (_updatedAt, variables) => {
      setConvertedOrderId('')
      setAction('record-contact')
      setSuccessMessage(getSuccessMessage(variables.action))
      router.refresh()
    },
    onSettled: () => {
      passwordRef.current = ''
      setPassword('')
    }
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage('')

    if (lifecycle.legalHold) {
      return
    }

    if (action === 'convert' && !orderReferencePattern.test(normalizedOrderId)) {
      return
    }

    passwordRef.current = password
    setPassword('')
    mutation.mutate({
      type,
      recordReference,
      action,
      ...(action === 'convert' ? { convertedOrderId: normalizedOrderId } : {}),
      signal: request.start()
    })
  }

  const handleActionChange = (nextAction: RetentionLifecycleAction) => {
    request.abort()
    mutation.reset()
    setSuccessMessage('')
    setConvertedOrderId('')
    setAction(nextAction)
  }

  return (
    <div className='grid gap-5'>
      <div className='flex flex-wrap items-center gap-2'>
        <span className={`badge ${statusBadgeClasses[lifecycle.status]}`}>
          {statusLabels[lifecycle.status]}
        </span>
        {lifecycle.legalHold ? <span className='badge badge-warning'>Legal hold</span> : null}
      </div>

      <RetentionExplanation lifecycle={lifecycle} />

      <div className='alert alert-info items-start text-sm' role='note'>
        <span className='leading-6'>
          These controls only record lifecycle dates and status. They never delete customer data.
        </span>
      </div>

      <dl className='grid gap-3 text-sm tablet:grid-cols-2'>
        <div>
          <dt className='text-base-content/60'>Last customer contact</dt>
          <dd className='mt-1 font-semibold text-base-content'>{formatDateTime(lifecycle.lastContactedAt)}</dd>
        </div>
        <div>
          <dt className='text-base-content/60'>Closed at</dt>
          <dd className='mt-1 font-semibold text-base-content'>{formatDateTime(lifecycle.closedAt)}</dd>
        </div>
        <div>
          <dt className='text-base-content/60'>Enquiry retention deadline</dt>
          <dd className='mt-1 font-semibold text-base-content'>{formatDateTime(lifecycle.retentionDueAt)}</dd>
        </div>
        <div>
          <dt className='text-base-content/60'>Upload retention deadline</dt>
          <dd className='mt-1 font-semibold text-base-content'>{formatDateTime(lifecycle.uploadRetentionDueAt)}</dd>
        </div>
      </dl>

      {lifecycle.convertedOrderId ? (
        <Link
          href={`/admin/orders/${encodeURIComponent(lifecycle.convertedOrderId)}`}
          className='link link-primary w-fit break-all text-sm font-semibold'
        >
          Open linked order {lifecycle.convertedOrderId}
        </Link>
      ) : null}

      {lifecycle.legalHold ? (
        <div className='alert alert-warning items-start text-sm' role='note'>
          <div>
            <p className='font-semibold'>Routine deletion is paused</p>
            <p className='mt-1 leading-6'>
              This record cannot be deleted while its legal hold is active. Review or release the hold in the{' '}
              <Link href='/admin/privacy-retention' className='link font-semibold'>privacy retention centre</Link>.
            </p>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <fieldset className='grid gap-4' disabled={lifecycle.legalHold || mutation.isPending}>
        <div className='form-control w-full'>
          <label htmlFor={actionId} className='label-text mb-2 font-semibold'>Lifecycle action</label>
          <select
            id={actionId}
            className='select select-bordered w-full'
            value={action}
            aria-describedby={actionHelpId}
            onChange={(event) => handleActionChange(event.target.value as RetentionLifecycleAction)}
          >
            {availableActions.map((availableAction) => (
              <option key={availableAction} value={availableAction}>
                {actionLabels[availableAction]}
              </option>
            ))}
          </select>
          <span id={actionHelpId} className='mt-2 text-sm leading-6 text-base-content/70'>
            {getActionHelp(action, lifecycle.status)}
          </span>
        </div>

        {action === 'convert' ? (
          <div className='form-control w-full'>
            <label htmlFor={orderId} className='label-text mb-2 font-semibold'>Existing order number or ID</label>
            <input
              id={orderId}
              className={`input input-bordered w-full font-mono text-sm ${hasInvalidOrderId ? 'input-error' : ''}`.trim()}
              value={convertedOrderId}
              placeholder='OC-2026-00123'
              autoComplete='off'
              spellCheck={false}
              required
              aria-invalid={hasInvalidOrderId}
              aria-describedby={`${orderHelpId}${hasInvalidOrderId ? ` ${orderErrorId}` : ''}`}
              onChange={(event) => setConvertedOrderId(event.target.value)}
            />
            <span id={orderHelpId} className='mt-2 text-sm leading-6 text-base-content/70'>
              Enter the visible order number from the order list, or the complete order ID. The server verifies that the order exists.
            </span>
            <FormFieldError
              id={orderErrorId}
              message={hasInvalidOrderId ? 'Use only letters, numbers, full stops, underscores or hyphens.' : undefined}
              className='mt-2'
            />
          </div>
        ) : null}

        <div className='form-control w-full'>
          <label htmlFor={passwordId} className='label-text mb-2 font-semibold'>Admin password</label>
          <input
            id={passwordId}
            type='password'
            className='input input-bordered w-full'
            value={password}
            autoComplete='current-password'
            required
            aria-describedby={passwordHelpId}
            onChange={(event) => setPassword(event.target.value)}
          />
          <span id={passwordHelpId} className='mt-2 text-sm leading-6 text-base-content/70'>
            Re-enter the admin password to record this change.
          </span>
        </div>

        {mutation.isError ? (
          <FormFieldError
            id={submitErrorId}
            message={mutation.error instanceof Error
              ? mutation.error.message
              : 'The enquiry lifecycle could not be updated.'}
          />
        ) : null}

        {successMessage ? <SuccessNotice message={successMessage} /> : null}

        <button
          type='submit'
          className='btn btn-primary w-full tablet:w-fit'
          disabled={
            mutation.isPending ||
            lifecycle.legalHold ||
            password.length === 0 ||
            (action === 'convert' && !orderReferencePattern.test(normalizedOrderId))
          }
        >
          {mutation.isPending ? 'Saving...' : submitLabels[action]}
        </button>
        </fieldset>
      </form>
    </div>
  )
}
