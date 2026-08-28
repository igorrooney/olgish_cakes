import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PrivacyRetentionExpiredClaimHoldRecoveryForm } from '../PrivacyRetentionExpiredClaimHoldRecoveryForm'

const mockRecover = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh })
}))

jest.mock('../privacy-retention-claim-recovery-api', () => ({
  recoverExpiredClaimAndPlaceHold: (...args: unknown[]) => mockRecover(...args)
}))

const renderForm = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <PrivacyRetentionExpiredClaimHoldRecoveryForm
          candidateId='order:11111111-1111-4111-8111-111111111111'
          recordReference='OC-2026-001'
          refreshQueryKey={['admin-order', 'OC-2026-001']}
        />
      </QueryClientProvider>
    )
  }
}

const openAndComplete = () => {
  fireEvent.click(screen.getByRole('button', {
    name: 'Recover expired claim and place hold'
  }))
  fireEvent.change(screen.getByLabelText('Documented reason'), {
    target: { value: 'active-complaint' }
  })
  fireEvent.change(screen.getByLabelText('Review date'), {
    target: { value: '2099-01-20' }
  })
  fireEvent.change(screen.getByLabelText(/Exact confirmation phrase/), {
    target: { value: 'RECOVER CLAIM AND HOLD OC-2026-001' }
  })
  fireEvent.change(screen.getByLabelText('Admin password'), {
    target: { value: 'correct horse battery staple' }
  })
}

describe('PrivacyRetentionExpiredClaimHoldRecoveryForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRecover.mockResolvedValue({
      status: 'held',
      recordReference: 'OC-2026-001',
      claimRecovered: true,
      holdReviewAt: '2099-01-20T12:00:00.000Z',
      recoveredAt: '2026-08-25T14:00:00.000Z'
    })
  })

  it('is a closed, discoverable exceptional action with an explicit safety warning', () => {
    renderForm()

    const trigger = screen.getByRole('button', {
      name: 'Recover expired claim and place hold'
    })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByLabelText(/Exact confirmation phrase/)).not.toBeInTheDocument()

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'It refuses live claims and any claim where deletion may already have started.'
    )
  })

  it('requires reason, future review date, exact reference phrase and password', () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', {
      name: 'Recover expired claim and place hold'
    }))

    const submit = screen.getByRole('button', {
      name: 'Recover claim and place hold'
    })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Documented reason'), {
      target: { value: 'legal-claim' }
    })
    fireEvent.change(screen.getByLabelText('Review date'), {
      target: { value: '2099-01-20' }
    })
    fireEvent.change(screen.getByLabelText(/Exact confirmation phrase/), {
      target: { value: 'RECOVER CLAIM AND HOLD wrong-record' }
    })
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'admin-password' }
    })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/Exact confirmation phrase/), {
      target: { value: 'RECOVER CLAIM AND HOLD OC-2026-001' }
    })
    expect(submit).toBeEnabled()
  })

  it('keeps credentials out of React Query variables and supplies an AbortSignal', async () => {
    let resolveRecovery: ((value: unknown) => void) | undefined
    mockRecover.mockImplementation(() => new Promise((resolve) => {
      resolveRecovery = resolve
    }))
    const { queryClient } = renderForm()
    openAndComplete()

    fireEvent.click(screen.getByRole('button', {
      name: 'Recover claim and place hold'
    }))

    await waitFor(() => expect(mockRecover).toHaveBeenCalled())
    const variables = queryClient.getMutationCache().getAll()[0]?.state.variables
    const serializedVariables = JSON.stringify(variables)

    expect(serializedVariables).not.toContain('correct horse battery staple')
    expect(serializedVariables).not.toContain('RECOVER CLAIM AND HOLD')
    expect(variables).toEqual(expect.objectContaining({
      reason: 'active-complaint',
      reviewAt: '2099-01-20T12:00:00.000Z',
      signal: expect.any(AbortSignal)
    }))
    expect(mockRecover).toHaveBeenCalledWith(expect.objectContaining({
      candidateId: 'order:11111111-1111-4111-8111-111111111111',
      credentials: {
        password: 'correct horse battery staple',
        confirmation: 'RECOVER CLAIM AND HOLD OC-2026-001'
      },
      signal: expect.any(AbortSignal)
    }))
    expect(screen.getByLabelText('Admin password')).toHaveValue('')
    expect(screen.getByLabelText(/Exact confirmation phrase/)).toHaveValue('')

    await act(async () => {
      resolveRecovery?.({
        status: 'held',
        recordReference: 'OC-2026-001',
        claimRecovered: true,
        holdReviewAt: '2099-01-20T12:00:00.000Z',
        recoveredAt: '2026-08-25T14:00:00.000Z'
      })
    })
  })

  it('shows the standard success alert, refreshes evidence and restores trigger focus', async () => {
    renderForm()
    const trigger = screen.getByRole('button', {
      name: 'Recover expired claim and place hold'
    })
    openAndComplete()
    fireEvent.click(screen.getByRole('button', {
      name: 'Recover claim and place hold'
    }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Legal hold placed safely'
    )
    expect(mockRefresh).toHaveBeenCalled()
    expect(trigger).toHaveFocus()
    expect(screen.queryByLabelText('Admin password')).not.toBeInTheDocument()
  })

  it('clears secrets on failure and renders only the safe server message', async () => {
    mockRecover.mockRejectedValue(new Error(
      'Deletion may already have started, so this claim cannot be cancelled automatically.'
    ))
    renderForm()
    openAndComplete()
    fireEvent.click(screen.getByRole('button', {
      name: 'Recover claim and place hold'
    }))

    expect(await screen.findByText(
      'Deletion may already have started, so this claim cannot be cancelled automatically.'
    )).toBeInTheDocument()
    expect(screen.getByLabelText('Admin password')).toHaveValue('')
    expect(screen.getByLabelText(/Exact confirmation phrase/)).toHaveValue('')
  })

  it('clears all state and restores trigger focus when cancelled', () => {
    renderForm()
    const trigger = screen.getByRole('button', {
      name: 'Recover expired claim and place hold'
    })
    openAndComplete()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByLabelText('Admin password')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })
})
