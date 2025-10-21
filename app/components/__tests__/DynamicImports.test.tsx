/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  DynamicContactForm,
  DynamicQuoteForm,
  DynamicCakeImageGallery,
  DynamicTestimonialsList,
  DynamicCookieConsent,
  DynamicDevTools,
  DynamicComponentWrapper
} from '../DynamicImports'

// Mock next/dynamic
jest.mock('next/dynamic', () => {
  return (loader: any, options?: any) => {
    const Component = (props: any) => {
      if (options?.loading && typeof options.loading === 'function') {
        return React.createElement(options.loading, props)
      }
      return React.createElement('div', { 'data-testid': 'dynamic-component' }, 'Dynamic Component')
    }
    Component.displayName = 'DynamicComponent'
    return Component
  }
})

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Box: ({ children, display, justifyContent, alignItems, p, ...props }: any) => (
    <div data-testid="box" {...props}>{children}</div>
  ),
  CircularProgress: ({ size, ...props }: any) => (
    <div data-testid="circular-progress" data-size={size} {...props}>Loading...</div>
  )
}))

describe('DynamicImports', () => {
  describe('DynamicContactForm', () => {
    it('should be defined', () => {
      expect(DynamicContactForm).toBeDefined()
    })

    it('should be a React component', () => {
      expect(typeof DynamicContactForm).toBe('function')
    })

    it('should render component or loading', () => {
      const { container } = render(<DynamicContactForm />)

      expect(container.innerHTML).toBeTruthy()
    })
  })

  describe('DynamicQuoteForm', () => {
    it('should be defined', () => {
      expect(DynamicQuoteForm).toBeDefined()
    })

    it('should be a React component', () => {
      expect(typeof DynamicQuoteForm).toBe('function')
    })
  })

  describe('DynamicCakeImageGallery', () => {
    it('should be defined', () => {
      expect(DynamicCakeImageGallery).toBeDefined()
    })

    it('should be a React component', () => {
      expect(typeof DynamicCakeImageGallery).toBe('function')
    })
  })

  describe('DynamicTestimonialsList', () => {
    it('should be defined', () => {
      expect(DynamicTestimonialsList).toBeDefined()
    })

    it('should be a React component', () => {
      expect(typeof DynamicTestimonialsList).toBe('function')
    })
  })

  describe('DynamicCookieConsent', () => {
    it('should be defined', () => {
      expect(DynamicCookieConsent).toBeDefined()
    })

    it('should be a React component', () => {
      expect(typeof DynamicCookieConsent).toBe('function')
    })
  })

  describe('DynamicDevTools', () => {
    it('should be defined', () => {
      expect(DynamicDevTools).toBeDefined()
    })

    it('should be a React component', () => {
      expect(typeof DynamicDevTools).toBe('function')
    })
  })

  describe('DynamicComponentWrapper', () => {
    it('should render children', () => {
      render(
        <DynamicComponentWrapper>
          <div data-testid="child">Child Content</div>
        </DynamicComponentWrapper>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should accept custom fallback', () => {
      const customFallback = <div data-testid="custom-fallback">Loading...</div>

      render(
        <DynamicComponentWrapper fallback={customFallback}>
          <div>Content</div>
        </DynamicComponentWrapper>
      )

      // Component renders children immediately in test
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should be a function', () => {
      expect(typeof DynamicComponentWrapper).toBe('function')
    })
  })

  describe('Exports', () => {
    it('should export all dynamic components', () => {
      expect(DynamicContactForm).toBeDefined()
      expect(DynamicQuoteForm).toBeDefined()
      expect(DynamicCakeImageGallery).toBeDefined()
      expect(DynamicTestimonialsList).toBeDefined()
      expect(DynamicCookieConsent).toBeDefined()
      expect(DynamicDevTools).toBeDefined()
      expect(DynamicComponentWrapper).toBeDefined()
    })
  })
})

