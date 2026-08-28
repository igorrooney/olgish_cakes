import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LegacyHealthRetentionScheduleForm } from '../LegacyHealthRetentionScheduleForm'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh
  })
}))

const createResponse = (body: object, status: number): Response => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(body)
} as unknown as Response)

const renderForm = (recordKind: 'enquiry' | 'order' = 'enquiry') => {
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
      {recordKind === 'enquiry' ? (
        <LegacyHealthRetentionScheduleForm
          recordKind='enquiry'
          enquiryType='contact'
          recordReference='42'
        />
      ) : (
        <LegacyHealthRetentionScheduleForm
          recordKind='order'
          recordReference='order-42'
        />
      )}
    </QueryClientProvider>
    )
  }
}

describe('LegacyHealthRetentionScheduleForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('keeps the confirmation closed until requested and requires the exact phrase', () => {
    renderForm()

    const trigger = screen.getByRole('button', {
      name: 'Start 30-day health retention period'
    })
    const disclosureId = trigger.getAttribute('aria-controls')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(disclosureId).toBeTruthy()
    expect(document.getElementById(disclosureId as string)).not.toBeInTheDocument()

    fireEvent.click(trigger)

    const submit = screen.getByRole('button', { name: 'Start 30-day period' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(submit).toBeDisabled()
    expect(screen.getByText(/does not accept or infer a historical date/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Exact confirmation phrase'), {
      target: { value: '42' }
    })
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'admin-secret' }
    })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Exact confirmation phrase'), {
      target: { value: 'START HEALTH RETENTION 42' }
    })
    expect(submit).toBeEnabled()
  })

  it('sends only credentials with cancellation and shows the standard success alert', async () => {
    const fetchMock = jest.mocked(global.fetch)
    fetchMock.mockResolvedValueOnce(createResponse({
      status: 'scheduled',
      dueAt: '2026-09-24T12:00:00.000Z'
    }, 200))
    const { queryClient } = renderForm()

    fireEvent.click(screen.getByRole('button', {
      name: 'Start 30-day health retention period'
    }))
    fireEvent.change(screen.getByLabelText('Exact confirmation phrase'), {
      target: { value: 'START HEALTH RETENTION 42' }
    })
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'admin-secret' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Start 30-day period' }))

    const success = await screen.findByText('Health retention period started')
    expect(success.closest('[role="status"]')).toHaveClass(
      'alert',
      'alert-success',
      'w-full',
      'items-start',
      'text-sm'
    )
    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1))
    expect(screen.getByRole('button', {
      name: 'Start 30-day health retention period'
    })).toHaveFocus()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/enquiries/contact/42/schedule-health-retention',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          password: 'admin-secret',
          confirmation: 'START HEALTH RETENTION 42'
        }),
        signal: expect.any(AbortSignal)
      })
    )
    const mutationVariables = queryClient.getMutationCache().getAll()[0]?.state.variables
    expect(JSON.stringify(mutationVariables)).not.toContain('admin-secret')
    expect(JSON.stringify(mutationVariables)).not.toContain('START HEALTH RETENTION 42')
  })

  it('uses the order endpoint and rejects malformed success responses', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(createResponse({
      status: 'not-found',
      dueAt: '2026-09-24T12:00:00.000Z'
    }, 200))
    renderForm('order')

    fireEvent.click(screen.getByRole('button', {
      name: 'Start 30-day health retention period'
    }))
    fireEvent.change(screen.getByLabelText('Exact confirmation phrase'), {
      target: { value: 'START HEALTH RETENTION order-42' }
    })
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'admin-secret' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Start 30-day period' }))

    expect(await screen.findByText(
      'The dietary-health retention period could not be started.'
    )).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/orders/order-42/schedule-health-retention',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('clears secrets and errors when cancelled', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(createResponse({
      error: 'Invalid admin password'
    }, 401))
    renderForm()

    const trigger = screen.getByRole('button', {
      name: 'Start 30-day health retention period'
    })
    fireEvent.click(trigger)
    fireEvent.change(screen.getByLabelText('Exact confirmation phrase'), {
      target: { value: 'START HEALTH RETENTION 42' }
    })
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'wrong' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Start 30-day period' }))
    expect(await screen.findByText('Invalid admin password')).toBeInTheDocument()
    expect(screen.getByLabelText('Exact confirmation phrase')).toHaveValue('')
    expect(screen.getByLabelText('Admin password')).toHaveValue('')

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
    fireEvent.click(trigger)
    expect(screen.getByLabelText('Exact confirmation phrase')).toHaveValue('')
    expect(screen.getByLabelText('Admin password')).toHaveValue('')
    expect(screen.queryByText('Invalid admin password')).not.toBeInTheDocument()
  })
})
