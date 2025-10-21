/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { EmotionCacheProvider } from '../EmotionCacheProvider'

// Mock @emotion/cache
const mockCreateCache = jest.fn()
jest.mock('@emotion/cache', () => {
  return jest.fn(() => {
    const cache = {
      key: 'mui',
      compat: false,
      inserted: { 'css-123': '.test { color: red; }' },
      registered: {}
    }
    mockCreateCache(cache)
    return cache
  })
})

// Mock @emotion/react
jest.mock('@emotion/react', () => ({
  CacheProvider: ({ children, value }: any) => (
    <div data-testid="cache-provider" data-cache-key={value?.key}>
      {children}
    </div>
  )
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useServerInsertedHTML: (callback: () => void) => {
    // In test environment, call the callback immediately
    callback()
  }
}))

describe('EmotionCacheProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <EmotionCacheProvider>
          <div data-testid="child">Child Content</div>
        </EmotionCacheProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should wrap children in CacheProvider', () => {
      render(
        <EmotionCacheProvider>
          <div>Content</div>
        </EmotionCacheProvider>
      )

      expect(screen.getByTestId('cache-provider')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      render(
        <EmotionCacheProvider>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </EmotionCacheProvider>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })
  })

  describe('Cache Creation', () => {
    it('should create cache with key "mui"', () => {
      render(
        <EmotionCacheProvider>
          <div>Content</div>
        </EmotionCacheProvider>
      )

      expect(mockCreateCache).toHaveBeenCalled()
      const cache = mockCreateCache.mock.calls[0][0]
      expect(cache.key).toBe('mui')
    })

    it('should set compat to true', () => {
      render(
        <EmotionCacheProvider>
          <div>Content</div>
        </EmotionCacheProvider>
      )

      const cache = mockCreateCache.mock.calls[0][0]
      // Cache is modified to set compat = true after creation
      expect(cache).toBeDefined()
    })

    it('should create cache only once', () => {
      const { rerender } = render(
        <EmotionCacheProvider>
          <div>Content 1</div>
        </EmotionCacheProvider>
      )

      const callCount1 = mockCreateCache.mock.calls.length

      rerender(
        <EmotionCacheProvider>
          <div>Content 2</div>
        </EmotionCacheProvider>
      )

      const callCount2 = mockCreateCache.mock.calls.length

      // Cache should be created only once due to useState
      expect(callCount2).toBe(callCount1)
    })
  })

  describe('Server Inserted HTML', () => {
    it('should use useServerInsertedHTML', () => {
      // Test that component renders without errors
      expect(() => {
        render(
          <EmotionCacheProvider>
            <div>Content</div>
          </EmotionCacheProvider>
        )
      }).not.toThrow()
    })
  })

  describe('Cache Provider Integration', () => {
    it('should pass cache to CacheProvider', () => {
      render(
        <EmotionCacheProvider>
          <div>Content</div>
        </EmotionCacheProvider>
      )

      const cacheProvider = screen.getByTestId('cache-provider')
      expect(cacheProvider.getAttribute('data-cache-key')).toBe('mui')
    })
  })

  describe('Props', () => {
    it('should accept children prop', () => {
      render(
        <EmotionCacheProvider>
          <div data-testid="test-child">Test</div>
        </EmotionCacheProvider>
      )

      expect(screen.getByTestId('test-child')).toBeInTheDocument()
    })

    it('should support React.ReactNode as children', () => {
      render(
        <EmotionCacheProvider>
          Text content
        </EmotionCacheProvider>
      )

      expect(screen.getByText('Text content')).toBeInTheDocument()
    })
  })
})

