import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PrivacyRetentionRunDetailsView } from '../PrivacyRetentionRunDetails'

const mockFetch = jest.fn()
const runReference = 'RET-20260825-A1B2C3D4'

const details = {
  runReference,
  mode: 'manual',
  status: 'partial',
  startedAt: '2026-08-25T09:00:00.000Z',
  completedAt: '2026-08-25T09:01:00.000Z',
  updatedAt: '2026-08-25T09:01:00.000Z',
  counts: {
    candidates: 3,
    selected: 2,
    succeeded: 1,
    skipped: 0,
    failed: 1
  },
  auditInitialisationIncomplete: false,
  actions: [
    {
      candidateId: 'enquiry:contact:12',
      category: 'expired-enquiry',
      recordType: 'Contact enquiry',
      recordReference: 'contact-12',
      action: 'delete-enquiry-record',
      outcome: 'deleted',
      errorCode: null,
      occurredAt: '2026-08-25T09:00:20.000Z'
    },
    {
      candidateId: 'order:22222222-2222-4222-8222-222222222222',
      category: 'expired-order',
      recordType: 'Order record',
      recordReference: 'OC-2026-0001',
      action: 'delete-order-record',
      outcome: 'failed',
      errorCode: 'RETENTION_ORDER_DELETE_FAILED',
      occurredAt: '2026-08-25T09:00:30.000Z',
      deletedPayload: 'SENTINEL_DELETED_CONTENT'
    }
  ],
  providerPayload: 'SENTINEL_PROVIDER_PAYLOAD'
}

const response = (body: unknown, ok = true) => ({
  ok,
  json: jest.fn().mockResolvedValue(body)
})

const renderDetails = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  })

  return {
    ...render(
    <QueryClientProvider client={queryClient}>
      <PrivacyRetentionRunDetailsView runReference={runReference} />
    </QueryClientProvider>
    ),
    queryClient
  }
}

describe('PrivacyRetentionRunDetailsView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = mockFetch
    mockFetch.mockResolvedValue(response(details))
  })

  it('loads only after the admin chooses View results and passes an AbortSignal', async () => {
    renderDetails()
    expect(mockFetch).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'View results' }))

    expect(await screen.findByRole('heading', { name: 'Retention run results' })).toBeInTheDocument()
    expect(await screen.findByText('OC-2026-0001')).toBeInTheDocument()
    expect(screen.getByText('RETENTION_ORDER_DELETE_FAILED')).toBeInTheDocument()
    expect(screen.getByText('3 / 2')).toBeInTheDocument()
    expect(screen.queryByText(/SENTINEL/)).not.toBeInTheDocument()
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/admin/privacy-retention/runs/${runReference}`,
      {
        credentials: 'include',
        signal: expect.any(AbortSignal)
      }
    )

    fireEvent.click(screen.getByRole('button', { name: 'Refresh results' }))
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2))
  })

  it('shows a clear normal empty state for a terminal owner-review run', async () => {
    mockFetch.mockResolvedValue(response({
      ...details,
      mode: 'owner-review',
      status: 'completed',
      counts: {
        candidates: 0,
        selected: 0,
        succeeded: 0,
        skipped: 0,
        failed: 0
      },
      actions: []
    }))
    renderDetails()
    fireEvent.click(screen.getByRole('button', { name: 'View results' }))

    expect(await screen.findByText(/No item-level actions were recorded/)).toBeInTheDocument()
    expect(screen.getByText('Owner Review')).toBeInTheDocument()
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0)
    expect(screen.queryByText('Audit initialisation incomplete')).not.toBeInTheDocument()
  })

  it('warns when an active manual run has fewer action audits than selected records', async () => {
    mockFetch.mockResolvedValue(response({
      ...details,
      status: 'running',
      completedAt: null,
      counts: {
        ...details.counts,
        succeeded: 0,
        failed: 0
      },
      auditInitialisationIncomplete: true,
      actions: [{
        ...details.actions[0],
        outcome: 'pending',
        errorCode: null
      }]
    }))
    renderDetails()
    fireEvent.click(screen.getByRole('button', { name: 'View results' }))

    expect(await screen.findByText('Audit initialisation incomplete')).toBeInTheDocument()
    expect(screen.getByText(/1 of 2 selected item-level audit records/)).toBeInTheDocument()
    expect(screen.getByText(/Do not retry or treat these results as complete/)).toBeInTheDocument()
    expect(screen.queryByText(/Discovery and owner-review runs normally/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Review and resume' })).not.toBeInTheDocument()
  })

  it('resumes only the exact persisted pending selection without caching credentials', async () => {
    const pendingDetails = {
      ...details,
      status: 'running',
      completedAt: null,
      counts: {
        ...details.counts,
        succeeded: 0,
        failed: 0
      },
      actions: details.actions.map((action) => ({
        ...action,
        outcome: 'pending',
        errorCode: null
      }))
    }
    const completedDetails = {
      ...pendingDetails,
      status: 'completed',
      completedAt: '2026-08-25T09:03:00.000Z',
      updatedAt: '2026-08-25T09:03:00.000Z',
      counts: {
        ...pendingDetails.counts,
        succeeded: 2
      },
      actions: pendingDetails.actions.map((action) => ({
        ...action,
        outcome: 'deleted'
      }))
    }
    let resolveResume: ((value: ReturnType<typeof response>) => void) | null = null
    const resumeResponse = new Promise<ReturnType<typeof response>>((resolve) => {
      resolveResume = resolve
    })
    mockFetch
      .mockResolvedValueOnce(response(pendingDetails))
      .mockReturnValueOnce(resumeResponse)
      .mockResolvedValue(response(completedDetails))

    const { queryClient } = renderDetails()
    fireEvent.click(screen.getByRole('button', { name: 'View results' }))

    expect(await screen.findByText('Persisted run needs resumption')).toBeInTheDocument()
    expect(screen.getByText(/resumes only the 2 pending items from the exact saved selection/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Review and resume' }))

    const password = screen.getByLabelText('Admin password')
    const confirmation = screen.getByLabelText(`Type ${`RESUME ${runReference}`}`)
    const submit = screen.getByRole('button', { name: 'Resume pending items' })
    expect(password).toHaveFocus()
    expect(submit).toBeDisabled()

    const passwordSentinel = 'SENTINEL-ADMIN-PASSWORD'
    fireEvent.change(password, { target: { value: passwordSentinel } })
    fireEvent.change(confirmation, { target: { value: `RESUME ${runReference}` } })
    expect(submit).toBeEnabled()
    fireEvent.click(submit)

    expect(screen.getByRole('button', { name: 'Resuming persisted run...' })).toBeDisabled()
    expect(password).toHaveValue('')
    expect(confirmation).toHaveValue('')
    const mutation = queryClient.getMutationCache().getAll().at(-1)
    expect(mutation?.state.variables).toEqual({
      runReference,
      signal: expect.any(AbortSignal)
    })
    expect(JSON.stringify(mutation?.state.variables)).not.toContain(passwordSentinel)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2))
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      `/api/admin/privacy-retention/runs/${runReference}/resume`,
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        signal: expect.any(AbortSignal)
      })
    )
    expect(String(mockFetch.mock.calls[1]?.[1]?.body)).toContain(passwordSentinel)

    await act(async () => {
      resolveResume?.(response({
        status: 'completed',
        runReference,
        completedAt: '2026-08-25T09:03:00.000Z',
        selectedCount: 2,
        succeededCount: 2,
        failedCount: 0,
        results: pendingDetails.actions.map((action) => ({
          candidateId: action.candidateId,
          status: 'deleted',
          message: 'The selected retained information was removed.'
        }))
      }))
      await resumeResponse
    })

    expect(await screen.findByText('Persisted run finalised')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(/status Completed: 2 deleted, 0 failed and 0 skipped/)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3))
  })

  it('clears resume credentials and presents a safe focused error', async () => {
    const pendingDetails = {
      ...details,
      status: 'running',
      completedAt: null,
      counts: {
        ...details.counts,
        succeeded: 0,
        failed: 0
      },
      actions: details.actions.map((action) => ({
        ...action,
        outcome: 'pending',
        errorCode: null
      }))
    }
    mockFetch
      .mockResolvedValueOnce(response(pendingDetails))
      .mockResolvedValueOnce(response({ error: 'SENTINEL_PROVIDER_DETAIL' }, false))

    renderDetails()
    fireEvent.click(screen.getByRole('button', { name: 'View results' }))
    await screen.findByText('Persisted run needs resumption')
    fireEvent.click(screen.getByRole('button', { name: 'Review and resume' }))

    const password = screen.getByLabelText('Admin password')
    const confirmation = screen.getByLabelText(`Type ${`RESUME ${runReference}`}`)
    fireEvent.change(password, { target: { value: 'secret-password' } })
    fireEvent.change(confirmation, { target: { value: `RESUME ${runReference}` } })
    fireEvent.click(screen.getByRole('button', { name: 'Resume pending items' }))

    expect(await screen.findByText(/could not be resumed safely/)).toBeInTheDocument()
    expect(screen.queryByText(/SENTINEL/)).not.toBeInTheDocument()
    expect(password).toHaveValue('')
    expect(confirmation).toHaveValue('')
    expect(password).toHaveClass('input-error')
    expect(password).toHaveFocus()
  })

  it.each([
    {
      label: 'a terminal manual run with a missing action',
      payload: {
        ...details,
        actions: [details.actions[1]]
      }
    },
    {
      label: 'a terminal manual run with mismatched outcome tallies',
      payload: {
        ...details,
        counts: {
          ...details.counts,
          succeeded: 0,
          skipped: 1
        }
      }
    },
    {
      label: 'a terminal owner review with actions',
      payload: {
        ...details,
        mode: 'owner-review',
        counts: {
          ...details.counts,
          selected: 0,
          succeeded: 0,
          failed: 0
        },
        actions: [details.actions[0]]
      }
    },
    {
      label: 'an active manual run with more actions than selected records',
      payload: {
        ...details,
        status: 'running',
        completedAt: null,
        counts: {
          ...details.counts,
          selected: 1,
          succeeded: 0,
          failed: 0
        },
        actions: details.actions.map((action) => ({
          ...action,
          outcome: 'pending',
          errorCode: null
        }))
      }
    },
    {
      label: 'an incorrect audit-initialisation flag',
      payload: {
        ...details,
        status: 'running',
        completedAt: null,
        counts: {
          ...details.counts,
          succeeded: 0,
          failed: 0
        },
        actions: [{
          ...details.actions[0],
          outcome: 'pending',
          errorCode: null
        }],
        auditInitialisationIncomplete: false
      }
    }
  ])('rejects $label from the API', async ({ payload }) => {
    mockFetch.mockResolvedValue(response(payload))
    renderDetails()
    fireEvent.click(screen.getByRole('button', { name: 'View results' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded')
    expect(screen.queryByText('OC-2026-0001')).not.toBeInTheDocument()
  })

  it('shows a safe retry state without echoing response details', async () => {
    mockFetch.mockResolvedValue(response({ error: 'SENTINEL_PROVIDER_DETAIL' }, false))
    renderDetails()
    fireEvent.click(screen.getByRole('button', { name: 'View results' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded')
    expect(screen.queryByText(/SENTINEL/)).not.toBeInTheDocument()

    mockFetch.mockResolvedValue(response(details))
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('OC-2026-0001')).toBeInTheDocument()
  })

  it('closes with Escape and restores focus to the trigger', async () => {
    renderDetails()
    const trigger = screen.getByRole('button', { name: 'View results' })
    fireEvent.click(trigger)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })
})
