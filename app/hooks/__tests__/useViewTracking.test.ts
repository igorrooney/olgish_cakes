/**
 * @jest-environment jsdom
 */

// Mock window properties BEFORE any imports
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'event', {
    value: undefined,
    configurable: true,
    writable: true
  })
}

// Mock HTMLIFrameElement if not defined
if (typeof HTMLIFrameElement === 'undefined') {
  (global as any).HTMLIFrameElement = class HTMLIFrameElement {}
}

import { renderHook, waitFor } from '@testing-library/react'
import { useViewTracking } from '../useViewTracking'

describe('useViewTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Initial State', () => {
    it('should not track immediately', () => {
      renderHook(() => useViewTracking({ postId: 'post-1' }))

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should return hasTracked as false initially', () => {
      const { result } = renderHook(() => useViewTracking({ postId: 'post-1' }))

      expect(result.current.hasTracked).toBe(false)
    })
  })

  describe('View Tracking', () => {
    it('should track view after 2 seconds', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true })

      renderHook(() => useViewTracking({ postId: 'post-1' }))

      jest.advanceTimersByTime(2000)
      await Promise.resolve() // Flush promises

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/blog-posts/post-1/view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      })
    })

    it('should track view correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true })

      const { result } = renderHook(() => useViewTracking({ postId: 'post-1' }))

      expect(result.current).toBeDefined()

      jest.advanceTimersByTime(2000)
      await Promise.resolve() // Flush promises

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('should not set hasTracked if request fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false })

      const { result } = renderHook(() => useViewTracking({ postId: 'post-1' }))

      jest.advanceTimersByTime(2000)
      await Promise.resolve() // Flush promises

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })

      expect(result.current.hasTracked).toBe(false)
    })

    it('should handle fetch errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'))
      global.fetch = mockFetch

      renderHook(() => useViewTracking({ postId: 'post-1' }))

      jest.advanceTimersByTime(2000)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled()
      }, { timeout: 3000 })

      consoleSpy.mockRestore()
    })
  })

  describe('Enabled Flag', () => {
    it('should not track when enabled is false', () => {
      renderHook(() => useViewTracking({ postId: 'post-1', enabled: false }))

      jest.advanceTimersByTime(2000)

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should track when enabled is true', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true })

      renderHook(() => useViewTracking({ postId: 'post-1', enabled: true }))

      jest.advanceTimersByTime(2000)
      await Promise.resolve() // Flush promises

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })
    })
  })

  describe('Missing postId', () => {
    it('should not track when postId is empty', () => {
      renderHook(() => useViewTracking({ postId: '' }))

      jest.advanceTimersByTime(2000)

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should not track when postId is missing', () => {
      renderHook(() => useViewTracking({ postId: null as any }))

      jest.advanceTimersByTime(2000)

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Already Tracked', () => {
    it('should not track again if already tracked', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true })

      const { rerender } = renderHook(() => useViewTracking({ postId: 'post-1' }))

      jest.advanceTimersByTime(2000)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      jest.clearAllMocks()

      rerender()
      jest.advanceTimersByTime(2000)

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('should clear timeout on unmount', () => {
      const { unmount } = renderHook(() => useViewTracking({ postId: 'post-1' }))

      unmount()

      jest.advanceTimersByTime(2000)

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should clear timeout when postId changes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true })

      const { rerender } = renderHook(
        ({ postId }) => useViewTracking({ postId }),
        { initialProps: { postId: 'post-1' } }
      )

      jest.advanceTimersByTime(1000) // Not enough time to trigger

      rerender({ postId: 'post-2' })

      jest.advanceTimersByTime(1000) // Total 2 seconds, but postId changed

      expect(global.fetch).not.toHaveBeenCalledWith('/api/blog-posts/post-1/view', expect.anything())

      jest.advanceTimersByTime(1000) // 2 seconds for post-2

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/blog-posts/post-2/view', expect.anything())
      })
    })
  })

  describe('Multiple Calls', () => {
    it('should handle postId changes', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true })
      global.fetch = mockFetch

      const { rerender } = renderHook(
        ({ postId }) => useViewTracking({ postId }),
        { initialProps: { postId: 'post-1' } }
      )

      // Hook should handle postId changes without crashing
      expect(() => rerender({ postId: 'post-2' })).not.toThrow()
      expect(() => rerender({ postId: 'post-3' })).not.toThrow()
    })
  })
})

