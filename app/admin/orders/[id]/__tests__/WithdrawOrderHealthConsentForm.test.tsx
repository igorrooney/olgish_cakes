import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { WithdrawOrderHealthConsentForm } from '../WithdrawOrderHealthConsentForm'

const createResponse = (body: object, status: number): Response => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(body)
} as unknown as Response)

const renderForm = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false }
    }
  })
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries')

  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <WithdrawOrderHealthConsentForm orderId='OC-1001' />
    </QueryClientProvider>
  )

  return { ...rendered, invalidateQueries }
}

describe('WithdrawOrderHealthConsentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('does not enable redaction for an inexact order reference', () => {
    const { container } = renderForm()

    const trigger = screen.getByRole('button', { name: 'Record consent withdrawal' })
    const disclosureId = trigger.getAttribute('aria-controls')

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(disclosureId).toBeTruthy()
    expect(document.getElementById(disclosureId as string)).not.toBeInTheDocument()

    fireEvent.click(trigger)
    fireEvent.change(screen.getByLabelText('Order reference'), { target: { value: 'OC-100' } })
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById(disclosureId as string)?.tagName).toBe('FORM')
    expect(screen.getByText('This permanently erases the health information.').closest('[role="alert"]')).toBeInTheDocument()
    expect(container.querySelectorAll('form')).toHaveLength(1)
    expect(screen.getByLabelText('Order reference')).toBeRequired()
    expect(screen.getByLabelText('Admin password')).toBeRequired()
    expect(screen.getByRole('button', { name: 'Erase health information' })).toBeDisabled()
  })

  it('posts the exact reference and invalidates only the affected admin order', async () => {
    const fetchMock = jest.mocked(global.fetch)
    fetchMock.mockResolvedValueOnce(createResponse({
      status: 'withdrawn',
      withdrawnAt: '2026-08-02T12:00:00.000Z'
    }, 200))
    const { invalidateQueries } = renderForm()

    fireEvent.click(screen.getByRole('button', { name: 'Record consent withdrawal' }))
    fireEvent.change(screen.getByLabelText('Order reference'), { target: { value: 'OC-1001' } })
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Erase health information' }))

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['admin-order', 'OC-1001']
      })
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/orders/OC-1001/withdraw-health-consent',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          password: 'admin-secret',
          confirmation: 'OC-1001'
        }),
        signal: expect.any(AbortSignal)
      })
    )
  })

  it('submits through the semantic withdrawal form', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(createResponse({
      status: 'withdrawn',
      withdrawnAt: '2026-08-02T12:00:00.000Z'
    }, 200))
    renderForm()

    fireEvent.click(screen.getByRole('button', { name: 'Record consent withdrawal' }))
    fireEvent.change(screen.getByLabelText('Order reference'), { target: { value: 'OC-1001' } })
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    const withdrawalForm = screen.getByRole('button', { name: 'Erase health information' }).closest('form')

    if (!withdrawalForm) {
      throw new Error('Withdrawal form was not rendered')
    }

    fireEvent.submit(withdrawalForm)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
  })

  it('shows a safe error and leaves the disclosure open', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(createResponse({
      error: 'Invalid admin password'
    }, 401))
    renderForm()

    const trigger = screen.getByRole('button', { name: 'Record consent withdrawal' })
    fireEvent.click(trigger)
    fireEvent.change(screen.getByLabelText('Order reference'), { target: { value: 'OC-1001' } })
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Erase health information' }))

    const error = await screen.findByText('Invalid admin password')
    expect(error.closest('[role="alert"]')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('rejects a 200 response with an unrecognised withdrawal status', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(createResponse({
      status: 'no-active-information',
      withdrawnAt: '2026-08-02T12:00:00.000Z'
    }, 200))
    renderForm()

    fireEvent.click(screen.getByRole('button', { name: 'Record consent withdrawal' }))
    fireEvent.change(screen.getByLabelText('Order reference'), { target: { value: 'OC-1001' } })
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Erase health information' }))

    expect(await screen.findByText('Dietary-health information could not be withdrawn.')).toBeInTheDocument()
  })

  it('clears confirmation fields when the admin cancels', () => {
    renderForm()

    fireEvent.click(screen.getByRole('button', { name: 'Record consent withdrawal' }))
    fireEvent.change(screen.getByLabelText('Order reference'), { target: { value: 'OC-1001' } })
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    const trigger = screen.getByRole('button', { name: 'Record consent withdrawal' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)

    expect(screen.getByLabelText('Order reference')).toHaveValue('')
    expect(screen.getByLabelText('Admin password')).toHaveValue('')
  })
})
