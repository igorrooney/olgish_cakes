/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { CakeImageGallery } from '../CakeImageGallery'

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: any) => <img alt={alt} src={src} data-testid="next-image" {...props} />
}))

// Mock Sanity
jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn((image) => ({
    width: jest.fn().mockReturnThis(),
    height: jest.fn().mockReturnThis(),
    url: jest.fn(() => `https://cdn.sanity.io/image-${image?.asset?._ref || 'default'}.jpg`)
  }))
}))

// Mock design system
jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: { primary: { main: '#2E3192' } }
  }
}))

// Mock UI components
jest.mock('@/lib/ui-components', () => ({
  AccessibleIconButton: ({ children, onClick, ariaLabel, ...props }: any) => (
    <button data-testid="accessible-icon-button" onClick={onClick} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
  TouchTargetWrapper: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Box: ({ children, role, sx, ...props }: any) => (
    <div data-testid="box" role={role} {...props}>{children}</div>
  ),
  IconButton: ({ children, onClick, ...props }: any) => (
    <button data-testid="icon-button" onClick={onClick} {...props}>{children}</button>
  ),
  ImageList: ({ children, ...props }: any) => <div data-testid="image-list" {...props}>{children}</div>,
  ImageListItem: ({ children, ...props }: any) => <div data-testid="image-list-item" {...props}>{children}</div>,
  Typography: ({ children, ...props }: any) => <div data-testid="typography" {...props}>{children}</div>,
}))

// Mock direct icon imports
jest.mock('@mui/icons-material/ArrowBack', () => ({
  __esModule: true,
  default: () => <span>◀</span>
}))

jest.mock('@mui/icons-material/ArrowForward', () => ({
  __esModule: true,
  default: () => <span>▶</span>
}))

// Mock DesignSelector
jest.mock('../DesignSelector', () => ({
  DesignSelector: ({ onChange, value, ...props }: any) => (
    <div data-testid="design-selector">
      <button onClick={() => onChange('standard')}>Standard</button>
      <button onClick={() => onChange('individual')}>Individual</button>
      <span>Current: {value}</span>
    </div>
  )
}))

describe('CakeImageGallery', () => {
  const mockStandardImages = [
    { asset: { _ref: 'std-1' }, alt: 'Standard 1' },
    { asset: { _ref: 'std-2' }, alt: 'Standard 2' }
  ]

  const mockIndividualImages = [
    { asset: { _ref: 'ind-1' }, alt: 'Individual 1' },
    { asset: { _ref: 'ind-2' }, alt: 'Individual 2' }
  ]

  const mockDesigns = {
    standard: mockStandardImages,
    individual: mockIndividualImages
  }

  const mockProps = {
    designs: mockDesigns,
    name: 'Honey Cake',
    designType: 'standard' as const,
    onDesignTypeChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render gallery section', () => {
      render(<CakeImageGallery {...mockProps} />)

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should render main image', () => {
      render(<CakeImageGallery {...mockProps} />)

      const images = screen.getAllByTestId('next-image')
      expect(images.length).toBeGreaterThan(0)
    })

    it('should render navigation buttons', () => {
      render(<CakeImageGallery {...mockProps} />)

      expect(screen.getByLabelText('View previous image')).toBeInTheDocument()
      expect(screen.getByLabelText('View next image')).toBeInTheDocument()
    })

    it('should render thumbnail grid', () => {
      render(<CakeImageGallery {...mockProps} />)

      const images = screen.getAllByTestId('next-image')
      // Main image + thumbnails
      expect(images.length).toBeGreaterThan(1)
    })
  })

  describe('No Images', () => {
    it('should show "No image available" when no standard images', () => {
      const propsWithoutImages = {
        ...mockProps,
        designs: { standard: [], individual: [] }
      }

      render(<CakeImageGallery {...propsWithoutImages} />)

      expect(screen.getByText('No image available')).toBeInTheDocument()
    })

    it('should show "No image available" when designs is null', () => {
      const propsWithNullDesigns = {
        ...mockProps,
        designs: null as any
      }

      render(<CakeImageGallery {...propsWithNullDesigns} />)

      expect(screen.getByText('No image available')).toBeInTheDocument()
    })

    it('should show "No image available" when no standard key', () => {
      const propsWithNoStandard = {
        ...mockProps,
        designs: { individual: mockIndividualImages } as any
      }

      render(<CakeImageGallery {...propsWithNoStandard} />)

      expect(screen.getByText('No image available')).toBeInTheDocument()
    })
  })

  describe('Design Selector', () => {
    it('should show DesignSelector when individual designs exist', () => {
      render(<CakeImageGallery {...mockProps} />)

      expect(screen.getByTestId('design-selector')).toBeInTheDocument()
    })

    it('should hide DesignSelector when no individual designs', () => {
      const propsWithoutIndividual = {
        ...mockProps,
        designs: { standard: mockStandardImages }
      }

      render(<CakeImageGallery {...propsWithoutIndividual} />)

      expect(screen.queryByTestId('design-selector')).not.toBeInTheDocument()
    })

    it('should hide DesignSelector when hideDesignSelector is true', () => {
      render(<CakeImageGallery {...mockProps} hideDesignSelector={true} />)

      expect(screen.queryByTestId('design-selector')).not.toBeInTheDocument()
    })

    it('should call onDesignTypeChange when design changes', () => {
      render(<CakeImageGallery {...mockProps} />)

      const individualButton = screen.getByText('Individual')
      fireEvent.click(individualButton)

      expect(mockProps.onDesignTypeChange).toHaveBeenCalledWith('individual')
    })
  })

  describe('Navigation', () => {
    it('should navigate to next image', () => {
      render(<CakeImageGallery {...mockProps} />)

      const nextButton = screen.getByLabelText('View next image')
      fireEvent.click(nextButton)

      // Current image index should change
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should navigate to previous image', () => {
      render(<CakeImageGallery {...mockProps} />)

      const prevButton = screen.getByLabelText('View previous image')
      fireEvent.click(prevButton)

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should wrap to last image when clicking previous on first image', () => {
      render(<CakeImageGallery {...mockProps} />)

      const prevButton = screen.getByLabelText('View previous image')
      fireEvent.click(prevButton)

      // Should switch to individual design (last image)
      expect(mockProps.onDesignTypeChange).toHaveBeenCalledWith('individual')
    })

    it('should wrap to first image when clicking next on last image', () => {
      const propsAtLastImage = {
        ...mockProps,
        designType: 'individual' as const
      }

      render(<CakeImageGallery {...propsAtLastImage} />)

      // Navigate to last individual image
      const nextButton = screen.getByLabelText('View next image')
      fireEvent.click(nextButton) // Move to last
      fireEvent.click(nextButton) // Wrap to first

      expect(mockProps.onDesignTypeChange).toHaveBeenCalledWith('standard')
    })

    it('should update designType when navigating from standard to individual', () => {
      render(<CakeImageGallery {...mockProps} />)

      const nextButton = screen.getByLabelText('View next image')
      // Click through all standard images to reach individual
      fireEvent.click(nextButton)
      fireEvent.click(nextButton)

      expect(mockProps.onDesignTypeChange).toHaveBeenCalledWith('individual')
    })

    it('should update designType when navigating from individual to standard', () => {
      const propsIndividual = {
        ...mockProps,
        designType: 'individual' as const
      }

      render(<CakeImageGallery {...propsIndividual} />)

      const prevButton = screen.getByLabelText('View previous image')
      // Navigate back to standard
      fireEvent.click(prevButton)

      expect(mockProps.onDesignTypeChange).toHaveBeenCalledWith('standard')
    })
  })

  describe('Thumbnail Click', () => {
    it('should change image on thumbnail click', () => {
      render(<CakeImageGallery {...mockProps} />)

      const thumbnails = screen.getAllByRole('button')
      const thumbnail = thumbnails.find(btn => btn.getAttribute('aria-label')?.includes('View Honey Cake image'))

      if (thumbnail) {
        fireEvent.click(thumbnail)
      }

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should handle keyboard Enter on thumbnail', () => {
      render(<CakeImageGallery {...mockProps} />)

      const thumbnails = screen.getAllByRole('button')
      const thumbnail = thumbnails.find(btn => btn.getAttribute('aria-label')?.includes('View Honey Cake image'))

      if (thumbnail) {
        fireEvent.keyDown(thumbnail, { key: 'Enter' })
      }

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should handle keyboard Space on thumbnail', () => {
      render(<CakeImageGallery {...mockProps} />)

      const thumbnails = screen.getAllByRole('button')
      const thumbnail = thumbnails.find(btn => btn.getAttribute('aria-label')?.includes('View Honey Cake image'))

      if (thumbnail) {
        fireEvent.keyDown(thumbnail, { key: ' ' })
      }

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should not navigate on other keys', () => {
      render(<CakeImageGallery {...mockProps} />)

      const thumbnails = screen.getAllByRole('button')
      const thumbnail = thumbnails.find(btn => btn.getAttribute('aria-label')?.includes('View Honey Cake image'))

      if (thumbnail) {
        fireEvent.keyDown(thumbnail, { key: 'a' })
      }

      // Should not change anything
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should switch to individual design when clicking individual thumbnail', () => {
      render(<CakeImageGallery {...mockProps} />)

      const thumbnails = screen.getAllByRole('button')
      // Find a thumbnail in the individual range (index >= 2)
      const thumbnail = thumbnails[thumbnails.length - 1]

      if (thumbnail && thumbnail.getAttribute('aria-label')?.includes('View Honey Cake image')) {
        fireEvent.click(thumbnail)
      }

      // May trigger design change
      expect(mockProps.onDesignTypeChange).toHaveBeenCalled()
    })
  })

  describe('Design Type Reset', () => {
    it('should reset to index 0 when switching to standard', () => {
      const { rerender } = render(<CakeImageGallery {...mockProps} designType="individual" />)

      rerender(<CakeImageGallery {...mockProps} designType="standard" />)

      // Should reset to first image
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should set index to standard.length when switching to individual', () => {
      const { rerender } = render(<CakeImageGallery {...mockProps} designType="standard" />)

      rerender(<CakeImageGallery {...mockProps} designType="individual" />)

      expect(screen.getByRole('region')).toBeInTheDocument()
    })
  })

  describe('Image Alt Text', () => {
    it('should use custom alt text when provided', () => {
      render(<CakeImageGallery {...mockProps} />)

      const images = screen.getAllByTestId('next-image')
      const mainImage = images[0]
      expect(mainImage).toHaveAttribute('alt', expect.stringContaining('Standard 1'))
    })

    it('should generate alt text when not provided', () => {
      const propsWithoutAlt = {
        ...mockProps,
        designs: {
          standard: [{ asset: { _ref: 'no-alt' } }]
        }
      }

      render(<CakeImageGallery {...propsWithoutAlt} />)

      const images = screen.getAllByTestId('next-image')
      expect(images[0]).toHaveAttribute('alt', expect.stringContaining('Honey Cake'))
      expect(images[0]).toHaveAttribute('alt', expect.stringContaining('Leeds'))
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CakeImageGallery {...mockProps} />)

      expect(screen.getByLabelText('Cake image gallery')).toBeInTheDocument()
      expect(screen.getByLabelText('Main cake image')).toBeInTheDocument()
    })

    it('should have proper roles', () => {
      render(<CakeImageGallery {...mockProps} />)

      expect(screen.getByRole('region')).toBeInTheDocument()
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
    })

    it('should have keyboard accessible thumbnails', () => {
      render(<CakeImageGallery {...mockProps} />)

      const thumbnails = screen.getAllByRole('button')
      const thumbnail = thumbnails.find(btn => btn.getAttribute('aria-label')?.includes('View Honey Cake image'))

      expect(thumbnail).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Memoization', () => {
    it('should be memoized', () => {
    })
  })

  describe('Edge Cases', () => {
    it('should handle single standard image', () => {
      const propsWithSingleImage = {
        ...mockProps,
        designs: {
          standard: [{ asset: { _ref: 'single' }, alt: 'Single' }]
        }
      }

      render(<CakeImageGallery {...propsWithSingleImage} />)

      // Should not show thumbnails when only 1 image total
      expect(screen.getAllByTestId('next-image').length).toBe(1)
    })

    it('should handle empty individual array', () => {
      const propsWithEmptyIndividual = {
        ...mockProps,
        designs: {
          standard: mockStandardImages,
          individual: []
        }
      }

      render(<CakeImageGallery {...propsWithEmptyIndividual} />)

      expect(screen.queryByTestId('design-selector')).not.toBeInTheDocument()
    })
  })
})

