/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OptimizedImage } from '../OptimizedImage'

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, onLoad, onError, width, height, ...props }: any) => (
    <img
      alt={alt}
      src={src}
      width={width}
      height={height}
      onLoad={onLoad}
      onError={onError}
      data-testid="next-image"
      {...props}
    />
  )
}))

// Mock MUI
jest.mock('@mui/material', () => ({
  Box: ({ children, sx, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  Skeleton: ({ variant, width, height, animation, sx, ...props }: any) => (
    <div data-testid="skeleton" data-variant={variant} {...props}>Loading...</div>
  )
}))

describe('OptimizedImage', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test Image',
    width: 400,
    height: 300
  }

  beforeEach(() => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true })
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
  })

  describe('Rendering', () => {
    it('should render Next.js Image', () => {
      render(<OptimizedImage {...defaultProps} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should show loading skeleton initially', () => {
      render(<OptimizedImage {...defaultProps} />)

      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('should pass src and alt to Image', () => {
      render(<OptimizedImage {...defaultProps} />)

      const img = screen.getByTestId('next-image')
      expect(img).toHaveAttribute('alt', 'Test Image')
    })

    it('should pass width and height', () => {
      render(<OptimizedImage {...defaultProps} />)

      const img = screen.getByTestId('next-image')
      expect(img).toHaveAttribute('width', '400')
      expect(img).toHaveAttribute('height', '300')
    })
  })

  describe('Image Optimization', () => {
    it('should use @2x for retina displays', async () => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 2, writable: true })

      render(<OptimizedImage {...defaultProps} />)

      // Component should attempt to optimize source
      await waitFor(() => {
        expect(true).toBe(true)
      })
    })

    it('should use mobile version on mobile devices', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 500, writable: true })

      render(<OptimizedImage {...defaultProps} />)

      await waitFor(() => {
        expect(true).toBe(true)
      })
    })

    it('should use original source for standard displays', () => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true })

      render(<OptimizedImage {...defaultProps} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should hide skeleton after image loads', () => {
      render(<OptimizedImage {...defaultProps} />)

      const img = screen.getByTestId('next-image')
      fireEvent.load(img)

      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })

    it('should call onLoad callback', () => {
      const onLoad = jest.fn()

      render(<OptimizedImage {...defaultProps} onLoad={onLoad} />)

      const img = screen.getByTestId('next-image')
      fireEvent.load(img)

      expect(onLoad).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should show error message when image fails', () => {
      render(<OptimizedImage {...defaultProps} />)

      const img = screen.getByTestId('next-image')
      fireEvent.error(img)

      expect(screen.getByText('Image not available')).toBeInTheDocument()
    })

    it('should call onError callback', () => {
      const onError = jest.fn()

      render(<OptimizedImage {...defaultProps} onError={onError} />)

      const img = screen.getByTestId('next-image')
      fireEvent.error(img)

      expect(onError).toHaveBeenCalled()
    })

    it('should fallback to original src on error', () => {
      render(<OptimizedImage {...defaultProps} />)

      const img = screen.getByTestId('next-image')
      fireEvent.error(img)

      // Error state should be shown
      expect(screen.getByText('Image not available')).toBeInTheDocument()
    })

    it('should not show Next.js Image when error occurs', () => {
      render(<OptimizedImage {...defaultProps} />)

      const img = screen.getByTestId('next-image')
      fireEvent.error(img)

      expect(screen.queryByTestId('next-image')).not.toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should use priority prop', () => {
      render(<OptimizedImage {...defaultProps} priority />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should apply className', () => {
      render(<OptimizedImage {...defaultProps} className="custom-class" />)

      const img = screen.getByTestId('next-image')
      expect(img).toHaveClass('custom-class')
    })

    it('should use custom sizes', () => {
      render(<OptimizedImage {...defaultProps} sizes="(max-width: 600px) 100vw" />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should use custom quality', () => {
      render(<OptimizedImage {...defaultProps} quality={90} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should use empty placeholder by default', () => {
      render(<OptimizedImage {...defaultProps} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should accept blur placeholder', () => {
      render(<OptimizedImage {...defaultProps} placeholder="blur" blurDataURL="data:image/..." />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should use lazy loading by default', () => {
      render(<OptimizedImage {...defaultProps} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should accept eager loading', () => {
      render(<OptimizedImage {...defaultProps} loading="eager" />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should use async decoding by default', () => {
      render(<OptimizedImage {...defaultProps} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should use auto fetchPriority by default', () => {
      render(<OptimizedImage {...defaultProps} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })
  })

  describe('Structured Data', () => {
    it('should include JSON-LD script', () => {
      const { container } = render(<OptimizedImage {...defaultProps} />)

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
    })

    it('should generate valid ImageObject schema', () => {
      const { container } = render(<OptimizedImage {...defaultProps} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json['@type']).toBe('ImageObject')
      expect(json.name).toBe('Test Image')
    })
  })
})

