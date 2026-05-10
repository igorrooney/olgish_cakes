/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useContactPageEnquiry } from '../useContactPageEnquiry'
import {
  fetchCsrfToken,
  submitContactPageEnquiry
} from '../contactPageEnquiry'

jest.mock('../contactPageEnquiry', () => ({
  csrfTokenQueryKey: ['csrf-token'],
  csrfTokenStaleTimeMs: 5 * 60 * 1000,
  fetchCsrfToken: jest.fn(),
  submitContactPageEnquiry: jest.fn()
}))

const mockedFetchCsrfToken = fetchCsrfToken as jest.MockedFunction<typeof fetchCsrfToken>
const mockedSubmitContactPageEnquiry = submitContactPageEnquiry as jest.MockedFunction<typeof submitContactPageEnquiry>

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

describe('useContactPageEnquiry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedFetchCsrfToken.mockResolvedValue('csrf-token-123')
    mockedSubmitContactPageEnquiry.mockResolvedValue({ ok: true })
  })

  it('reports csrf loading while a token refresh is in flight', async () => {
    let resolveRefresh: ((value: string) => void) | null = null
    mockedFetchCsrfToken
      .mockResolvedValueOnce('csrf-token-123')
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveRefresh = resolve
      }))

    const { result } = renderHook(() => useContactPageEnquiry(), {
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
