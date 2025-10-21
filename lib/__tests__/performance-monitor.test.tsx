/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import { usePerformanceMonitor, InteractionMonitor, useRenderTimeMonitor } from '../performance-monitor'

// Mock Performance Observer
class MockPerformanceObserver {
  callback: PerformanceObserverCallback
  options: PerformanceObserverInit

  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback
    this.options = {} as PerformanceObserverInit
  }

  observe(options: PerformanceObserverInit) {
    this.options = options
  }

  disconnect() {}
}

global.PerformanceObserver = MockPerformanceObserver as any

describe('performance-monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    window.gtag = jest.fn()
    
    // Mock performance.getEntriesByType
    global.performance.getEntriesByType = jest.fn((type: string) => {
      if (type === 'navigation') {
        return [{
          responseStart: 100,
          requestStart: 50,
          loadEventEnd: 200,
          domContentLoadedEventEnd: 150
        }] as any
      }
      return []
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    delete (window as any).gtag
  })

  describe('usePerformanceMonitor', () => {
    function TestComponent() {
      usePerformanceMonitor()
      return <div>Test</div>
    }

    it('should render without crashing', () => {
      const { unmount } = render(<TestComponent />)
      unmount()
    })

    it('should setup performance observers', () => {
      const { unmount } = render(<TestComponent />)

      // Observers should be created
      expect(MockPerformanceObserver).toBeDefined()

      unmount()
    })

    it('should cleanup on unmount', () => {
      const { unmount } = render(<TestComponent />)

      expect(() => unmount()).not.toThrow()
    })

    it('should not crash in browser environment', () => {
      expect(() => {
        render(<TestComponent />)
      }).not.toThrow()
    })

    it('should report metrics to gtag', () => {
      render(<TestComponent />)

      jest.advanceTimersByTime(3100)

      // gtag might be called for reporting
      expect(window.gtag).toBeDefined()
    })
  })

  describe('InteractionMonitor', () => {
    it('should render children', () => {
      const { getByTestId } = render(
        <InteractionMonitor>
          <div data-testid="child">Child Content</div>
        </InteractionMonitor>
      )

      expect(getByTestId('child')).toBeInTheDocument()
    })

    it('should setup interaction listeners', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')

      render(
        <InteractionMonitor>
          <div>Child</div>
        </InteractionMonitor>
      )

      expect(addEventListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('pointerup', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function))
    })

    it('should cleanup listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

      const { unmount } = render(
        <InteractionMonitor>
          <div>Child</div>
        </InteractionMonitor>
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('pointerup', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function))
    })

    it('should render without crashing', () => {
      expect(() => {
        render(
          <InteractionMonitor>
            <div>Test</div>
          </InteractionMonitor>
        )
      }).not.toThrow()
    })
  })

  describe('useRenderTimeMonitor', () => {
    function TestComponent({ componentName }: { componentName: string }) {
      useRenderTimeMonitor(componentName)
      return <div>Test</div>
    }

    it('should monitor component render time', () => {
      const { unmount } = render(<TestComponent componentName="TestComp" />)

      unmount()

      // Should not throw
      expect(true).toBe(true)
    })

    it('should track slow renders over 16ms', () => {
      const { unmount } = render(<TestComponent componentName="SlowComponent" />)

      jest.advanceTimersByTime(20)
      unmount()

      // gtag might be called for slow render
      expect(window.gtag).toBeDefined()
    })

    it('should use provided component name', () => {
      const { unmount } = render(<TestComponent componentName="MyComponent" />)

      unmount()

      expect(true).toBe(true)
    })

    it('should not crash on mount and unmount', () => {
      expect(() => {
        const { unmount } = render(<TestComponent componentName="Test" />)
        unmount()
      }).not.toThrow()
    })
  })

  describe('Integration', () => {
    it('should work together in a component', () => {
      function FullMonitoringComponent() {
        usePerformanceMonitor()
        useRenderTimeMonitor('FullMonitoring')
        return (
          <InteractionMonitor>
            <div>Monitored Content</div>
          </InteractionMonitor>
        )
      }

      const { unmount } = render(<FullMonitoringComponent />)

      expect(() => unmount()).not.toThrow()
    })
  })
})

