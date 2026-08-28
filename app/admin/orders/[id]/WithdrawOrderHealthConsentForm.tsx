'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAbortableRequest } from '@/app/hooks/useAbortableRequest'

interface WithdrawOrderHealthConsentFormProps {
  orderId: string
}

interface WithdrawalResponse {
  status?: unknown
  withdrawnAt?: unknown
  error?: string
}

const isSuccessfulWithdrawalStatus = (value: unknown) =>
  value === 'withdrawn' || value === 'already-withdrawn'

async function withdrawHealthConsent(params: {
  orderId: string
  password: string
  confirmation: string
  signal: AbortSignal
}) {
  const response = await fetch(
    `/api/admin/orders/${encodeURIComponent(params.orderId)}/withdraw-health-consent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        password: params.password,
        confirmation: params.confirmation
      }),
      signal: params.signal
    }
  )
  const data = await response.json().catch((): WithdrawalResponse => ({}))

  if (
    !response.ok ||
    !isSuccessfulWithdrawalStatus(data.status) ||
    typeof data.withdrawnAt !== 'string'
  ) {
    throw new Error(data.error || 'Dietary-health information could not be withdrawn.')
  }
}

export function WithdrawOrderHealthConsentForm({
  orderId
}: WithdrawOrderHealthConsentFormProps) {
  const queryClient = useQueryClient()
  const disclosureId = useId()
  const triggerId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const credentialsRef = useRef<{ password: string, confirmation: string } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const restoreFocusRef = useRef(false)
  const request = useAbortableRequest()

  useEffect(() => {
    if (!isOpen && restoreFocusRef.current) {
      restoreFocusRef.current = false
      triggerRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => () => {
    credentialsRef.current = null
  }, [])

  const mutation = useMutation({
    mutationFn: (input: { orderId: string, signal: AbortSignal }) => {
      const credentials = credentialsRef.current
      if (!credentials) {
        return Promise.reject(new Error('Re-enter the admin password and order reference.'))
      }

      return withdrawHealthConsent({ ...input, ...credentials })
    },
    onSuccess: async () => {
      restoreFocusRef.current = true
      setIsOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] })
    },
    onSettled: () => {
      credentialsRef.current = null
      setPassword('')
      setConfirmation('')
    }
  })
  const canWithdraw = !mutation.isPending &&
    password.length > 0 &&
    confirmation === orderId

  const handleWithdrawal = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()

    if (!canWithdraw) {
      return
    }

    credentialsRef.current = { password, confirmation }
    setPassword('')
    setConfirmation('')
    mutation.mutate({
      orderId,
      signal: request.start()
    })
  }

  const closeDisclosure = () => {
    request.abort()
    credentialsRef.current = null
    setPassword('')
    setConfirmation('')
    restoreFocusRef.current = true
    setIsOpen(false)
    mutation.reset()
  }

  return (
    <div className='mt-4'>
      <button
        ref={triggerRef}
        id={triggerId}
        type='button'
        className='btn btn-outline btn-error btn-sm'
        aria-expanded={isOpen}
        aria-controls={disclosureId}
        onClick={() => {
          if (isOpen) {
            closeDisclosure()
          } else {
            setIsOpen(true)
          }
        }}
      >
        Record consent withdrawal
      </button>

      {isOpen ? (
        <form
          id={disclosureId}
          className='mt-3 grid gap-3'
          aria-labelledby={triggerId}
          onSubmit={handleWithdrawal}
        >
          <div className='alert alert-warning items-start text-sm' role='alert'>
            <div>
              <p className='font-semibold'>This permanently erases the health information.</p>
              <p className='mt-1 leading-6'>
                Only the consent and withdrawal evidence will remain.
              </p>
            </div>
          </div>

          <label className='form-control w-full'>
            <span className='label-text mb-2'>Order reference</span>
            <input
              className='input input-bordered w-full'
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={orderId}
              autoComplete='off'
              required
            />
          </label>

          <label className='form-control w-full'>
            <span className='label-text mb-2'>Admin password</span>
            <input
              type='password'
              className='input input-bordered w-full'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete='current-password'
              required
            />
          </label>

          {mutation.isError ? (
            <div className='alert alert-error items-start text-sm' role='alert'>
              <span>{mutation.error instanceof Error ? mutation.error.message : 'Withdrawal failed.'}</span>
            </div>
          ) : null}

          <div className='flex flex-wrap gap-2'>
            <button
              type='submit'
              className='btn btn-error btn-sm'
              disabled={!canWithdraw}
            >
              {mutation.isPending ? 'Withdrawing...' : 'Erase health information'}
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
