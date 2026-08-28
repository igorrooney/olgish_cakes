'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAbortableRequest } from '@/app/hooks/useAbortableRequest'
import type {
  OrderRetentionEvidenceBasis,
  OrderRetentionLifecycle
} from '@/types/order'

interface OrderRetentionLifecycleFormProps {
  orderId: string
  orderNumber: string
  createdAt: string
  status: string
  lifecycle?: OrderRetentionLifecycle
}

interface RetentionLifecycleResponse {
  status?: unknown
  completedAt?: unknown
  financialYearEndedAt?: unknown
  retentionDueAt?: unknown
  error?: unknown
}

const evidenceOptions: Array<{
  value: OrderRetentionEvidenceBasis
  label: string
}> = [
  { value: 'order-status-record', label: 'Order status record' },
  { value: 'payment-provider-record', label: 'Payment provider record' },
  { value: 'invoice-accounting-record', label: 'Invoice or accounting record' },
  { value: 'customer-correspondence', label: 'Customer correspondence' }
]

const terminalStatuses = new Set(['completed', 'delivered', 'cancelled'])

const formatDate = (value?: string) => {
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
    year: 'numeric'
  }).format(date)
}

const getUkCalendarDate = (value: Date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(value)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

const parseResponse = (value: unknown): RetentionLifecycleResponse => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  const record = value as Record<string, unknown>
  return {
    status: record.status,
    completedAt: record.completedAt,
    financialYearEndedAt: record.financialYearEndedAt,
    retentionDueAt: record.retentionDueAt,
    error: record.error
  }
}

async function recordOrderRetentionCompletion(input: {
  orderId: string
  effectiveOn: string
  evidenceBasis: OrderRetentionEvidenceBasis
  confirmation: string
  password: string
  signal: AbortSignal
}) {
  const response = await fetch(
    `/api/admin/orders/${encodeURIComponent(input.orderId)}/retention-lifecycle`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        effectiveOn: input.effectiveOn,
        evidenceBasis: input.evidenceBasis,
        confirmation: input.confirmation,
        password: input.password
      }),
      signal: input.signal
    }
  )
  const data = parseResponse(await response.json().catch((): unknown => null))

  if (
    !response.ok ||
    (data.status !== 'updated' && data.status !== 'already-recorded') ||
    typeof data.retentionDueAt !== 'string'
  ) {
    throw new Error(typeof data.error === 'string'
      ? data.error
      : 'The order retention date could not be recorded.')
  }

  return data
}

export function OrderRetentionLifecycleForm({
  orderId,
  orderNumber,
  createdAt,
  status,
  lifecycle
}: OrderRetentionLifecycleFormProps) {
  const effectiveOnId = useId()
  const evidenceId = useId()
  const confirmationId = useId()
  const passwordId = useId()
  const queryClient = useQueryClient()
  const request = useAbortableRequest()
  const [effectiveOn, setEffectiveOn] = useState('')
  const [evidenceBasis, setEvidenceBasis] = useState<OrderRetentionEvidenceBasis | ''>('')
  const [confirmation, setConfirmation] = useState('')
  const [password, setPassword] = useState('')
  const credentialsRef = useRef<{ confirmation: string, password: string } | null>(null)
  const phrase = `SET RETENTION ${orderNumber}`
  const today = getUkCalendarDate(new Date())
  const createdOn = getUkCalendarDate(new Date(createdAt))
  const isTerminal = terminalStatuses.has(status)
  const dateIsValid = /^\d{4}-\d{2}-\d{2}$/.test(effectiveOn) &&
    effectiveOn >= createdOn &&
    effectiveOn <= today

  useEffect(() => () => {
    credentialsRef.current = null
  }, [])

  const mutation = useMutation({
    mutationFn: (input: Omit<Parameters<typeof recordOrderRetentionCompletion>[0], 'confirmation' | 'password'>) => {
      const credentials = credentialsRef.current
      if (!credentials) {
        return Promise.reject(new Error('Re-enter the admin password and confirmation.'))
      }

      return recordOrderRetentionCompletion({ ...input, ...credentials })
    },
    onSuccess: async () => {
      setEffectiveOn('')
      setEvidenceBasis('')
      await queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] })
    },
    onSettled: () => {
      credentialsRef.current = null
      setConfirmation('')
      setPassword('')
    }
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !isTerminal ||
      lifecycle?.legalHold ||
      !dateIsValid ||
      !evidenceBasis ||
      confirmation !== phrase ||
      password.length === 0
    ) {
      return
    }

    credentialsRef.current = { confirmation, password }
    setConfirmation('')
    setPassword('')
    mutation.mutate({
      orderId,
      effectiveOn,
      evidenceBasis,
      signal: request.start()
    })
  }

  if (lifecycle?.retentionDueAt) {
    return (
      <dl className='mt-4 grid gap-3 text-sm tablet:grid-cols-2'>
        <div>
          <dt className='text-base-content/60'>Verified terminal date</dt>
          <dd className='mt-1 font-semibold'>{formatDate(lifecycle.completedAt)}</dd>
        </div>
        <div>
          <dt className='text-base-content/60'>Financial year ended</dt>
          <dd className='mt-1 font-semibold'>{formatDate(lifecycle.financialYearEndedAt)}</dd>
        </div>
        <div>
          <dt className='text-base-content/60'>Retention deadline</dt>
          <dd className='mt-1 font-semibold'>{formatDate(lifecycle.retentionDueAt)}</dd>
        </div>
        <div>
          <dt className='text-base-content/60'>Legal hold</dt>
          <dd className='mt-1 font-semibold'>{lifecycle.legalHold ? 'Active' : 'None'}</dd>
        </div>
      </dl>
    )
  }

  if (!isTerminal) {
    return (
      <div className='alert alert-info mt-4 items-start text-sm' role='note'>
        This order is still active. Its retention deadline starts only after a genuine terminal date is recorded.
      </div>
    )
  }

  if (lifecycle?.legalHold) {
    return (
      <div className='alert alert-warning mt-4 items-start text-sm' role='note'>
        This order is under a legal hold. Review the hold in the retention centre before changing its lifecycle.
      </div>
    )
  }

  return (
    <form className='mt-4 grid gap-4' onSubmit={handleSubmit}>
      <div className='alert alert-warning items-start text-sm' role='note'>
        <div>
          <p className='font-semibold'>Use a date supported by a business record</p>
          <p className='mt-1 leading-6'>Do not guess or use the last-updated date. If no reliable evidence exists, leave this order protected and unresolved.</p>
        </div>
      </div>

      <div className='form-control w-full'>
        <label htmlFor={effectiveOnId} className='label-text mb-2 font-semibold'>Verified terminal date</label>
        <input
          id={effectiveOnId}
          type='date'
          className={`input input-bordered w-full ${effectiveOn.length > 0 && !dateIsValid ? 'input-error' : ''}`.trim()}
          min={createdOn}
          max={today}
          value={effectiveOn}
          onChange={(event) => setEffectiveOn(event.target.value)}
          required
        />
        <span className='mt-2 text-sm leading-6 text-base-content/70'>Must be between the order creation date and today in the UK.</span>
      </div>

      <div className='form-control w-full'>
        <label htmlFor={evidenceId} className='label-text mb-2 font-semibold'>Evidence used</label>
        <select
          id={evidenceId}
          className='select select-bordered w-full'
          value={evidenceBasis}
          onChange={(event) => setEvidenceBasis(event.target.value as OrderRetentionEvidenceBasis | '')}
          required
        >
          <option value=''>Choose the supporting record</option>
          {evidenceOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className='form-control w-full'>
        <label htmlFor={confirmationId} className='label-text mb-2 font-semibold'>Type <span className='font-mono'>{phrase}</span></label>
        <input
          id={confirmationId}
          className='input input-bordered w-full font-mono'
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete='off'
          required
        />
      </div>

      <div className='form-control w-full'>
        <label htmlFor={passwordId} className='label-text mb-2 font-semibold'>Admin password</label>
        <input
          id={passwordId}
          type='password'
          className='input input-bordered w-full'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete='current-password'
          required
        />
      </div>

      {mutation.isError ? (
        <div className='alert alert-error items-start text-sm' role='alert'>
          {mutation.error instanceof Error ? mutation.error.message : 'The order retention date could not be recorded.'}
        </div>
      ) : null}

      <button
        type='submit'
        className='btn btn-primary w-full tablet:w-fit'
        disabled={mutation.isPending || !dateIsValid || !evidenceBasis || confirmation !== phrase || password.length === 0}
      >
        {mutation.isPending ? 'Recording...' : 'Record verified terminal date'}
      </button>
    </form>
  )
}
