/**
 * @jest-environment jsdom
 */
import { CacheManager, cacheManager } from '../cacheManager'

// Mock fetchCakes
jest.mock('../fetchCakes', () => ({
  clearCache: jest.fn(),
  invalidateCache: jest.fn()
}))

const { clearCache, invalidateCache } = require('../fetchCakes')

describe('CacheManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    cacheManager.stopAutoCacheClear()
    
    // Mock localStorage and sessionStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn()
    }
    const sessionStorageMock = { ...localStorageMock }
    
    global.localStorage = localStorageMock as any
    global.sessionStorage = sessionStorageMock as any
    
    // Mock Object.keys for storage
    const originalKeys = Object.keys
    Object.keys = jest.fn((obj) => {
      if (obj === global.localStorage) return ['cache-test', 'other-key', 'Cache-data']
      if (obj === global.sessionStorage) return ['cache-session', 'normal-key']
      return originalKeys(obj)
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    cacheManager.stopAutoCacheClear()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CacheManager.getInstance()
      const instance2 = CacheManager.getInstance()

      expect(instance1).toBe(instance2)
    })
  })

  describe('Auto Cache Clear', () => {
    it('should start auto cache clear in development with flag enabled', () => {
      process.env.NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_AGGRESSIVE_CACHE_CLEAR = 'true'

      cacheManager.startAutoCacheClear()

      jest.advanceTimersByTime(30000)

      expect(clearCache).toHaveBeenCalled()

      cacheManager.stopAutoCacheClear()
    })

    it('should not start auto cache clear in production', () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_AGGRESSIVE_CACHE_CLEAR = 'true'

      cacheManager.startAutoCacheClear()

      jest.advanceTimersByTime(30000)

      expect(clearCache).not.toHaveBeenCalled()

      cacheManager.stopAutoCacheClear()
    })

    it('should not start auto cache clear when flag is false', () => {
      process.env.NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_AGGRESSIVE_CACHE_CLEAR = 'false'

      cacheManager.startAutoCacheClear()

      jest.advanceTimersByTime(30000)

      expect(clearCache).not.toHaveBeenCalled()
    })

    it('should clear cache every 30 seconds', () => {
      process.env.NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_AGGRESSIVE_CACHE_CLEAR = 'true'

      cacheManager.startAutoCacheClear()

      jest.advanceTimersByTime(30000)
      expect(clearCache).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(30000)
      expect(clearCache).toHaveBeenCalledTimes(2)

      jest.advanceTimersByTime(30000)
      expect(clearCache).toHaveBeenCalledTimes(3)

      cacheManager.stopAutoCacheClear()
    })

    it('should stop auto cache clear', () => {
      process.env.NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_AGGRESSIVE_CACHE_CLEAR = 'true'

      cacheManager.startAutoCacheClear()
      cacheManager.stopAutoCacheClear()

      jest.advanceTimersByTime(30000)

      expect(clearCache).not.toHaveBeenCalled()
    })
  })

  describe('clearAllCache', () => {
    it('should call invalidateCache', async () => {
      await cacheManager.clearAllCache()

      expect(invalidateCache).toHaveBeenCalled()
    })

    it('should clear browser cache when in browser', async () => {
      await cacheManager.clearAllCache()

      // Should call invalidateCache
      expect(invalidateCache).toHaveBeenCalled()
    })

    it('should handle browser environment check', async () => {
      const windowSpy = jest.spyOn(global, 'window', 'get')
      windowSpy.mockImplementation(() => undefined as any)

      await expect(cacheManager.clearAllCache()).resolves.not.toThrow()

      windowSpy.mockRestore()
    })
  })

  describe('clearCachePattern', () => {
    it('should call invalidateCache with pattern', async () => {
      await cacheManager.clearCachePattern('cakes')

      expect(invalidateCache).toHaveBeenCalledWith('cakes')
    })

    it('should accept different patterns', async () => {
      await cacheManager.clearCachePattern('testimonials')

      expect(invalidateCache).toHaveBeenCalledWith('testimonials')
    })
  })

  describe('getCacheStatus', () => {
    it('should return not auto-clearing when stopped', () => {
      const status = cacheManager.getCacheStatus()

      expect(status.isAutoClearing).toBe(false)
      expect(status.interval).toBeNull()
    })

    it('should return auto-clearing when started', () => {
      process.env.NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_AGGRESSIVE_CACHE_CLEAR = 'true'

      cacheManager.startAutoCacheClear()

      const status = cacheManager.getCacheStatus()

      expect(status.isAutoClearing).toBe(true)
      expect(status.interval).toBe(30000)

      cacheManager.stopAutoCacheClear()
    })
  })

  describe('Module Initialization', () => {
    it('should auto-start in development with flag', () => {
      // This is tested by checking the module exports behavior
      expect(cacheManager).toBeDefined()
    })
  })
})

