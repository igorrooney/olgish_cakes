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
import { useMobileGestures } from '../useMobileGestures'

describe('useMobileGestures', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    navigator.vibrate = jest.fn()
    
    // Mock window.event for React 18
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
  })

  describe('Initialization', () => {
    it('should initialize with enabled=true', () => {
      const onSwipeClose = jest.fn()

      const { result } = renderHook(() => useMobileGestures({ onSwipeClose }))

      expect(result.current).toHaveProperty('triggerHapticFeedback')
    })

    it('should initialize with enabled=false', () => {
      const onSwipeClose = jest.fn()

      const { result } = renderHook(() => useMobileGestures({ onSwipeClose, enabled: false }))

      expect(result.current).toHaveProperty('triggerHapticFeedback')
    })
  })

  describe('Haptic Feedback', () => {
    it('should trigger vibration', () => {
      const { result } = renderHook(() => useMobileGestures({ onSwipeClose: jest.fn() }))

      act(() => {
        result.current.triggerHapticFeedback()
      })

      expect(navigator.vibrate).toHaveBeenCalledWith(10)
    })

    it('should handle missing vibrate API', () => {
      delete (navigator as any).vibrate

      const { result } = renderHook(() => useMobileGestures({ onSwipeClose: jest.fn() }))

      expect(() => {
        act(() => {
          result.current.triggerHapticFeedback()
        })
      }).not.toThrow()
    })

    it('should handle non-browser environment', () => {
      // Delete vibrate to simulate non-browser environment
      const originalVibrate = navigator.vibrate
      delete (navigator as any).vibrate

      const { result } = renderHook(() => useMobileGestures({ onSwipeClose: jest.fn() }))

      expect(() => {
        act(() => {
          result.current.triggerHapticFeedback()
        })
      }).not.toThrow()

      // Restore vibrate
      if (originalVibrate) {
        navigator.vibrate = originalVibrate
      }
    })
  })

  describe('Touch Events', () => {
    it('should setup event listeners when enabled', () => {
      const addEventListenerSpy = jest.spyOn(document.body, 'addEventListener')

      renderHook(() => useMobileGestures({ onSwipeClose: jest.fn(), enabled: true }))

      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true })
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: true })
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: true })

      addEventListenerSpy.mockRestore()
    })

    it('should not setup event listeners when disabled', () => {
      const addEventListenerSpy = jest.spyOn(document.body, 'addEventListener')

      renderHook(() => useMobileGestures({ onSwipeClose: jest.fn(), enabled: false }))

      expect(addEventListenerSpy).not.toHaveBeenCalled()

      addEventListenerSpy.mockRestore()
    })

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document.body, 'removeEventListener')

      const { unmount } = renderHook(() => useMobileGestures({ onSwipeClose: jest.fn(), enabled: true }))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Swipe Detection', () => {
    it('should detect right swipe', () => {
      const onSwipeClose = jest.fn()

      renderHook(() => useMobileGestures({ onSwipeClose, enabled: true }))

      // Simulate right swipe
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 0, clientY: 100 } as Touch]
      })

      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      })

      const touchEndEvent = new TouchEvent('touchend')

      act(() => {
        document.body.dispatchEvent(touchStartEvent)
        document.body.dispatchEvent(touchMoveEvent)
        document.body.dispatchEvent(touchEndEvent)
      })

      expect(onSwipeClose).toHaveBeenCalled()
    })

    it('should not detect swipe when distance is too small', () => {
      const onSwipeClose = jest.fn()

      renderHook(() => useMobileGestures({ onSwipeClose, enabled: true }))

      // Simulate small swipe (< 50px)
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 0, clientY: 100 } as Touch]
      })

      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 30, clientY: 100 } as Touch]
      })

      const touchEndEvent = new TouchEvent('touchend')

      act(() => {
        document.body.dispatchEvent(touchStartEvent)
        document.body.dispatchEvent(touchMoveEvent)
        document.body.dispatchEvent(touchEndEvent)
      })

      expect(onSwipeClose).not.toHaveBeenCalled()
    })

    it('should not detect left swipe', () => {
      const onSwipeClose = jest.fn()

      renderHook(() => useMobileGestures({ onSwipeClose, enabled: true }))

      // Simulate left swipe
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      })

      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 0, clientY: 100 } as Touch]
      })

      const touchEndEvent = new TouchEvent('touchend')

      act(() => {
        document.body.dispatchEvent(touchStartEvent)
        document.body.dispatchEvent(touchMoveEvent)
        document.body.dispatchEvent(touchEndEvent)
      })

      expect(onSwipeClose).not.toHaveBeenCalled()
    })

    it('should not detect vertical swipe', () => {
      const onSwipeClose = jest.fn()

      renderHook(() => useMobileGestures({ onSwipeClose, enabled: true }))

      // Simulate vertical swipe (more vertical than horizontal)
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 0 } as Touch]
      })

      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 110, clientY: 100 } as Touch]
      })

      const touchEndEvent = new TouchEvent('touchend')

      act(() => {
        document.body.dispatchEvent(touchStartEvent)
        document.body.dispatchEvent(touchMoveEvent)
        document.body.dispatchEvent(touchEndEvent)
      })

      expect(onSwipeClose).not.toHaveBeenCalled()
    })

    it('should not trigger when disabled', () => {
      const onSwipeClose = jest.fn()

      renderHook(() => useMobileGestures({ onSwipeClose, enabled: false }))

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 0, clientY: 100 } as Touch]
      })

      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      })

      const touchEndEvent = new TouchEvent('touchend')

      act(() => {
        document.body.dispatchEvent(touchStartEvent)
        document.body.dispatchEvent(touchMoveEvent)
        document.body.dispatchEvent(touchEndEvent)
      })

      expect(onSwipeClose).not.toHaveBeenCalled()
    })
  })

  describe('Hook behavior', () => {
    it('should return stable function reference', () => {
      const { result, rerender } = renderHook(() => 
        useMobileGestures({ onSwipeClose: jest.fn() })
      )

      const initialFn = result.current.triggerHapticFeedback

      rerender()

      expect(result.current.triggerHapticFeedback).toBe(initialFn)
    })
  })
})

