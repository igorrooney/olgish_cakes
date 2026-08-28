import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PrivacyRetentionLifecycleReviewQueue } from '../PrivacyRetentionLifecycleReviewQueue'

const mockFetch = jest.fn()

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: React.ComponentProps<'a'>) => <a href={href} {...props}>{children}</a>
}))

const response = (body: unknown, ok = true) => ({
  ok,
  json: jest.fn().mockResolvedValue(body)
})

const issuePage = {
  issues: [
    {
      id: 'contact:12:missing-enquiry-deadline',
      recordType: 'contact',
      recordReference: 'contact-12',
      createdAt: '2022-01-01T10:00:00.000Z',
      issueCode: 'missing-enquiry-deadline',
      issueLabel: 'Closed record has no reliable deadline.',
      detailHref: '/admin/enquiries/contact/12',
      action: 'open-detail'
    },
    {
      id: 'event-photo:22222222-2222-4222-8222-222222222222:event-files-cleared-open',
      recordType: 'event-photo',
      recordReference: 'event-photo-22222222-2222-4222-8222-222222222222',
      createdAt: '2026-01-01T10:00:00.000Z',
      issueCode: 'event-files-cleared-open',
      issueLabel: 'Temporary files were cleared, but this request remains open.',
      action: 'close-event-now'
    }
  ],
  page: 1,
  pageSize: 20,
  hasMore: false
}

const renderQueue = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <PrivacyRetentionLifecycleReviewQueue />
    </QueryClientProvider>
  )
  return { ...view, queryClient }
}

describe('PrivacyRetentionLifecycleReviewQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = mockFetch
    mockFetch.mockResolvedValue(response(issuePage))
  })

  it('shows exact safe issues and direct detail links', async () => {
    renderQueue()

    expect(await screen.findByText('contact-12')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review record' })).toHaveAttribute(
      'href',
      '/admin/enquiries/contact/12'
    )
    expect(screen.getByText('event-photo-22222222-2222-4222-8222-222222222222')).toBeInTheDocument()
    expect(mockFetch.mock.calls[0][1]).toEqual(expect.objectContaining({
      credentials: 'include',
      signal: expect.any(AbortSignal)
    }))
  })

  it('requires password and the exact event reference before recording closure', async () => {
    mockFetch
      .mockResolvedValueOnce(response(issuePage))
      .mockResolvedValueOnce(response({ status: 'closed' }))
      .mockResolvedValueOnce(response({ ...issuePage, issues: [issuePage.issues[0]] }))
    const { queryClient } = renderQueue()

    fireEvent.click(await screen.findByRole('button', { name: 'Record closure now' }))
    const submit = screen.getAllByRole('button', { name: 'Record closure now' }).at(-1)
    if (!submit) {
      throw new Error('Missing event closure submit button')
    }
    const password = screen.getByLabelText('Admin password')
    const confirmation = screen.getByLabelText(/Type CLOSE EVENT/)
    fireEvent.change(password, { target: { value: 'admin password' } })
    fireEvent.change(confirmation, { target: { value: 'CLOSE EVENT wrong' } })
    expect(submit).toBeDisabled()

    fireEvent.change(confirmation, {
      target: { value: 'CLOSE EVENT 22222222-2222-4222-8222-222222222222' }
    })
    fireEvent.click(submit)

    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/privacy-retention/lifecycle-issues/event-photo/22222222-2222-4222-8222-222222222222/close',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        signal: expect.any(AbortSignal)
      })
    ))
    const closeCall = mockFetch.mock.calls.find((call) => String(call[0]).includes('/close'))
    expect(JSON.parse(String(closeCall?.[1]?.body))).toEqual({
      password: 'admin password',
      confirmation: 'CLOSE EVENT 22222222-2222-4222-8222-222222222222'
    })
    const cachedVariables = queryClient.getMutationCache().getAll().map((item) => item.state.variables)
    expect(JSON.stringify(cachedVariables)).not.toContain('admin password')
    expect(JSON.stringify(cachedVariables)).not.toContain('CLOSE EVENT 22222222')
    expect(await screen.findByRole('status')).toHaveTextContent('no customer data was deleted')
  })

  it('clears credentials and restores focus when event closure is cancelled', async () => {
    renderQueue()

    const trigger = await screen.findByRole('button', { name: 'Record closure now' })
    fireEvent.click(trigger)
    fireEvent.change(screen.getByLabelText('Admin password'), {
      target: { value: 'temporary password' }
    })
    fireEvent.change(screen.getByLabelText(/Type CLOSE EVENT/), {
      target: { value: 'temporary confirmation' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(trigger).toHaveFocus())
    fireEvent.click(trigger)
    expect(screen.getByLabelText('Admin password')).toHaveValue('')
    expect(screen.getByLabelText(/Type CLOSE EVENT/)).toHaveValue('')
  })

  it('shows a safe retry state when the queue request fails', async () => {
    mockFetch.mockResolvedValue(response({ error: 'provider internals' }, false))
    renderQueue()

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded')
    expect(screen.queryByText('provider internals')).not.toBeInTheDocument()
  })
})
