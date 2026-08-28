import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PrivacyRetentionLegalHoldForm } from '../PrivacyRetentionLegalHoldForm'

const mockAddHold = jest.fn()
const mockRemoveHold = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh })
}))

jest.mock('../privacy-retention-api', () => ({
  addPrivacyRetentionHold: (...args: unknown[]) => mockAddHold(...args),
  removePrivacyRetentionHold: (...args: unknown[]) => mockRemoveHold(...args)
}))

const renderForm = (props: Partial<React.ComponentProps<typeof PrivacyRetentionLegalHoldForm>> = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <PrivacyRetentionLegalHoldForm
        candidateId='order:11111111-1111-4111-8111-111111111111'
        recordReference='OC-2026-00123'
        held={false}
        {...props}
      />
    </QueryClientProvider>
  )
}

describe('PrivacyRetentionLegalHoldForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAddHold.mockResolvedValue(undefined)
    mockRemoveHold.mockResolvedValue(undefined)
  })

  it('requires an explicit reason, future review date and password before placing a hold', async () => {
    renderForm()

    expect(screen.getByRole('button', {
      name: 'Recover expired claim and place hold'
    })).toBeInTheDocument()

    const submit = screen.getByRole('button', { name: 'Place legal hold' })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Documented reason'), {
      target: { value: 'active-complaint' }
    })
    fireEvent.change(screen.getByLabelText('Review date'), {
      target: { value: '2099-01-20' }
    })
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'correct horse battery staple' }
    })
    fireEvent.click(submit)

    await waitFor(() => expect(mockAddHold).toHaveBeenCalledWith(expect.objectContaining({
      candidateId: 'order:11111111-1111-4111-8111-111111111111',
      password: 'correct horse battery staple',
      reason: 'active-complaint',
      reviewAt: '2099-01-20T12:00:00.000Z',
      signal: expect.any(AbortSignal)
    })))
    expect(await screen.findByRole('status')).toHaveTextContent('Legal hold updated')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('requires the exact record-reference phrase before releasing a hold', async () => {
    renderForm({
      held: true,
      holdReason: 'legal-claim',
      holdReviewAt: '2099-02-01T12:00:00.000Z'
    })

    expect(screen.getByText(/Reason: Active or anticipated legal claim/)).toBeInTheDocument()
    expect(screen.queryByRole('button', {
      name: 'Recover expired claim and place hold'
    })).not.toBeInTheDocument()
    const submit = screen.getByRole('button', { name: 'Release legal hold' })
    fireEvent.change(screen.getByLabelText(/Type REMOVE HOLD/), {
      target: { value: 'REMOVE HOLD wrong' }
    })
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'correct horse battery staple' }
    })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/Type REMOVE HOLD/), {
      target: { value: 'REMOVE HOLD OC-2026-00123' }
    })
    fireEvent.click(submit)

    await waitFor(() => expect(mockRemoveHold).toHaveBeenCalledWith(expect.objectContaining({
      candidateId: 'order:11111111-1111-4111-8111-111111111111',
      confirmation: 'REMOVE HOLD OC-2026-00123',
      password: 'correct horse battery staple',
      signal: expect.any(AbortSignal)
    })))
  })

  it('clears the password and exposes a safe error when the request fails', async () => {
    mockAddHold.mockRejectedValue(new Error('The retention request could not be completed safely.'))
    renderForm()

    fireEvent.change(screen.getByLabelText('Documented reason'), {
      target: { value: 'regulatory-request' }
    })
    fireEvent.change(screen.getByLabelText('Review date'), {
      target: { value: '2099-03-01' }
    })
    const password = screen.getByLabelText('Admin password')
    fireEvent.change(password, { target: { value: 'admin password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Place legal hold' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be completed safely')
    expect(password).toHaveValue('')
  })
})
