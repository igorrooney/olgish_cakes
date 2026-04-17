/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useWorkshopEnquiry } from '../useWorkshopEnquiry'
import {
  fetchCsrfToken,
  submitWorkshopEnquiry
} from '@/app/services/workshopEnquiry'

jest.mock('@/app/services/workshopEnquiry', () => ({
  csrfTokenQueryKey: ['csrf-token'],
  csrfTokenStaleTimeMs: 5 * 60 * 1000,
  fetchCsrfToken: jest.fn(),
  submitWorkshopEnquiry: jest.fn()
}))

const mockedFetchCsrfToken = fetchCsrfToken as jest.MockedFunction<typeof fetchCsrfToken>
const mockedSubmitWorkshopEnquiry = submitWorkshopEnquiry as jest.MockedFunction<typeof submitWorkshopEnquiry>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useWorkshopEnquiry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedFetchCsrfToken.mockResolvedValue('csrf-token-123')
    mockedSubmitWorkshopEnquiry.mockResolvedValue({ ok: true })
  })

  it('loads the csrf token through React Query', async () => {
    const { result } = renderHook(() => useWorkshopEnquiry(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.csrfToken).toBe('csrf-token-123')
    })

    expect(mockedFetchCsrfToken).toHaveBeenCalledWith(expect.any(AbortSignal))
  })

  it('aborts the previous submit before starting a new one', async () => {
    mockedSubmitWorkshopEnquiry.mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useWorkshopEnquiry(), {
      wrapper: createWrapper()
    })
    const firstFormData = new FormData()
    const secondFormData = new FormData()

    await waitFor(() => {
      expect(result.current.csrfToken).toBe('csrf-token-123')
    })

    act(() => {
      result.current.submit(firstFormData)
    })

    act(() => {
      result.current.submit(secondFormData)
    })

    await waitFor(() => {
      expect(mockedSubmitWorkshopEnquiry).toHaveBeenCalledTimes(2)
    })

    const firstSignal = mockedSubmitWorkshopEnquiry.mock.calls[0]?.[1]
    const secondSignal = mockedSubmitWorkshopEnquiry.mock.calls[1]?.[1]

    expect(firstSignal).toBeInstanceOf(AbortSignal)
    expect(secondSignal).toBeInstanceOf(AbortSignal)
    expect(firstSignal?.aborted).toBe(true)
    expect(secondSignal?.aborted).toBe(false)
  })

  it('aborts the active submit when the hook unmounts', async () => {
    mockedSubmitWorkshopEnquiry.mockImplementation(() => new Promise(() => {}))
    const { result, unmount } = renderHook(() => useWorkshopEnquiry(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.csrfToken).toBe('csrf-token-123')
    })

    act(() => {
      result.current.submit(new FormData())
    })

    await waitFor(() => {
      expect(mockedSubmitWorkshopEnquiry).toHaveBeenCalledTimes(1)
    })

    const activeSignal = mockedSubmitWorkshopEnquiry.mock.calls[0]?.[1]

    unmount()

    expect(activeSignal?.aborted).toBe(true)
  })

  it('reports csrf loading while a token refresh is in flight', async () => {
    let resolveRefresh: ((value: string) => void) | null = null
    mockedFetchCsrfToken
      .mockResolvedValueOnce('csrf-token-123')
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveRefresh = resolve
      }))

    const { result } = renderHook(() => useWorkshopEnquiry(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.csrfToken).toBe('csrf-token-123')
    })

    let refreshPromise: Promise<string> | undefined

    act(() => {
      refreshPromise = result.current.refreshCsrfToken()
    })

    await waitFor(() => {
      expect(result.current.isCsrfLoading).toBe(true)
      expect(result.current.isRefreshingCsrf).toBe(true)
    })

    act(() => {
      resolveRefresh?.('csrf-token-456')
    })

    await act(async () => {
      await refreshPromise
    })

    await waitFor(() => {
      expect(result.current.isCsrfLoading).toBe(false)
      expect(result.current.isRefreshingCsrf).toBe(false)
    })
  })
})
