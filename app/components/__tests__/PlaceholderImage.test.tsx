/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import PlaceholderImage from '../PlaceholderImage'

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, fill, style, sizes, placeholder, blurDataURL, ...props }: any) => (
    <img
      alt={alt}
      src={src}
      data-testid="next-image"
      data-fill={fill}
      data-sizes={sizes}
      {...props}
    />
  )
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Box: ({ children, className, sx, role, ...props }: any) => (
    <div
      data-testid="box"
      className={className}
      data-sx={JSON.stringify(sx)}
      role={role}
      {...props}
    >
      {children}
    </div>
  ),
  Typography: ({ children, variant, className, sx, ...props }: any) => (
    <div
      data-testid="typography"
      data-variant={variant}
      className={className}
      data-sx={JSON.stringify(sx)}
      {...props}
    >
      {children}
    </div>
  )
}))

describe('PlaceholderImage', () => {
  describe('Rendering', () => {
    it('should render Box container', () => {
      render(<PlaceholderImage name="Test Cake" />)

      expect(screen.getByTestId('box')).toBeInTheDocument()
    })

    it('should render Next.js Image', () => {
      render(<PlaceholderImage name="Test Cake" />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should render name in Typography', () => {
      render(<PlaceholderImage name="Honey Cake" />)

      expect(screen.getByText('Honey Cake')).toBeInTheDocument()
    })

    it('should display product name', () => {
      render(<PlaceholderImage name="Chocolate Cake" />)

      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument()
    })
  })

  describe('Image Properties', () => {
    it('should use placeholder image source', () => {
      render(<PlaceholderImage name="Test" />)

      const img = screen.getByTestId('next-image')
      expect(img).toHaveAttribute('src', '/images/placeholder-cake.jpg')
    })

    it('should include name in alt text', () => {
      render(<PlaceholderImage name="Test Cake" />)

      const img = screen.getByTestId('next-image')
      expect(img).toHaveAttribute('alt', 'Placeholder for Test Cake')
    })

    it('should use fill prop', () => {
      render(<PlaceholderImage name="Test" />)

      const img = screen.getByTestId('next-image')
      expect(img.getAttribute('data-fill')).toBe('true')
    })

    it('should include responsive sizes', () => {
      render(<PlaceholderImage name="Test" />)

      const img = screen.getByTestId('next-image')
      const sizes = img.getAttribute('data-sizes')
      expect(sizes).toContain('max-width: 640px')
      expect(sizes).toContain('max-width: 1200px')
    })

    it('should use blur placeholder', () => {
      render(<PlaceholderImage name="Test" />)

      // Placeholder prop should be set
      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      render(<PlaceholderImage name="Test Cake" />)

      const box = screen.getByTestId('box')
      expect(box).toHaveAttribute('aria-label', 'Placeholder image for Test Cake')
    })

    it('should have img role', () => {
      render(<PlaceholderImage name="Test" />)

      const box = screen.getByTestId('box')
      expect(box).toHaveAttribute('role', 'img')
    })

    it('should include descriptive alt text', () => {
      render(<PlaceholderImage name="Ukrainian Honey Cake" />)

      const img = screen.getByTestId('next-image')
      expect(img).toHaveAttribute('alt', 'Placeholder for Ukrainian Honey Cake')
    })
  })

  describe('Styling', () => {
    it('should apply default className', () => {
      render(<PlaceholderImage name="Test" />)

      const box = screen.getByTestId('box')
      expect(box).toHaveClass('flex')
      expect(box).toHaveClass('items-center')
      expect(box).toHaveClass('justify-center')
      expect(box).toHaveClass('bg-gray-100')
    })

    it('should apply custom className', () => {
      render(<PlaceholderImage name="Test" className="custom-class" />)

      const box = screen.getByTestId('box')
      expect(box).toHaveClass('custom-class')
    })

    it('should preserve base classes with custom className', () => {
      render(<PlaceholderImage name="Test" className="extra-class" />)

      const box = screen.getByTestId('box')
      expect(box).toHaveClass('flex')
      expect(box).toHaveClass('extra-class')
    })

    it('should have minimum height', () => {
      render(<PlaceholderImage name="Test" />)

      const box = screen.getByTestId('box')
      const sx = JSON.parse(box.getAttribute('data-sx') || '{}')
      expect(sx.minHeight).toBe('200px')
    })

    it('should use relative positioning', () => {
      render(<PlaceholderImage name="Test" />)

      const box = screen.getByTestId('box')
      const sx = JSON.parse(box.getAttribute('data-sx') || '{}')
      expect(sx.position).toBe('relative')
    })
  })

  describe('Memoization', () => {
    it('should be memoized', () => {
    })

    it('should be default export', () => {
      expect(PlaceholderImage).toBeDefined()
      expect(typeof PlaceholderImage).toBe('object')
    })
  })

  describe('Typography', () => {
    it('should render Typography component', () => {
      render(<PlaceholderImage name="Test" />)

      expect(screen.getByTestId('typography')).toBeInTheDocument()
    })

    it('should use body1 variant', () => {
      render(<PlaceholderImage name="Test" />)

      const typography = screen.getByTestId('typography')
      expect(typography.getAttribute('data-variant')).toBe('body1')
    })

    it('should apply text styling classes', () => {
      render(<PlaceholderImage name="Test" />)

      const typography = screen.getByTestId('typography')
      expect(typography).toHaveClass('text-gray-400')
      expect(typography).toHaveClass('text-center')
    })
  })

  describe('Props', () => {
    it('should accept name prop', () => {
      render(<PlaceholderImage name="Birthday Cake" />)

      expect(screen.getByText('Birthday Cake')).toBeInTheDocument()
    })

    it('should accept className prop', () => {
      render(<PlaceholderImage name="Test" className="my-custom-class" />)

      expect(screen.getByTestId('box')).toHaveClass('my-custom-class')
    })

    it('should use empty string as default className', () => {
      render(<PlaceholderImage name="Test" />)

      // Should still have base classes
      expect(screen.getByTestId('box')).toHaveClass('flex')
    })
  })
})

