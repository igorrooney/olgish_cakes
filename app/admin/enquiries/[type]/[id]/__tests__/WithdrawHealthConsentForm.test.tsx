import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { WithdrawHealthConsentForm } from '../WithdrawHealthConsentForm'

const mockRefresh = jest.fn()
const createResponse = (body: object, status: number): Response => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(body)
} as unknown as Response)

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh
  })
}))

const renderForm = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false }
    }
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <WithdrawHealthConsentForm type='contact' recordReference='42' />
    </QueryClientProvider>
  )
}

describe('WithdrawHealthConsentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('requires the exact reference and admin password before enabling irreversible redaction', () => {
    renderForm()

    const trigger = screen.getByRole('button', { name: 'Record consent withdrawal' })
    const disclosureId = trigger.getAttribute('aria-controls')

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(disclosureId).toBeTruthy()
    expect(document.getElementById(disclosureId as string)).not.toBeInTheDocument()

    fireEvent.click(trigger)

    const submit = screen.getByRole('button', { name: 'Erase health information' })
    expect(submit).toBeDisabled()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById(disclosureId as string)).toHaveAttribute('aria-labelledby', trigger.id)
    expect(screen.getByText('This permanently erases the health information.').closest('[role="alert"]')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Record reference'), { target: { value: '41' } })
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Record reference'), { target: { value: '42' } })
    expect(submit).toBeEnabled()
  })

  it('sends only the confirmation credentials and refreshes after success', async () => {
    const fetchMock = jest.mocked(global.fetch)
    fetchMock.mockResolvedValueOnce(createResponse({
      status: 'withdrawn',
      withdrawnAt: '2026-08-02T12:00:00.000Z'
    }, 200))
    renderForm()

    fireEvent.click(screen.getByRole('button', { name: 'Record consent withdrawal' }))
    fireEvent.change(screen.getByLabelText('Record reference'), { target: { value: '42' } })
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Erase health information' }))

    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1))

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/enquiries/contact/42/withdraw-health-consent',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          password: 'admin-secret',
          confirmation: '42'
        }),
        signal: expect.any(AbortSignal)
      })
    )
    expect(screen.getByRole('button', { name: 'Record consent withdrawal' })).toBeInTheDocument()
  })

  it('shows a safe server error without closing the confirmation form', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(createResponse({
      error: 'Invalid admin password'
    }, 401))
    renderForm()

    fireEvent.click(screen.getByRole('button', { name: 'Record consent withdrawal' }))
    fireEvent.change(screen.getByLabelText('Record reference'), { target: { value: '42' } })
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Erase health information' }))

    const error = await screen.findByText('Invalid admin password')
    expect(error.closest('[role="alert"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Record consent withdrawal' })).toHaveAttribute('aria-expanded', 'true')
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('rejects a 200 response with an unrecognised withdrawal status', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(createResponse({
      status: 'not-found',
      withdrawnAt: '2026-08-02T12:00:00.000Z'
    }, 200))
    renderForm()

    fireEvent.click(screen.getByRole('button', { name: 'Record consent withdrawal' }))
    fireEvent.change(screen.getByLabelText('Record reference'), { target: { value: '42' } })
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Erase health information' }))

    expect(await screen.findByText('Dietary-health information could not be withdrawn.')).toBeInTheDocument()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('clears credentials, errors and disclosure state when cancelled', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(createResponse({
      error: 'Invalid admin password'
    }, 401))
    renderForm()

    const trigger = screen.getByRole('button', { name: 'Record consent withdrawal' })
    fireEvent.click(trigger)
    fireEvent.change(screen.getByLabelText('Record reference'), { target: { value: '42' } })
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Erase health information' }))
    expect(await screen.findByText('Invalid admin password')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)

    expect(screen.getByLabelText('Record reference')).toHaveValue('')
    expect(screen.getByLabelText('Admin password')).toHaveValue('')
    expect(screen.queryByText('Invalid admin password')).not.toBeInTheDocument()
  })
})
