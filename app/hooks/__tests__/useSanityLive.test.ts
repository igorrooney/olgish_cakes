/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSanityLive } from '../useSanityLive'

// Mock Sanity client
jest.mock('@/sanity/lib/client', () => {
  const mockFetch = jest.fn()
  const mockListen = jest.fn()
  return {
    client: {
      fetch: mockFetch,
      listen: mockListen
    },
    __mockFetch: mockFetch,
    __mockListen: mockListen
  }
})

const { __mockFetch: mockFetch, __mockListen: mockListen } = jest.requireMock('@/sanity/lib/client')
const mockSubscribe = jest.fn()
const mockUnsubscribe = jest.fn()

describe('useSanityLive', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSubscribe.mockReturnValue({ unsubscribe: mockUnsubscribe })
    mockListen.mockReturnValue({ subscribe: mockSubscribe })
  })

  describe('Initial Load', () => {
    it('should fetch data on mount', async () => {
      mockFetch.mockResolvedValue({ name: 'Test Data' })

      const { result } = renderHook(() =>
        useSanityLive({ query: '*[_type == "test"]' })
      )

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledWith('*[_type == "test"]', {})
      expect(result.current.data).toEqual({ name: 'Test Data' })
    })

    it('should use initialData while loading', () => {
      mockFetch.mockResolvedValue({ name: 'Fetched Data' })

      const { result } = renderHook(() =>
        useSanityLive({
          query: '*[_type == "test"]',
          initialData: { name: 'Initial Data' }
        })
      )

      expect(result.current.data).toEqual({ name: 'Initial Data' })
    })

    it('should handle params', async () => {
      mockFetch.mockResolvedValue({})

      renderHook(() =>
        useSanityLive({
          query: '*[_type == $type]',
          params: { type: 'cake' }
        })
      )

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('*[_type == $type]', { type: 'cake' })
      })
    })
  })

  describe('Error Handling', () => {
    it('should set error state on fetch failure', async () => {
      const error = new Error('Fetch failed')
      mockFetch.mockRejectedValue(error)

      const { result } = renderHook(() =>
        useSanityLive({ query: '*[_type == "test"]' })
      )

      await waitFor(() => {
        expect(result.current.error).toEqual(error)
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should log subscription errors', async () => {
      mockFetch.mockResolvedValue({})
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Subscription error')

      renderHook(() =>
        useSanityLive({ query: '*[_type == "test"]' })
      )

      await waitFor(() => {
        expect(mockListen).toHaveBeenCalled()
      })

      // Simulate subscription error
      const subscribeCall = mockSubscribe.mock.calls[0][0]
      act(() => {
        subscribeCall.error(error)
      })

      expect(consoleSpy).toHaveBeenCalledWith('Sanity live update error:', error)

      consoleSpy.mockRestore()
    })
  })

  describe('Real-time Updates', () => {
    it('should setup subscription', async () => {
      mockFetch.mockResolvedValue({ name: 'Test Data' })

      renderHook(() =>
        useSanityLive({ query: '*[_type == "test"]' })
      )

      await waitFor(() => {
        expect(mockListen).toHaveBeenCalledWith('*[_type == "test"]', {})
      })

      expect(mockSubscribe).toHaveBeenCalled()
    })

    it('should refetch data on update notification', async () => {
      mockFetch
        .mockResolvedValueOnce({ name: 'Initial Data' })
        .mockResolvedValueOnce({ name: 'Updated Data' })

      const { result } = renderHook(() =>
        useSanityLive({ query: '*[_type == "test"]' })
      )

      await waitFor(() => {
        expect(result.current.data).toEqual({ name: 'Initial Data' })
      })

      // Simulate update notification
      const subscribeCall = mockSubscribe.mock.calls[0][0]
      act(() => {
        subscribeCall.next({ documentId: 'test' })
      })

      await waitFor(() => {
        expect(result.current.data).toEqual({ name: 'Updated Data' })
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should cleanup subscription on unmount', async () => {
      mockFetch.mockResolvedValue({})

      const { unmount } = renderHook(() =>
        useSanityLive({ query: '*[_type == "test"]' })
      )

      await waitFor(() => {
        expect(mockSubscribe).toHaveBeenCalled()
      })

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('Enabled Flag', () => {
    it('should not fetch when disabled', () => {
      renderHook(() =>
        useSanityLive({
          query: '*[_type == "test"]',
          enabled: false
        })
      )

      expect(mockFetch).not.toHaveBeenCalled()
      expect(mockListen).not.toHaveBeenCalled()
    })

    it('should fetch when enabled=true', async () => {
      mockFetch.mockResolvedValue({})

      renderHook(() =>
        useSanityLive({
          query: '*[_type == "test"]',
          enabled: true
        })
      )

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })
    })
  })

  describe('Component Unmount', () => {
    it('should not update state after unmount', async () => {
      mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ name: 'Data' }), 100)))

      const { result, unmount } = renderHook(() =>
        useSanityLive({ query: '*[_type == "test"]' })
      )

      unmount()

      await new Promise(resolve => setTimeout(resolve, 150))

      // Data should remain null since component unmounted
      expect(result.current.data).toBeNull()
    })
  })

  describe('Params Changes', () => {
    it('should refetch when params change', async () => {
      mockFetch.mockResolvedValue({ name: 'Test' })

      const { rerender } = renderHook(
        ({ params }) => useSanityLive({ query: '*[_type == $type]', params }),
        { initialProps: { params: { type: 'cake' } } }
      )

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('*[_type == $type]', { type: 'cake' })
      })

      mockFetch.mockClear()

      rerender({ params: { type: 'hamper' } })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('*[_type == $type]', { type: 'hamper' })
      })
    })

    it('should memoize params to avoid unnecessary refetches', async () => {
      mockFetch.mockResolvedValue({ name: 'Test' })

      const { rerender } = renderHook(
        ({ params }) => useSanityLive({ query: '*[_type == $type]', params }),
        { initialProps: { params: { type: 'cake' } } }
      )

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })

      mockFetch.mockClear()

      // Rerender with same params value (different object reference)
      rerender({ params: { type: 'cake' } })

      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled()
      })
    })
  })

  describe('Return Value', () => {
    it('should return data, isLoading, and error', () => {
      mockFetch.mockResolvedValue({})

      const { result } = renderHook(() =>
        useSanityLive({ query: '*[_type == "test"]' })
      )

      expect(result.current).toHaveProperty('data')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
    })
  })
})

