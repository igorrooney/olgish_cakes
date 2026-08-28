/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import type { AdminEnquiryDetail } from '@/lib/enquiries/supabase-enquiries'
import { EnquiryRetentionLifecycleForm } from '../EnquiryRetentionLifecycleForm'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh
  })
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode
    href: string
  }) => <a href={href} {...props}>{children}</a>
}))

const createResponse = (body: object, status: number): Response => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(body)
} as unknown as Response)

const openLifecycle: AdminEnquiryDetail['retentionLifecycle'] = {
  status: 'open',
  legalHold: false
}

const renderForm = (
  lifecycle: AdminEnquiryDetail['retentionLifecycle'] = openLifecycle
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false }
    }
  })

  const view = render(
    <QueryClientProvider client={queryClient}>
      <EnquiryRetentionLifecycleForm
        type='contact'
        recordReference='42'
        lifecycle={lifecycle}
      />
    </QueryClientProvider>
  )
  return { ...view, queryClient }
}

describe('EnquiryRetentionLifecycleForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('records contact with admin reauthentication and an abortable request', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(createResponse({
      status: 'updated',
      updatedAt: '2026-08-25T12:00:00.000Z'
    }, 200))
    const { queryClient } = renderForm()

    expect(screen.getByText('Open')).toHaveClass('badge-info')
    expect(screen.getByText(/not queued for routine deletion/i)).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Close enquiry' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Reopen enquiry' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Record contact' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'admin-secret' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Record contact' }))

    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1))

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/enquiries/contact/42/retention-lifecycle',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          password: 'admin-secret',
          action: 'record-contact'
        }),
        signal: expect.any(AbortSignal)
      })
    )
    expect(screen.getByRole('status')).toHaveTextContent('Customer contact recorded.')
    expect(screen.getByRole('status')).toHaveClass('alert-success')
    expect(screen.getByLabelText('Admin password')).toHaveValue('')
    expect(JSON.stringify(queryClient.getMutationCache().getAll().map((item) => item.state.variables))).not.toContain('admin-secret')
  })

  it('requires a safe visible order number or ID before converting an enquiry', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(createResponse({
      status: 'updated',
      updatedAt: '2026-08-25T12:00:00.000Z'
    }, 200))
    const { queryClient } = renderForm()

    fireEvent.change(screen.getByLabelText('Lifecycle action'), {
      target: { value: 'convert' }
    })
    fireEvent.change(screen.getByLabelText('Existing order number or ID'), {
      target: { value: 'not an order id' }
    })
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'admin-secret' }
    })

    expect(screen.getByLabelText('Existing order number or ID')).toHaveClass('input-error')
    expect(screen.getByLabelText('Existing order number or ID')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(/only letters, numbers, full stops, underscores or hyphens/i).closest('[role="alert"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Link enquiry to order' })).toBeDisabled()

    const orderId = '26042009000001'
    fireEvent.change(screen.getByLabelText('Existing order number or ID'), {
      target: { value: ` ${orderId} ` }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Link enquiry to order' }))

    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1))
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/enquiries/contact/42/retention-lifecycle',
      expect.objectContaining({
        body: JSON.stringify({
          password: 'admin-secret',
          action: 'convert',
          convertedOrderId: orderId
        }),
        signal: expect.any(AbortSignal)
      })
    )
    expect(screen.getByText('Enquiry linked to the order.')).toBeInTheDocument()
  })

  it('shows closed deadlines and makes reopening explicit without deleting anything', () => {
    renderForm({
      status: 'closed',
      lastContactedAt: '2026-08-20T10:15:00.000Z',
      closedAt: '2026-08-25T11:30:00.000Z',
      retentionDueAt: '2028-08-25T11:30:00.000Z',
      uploadRetentionDueAt: '2028-08-25T11:30:00.000Z',
      legalHold: false
    })

    expect(screen.getByText('Closed')).toHaveClass('badge-neutral')
    expect(screen.getByText(/explicit selection before deletion/i)).toBeInTheDocument()
    expect(screen.getAllByText(/25 Aug 2028/)).toHaveLength(2)
    expect(screen.getByRole('option', { name: 'Reopen enquiry' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Close enquiry' })).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Lifecycle action'), {
      target: { value: 'reopen' }
    })
    expect(screen.getByText(/removes the current retention deadline/i)).toBeInTheDocument()
  })

  it('shows the converted order and prevents routine deletion while a hold is active', () => {
    const orderId = '123e4567-e89b-12d3-a456-426614174000'
    renderForm({
      status: 'converted',
      closedAt: '2026-08-25T11:30:00.000Z',
      convertedOrderId: orderId,
      retentionDueAt: '2033-04-06T00:00:00.000Z',
      uploadRetentionDueAt: '2028-08-25T11:30:00.000Z',
      legalHold: true
    })

    expect(screen.getByText('Converted to order')).toHaveClass('badge-success')
    expect(screen.getByText('Legal hold')).toHaveClass('badge-warning')
    expect(screen.getByRole('link', { name: `Open linked order ${orderId}` })).toHaveAttribute(
      'href',
      `/admin/orders/${orderId}`
    )
    expect(screen.getByText('Routine deletion is paused').closest('.alert-warning')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'privacy retention centre' })).toHaveAttribute(
      'href',
      '/admin/privacy-retention'
    )
    expect(screen.queryByRole('option', { name: 'Link to an order' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Lifecycle action')).toBeDisabled()
    expect(screen.getByLabelText('Admin password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Record contact' })).toBeDisabled()
  })

  it('shows only a safe API error and does not refresh on malformed success', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(createResponse({
      status: 'updated',
      updatedAt: null,
      error: { database: 'private detail' }
    }, 200))
    const { queryClient } = renderForm()

    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'admin-secret' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Record contact' }))

    const error = await screen.findByText('The enquiry lifecycle could not be updated.')
    expect(error.closest('[role="alert"]')).toBeInTheDocument()
    expect(screen.queryByText('private detail')).not.toBeInTheDocument()
    expect(mockRefresh).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Admin password')).toHaveValue('')
    expect(JSON.stringify(queryClient.getMutationCache().getAll().map((item) => item.state.variables))).not.toContain('admin-secret')
  })

  it('aborts an in-flight lifecycle request when the component unmounts', async () => {
    let requestSignal: AbortSignal | undefined
    jest.mocked(global.fetch).mockImplementation((_input, init) => {
      requestSignal = init?.signal || undefined
      return new Promise<Response>(() => {})
    })
    const view = renderForm()

    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'admin-secret' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Record contact' }))

    await waitFor(() => expect(requestSignal).toBeInstanceOf(AbortSignal))
    expect(requestSignal?.aborted).toBe(false)

    view.unmount()
    expect(requestSignal?.aborted).toBe(true)
  })
})
