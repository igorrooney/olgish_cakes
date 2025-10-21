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

import { renderHook, act } from '@testing-library/react'
import { useAnalytics } from '../useAnalytics'

describe('useAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Ensure window exists
    if (typeof window !== 'undefined') {
      // Mock window.gtag
      Object.defineProperty(window, 'gtag', {
        value: jest.fn(),
        configurable: true,
        writable: true
      })
      
      // Mock window.event for React 18
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
  })

  afterEach(() => {
    if (typeof window !== 'undefined') {
      delete (window as any).gtag
    }
  })

  describe('trackEvent', () => {
    it('should call gtag with event data', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent({
          event: 'test_event',
          category: 'Test Category',
          action: 'test_action',
          label: 'Test Label',
          value: 100
        })
      })

      expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', {
        event_category: 'Test Category',
        event_label: 'Test Label',
        value: 100
      })
    })

    it('should handle event without label', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent({
          event: 'test_event',
          category: 'Test Category',
          action: 'test_action'
        })
      })

      expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', {
        event_category: 'Test Category',
        event_label: undefined,
        value: undefined
      })
    })

    it('should handle event without value', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent({
          event: 'test_event',
          category: 'Test Category',
          action: 'test_action',
          label: 'Test Label'
        })
      })

      expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', {
        event_category: 'Test Category',
        event_label: 'Test Label',
        value: undefined
      })
    })

    it('should not throw when gtag is not available', () => {
      delete (window as any).gtag
      const { result } = renderHook(() => useAnalytics())

      expect(() => {
        act(() => {
          result.current.trackEvent({
            event: 'test_event',
            category: 'Test Category',
            action: 'test_action'
          })
        })
      }).not.toThrow()
    })

    it('should not throw in non-browser environment', () => {
      // Delete gtag to simulate non-browser environment
      const originalGtag = window.gtag
      delete (window as any).gtag

      const { result } = renderHook(() => useAnalytics())

      expect(() => {
        act(() => {
          result.current.trackEvent({
            event: 'test_event',
            category: 'Test Category',
            action: 'test_action'
          })
        })
      }).not.toThrow()

      // Restore gtag
      if (originalGtag) {
        window.gtag = originalGtag
      }
    })
  })

  describe('trackMobileMenuInteraction', () => {
    it('should track mobile menu interaction', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackMobileMenuInteraction('open', 'hamburger_button')
      })

      expect(window.gtag).toHaveBeenCalledWith('event', 'mobile_menu_interaction', {
        event_category: 'Navigation',
        event_label: 'hamburger_button',
        value: undefined
      })
    })

    it('should handle interaction without label', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackMobileMenuInteraction('close')
      })

      expect(window.gtag).toHaveBeenCalledWith('event', 'mobile_menu_interaction', {
        event_category: 'Navigation',
        event_label: undefined,
        value: undefined
      })
    })
  })

  describe('trackNavigation', () => {
    it('should track page navigation', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackNavigation('/home', '/about')
      })

      expect(window.gtag).toHaveBeenCalledWith('event', 'navigation', {
        event_category: 'User Journey',
        event_label: '/home -> /about',
        value: undefined
      })
    })

    it('should format label correctly', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackNavigation('/cakes', '/cakes/honey-cake')
      })

      expect(window.gtag).toHaveBeenCalledWith('event', 'navigation', expect.objectContaining({
        event_label: '/cakes -> /cakes/honey-cake'
      }))
    })
  })

  describe('Hook behavior', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useAnalytics())

      const initialTrackEvent = result.current.trackEvent
      const initialTrackMobile = result.current.trackMobileMenuInteraction
      const initialTrackNav = result.current.trackNavigation

      rerender()

      expect(result.current.trackEvent).toBe(initialTrackEvent)
      expect(result.current.trackMobileMenuInteraction).toBe(initialTrackMobile)
      expect(result.current.trackNavigation).toBe(initialTrackNav)
    })
  })

  describe('Development logging', () => {
    it('should not log in production', () => {
      process.env.NODE_ENV = 'production'
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.trackEvent({
          event: 'test_event',
          category: 'Test',
          action: 'test'
        })
      })

      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})

