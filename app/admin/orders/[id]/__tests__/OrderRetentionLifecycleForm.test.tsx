/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { OrderRetentionLifecycleForm } from '../OrderRetentionLifecycleForm'

const renderForm = (ui: ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  const view = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
  return { ...view, queryClient }
}

const baseProps = {
  orderId: 'order-uuid-1',
  orderNumber: '26042009000001',
  createdAt: '2026-04-20T09:00:00.000Z',
  status: 'completed'
}

describe('OrderRetentionLifecycleForm', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-25T12:00:00.000Z'))
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('keeps active orders protected without offering a lifecycle date action', () => {
    renderForm(<OrderRetentionLifecycleForm {...baseProps} status='in-progress' />)

    expect(screen.getByText(/This order is still active/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Record verified terminal date' })).not.toBeInTheDocument()
  })

  it('shows existing lifecycle dates instead of allowing them to be replaced', () => {
    renderForm(<OrderRetentionLifecycleForm
      {...baseProps}
      lifecycle={{
        completedAt: '2026-05-02T12:00:00.000Z',
        financialYearEndedAt: '2027-04-05T00:00:00.000Z',
        retentionDueAt: '2033-04-06T00:00:00.000Z',
        legalHold: false
      }}
    />)

    expect(screen.getByText('02 May 2026')).toBeInTheDocument()
    expect(screen.getByText('06 Apr 2033')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Record verified terminal date' })).not.toBeInTheDocument()
  })

  it('requires evidence, exact confirmation and password and sends an abortable request', async () => {
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'updated',
        completedAt: '2026-05-02T12:00:00.000Z',
        financialYearEndedAt: '2027-04-05T00:00:00.000Z',
        retentionDueAt: '2033-04-06T00:00:00.000Z'
      })
    } as Response)
    const { queryClient } = renderForm(<OrderRetentionLifecycleForm {...baseProps} />)

    const submit = screen.getByRole('button', { name: 'Record verified terminal date' })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Verified terminal date'), {
      target: { value: '2026-05-02' }
    })
    fireEvent.change(screen.getByLabelText('Evidence used'), {
      target: { value: 'invoice-accounting-record' }
    })
    fireEvent.change(screen.getByLabelText('Type SET RETENTION 26042009000001'), {
      target: { value: 'SET RETENTION 26042009000001' }
    })
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'admin-secret' }
    })
    expect(submit).toBeEnabled()
    fireEvent.click(submit)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/orders/order-uuid-1/retention-lifecycle',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        signal: expect.any(AbortSignal),
        body: JSON.stringify({
          effectiveOn: '2026-05-02',
          evidenceBasis: 'invoice-accounting-record',
          confirmation: 'SET RETENTION 26042009000001',
          password: 'admin-secret'
        })
      })
    ))
    expect(screen.getByLabelText('Admin password')).toHaveValue('')
    expect(screen.getByLabelText('Type SET RETENTION 26042009000001')).toHaveValue('')
    const cachedVariables = JSON.stringify(queryClient.getMutationCache().getAll().map((item) => item.state.variables))
    expect(cachedVariables).not.toContain('admin-secret')
    expect(cachedVariables).not.toContain('SET RETENTION 26042009000001')
  })

  it('blocks lifecycle changes while a legal hold is active', () => {
    renderForm(<OrderRetentionLifecycleForm
      {...baseProps}
      lifecycle={{ legalHold: true }}
    />)

    expect(screen.getByText(/under a legal hold/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Record verified terminal date' })).not.toBeInTheDocument()
  })
})
