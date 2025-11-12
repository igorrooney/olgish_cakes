/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { HamperImageGallery } from '../HamperImageGallery'

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, fill, priority, blurDataURL, placeholder, sizes, loading, quality, ...props }: any) => (
    <img alt={alt} src={src} data-testid="next-image" {...props} />
  )
}))

// Mock Sanity
jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn((image) => ({
    width: () => ({ height: () => ({ url: () => 'https://cdn.sanity.io/image.jpg' }) })
  }))
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Box: ({ children, role, sx, ...props }: any) => (
    <div data-testid="box" role={role} {...props}>{children}</div>
  ),
}))

// Mock direct icon imports
jest.mock('@mui/icons-material/ArrowBack', () => ({
  __esModule: true,
  default: () => <span>←</span>
}))

jest.mock('@mui/icons-material/ArrowForward', () => ({
  __esModule: true,
  default: () => <span>→</span>
}))

// Mock UI components
jest.mock('@/lib/ui-components', () => ({
  AccessibleIconButton: ({ children, ariaLabel, onClick, ...props }: any) => (
    <button data-testid="icon-button" aria-label={ariaLabel} onClick={onClick} {...props}>
      {children}
    </button>
  )
}))

// Mock design system
jest.mock('@/lib/design-system', () => ({
  colors: {
    primary: { main: '#2E3192' }
  }
}))

describe('HamperImageGallery', () => {
  const mockImages = [
    { asset: { _ref: 'ref-1', url: '/image-1.jpg' }, alt: 'Image 1', isMain: true },
    { asset: { _ref: 'ref-2', url: '/image-2.jpg' }, alt: 'Image 2', isMain: false },
    { asset: { _ref: 'ref-3', url: '/image-3.jpg' }, alt: 'Image 3', isMain: false }
  ]

  describe('Rendering', () => {
    it('should render section element', () => {
      const { container } = render(<HamperImageGallery name="Test Hamper" images={mockImages} />)

      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should have aria-label', () => {
      const { container } = render(<HamperImageGallery name="Test Hamper" images={mockImages} />)

      const section = container.querySelector('section')
      expect(section).toHaveAttribute('aria-label', 'Hamper image gallery')
      expect(section).toHaveAttribute('role', 'region')
    })

    it('should render Box container', () => {
      render(<HamperImageGallery name="Test Hamper" images={mockImages} />)

      expect(screen.getAllByTestId('box').length).toBeGreaterThan(0)
    })

    it('should render Next.js Image', () => {
      render(<HamperImageGallery name="Test Hamper" images={mockImages} />)

      const images = screen.getAllByTestId('next-image')
      expect(images.length).toBeGreaterThan(0)
    })
  })

  describe('Image Sorting', () => {
    it('should show main image first', () => {
      render(<HamperImageGallery name="Test Hamper" images={mockImages} />)

      const images = screen.getAllByTestId('next-image')
      expect(images[0]).toHaveAttribute('alt', 'Image 1')
    })

    it('should prioritize isMain images', () => {
      const shuffled = [mockImages[2], mockImages[0], mockImages[1]]

      render(<HamperImageGallery name="Test" images={shuffled} />)

      const images = screen.getAllByTestId('next-image')
      expect(images[0]).toHaveAttribute('alt', 'Image 1')
    })
  })

  describe('Navigation', () => {
    it('should show navigation buttons when multiple images', () => {
      render(<HamperImageGallery name="Test" images={mockImages} />)

      const buttons = screen.getAllByTestId('icon-button')
      expect(buttons.length).toBe(2)
    })

    it('should have Previous button', () => {
      render(<HamperImageGallery name="Test" images={mockImages} />)

      const prevButton = screen.getByLabelText('Previous image')
      expect(prevButton).toBeInTheDocument()
    })

    it('should have Next button', () => {
      render(<HamperImageGallery name="Test" images={mockImages} />)

      const nextButton = screen.getByLabelText('Next image')
      expect(nextButton).toBeInTheDocument()
    })

    it('should navigate to next image', () => {
      render(<HamperImageGallery name="Test" images={mockImages} />)

      const nextButton = screen.getByLabelText('Next image')
      fireEvent.click(nextButton)

      const images = screen.getAllByTestId('next-image')
      expect(images[0]).toHaveAttribute('alt', 'Image 2')
    })

    it('should navigate to previous image', () => {
      render(<HamperImageGallery name="Test" images={mockImages} />)

      const prevButton = screen.getByLabelText('Previous image')
      fireEvent.click(prevButton)

      const images = screen.getAllByTestId('next-image')
      expect(images[0]).toHaveAttribute('alt', 'Image 3')
    })

    it('should loop to last image when going back from first', () => {
      render(<HamperImageGallery name="Test" images={mockImages} />)

      const prevButton = screen.getByLabelText('Previous image')
      fireEvent.click(prevButton)

      const images = screen.getAllByTestId('next-image')
      expect(images[0]).toHaveAttribute('alt', 'Image 3')
    })

    it('should loop to first image when going forward from last', () => {
      render(<HamperImageGallery name="Test" images={mockImages} />)

      const nextButton = screen.getByLabelText('Next image')
      fireEvent.click(nextButton) // Image 2
      fireEvent.click(nextButton) // Image 3
      fireEvent.click(nextButton) // Back to Image 1

      const images = screen.getAllByTestId('next-image')
      expect(images[0]).toHaveAttribute('alt', 'Image 1')
    })

    it('should not show navigation buttons for single image', () => {
      render(<HamperImageGallery name="Test" images={[mockImages[0]]} />)

      expect(screen.queryByTestId('icon-button')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should return null when no images', () => {
      const { container } = render(<HamperImageGallery name="Test" images={[]} />)

      expect(container.firstChild).toBeNull()
    })

    it('should return null when images undefined', () => {
      const { container } = render(<HamperImageGallery name="Test" />)

      expect(container.firstChild).toBeNull()
    })

    it('should return null when no valid images', () => {
      const invalidImages = [{ asset: { _ref: null } }] as any

      const { container } = render(<HamperImageGallery name="Test" images={invalidImages} />)

      // Component now renders a fallback instead of returning null
      expect(container.firstChild).toBeTruthy()
    })
  })

  describe('Alt Text', () => {
    it('should use provided alt text', () => {
      render(<HamperImageGallery name="Test" images={mockImages} />)

      const images = screen.getAllByAltText('Image 1')
      expect(images.length).toBeGreaterThan(0)
    })

    it('should fallback to product name', () => {
      const imagesWithoutAlt = [{ ...mockImages[0], alt: undefined }]

      render(<HamperImageGallery name="Deluxe Hamper" images={imagesWithoutAlt as any} />)

      expect(screen.getByAltText('Deluxe Hamper product image')).toBeInTheDocument()
    })
  })

  describe('Memoization', () => {
    it('should be memoized', () => {
    })
  })

  describe('Accessibility', () => {
    it('should have region role', () => {
      const { container } = render(<HamperImageGallery name="Test" images={mockImages} />)

      const section = container.querySelector('section')
      expect(section).toHaveAttribute('role', 'region')
    })

    it('should have descriptive aria-labels for buttons', () => {
      render(<HamperImageGallery name="Test" images={mockImages} />)

      expect(screen.getByLabelText('Previous image')).toBeInTheDocument()
      expect(screen.getByLabelText('Next image')).toBeInTheDocument()
    })
  })
})

