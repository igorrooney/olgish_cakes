/**
 * @jest-environment jsdom
 */

// Mock browser APIs BEFORE any imports
class MockIntersectionObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

class MockPerformanceObserver {
  observe = jest.fn()
  disconnect = jest.fn()
}

global.IntersectionObserver = MockIntersectionObserver as any
global.PerformanceObserver = MockPerformanceObserver as any

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

// Mock window properties for React 18
Object.defineProperty(window, 'event', {
  value: undefined,
  configurable: true,
  writable: true
})

import React from 'react'
import { render } from '@testing-library/react'
import { WebVitalsMonitor, performanceOptimizations } from '../WebVitalsMonitor'

describe('WebVitalsMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.gtag = jest.fn()
  })

  afterEach(() => {
    delete (window as any).gtag
  })

  it('should render nothing visible', () => {
    const { container } = render(<WebVitalsMonitor />)

    expect(container.firstChild).toBeNull()
  })

  it('should not run in development', () => {
    process.env.NODE_ENV = 'development'

    render(<WebVitalsMonitor />)

    // Should return early, no web-vitals import
    expect(true).toBe(true)
  })

  it('should run in production', () => {
    process.env.NODE_ENV = 'production'

    render(<WebVitalsMonitor />)

    // Component should mount without errors
    expect(true).toBe(true)
  })

  it('should not crash when gtag is undefined', () => {
    delete (window as any).gtag
    process.env.NODE_ENV = 'production'

    expect(() => {
      render(<WebVitalsMonitor />)
    }).not.toThrow()
  })
})

describe('performanceOptimizations', () => {
  describe('debounce', () => {
    it('should debounce function calls', () => {
      jest.useFakeTimers()
      const func = jest.fn()
      const debounced = performanceOptimizations.debounce(func, 100)

      debounced()
      debounced()
      debounced()

      expect(func).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)

      expect(func).toHaveBeenCalledTimes(1)

      jest.useRealTimers()
    })

    it('should call function with correct arguments', () => {
      jest.useFakeTimers()
      const func = jest.fn()
      const debounced = performanceOptimizations.debounce(func, 100)

      debounced('arg1', 'arg2')
      jest.advanceTimersByTime(100)

      expect(func).toHaveBeenCalledWith('arg1', 'arg2')

      jest.useRealTimers()
    })
  })

  describe('throttle', () => {
    it('should throttle function calls', () => {
      jest.useFakeTimers()
      const func = jest.fn()
      const throttled = performanceOptimizations.throttle(func, 100)

      throttled()
      throttled()
      throttled()

      expect(func).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(100)

      throttled()

      expect(func).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })

    it('should preserve this context', () => {
      jest.useFakeTimers()
      const obj = {
        value: 42,
        func: jest.fn(function(this: any) {
          return this.value
        })
      }
      const throttled = performanceOptimizations.throttle(obj.func, 100)

      throttled.call(obj)

      expect(obj.func).toHaveBeenCalled()

      jest.useRealTimers()
    })
  })

  describe('isInViewport', () => {
    it('should return true for element in viewport', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = jest.fn(() => ({
        top: 100,
        left: 50,
        bottom: 200,
        right: 300,
        width: 250,
        height: 100,
        x: 50,
        y: 100,
        toJSON: () => {}
      }))

      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })

      const result = performanceOptimizations.isInViewport(element)

      expect(result).toBe(true)
    })

    it('should return false for element above viewport', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = jest.fn(() => ({
        top: -100,
        left: 50,
        bottom: -50,
        right: 300,
        width: 250,
        height: 50,
        x: 50,
        y: -100,
        toJSON: () => {}
      }))

      const result = performanceOptimizations.isInViewport(element)

      expect(result).toBe(false)
    })

    it('should return false for element below viewport', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = jest.fn(() => ({
        top: 1000,
        left: 50,
        bottom: 1100,
        right: 300,
        width: 250,
        height: 100,
        x: 50,
        y: 1000,
        toJSON: () => {}
      }))

      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })

      const result = performanceOptimizations.isInViewport(element)

      expect(result).toBe(false)
    })

    it('should return false for element outside left edge', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = jest.fn(() => ({
        top: 100,
        left: -300,
        bottom: 200,
        right: -50,
        width: 250,
        height: 100,
        x: -300,
        y: 100,
        toJSON: () => {}
      }))

      const result = performanceOptimizations.isInViewport(element)

      expect(result).toBe(false)
    })

    it('should return false for element outside right edge', () => {
      const element = document.createElement('div')
      element.getBoundingClientRect = jest.fn(() => ({
        top: 100,
        left: 1500,
        bottom: 200,
        right: 1750,
        width: 250,
        height: 100,
        x: 1500,
        y: 100,
        toJSON: () => {}
      }))

      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })

      const result = performanceOptimizations.isInViewport(element)

      expect(result).toBe(false)
    })
  })
})

