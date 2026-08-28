/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PrivacyRetentionActiveHoldRegister } from '../PrivacyRetentionActiveHoldRegister'

const mockFetch = jest.fn()

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>{children}</a>
  )
}))

const response = (body: unknown, status = 200): Response => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(body)
} as unknown as Response)

const activePage = {
  holds: [
    {
      candidateId: 'enquiry:contact:12',
      recordType: 'contact-enquiry',
      recordReference: 'contact-12',
      reason: 'active-complaint',
      reviewAt: '2026-08-01T00:00:00.000Z',
      overdue: true,
      detailHref: '/admin/enquiries/contact/12'
    },
    {
      candidateId: 'security:admin-login-attempts',
      recordType: 'security-batch',
      recordReference: 'admin-login-attempts',
      reason: 'fraud-investigation',
      reviewAt: '2026-10-01T00:00:00.000Z',
      overdue: false
    }
  ],
  page: 1,
  pageSize: 20,
  hasMore: false
}

const emptyPage = {
  holds: [],
  page: 1,
  pageSize: 20,
  hasMore: false
}

const renderRegister = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <PrivacyRetentionActiveHoldRegister />
    </QueryClientProvider>
  )
  return { ...view, queryClient }
}

describe('PrivacyRetentionActiveHoldRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = mockFetch
    mockFetch.mockResolvedValue(response(activePage))
  })

  it('shows overdue and non-due holds with safe detail actions', async () => {
    renderRegister()

    expect((await screen.findAllByText('contact-12'))[0]).toBeInTheDocument()
    expect(screen.getByText('Review overdue')).toBeInTheDocument()
    expect(screen.getByText('Active hold')).toBeInTheDocument()
    expect(screen.getByText('Active complaint or dispute')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review record' })).toHaveAttribute(
      'href',
      '/admin/enquiries/contact/12'
    )
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/privacy-retention/holds/active?page=1&pageSize=20',
      expect.objectContaining({
        credentials: 'include',
        signal: expect.any(AbortSignal)
      })
    )
    expect(screen.queryByText(/dietary health/i)).not.toBeInTheDocument()
  })

  it('always renders a clear empty register state', async () => {
    mockFetch.mockResolvedValue(response(emptyPage))
    renderRegister()

    expect(await screen.findByRole('heading', {
      name: 'Active legal-hold register'
    })).toBeInTheDocument()
    expect(screen.getByText('No active legal holds are recorded.')).toBeInTheDocument()
  })

  it('requires exact confirmation, releases safely and retains no credentials in mutation variables', async () => {
    let released = false
    mockFetch.mockImplementation(async (input, init) => {
      const url = String(input)
      if (url.includes('/holds/active')) {
        return response(released ? emptyPage : activePage)
      }
      if (url === '/api/admin/privacy-retention/holds' && init?.method === 'DELETE') {
        released = true
        return response({ status: 'released' })
      }
      throw new Error(`Unexpected request: ${url}`)
    })
    const { queryClient } = renderRegister()

    fireEvent.click(await screen.findByRole('button', {
      name: 'Review hold contact-12'
    }))
    const submit = screen.getByRole('button', { name: 'Release legal hold' })
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'temporary admin password' }
    })
    fireEvent.change(screen.getByLabelText(/Type REMOVE HOLD contact-12/), {
      target: { value: 'REMOVE HOLD wrong' }
    })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/Type REMOVE HOLD contact-12/), {
      target: { value: 'REMOVE HOLD contact-12' }
    })
    fireEvent.click(submit)

    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/privacy-retention/holds',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
        signal: expect.any(AbortSignal),
        body: JSON.stringify({
          password: 'temporary admin password',
          candidateId: 'enquiry:contact:12',
          confirmation: 'REMOVE HOLD contact-12'
        })
      })
    ))
    const cachedVariables = queryClient.getMutationCache().getAll()
      .map((mutation) => mutation.state.variables)
    expect(JSON.stringify(cachedVariables)).not.toContain('temporary admin password')
    expect(JSON.stringify(cachedVariables)).not.toContain('REMOVE HOLD contact-12')
    expect(await screen.findByRole('status')).toHaveTextContent(
      'No record was deleted'
    )
    await waitFor(() => expect(screen.getByText(
      'No active legal holds are recorded.'
    )).toBeInTheDocument())
  })

  it('scrubs controlled credentials and restores trigger focus when cancelled', async () => {
    renderRegister()

    const trigger = await screen.findByRole('button', {
      name: 'Review hold contact-12'
    })
    fireEvent.click(trigger)
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'temporary password' }
    })
    fireEvent.change(screen.getByLabelText(/Type REMOVE HOLD contact-12/), {
      target: { value: 'temporary confirmation' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(trigger).toHaveFocus())
    fireEvent.click(trigger)
    expect(screen.getByLabelText('Admin password')).toHaveValue('')
    expect(screen.getByLabelText(/Type REMOVE HOLD contact-12/)).toHaveValue('')
  })

  it('clears credentials and exposes only a safe error after a release failure', async () => {
    mockFetch.mockImplementation(async (input, init) => {
      if (String(input).includes('/holds/active')) {
        return response(activePage)
      }
      if (String(input) === '/api/admin/privacy-retention/holds' && init?.method === 'DELETE') {
        return response({ error: 'provider detail MUST-NOT-LEAK' }, 500)
      }
      throw new Error(`Unexpected request: ${String(input)}`)
    })
    renderRegister()

    fireEvent.click(await screen.findByRole('button', {
      name: 'Review hold contact-12'
    }))
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'temporary password' }
    })
    fireEvent.change(screen.getByLabelText(/Type REMOVE HOLD contact-12/), {
      target: { value: 'REMOVE HOLD contact-12' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Release legal hold' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'could not be released safely'
    )
    expect(screen.queryByText('MUST-NOT-LEAK')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Admin password')).toHaveValue('')
    expect(screen.getByLabelText(/Type REMOVE HOLD contact-12/)).toHaveValue('')
    expect(screen.getByLabelText('Admin password')).toHaveFocus()
  })

  it('fails closed for an invalid response contract', async () => {
    mockFetch.mockResolvedValue(response({
      ...activePage,
      holds: [{ ...activePage.holds[0], reason: 'provider-secret-value' }]
    }))
    renderRegister()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'could not be loaded'
    )
    expect(screen.queryByText('provider-secret-value')).not.toBeInTheDocument()
  })

  it('cancels the active register request when unmounted', () => {
    let requestSignal: AbortSignal | undefined
    mockFetch.mockImplementation((_input, init) => {
      requestSignal = init?.signal ?? undefined
      return new Promise<Response>(() => {})
    })
    const view = renderRegister()

    expect(requestSignal).toBeInstanceOf(AbortSignal)
    view.unmount()
    expect(requestSignal?.aborted).toBe(true)
  })
})
