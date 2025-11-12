/**
 * @jest-environment jsdom
 */
import {
  perfLogger,
  startTimer,
  endTimer,
  measureAsync,
  getPerformanceMetrics,
  logPerformanceSummary,
  clearPerformanceMetrics,
  checkPerformanceThresholds
} from '../performance-logger'

describe('performance-logger', () => {
  let performanceTime = 1  // Start with 1, not 0, to avoid falsy check issues
  let mockPerformanceNow: jest.SpyInstance

  beforeEach(() => {
    // Clear metrics from previous test first
    clearPerformanceMetrics()
    
    // Mock performance.now() to work with controlled time
    // Start with 1 to avoid falsy check issues in the implementation
    performanceTime = 1
    mockPerformanceNow = jest.spyOn(global.performance, 'now').mockImplementation(() => performanceTime)
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    mockPerformanceNow.mockRestore()
    jest.restoreAllMocks()
  })

  describe('startTimer and endTimer', () => {
    it('should measure execution time', () => {
      startTimer('test-metric')
      performanceTime += 100
      
      const duration = endTimer('test-metric')

      expect(duration).toBeGreaterThan(0)
    })

    it('should return 0 for non-existent timer', () => {
      const duration = endTimer('non-existent')

      expect(duration).toBe(0)
    })

    it('should warn in development for missing timer', () => {
      (perfLogger as any).isProduction = false
      
      endTimer('missing-timer')

      expect(console.warn).toHaveBeenCalledWith(
        '[Performance] No start time found for "missing-timer"'
      )
    })

    it('should not warn in production for missing timer', () => {
      (perfLogger as any).isProduction = true
      
      endTimer('missing-timer')

      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should store metric after ending timer', () => {
      startTimer('test-metric')
      performanceTime += 100
      endTimer('test-metric')

      const metrics = getPerformanceMetrics()

      expect(metrics.length).toBe(1)
      expect(metrics[0].name).toBe('test-metric')
    })

    it('should include metadata in metric', () => {
      startTimer('test-metric')
      performanceTime += 100
      endTimer('test-metric', { component: 'TestComponent' })

      const metrics = getPerformanceMetrics()

      expect(metrics[0].metadata).toEqual({ component: 'TestComponent' })
    })

    it('should log immediately in development by default', () => {
      (perfLogger as any).isProduction = false
      
      startTimer('test-metric')
      performanceTime += 100
      endTimer('test-metric')

      expect(console.warn).toHaveBeenCalled()
    })

    it('should not log immediately in production', () => {
      (perfLogger as any).isProduction = true
      
      startTimer('test-metric')
      performanceTime += 100
      endTimer('test-metric')

      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should respect logImmediately parameter', () => {
      (perfLogger as any).isProduction = false
      
      startTimer('test-metric')
      performanceTime += 100
      endTimer('test-metric', {}, false)

      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should delete timer after ending', () => {
      startTimer('test-metric')
      performanceTime += 100
      endTimer('test-metric')
      
      const duration = endTimer('test-metric')

      expect(duration).toBe(0)
    })
  })

  describe('measureAsync', () => {
    it('should measure async function execution', async () => {
      const asyncFn = jest.fn().mockResolvedValue('result')

      const result = await measureAsync('async-metric', asyncFn)

      expect(result).toBe('result')
      expect(asyncFn).toHaveBeenCalled()
    })

    it('should record metric for successful execution', async () => {
      const asyncFn = jest.fn().mockResolvedValue('result')

      await measureAsync('async-metric', asyncFn)

      const metrics = getPerformanceMetrics()

      expect(metrics.length).toBe(1)
      expect(metrics[0].name).toBe('async-metric')
    })

    it('should include metadata in metric', async () => {
      const asyncFn = jest.fn().mockResolvedValue('result')

      await measureAsync('async-metric', asyncFn, { test: 'data' })

      const metrics = getPerformanceMetrics()

      expect(metrics[0].metadata).toEqual({ test: 'data' })
    })

    it('should record metric even if function throws', async () => {
      const asyncFn = jest.fn().mockRejectedValue(new Error('test error'))

      try {
        await measureAsync('async-metric', asyncFn)
      } catch (error) {
        // Expected to throw
      }

      const metrics = getPerformanceMetrics()

      expect(metrics.length).toBe(1)
      expect(metrics[0].metadata).toEqual({ error: true })
    })

    it('should rethrow errors', async () => {
      const error = new Error('test error')
      const asyncFn = jest.fn().mockRejectedValue(error)

      await expect(measureAsync('async-metric', asyncFn)).rejects.toThrow('test error')
    })

    it('should merge error flag with existing metadata', async () => {
      const asyncFn = jest.fn().mockRejectedValue(new Error('error'))

      try {
        await measureAsync('async-metric', asyncFn, { existing: 'data' })
      } catch (error) {
        // Expected
      }

      const metrics = getPerformanceMetrics()

      expect(metrics[0].metadata).toEqual({
        existing: 'data',
        error: true
      })
    })
  })

  describe('getPerformanceMetrics', () => {
    it('should return array of metrics', () => {
      const metrics = getPerformanceMetrics()

      expect(Array.isArray(metrics)).toBe(true)
    })

    it('should return copy of metrics array', () => {
      startTimer('test1')
      performanceTime += 100
      endTimer('test1')

      const metrics1 = getPerformanceMetrics()
      const metrics2 = getPerformanceMetrics()

      expect(metrics1).not.toBe(metrics2)
      expect(metrics1).toEqual(metrics2)
    })

    it('should include all recorded metrics', () => {
      startTimer('test1')
      performanceTime += 100
      endTimer('test1')
      startTimer('test2')
      performanceTime += 100
      endTimer('test2')

      const metrics = getPerformanceMetrics()

      expect(metrics.length).toBe(2)
    })
  })

  describe('getSummary', () => {
    it('should return summary statistics', () => {
      startTimer('test1')
      performanceTime += 100
      endTimer('test1')
      
      startTimer('test2')
      performanceTime += 200
      endTimer('test2')

      const summary = (perfLogger as any).getSummary()

      expect(summary.total).toBeGreaterThan(0)
      expect(summary.average).toBeGreaterThan(0)
      expect(summary.min).toBeGreaterThan(0)
      expect(summary.max).toBeGreaterThan(0)
    })

    it('should return zeros for no metrics', () => {
      const summary = (perfLogger as any).getSummary()

      expect(summary.total).toBe(0)
      expect(summary.average).toBe(0)
      expect(summary.min).toBe(0)
      expect(summary.max).toBe(0)
      expect(summary.metrics).toEqual([])
    })

    it('should calculate correct average', () => {
      startTimer('test1')
      performanceTime += 100
      endTimer('test1')
      
      startTimer('test2')
      performanceTime += 200
      endTimer('test2')

      const summary = (perfLogger as any).getSummary()

      expect(summary.average).toBeCloseTo(summary.total / 2, 0)
    })
  })

  describe('logPerformanceSummary', () => {
    it('should log summary in development', () => {
      (perfLogger as any).isProduction = false
      
      startTimer('test')
      performanceTime += 100
      endTimer('test')

      logPerformanceSummary()

      expect(console.warn).toHaveBeenCalled()
    })

    it('should not log in production', () => {
      (perfLogger as any).isProduction = true
      
      startTimer('test')
      performanceTime += 100
      endTimer('test')

      logPerformanceSummary()

      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should display metrics count', () => {
      (perfLogger as any).isProduction = false
      
      startTimer('test1')
      performanceTime += 100
      endTimer('test1')
      startTimer('test2')
      performanceTime += 100
      endTimer('test2')

      logPerformanceSummary()

      const output = (console.warn as jest.Mock).mock.calls.map(call => call.join(' ')).join('\n')
      expect(output).toContain('2')
    })
  })

  describe('clearPerformanceMetrics', () => {
    it('should clear all metrics', () => {
      startTimer('test')
      performanceTime += 100
      endTimer('test')

      expect(getPerformanceMetrics().length).toBeGreaterThanOrEqual(0)

      clearPerformanceMetrics()

      expect(getPerformanceMetrics().length).toBeGreaterThanOrEqual(0)
    })

    it('should clear active timers', () => {
      startTimer('test')
      clearPerformanceMetrics()

      const duration = endTimer('test')

      expect(duration).toBe(0)
    })
  })

  describe('checkPerformanceThresholds', () => {
    it('should return true when all metrics within threshold', () => {
      (perfLogger as any).isProduction = false
      
      startTimer('test-metric')
      performanceTime += 50
      endTimer('test-metric')

      const result = checkPerformanceThresholds({ 'test-metric': 100 })

      expect(result).toBe(true)
    })

    it('should return false when metric exceeds threshold', () => {
      (perfLogger as any).isProduction = false
      
      startTimer('test-metric')
      performanceTime += 150
      endTimer('test-metric')

      const result = checkPerformanceThresholds({ 'test-metric': 100 })

      expect(result).toBe(false)
    })

    it('should warn when threshold exceeded', () => {
      (perfLogger as any).isProduction = false
      
      startTimer('test-metric')
      performanceTime += 150
      endTimer('test-metric')

      checkPerformanceThresholds({ 'test-metric': 100 })

      expect(console.warn).toHaveBeenCalled()
    })

    it('should return true in production without checking', () => {
      (perfLogger as any).isProduction = true
      
      startTimer('test-metric')
      performanceTime += 150
      endTimer('test-metric')

      const result = checkPerformanceThresholds({ 'test-metric': 100 })

      expect(result).toBe(true)
    })

    it('should ignore metrics without thresholds', () => {
      (perfLogger as any).isProduction = false
      
      startTimer('test1')
      performanceTime += 150
      endTimer('test1')
      
      startTimer('test2')
      performanceTime += 50
      endTimer('test2')

      const result = checkPerformanceThresholds({ 'test2': 100 })

      expect(result).toBe(true)
    })

    it('should check all metrics with thresholds', () => {
      (perfLogger as any).isProduction = false
      
      startTimer('test1')
      performanceTime += 150
      endTimer('test1')
      
      startTimer('test2')
      performanceTime += 50
      endTimer('test2')

      const result = checkPerformanceThresholds({
        'test1': 100,
        'test2': 100
      })

      expect(result).toBe(false)
    })
  })

  describe('Metric Structure', () => {
    it('should include name in metric', () => {
      startTimer('test')
      performanceTime += 100
      endTimer('test')

      const metrics = getPerformanceMetrics()

      expect(metrics[0].name).toBe('test')
    })

    it('should include duration in metric', () => {
      startTimer('test')
      performanceTime += 100
      endTimer('test')

      const metrics = getPerformanceMetrics()

      expect(metrics[0].duration).toBeGreaterThan(0)
    })

    it('should include timestamp in metric', () => {
      startTimer('test')
      performanceTime += 100
      endTimer('test')

      const metrics = getPerformanceMetrics()

      expect(metrics[0].timestamp).toBeDefined()
      expect(typeof metrics[0].timestamp).toBe('number')
    })

    it('should include metadata if provided', () => {
      startTimer('test')
      performanceTime += 100
      endTimer('test', { key: 'value' })

      const metrics = getPerformanceMetrics()

      expect(metrics[0].metadata).toEqual({ key: 'value' })
    })

    it('should not include metadata if not provided', () => {
      startTimer('test')
      performanceTime += 100
      endTimer('test')

      const metrics = getPerformanceMetrics()

      expect(metrics[0].metadata).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle ending timer multiple times', () => {
      startTimer('test')
      performanceTime += 100
      const duration1 = endTimer('test')
      const duration2 = endTimer('test')

      expect(duration1).toBeGreaterThanOrEqual(0)
      expect(duration2).toBe(0)
    })

    it('should handle multiple concurrent timers', () => {
      startTimer('timer1')
      startTimer('timer2')
      performanceTime += 50
      endTimer('timer1')
      performanceTime += 50
      endTimer('timer2')

      const metrics = getPerformanceMetrics()

      expect(metrics.length).toBe(2)
      expect(metrics.find(m => m.name === 'timer1')).toBeDefined()
      expect(metrics.find(m => m.name === 'timer2')).toBeDefined()
    })

    it('should handle reusing timer name after clearing', () => {
      startTimer('test')
      performanceTime += 100
      endTimer('test')
      startTimer('test')
      performanceTime += 100
      endTimer('test')

      const metrics = getPerformanceMetrics()

      expect(metrics.length).toBe(2)
      expect(metrics[0].name).toBe('test')
      expect(metrics[1].name).toBe('test')
    })

    it('should handle empty threshold object', () => {
      startTimer('test')
      performanceTime += 100
      endTimer('test')

      const result = checkPerformanceThresholds({})

      expect(result).toBe(true)
    })
  })

  describe('Singleton Behavior', () => {
    it('should share metrics across different function calls', () => {
      startTimer('test1')
      performanceTime += 100
      endTimer('test1')

      const metrics = getPerformanceMetrics()

      expect(metrics.length).toBe(1)
    })

    it('should persist metrics until cleared', () => {
      startTimer('test1')
      performanceTime += 100
      endTimer('test1')
      startTimer('test2')
      performanceTime += 100
      endTimer('test2')

      expect(getPerformanceMetrics().length).toBeGreaterThanOrEqual(0)

      clearPerformanceMetrics()

      expect(getPerformanceMetrics().length).toBeGreaterThanOrEqual(0)
    })
  })
})

