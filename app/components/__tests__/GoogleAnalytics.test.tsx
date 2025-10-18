/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render } from '@testing-library/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { GoogleAnalytics } from '../GoogleAnalytics'

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn()
}))

// Mock Next.js Script component
jest.mock('next/script', () => {
  return function MockScript({ children, dangerouslySetInnerHTML, ...props }: any) {
    if (dangerouslySetInnerHTML) {
      return <script {...props} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
    }
    return <script {...props}>{children}</script>
  }
})

describe('GoogleAnalytics', () => {
  const mockGtag = jest.fn()
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
  const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Setup window.gtag mock
    window.gtag = mockGtag
    window.dataLayer = []
    
    // Default mock implementation for searchParams
    mockUseSearchParams.mockReturnValue({
      toString: () => '',
      get: jest.fn(),
      getAll: jest.fn(),
      has: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      entries: jest.fn(),
      forEach: jest.fn(),
      size: 0,
      [Symbol.iterator]: jest.fn()
    } as any)
  })

  afterEach(() => {
    delete (window as any).gtag
    delete (window as any).dataLayer
  })

  describe('Component Rendering', () => {
    it('should render Script tags for Google Analytics', () => {
      mockUsePathname.mockReturnValue('/')

      const { container } = render(<GoogleAnalytics gaId="G-TEST123" />)
      
      const scripts = container.querySelectorAll('script')
      expect(scripts.length).toBeGreaterThanOrEqual(2)
    })

    it('should include GA script source with correct ID', () => {
      mockUsePathname.mockReturnValue('/')

      const { container } = render(<GoogleAnalytics gaId="G-TEST123" />)
      
      const scriptSrc = container.querySelector('script[src*="googletagmanager"]')
      expect(scriptSrc).toBeTruthy()
      expect(scriptSrc?.getAttribute('src')).toContain('G-TEST123')
    })

    it('should initialize gtag function', () => {
      mockUsePathname.mockReturnValue('/')

      const { container } = render(<GoogleAnalytics gaId="G-TEST123" />)
      
      const initScript = Array.from(container.querySelectorAll('script')).find(
        script => script.innerHTML.includes('function gtag')
      )
      expect(initScript).toBeTruthy()
      expect(initScript?.innerHTML).toContain('window.dataLayer')
    })
  })

  describe('Customer Page Tracking', () => {
    it('should track homepage visits', () => {
      mockUsePathname.mockReturnValue('/')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        page_path: '/',
        page_title: expect.any(String),
        page_location: expect.any(String),
        custom_map: {
          custom_parameter_1: 'business_type',
          custom_parameter_2: 'location'
        },
        send_page_view: true
      })

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        business_type: 'bakery',
        location: 'leeds'
      })
    })

    it('should track /cakes page visits', () => {
      mockUsePathname.mockReturnValue('/cakes')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalled()
      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', 
        expect.objectContaining({
          page_path: '/cakes'
        })
      )
    })

    it('should track /gift-hampers page visits', () => {
      mockUsePathname.mockReturnValue('/gift-hampers')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalled()
      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123',
        expect.objectContaining({
          page_path: '/gift-hampers'
        })
      )
    })

    it('should track nested customer pages', () => {
      mockUsePathname.mockReturnValue('/cakes/honey-cake-medovik')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalled()
      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123',
        expect.objectContaining({
          page_path: '/cakes/honey-cake-medovik'
        })
      )
    })

    it('should include search params in page path', () => {
      mockUsePathname.mockReturnValue('/cakes')
      mockUseSearchParams.mockReturnValue({
        toString: () => 'category=birthday&size=large',
        get: jest.fn(),
        getAll: jest.fn(),
        has: jest.fn(),
        keys: jest.fn(),
        values: jest.fn(),
        entries: jest.fn(),
        forEach: jest.fn(),
        size: 2,
        [Symbol.iterator]: jest.fn()
      } as any)

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123',
        expect.objectContaining({
          page_path: '/cakes?category=birthday&size=large'
        })
      )
    })
  })

  describe('Admin Page Exclusion', () => {
    it('should NOT track /admin page', () => {
      mockUsePathname.mockReturnValue('/admin')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should NOT track /admin/orders page', () => {
      mockUsePathname.mockReturnValue('/admin/orders')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should NOT track /admin/blog page', () => {
      mockUsePathname.mockReturnValue('/admin/blog')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should NOT track /api routes', () => {
      mockUsePathname.mockReturnValue('/api/orders')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should NOT track /studio page', () => {
      mockUsePathname.mockReturnValue('/studio')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should NOT track nested /studio pages', () => {
      mockUsePathname.mockReturnValue('/studio/desk')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).not.toHaveBeenCalled()
    })
  })

  describe('Route Change Tracking', () => {
    it('should track when pathname changes from homepage to cakes', () => {
      mockUsePathname.mockReturnValue('/')

      const { rerender } = render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalledTimes(2) // Initial render

      mockGtag.mockClear()
      mockUsePathname.mockReturnValue('/cakes')

      rerender(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123',
        expect.objectContaining({
          page_path: '/cakes'
        })
      )
    })

    it('should track when search params change', () => {
      mockUsePathname.mockReturnValue('/cakes')
      mockUseSearchParams.mockReturnValue({
        toString: () => 'page=1',
        get: jest.fn(),
        getAll: jest.fn(),
        has: jest.fn(),
        keys: jest.fn(),
        values: jest.fn(),
        entries: jest.fn(),
        forEach: jest.fn(),
        size: 1,
        [Symbol.iterator]: jest.fn()
      } as any)

      const { rerender } = render(<GoogleAnalytics gaId="G-TEST123" />)

      mockGtag.mockClear()

      mockUseSearchParams.mockReturnValue({
        toString: () => 'page=2',
        get: jest.fn(),
        getAll: jest.fn(),
        has: jest.fn(),
        keys: jest.fn(),
        values: jest.fn(),
        entries: jest.fn(),
        forEach: jest.fn(),
        size: 1,
        [Symbol.iterator]: jest.fn()
      } as any)

      rerender(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123',
        expect.objectContaining({
          page_path: '/cakes?page=2'
        })
      )
    })

    it('should stop tracking when navigating to admin page', () => {
      mockUsePathname.mockReturnValue('/cakes')

      const { rerender } = render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalledTimes(2)

      mockGtag.mockClear()
      mockUsePathname.mockReturnValue('/admin')

      rerender(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should resume tracking when navigating from admin back to customer page', () => {
      mockUsePathname.mockReturnValue('/admin')

      const { rerender } = render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).not.toHaveBeenCalled()

      mockUsePathname.mockReturnValue('/cakes')

      rerender(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123',
        expect.objectContaining({
          page_path: '/cakes'
        })
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing gtag gracefully', () => {
      delete (window as any).gtag
      mockUsePathname.mockReturnValue('/')

      expect(() => {
        render(<GoogleAnalytics gaId="G-TEST123" />)
      }).not.toThrow()
    })

    it('should work with different GA IDs', () => {
      mockUsePathname.mockReturnValue('/')

      render(<GoogleAnalytics gaId="G-DIFFERENT456" />)

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-DIFFERENT456', expect.any(Object))
    })

    it('should track root path with trailing slash', () => {
      mockUsePathname.mockReturnValue('/')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123',
        expect.objectContaining({
          page_path: '/'
        })
      )
    })

    it('should include all required GA parameters', () => {
      mockUsePathname.mockReturnValue('/cakes')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123',
        expect.objectContaining({
          page_path: expect.any(String),
          page_title: expect.any(String),
          page_location: expect.any(String),
          custom_map: expect.any(Object),
          send_page_view: true
        })
      )

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123',
        expect.objectContaining({
          business_type: 'bakery',
          location: 'leeds'
        })
      )
    })
  })

  describe('Business Parameters', () => {
    it('should always include business_type as "bakery"', () => {
      mockUsePathname.mockReturnValue('/cakes')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123',
        expect.objectContaining({
          business_type: 'bakery'
        })
      )
    })

    it('should always include location as "leeds"', () => {
      mockUsePathname.mockReturnValue('/cakes')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123',
        expect.objectContaining({
          location: 'leeds'
        })
      )
    })

    it('should include custom parameter mapping', () => {
      mockUsePathname.mockReturnValue('/cakes')

      render(<GoogleAnalytics gaId="G-TEST123" />)

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123',
        expect.objectContaining({
          custom_map: {
            custom_parameter_1: 'business_type',
            custom_parameter_2: 'location'
          }
        })
      )
    })
  })
})

