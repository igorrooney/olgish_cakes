/**
 * @jest-environment jsdom
 */
import { usePerformanceMonitor } from '../PerformanceMonitor'
import { renderHook, act } from '@testing-library/react'

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    window.gtag = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    delete (window as any).gtag
  })

  it('should return startTimer and getMetrics functions', () => {
    const { result } = renderHook(() => usePerformanceMonitor())

    expect(result.current.startTimer).toBeDefined()
    expect(result.current.getMetrics).toBeDefined()
    expect(typeof result.current.startTimer).toBe('function')
    expect(typeof result.current.getMetrics).toBe('function')
  })

  it('should measure menuOpenTime', () => {
    const { result } = renderHook(() => usePerformanceMonitor())

    const endTimer = result.current.startTimer('menuOpenTime')
    endTimer()

    const metrics = result.current.getMetrics()
    expect(metrics.menuOpenTime).toBeGreaterThanOrEqual(0)
  })

  it('should measure menuCloseTime', () => {
    const { result } = renderHook(() => usePerformanceMonitor())

    const endTimer = result.current.startTimer('menuCloseTime')
    endTimer()

    const metrics = result.current.getMetrics()
    expect(metrics.menuCloseTime).toBeGreaterThanOrEqual(0)
  })

  it('should measure submenuToggleTime', () => {
    const { result } = renderHook(() => usePerformanceMonitor())

    const endTimer = result.current.startTimer('submenuToggleTime')
    endTimer()

    const metrics = result.current.getMetrics()
    expect(metrics.submenuToggleTime).toBeGreaterThanOrEqual(0)
  })

  it('should measure navigationTime', () => {
    const { result } = renderHook(() => usePerformanceMonitor())

    const endTimer = result.current.startTimer('navigationTime')
    endTimer()

    const metrics = result.current.getMetrics()
    expect(metrics.navigationTime).toBeGreaterThanOrEqual(0)
  })

  it('should log metrics in development', () => {
    process.env.NODE_ENV = 'development'

    const { result } = renderHook(() => usePerformanceMonitor())

    const endTimer = result.current.startTimer('menuOpenTime')
    endTimer()

    expect(console.warn).toHaveBeenCalled()
  })

  it('should not log in production', () => {
    process.env.NODE_ENV = 'production'

    const { result } = renderHook(() => usePerformanceMonitor())

    const endTimer = result.current.startTimer('menuOpenTime')
    endTimer()

    expect(console.warn).not.toHaveBeenCalled()
  })

  it('should send to gtag when available', () => {
    const { result } = renderHook(() => usePerformanceMonitor())

    const endTimer = result.current.startTimer('menuOpenTime')
    endTimer()

    expect(window.gtag).toHaveBeenCalledWith('event', 'timing_complete', expect.objectContaining({
      name: 'menuOpenTime',
      event_category: 'Mobile Menu Performance'
    }))
  })

  it('should not crash when gtag is undefined', () => {
    delete (window as any).gtag

    const { result } = renderHook(() => usePerformanceMonitor())

    expect(() => {
      const endTimer = result.current.startTimer('menuOpenTime')
      endTimer()
    }).not.toThrow()
  })

  it('should measure multiple metrics independently', () => {
    const { result } = renderHook(() => usePerformanceMonitor())

    const endTimer1 = result.current.startTimer('menuOpenTime')
    const endTimer2 = result.current.startTimer('menuCloseTime')
    
    endTimer1()
    endTimer2()

    const metrics = result.current.getMetrics()
    expect(metrics.menuOpenTime).toBeGreaterThanOrEqual(0)
    expect(metrics.menuCloseTime).toBeGreaterThanOrEqual(0)
  })

  it('should initialize all metrics to 0', () => {
    const { result } = renderHook(() => usePerformanceMonitor())

    const metrics = result.current.getMetrics()
    expect(metrics.menuOpenTime).toBe(0)
    expect(metrics.menuCloseTime).toBe(0)
    expect(metrics.submenuToggleTime).toBe(0)
    expect(metrics.navigationTime).toBe(0)
  })
})

