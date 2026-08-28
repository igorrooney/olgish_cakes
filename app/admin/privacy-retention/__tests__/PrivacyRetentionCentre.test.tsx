/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { PrivacyRetentionPreview, PrivacyRetentionRunResponse } from '@/lib/privacy-retention/types'
import { PrivacyRetentionCentre } from '../PrivacyRetentionCentre'

jest.mock('../PrivacyRetentionActiveHoldRegister', () => ({
  PrivacyRetentionActiveHoldRegister: () => (
    <section aria-label='Active legal-hold register'>
      <h2>Active legal-hold register</h2>
    </section>
  )
}))

const preview: PrivacyRetentionPreview = {
  generatedAt: '2026-08-25T08:30:00.000Z',
  runReference: 'RET-20260825-ABC123',
  snapshotToken: `eyJ2ZXJzaW9uIjoxfQ.${'a'.repeat(43)}`,
  confirmationPhrase: 'DELETE RET-20260825-ABC123',
  ownerReview: {
    ownerLabel: 'Data controller',
    lastReviewedAt: '2026-05-01T09:00:00.000Z',
    nextReviewDueAt: '2026-09-01T09:00:00.000Z',
    status: 'due-soon'
  },
  summary: {
    due: 2,
    held: 1,
    needsLifecycleReview: 0,
    failedLastRun: 0
  },
  categories: [
    {
      id: 'expired-enquiry',
      label: 'Expired enquiries',
      description: 'Closed enquiries that passed their documented retention period.'
    },
    {
      id: 'expired-enquiry-upload',
      label: 'Expired enquiry uploads',
      description: 'Enquiry uploads whose separate file-retention deadline has passed.'
    },
    {
      id: 'expired-order-upload',
      label: 'Expired order uploads',
      description: 'Order uploads whose separate file-retention deadline has passed.'
    },
    {
      id: 'expired-order',
      label: 'Expired orders',
      description: 'Completed order records that passed their financial retention period.'
    },
    {
      id: 'expired-health-information',
      label: 'Expired dietary health information',
      description: 'Protected health content whose separate deadline has passed.'
    },
    {
      id: 'expired-security-record',
      label: 'Expired security records',
      description: 'Bounded security batches whose retention period has passed.'
    }
  ],
  categoryCounts: [
    { category: 'expired-enquiry', total: 2, due: 1, held: 1 },
    { category: 'expired-enquiry-upload', total: 0, due: 0, held: 0 },
    { category: 'expired-order-upload', total: 0, due: 0, held: 0 },
    { category: 'expired-order', total: 1, due: 1, held: 0 },
    { category: 'expired-health-information', total: 0, due: 0, held: 0 },
    { category: 'expired-security-record', total: 0, due: 0, held: 0 }
  ],
  pagination: {
    page: 1,
    pageSize: 50,
    totalCandidates: 3,
    totalPages: 1,
    hasPrevious: false,
    hasMore: false
  },
  candidates: [
    {
      id: 'candidate-enquiry-1',
      category: 'expired-enquiry',
      recordType: 'Contact enquiry',
      recordReference: 'ENQ-0001',
      dueAt: '2026-08-01T00:00:00.000Z',
      reason: 'Closed more than 24 months ago.',
      removes: ['Enquiry record', 'Associated consent evidence'],
      retains: ['Aggregate deletion audit count'],
      itemCount: 2,
      held: false
    },
    {
      id: 'candidate-enquiry-held',
      category: 'expired-enquiry',
      recordType: 'Workshop enquiry',
      recordReference: 'ENQ-0002',
      dueAt: '2026-07-01T00:00:00.000Z',
      reason: 'Closed more than 24 months ago.',
      removes: ['Enquiry record'],
      retains: ['Legal-hold audit evidence'],
      itemCount: 1,
      held: true,
      holdReason: 'active-complaint',
      holdReviewAt: '2026-10-01T00:00:00.000Z'
    },
    {
      id: 'candidate-order-1',
      category: 'expired-order',
      recordType: 'Order',
      recordReference: 'ORD-0001',
      dueAt: '2026-04-06T00:00:00.000Z',
      reason: 'Financial retention period ended.',
      removes: ['Order record'],
      retains: [],
      itemCount: 1,
      held: false
    }
  ],
  history: [
    {
      runReference: 'RET-20260501-ABC123',
      mode: 'manual',
      status: 'completed',
      startedAt: '2026-05-01T09:00:00.000Z',
      completedAt: '2026-05-01T09:02:00.000Z',
      selectedCount: 2,
      succeededCount: 2,
      failedCount: 0
    }
  ]
}

const emptyPreview: PrivacyRetentionPreview = {
  ...preview,
  summary: {
    due: 0,
    held: 0,
    needsLifecycleReview: 0,
    failedLastRun: 0
  },
  categoryCounts: preview.categoryCounts.map((count) => ({
    ...count,
    total: 0,
    due: 0,
    held: 0
  })),
  pagination: {
    page: 1,
    pageSize: 50,
    totalCandidates: 0,
    totalPages: 1,
    hasPrevious: false,
    hasMore: false
  },
  candidates: [],
  history: []
}

const runResponse: PrivacyRetentionRunResponse = {
  status: 'completed',
  runReference: preview.runReference,
  completedAt: '2026-08-25T08:35:00.000Z',
  selectedCount: 1,
  succeededCount: 1,
  failedCount: 0,
  results: [
    {
      candidateId: 'candidate-enquiry-1',
      status: 'deleted',
      message: 'Deleted'
    }
  ]
}

const createResponse = (body: unknown, status = 200): Response => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(body)
} as unknown as Response)

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const renderCentre = () => {
  const queryClient = createQueryClient()
  const view = render(
    <QueryClientProvider client={queryClient}>
      <PrivacyRetentionCentre />
    </QueryClientProvider>
  )
  return { ...view, queryClient }
}

const mockPreviewFetch = (value: PrivacyRetentionPreview = preview) => {
  jest.mocked(global.fetch).mockImplementation(async (input) => {
    if (String(input) === '/api/admin/privacy-retention?page=1') {
      return createResponse(value)
    }

    throw new Error(`Unexpected request: ${String(input)}`)
  })
}

describe('PrivacyRetentionCentre', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('shows loading state and cancels the preview request when unmounted', () => {
    let requestSignal: AbortSignal | undefined

    jest.mocked(global.fetch).mockImplementation((_input, init) => {
      requestSignal = init?.signal ?? undefined

      return new Promise<Response>((_resolve, reject) => {
        requestSignal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      })
    })

    const view = renderCentre()

    expect(screen.getByRole('status', { name: 'Loading privacy retention centre' })).toBeInTheDocument()
    expect(requestSignal).toBeInstanceOf(AbortSignal)

    view.unmount()

    expect(requestSignal?.aborted).toBe(true)
  })

  it('shows a safe error state when the preview request fails', async () => {
    jest.mocked(global.fetch).mockResolvedValue(createResponse({}, 500))

    renderCentre()

    expect(await screen.findByRole('alert')).toHaveTextContent('The privacy retention centre could not be loaded.')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('fails closed when a successful preview response has an invalid contract', async () => {
    jest.mocked(global.fetch).mockResolvedValue(createResponse({
      ...preview,
      candidates: [{ ...preview.candidates[0], held: 'no' }]
    }))

    renderCentre()

    expect(await screen.findByRole('alert')).toHaveTextContent('The privacy retention centre could not be loaded.')
    expect(screen.queryByRole('button', { name: /Review .* selected/ })).not.toBeInTheDocument()
  })

  it('fails closed when the preview has no valid signed-snapshot envelope', async () => {
    jest.mocked(global.fetch).mockResolvedValue(createResponse({
      ...preview,
      snapshotToken: 'invalid-token'
    }))

    renderCentre()

    expect(await screen.findByRole('alert')).toHaveTextContent('The privacy retention centre could not be loaded.')
    expect(screen.queryByRole('button', { name: /Review .* selected/ })).not.toBeInTheDocument()
  })

  it('shows empty candidate and history states without enabling deletion', async () => {
    mockPreviewFetch(emptyPreview)

    renderCentre()

    expect(await screen.findByRole('heading', { name: 'Privacy retention centre' })).toBeInTheDocument()
    expect(screen.getByText('No records are due for deletion')).toBeInTheDocument()
    expect(screen.getByText('No retention runs recorded')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Review 0 selected candidates' })).toBeDisabled()
  })

  it('renders safe references, deletion effects, owner status and run history', async () => {
    mockPreviewFetch()

    renderCentre()

    expect(await screen.findByRole('checkbox', { name: 'Contact enquiry ENQ-0001' })).toBeInTheDocument()
    expect(screen.getAllByText('Permanently removes')).toHaveLength(3)
    expect(screen.getByText('Affected items: 2')).toBeInTheDocument()
    expect(screen.getAllByText('Enquiry record')).toHaveLength(2)
    expect(screen.getByText('Aggregate deletion audit count')).toBeInTheDocument()
    expect(screen.getByText('Data controller')).toBeInTheDocument()
    expect(screen.getByText('RET-20260501-ABC123')).toBeInTheDocument()
    expect(screen.getByText('Due candidates held')).toBeInTheDocument()
    const holdRegister = screen.getByRole('heading', {
      name: 'Active legal-hold register'
    })
    const ownerReview = screen.getByRole('heading', {
      name: 'Owner retention review'
    })
    expect(
      holdRegister.compareDocumentPosition(ownerReview) &
      Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(screen.queryByText('Secret allergy note')).not.toBeInTheDocument()
  })

  it('accepts and renders the separate health-information retention category', async () => {
    mockPreviewFetch({
      ...preview,
      summary: { ...preview.summary, due: 3 },
      categoryCounts: preview.categoryCounts.map((count) =>
        count.category === 'expired-health-information'
          ? { ...count, total: 1, due: 1 }
          : count
      ),
      pagination: { ...preview.pagination, totalCandidates: 4 },
      candidates: [
        ...preview.candidates,
        {
          id: 'health:enquiry:contact:12',
          category: 'expired-health-information',
          recordType: 'Enquiry health information',
          recordReference: 'contact-12',
          dueAt: '2026-08-20T00:00:00.000Z',
          reason: 'The separate health-information deadline has passed.',
          removes: ['The protected dietary-health text and active consent state'],
          retains: ['The enquiry and non-content consent/erasure evidence'],
          itemCount: 1,
          held: false
        }
      ]
    })

    renderCentre()

    const checkbox = await screen.findByRole('checkbox', {
      name: 'Enquiry health information contact-12'
    })
    expect(checkbox).not.toBeChecked()
    expect(screen.getByText('The protected dietary-health text and active consent state')).toBeInTheDocument()
    expect(screen.queryByText('PRIVATE_DIETARY_HEALTH_SENTINEL')).not.toBeInTheDocument()
  })

  it('supports individual, category and global selection while excluding legal holds', async () => {
    mockPreviewFetch()

    renderCentre()

    const enquiryCheckbox = await screen.findByRole('checkbox', { name: 'Contact enquiry ENQ-0001' })
    const heldCheckbox = screen.getByRole('checkbox', { name: 'Workshop enquiry ENQ-0002' })
    const orderCheckbox = screen.getByRole('checkbox', { name: 'Order ORD-0001' })
    const enquiryCategoryCheckbox = screen.getByRole('checkbox', { name: 'Select all visible in Expired enquiries' })

    expect(enquiryCheckbox).not.toBeChecked()
    expect(heldCheckbox).toBeDisabled()
    expect(orderCheckbox).not.toBeChecked()

    fireEvent.click(enquiryCategoryCheckbox)

    expect(enquiryCheckbox).toBeChecked()
    expect(heldCheckbox).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Select all visible due records' })).toHaveProperty('indeterminate', true)

    fireEvent.click(screen.getByRole('button', { name: 'Clear 1 selected' }))
    expect(enquiryCheckbox).not.toBeChecked()
    expect(heldCheckbox).not.toBeChecked()

    fireEvent.click(enquiryCategoryCheckbox)
    expect(enquiryCheckbox).toBeChecked()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all visible due records' }))

    expect(enquiryCheckbox).toBeChecked()
    expect(orderCheckbox).toBeChecked()
    expect(heldCheckbox).not.toBeChecked()
    expect(screen.getByText('2 selected')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(enquiryCheckbox).not.toBeChecked()
    expect(orderCheckbox).not.toBeChecked()

    fireEvent.click(orderCheckbox)
    expect(screen.getByText('1 selected')).toBeInTheDocument()
  })

  it('invalidates irreversible confirmation when the selected candidate changes', async () => {
    mockPreviewFetch()
    renderCentre()

    const enquiryCheckbox = await screen.findByRole('checkbox', { name: 'Contact enquiry ENQ-0001' })
    const orderCheckbox = screen.getByRole('checkbox', { name: 'Order ORD-0001' })

    fireEvent.click(enquiryCheckbox)
    fireEvent.click(screen.getByRole('button', { name: 'Review 1 selected candidate' }))
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    fireEvent.change(screen.getByLabelText(`Type ${preview.confirmationPhrase}`), { target: { value: preview.confirmationPhrase } })
    fireEvent.click(screen.getByRole('checkbox', { name: /I understand that this run removes only the live records/ }))
    expect(screen.getByRole('button', { name: 'Permanently delete selected records' })).toBeEnabled()

    fireEvent.click(enquiryCheckbox)
    fireEvent.click(orderCheckbox)

    expect(screen.queryByRole('button', { name: 'Permanently delete selected records' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Review 1 selected candidate' }))

    const finalButton = screen.getByRole('button', { name: 'Permanently delete selected records' })
    const finalForm = finalButton.closest('form')
    expect(finalForm).not.toBeNull()
    expect(within(finalForm as HTMLFormElement).getByText('ORD-0001')).toBeInTheDocument()
    expect(screen.getByLabelText('Admin password')).toHaveValue('')
    expect(screen.getByRole('checkbox', { name: /I understand that this run removes only the live records/ })).not.toBeChecked()
    expect(finalButton).toBeDisabled()
  })

  it('limits a bulk selection to the first 100 due candidates', async () => {
    const candidates = Array.from({ length: 100 }, (_value, index) => ({
      ...preview.candidates[0],
      id: `candidate-${index}`,
      recordReference: `ENQ-${String(index + 1).padStart(4, '0')}`
    }))
    mockPreviewFetch({
      ...preview,
      summary: { ...preview.summary, due: candidates.length, held: 0 },
      categoryCounts: preview.categoryCounts.map((count) =>
        count.category === 'expired-enquiry'
          ? { ...count, total: candidates.length, due: candidates.length, held: 0 }
          : { ...count, total: 0, due: 0, held: 0 }
      ),
      pagination: {
        ...preview.pagination,
        pageSize: 100,
        totalCandidates: candidates.length
      },
      candidates
    })

    renderCentre()

    fireEvent.click(await screen.findByRole('checkbox', { name: 'Select all visible due records' }))

    expect(screen.getByText('100 selected')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Contact enquiry ENQ-0100' })).toBeChecked()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Clear 100 visible selected records' }))
    expect(screen.getByText('0 selected')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all visible in Expired enquiries' }))
    expect(screen.getByText('100 selected')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear 100 selected' }))
    expect(screen.getByText('0 selected')).toBeInTheDocument()
  })

  it('loads candidate 51 on the next bounded page and clears page-one selection', async () => {
    const secondPageCandidate = {
      ...preview.candidates[0],
      id: 'candidate-enquiry-51',
      recordReference: 'ENQ-0051'
    }
    const firstPageCandidates = Array.from({ length: 50 }, (_value, index) => ({
      ...preview.candidates[0],
      id: `candidate-enquiry-${index + 1}`,
      recordReference: `ENQ-${String(index + 1).padStart(4, '0')}`,
      held: index === 49,
      ...(index === 49
        ? {
            holdReason: 'active-complaint' as const,
            holdReviewAt: '2026-10-01T00:00:00.000Z'
          }
        : {})
    }))
    const firstPage = {
      ...preview,
      summary: { ...preview.summary, due: 50, held: 1 },
      categoryCounts: preview.categoryCounts.map((count) =>
        count.category === 'expired-enquiry'
          ? { ...count, total: 51, due: 50, held: 1 }
          : { ...count, total: 0, due: 0, held: 0 }
      ),
      candidates: firstPageCandidates,
      pagination: {
        page: 1,
        pageSize: 50,
        totalCandidates: 51,
        totalPages: 2,
        hasPrevious: false,
        hasMore: true
      }
    }
    const secondPage = {
      ...firstPage,
      candidates: [secondPageCandidate],
      pagination: {
        ...firstPage.pagination,
        page: 2,
        hasPrevious: true,
        hasMore: false
      }
    }
    jest.mocked(global.fetch).mockImplementation(async (input) => {
      if (String(input) === '/api/admin/privacy-retention?page=1') {
        return createResponse(firstPage)
      }
      if (String(input) === '/api/admin/privacy-retention?page=2') {
        return createResponse(secondPage)
      }
      throw new Error(`Unexpected request: ${String(input)}`)
    })

    renderCentre()

    fireEvent.click(await screen.findByRole('checkbox', {
      name: 'Contact enquiry ENQ-0001'
    }))
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('checkbox', {
      name: 'Contact enquiry ENQ-0051'
    })).toBeInTheDocument()
    expect(screen.getByText('0 selected')).toBeInTheDocument()
    expect(screen.getByText(/Page 2 of/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('requires a review step, password and exact phrase before posting selected IDs with a signal', async () => {
    const fetchMock = jest.mocked(global.fetch)
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input)

      if (url === '/api/admin/privacy-retention?page=1' && (!init?.method || init.method === 'GET')) {
        return createResponse(preview)
      }

      if (url === '/api/admin/privacy-retention/runs' && init?.method === 'POST') {
        return createResponse(runResponse)
      }

      throw new Error(`Unexpected request: ${url}`)
    })

    const { queryClient } = renderCentre()

    fireEvent.click(await screen.findByRole('checkbox', { name: 'Contact enquiry ENQ-0001' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review 1 selected candidate' }))

    expect(screen.getAllByText('Affected items: 2').length).toBeGreaterThanOrEqual(2)

    const finalButton = screen.getByRole('button', { name: 'Permanently delete selected records' })
    expect(finalButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    fireEvent.change(screen.getByLabelText(`Type ${preview.confirmationPhrase}`), { target: { value: 'wrong phrase' } })
    expect(finalButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText(`Type ${preview.confirmationPhrase}`), { target: { value: preview.confirmationPhrase } })
    expect(finalButton).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: /I understand that this run removes only the live records/ }))
    expect(finalButton).toBeEnabled()
    fireEvent.click(finalButton)

    expect(await screen.findByText(/Retention run RET-20260825-ABC123 completed/)).toBeInTheDocument()

    const runCall = fetchMock.mock.calls.find(([input]) => String(input) === '/api/admin/privacy-retention/runs')
    expect(runCall).toBeDefined()
    expect(runCall?.[1]).toEqual(expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      signal: expect.any(AbortSignal),
      body: JSON.stringify({
        password: 'admin-secret',
        confirmation: preview.confirmationPhrase,
        runReference: preview.runReference,
        snapshotToken: preview.snapshotToken,
        candidateIds: ['candidate-enquiry-1'],
        acknowledgedExternalCopies: true
      })
    }))
    const cachedVariables = JSON.stringify(
      queryClient.getMutationCache().getAll().map((item) => item.state.variables)
    )
    expect(cachedVariables).not.toContain('admin-secret')
    expect(cachedVariables).not.toContain(preview.confirmationPhrase)
  })

  it('closes and clears an ambiguous deletion while directing staff to persisted run details', async () => {
    jest.mocked(global.fetch).mockImplementation(async (input, init) => {
      if (String(input) === '/api/admin/privacy-retention?page=1' && (!init?.method || init.method === 'GET')) {
        return createResponse(preview)
      }

      if (String(input) === '/api/admin/privacy-retention/runs') {
        return createResponse({}, 500)
      }

      throw new Error('Unexpected request')
    })

    const { queryClient } = renderCentre()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Order ORD-0001' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review 1 selected candidate' }))
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    fireEvent.change(screen.getByLabelText(`Type ${preview.confirmationPhrase}`), { target: { value: preview.confirmationPhrase } })
    fireEvent.click(screen.getByRole('checkbox', { name: /I understand that this run removes only the live records/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Permanently delete selected records' }))

    expect(await screen.findByText(/The browser did not receive a definitive result/)).toBeInTheDocument()
    expect(screen.getByText(/Open and resolve the persisted run details/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Permanently delete selected records' })).not.toBeInTheDocument()
    expect(screen.getByText('0 selected')).toBeInTheDocument()
    expect(screen.queryByLabelText('Admin password')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(`Type ${preview.confirmationPhrase}`)).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /I understand that this run removes only the live records/ })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Order ORD-0001' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Select all visible due records' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Review 0 selected candidates' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Record owner review' })).toBeEnabled()
    expect(JSON.stringify(
      queryClient.getMutationCache().getAll().map((item) => item.state.variables)
    )).not.toContain('admin-secret')
  })

  it('reports a definitive authentication rejection without claiming a persisted run exists', async () => {
    jest.mocked(global.fetch).mockImplementation(async (input, init) => {
      if (String(input) === '/api/admin/privacy-retention?page=1' && (!init?.method || init.method === 'GET')) {
        return createResponse(preview)
      }

      if (String(input) === '/api/admin/privacy-retention/runs') {
        return createResponse({ error: 'UNREVIEWED_PROVIDER_DETAIL' }, 401)
      }

      throw new Error('Unexpected request')
    })

    renderCentre()
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Order ORD-0001' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review 1 selected candidate' }))
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'wrong-secret' } })
    fireEvent.change(screen.getByLabelText(`Type ${preview.confirmationPhrase}`), { target: { value: preview.confirmationPhrase } })
    fireEvent.click(screen.getByRole('checkbox', { name: /I understand that this run removes only the live records/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Permanently delete selected records' }))

    expect(await screen.findByText('Deletion request rejected')).toBeInTheDocument()
    expect(screen.getByText(/admin session or password was not accepted/i)).toBeInTheDocument()
    expect(screen.queryByText('Check the persisted run before taking another action')).not.toBeInTheDocument()
    expect(screen.queryByText('UNREVIEWED_PROVIDER_DETAIL')).not.toBeInTheDocument()
    expect(screen.getByText('0 selected')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Permanently delete selected records' })).not.toBeInTheDocument()
  })

  it('records owner review only after exact review confirmation', async () => {
    const fetchMock = jest.mocked(global.fetch)
    fetchMock.mockImplementation(async (input, init) => {
      if (String(input) === '/api/admin/privacy-retention?page=1' && (!init?.method || init.method === 'GET')) {
        return createResponse(preview)
      }

      if (String(input) === '/api/admin/privacy-retention/review') {
        return createResponse({ status: 'recorded' })
      }

      throw new Error('Unexpected request')
    })

    renderCentre()
    fireEvent.click(await screen.findByRole('button', { name: 'Record owner review' }))

    const form = screen.getByRole('heading', { name: 'Confirm owner review' }).closest('form')
    expect(form).not.toBeNull()
    const formQueries = within(form as HTMLFormElement)
    const submit = formQueries.getByRole('button', { name: 'Record reviewed schedule' })

    fireEvent.change(formQueries.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    fireEvent.change(formQueries.getByLabelText(`Type REVIEW ${preview.runReference}`), { target: { value: `REVIEW ${preview.runReference}` } })
    expect(submit).toBeDisabled()
    fireEvent.click(formQueries.getByRole('checkbox', { name: /reviewed the retention schedule/i }))
    fireEvent.click(formQueries.getByRole('checkbox', { name: /checked the relevant processor accounts/i }))
    expect(submit).toBeEnabled()
    fireEvent.click(submit)

    expect(await screen.findByText('The owner retention review was recorded and the next review date was scheduled.')).toBeInTheDocument()

    const reviewCall = fetchMock.mock.calls.find(([input]) => String(input) === '/api/admin/privacy-retention/review')
    expect(reviewCall?.[1]).toEqual(expect.objectContaining({
      signal: expect.any(AbortSignal),
      body: JSON.stringify({
        password: 'admin-secret',
        confirmation: `REVIEW ${preview.runReference}`,
        runReference: preview.runReference,
        reviewedSchedule: true,
        reviewedExternalSystems: true
      })
    }))
  })

  it('requires an exact phrase before releasing a held candidate', async () => {
    const fetchMock = jest.mocked(global.fetch)
    fetchMock.mockImplementation(async (input, init) => {
      if (String(input) === '/api/admin/privacy-retention?page=1' && (!init?.method || init.method === 'GET')) {
        return createResponse(preview)
      }

      if (String(input) === '/api/admin/privacy-retention/holds' && init?.method === 'DELETE') {
        return createResponse({ status: 'released' })
      }

      throw new Error('Unexpected request')
    })

    renderCentre()
    fireEvent.click(await screen.findByRole('button', { name: 'Review or release hold' }))

    const releaseButton = screen.getByRole('button', { name: 'Release legal hold' })
    expect(releaseButton).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    fireEvent.change(screen.getByLabelText('Type REMOVE HOLD ENQ-0002'), { target: { value: 'REMOVE HOLD ENQ-0002' } })
    expect(releaseButton).toBeEnabled()
    fireEvent.click(releaseButton)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/privacy-retention/holds',
      expect.objectContaining({
        method: 'DELETE',
        signal: expect.any(AbortSignal),
        body: JSON.stringify({
          password: 'admin-secret',
          candidateId: 'candidate-enquiry-held',
          confirmation: 'REMOVE HOLD ENQ-0002'
        })
      })
    ))
  })

  it('records a standardised legal hold reason and ISO review date with a signal', async () => {
    const fetchMock = jest.mocked(global.fetch)
    fetchMock.mockImplementation(async (input, init) => {
      if (String(input) === '/api/admin/privacy-retention?page=1' && (!init?.method || init.method === 'GET')) {
        return createResponse(preview)
      }

      if (String(input) === '/api/admin/privacy-retention/holds' && init?.method === 'POST') {
        return createResponse({ status: 'held' })
      }

      throw new Error('Unexpected request')
    })

    renderCentre()
    const candidateCheckbox = await screen.findByRole('checkbox', { name: 'Contact enquiry ENQ-0001' })
    const candidateRow = candidateCheckbox.closest('tr')
    expect(candidateRow).not.toBeNull()
    fireEvent.click(within(candidateRow as HTMLTableRowElement).getByRole('button', { name: 'Place legal hold' }))
    expect(screen.getByRole('button', {
      name: 'Recover expired claim and place hold'
    })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Documented reason'), { target: { value: 'active-complaint' } })
    fireEvent.change(screen.getByLabelText('Hold review date'), { target: { value: '2026-10-01' } })
    fireEvent.change(screen.getByLabelText('Admin password'), { target: { value: 'admin-secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Record legal hold' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/privacy-retention/holds',
      expect.objectContaining({
        method: 'POST',
        signal: expect.any(AbortSignal),
        body: JSON.stringify({
          password: 'admin-secret',
          candidateId: 'candidate-enquiry-1',
          reason: 'active-complaint',
          reviewAt: '2026-10-01T00:00:00.000Z'
        })
      })
    ))
    expect(await screen.findByText('The legal hold was recorded. This candidate is excluded from deletion.')).toBeInTheDocument()
  })
})
