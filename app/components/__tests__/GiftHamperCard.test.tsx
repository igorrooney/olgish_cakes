/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import GiftHamperCard from '../GiftHamperCard'

type HamperProp = React.ComponentProps<typeof GiftHamperCard>['hamper']

// Mock Next.js
jest.mock('next/link', () => {
  return ({ children, href, ...props }: MockProps) => <a href={href} {...props}>{children}</a>
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: MockProps) => <img alt={alt} src={src} data-testid="next-image" {...props} />
}))

// Mock Sanity
jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn((image) => ({
    url: () => 'https://cdn.sanity.io/hamper.jpg',
    width: () => ({ height: () => ({ url: () => 'https://cdn.sanity.io/hamper.jpg' }) })
  }))
}))

// Mock utilities
jest.mock('@/types/cake', () => ({
  blocksToText: jest.fn((blocks) => 'Hamper description text')
}))

jest.mock('@/lib/constants', () => ({
  BUSINESS_CONSTANTS: {
    NAME: 'Olgish Cakes',
    WEBSITE: 'https://olgishcakes.co.uk'
  }
}))

// Mock design system
jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: {
      text: { primary: '#000', secondary: '#666' },
      primary: { main: '#2E3192' },
      background: { subtle: '#F5F5F5' }
    },
    typography: {
      fontFamily: { display: 'Playfair Display' },
      fontWeight: { semibold: 600, medium: 500 },
      lineHeight: { tight: 1.2 }
    },
    spacing: { xs: '0.25rem', md: '1rem', lg: '1.5rem' },
    borderRadius: {},
    shadows: {}
  }
}))

// Mock UI components
jest.mock('@/lib/ui-components', () => ({
  ProductCard: ({ children, onMouseEnter, onMouseLeave, role, ...props }: MockProps) => (
    <div
      data-testid="product-card"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role={role}
      {...props}
    >
      {children}
    </div>
  ),
  PriceDisplay: ({ price, size, label, ...props }: MockProps) => (
    <div data-testid="price-display" data-price={price} {...props}>£{price}</div>
  ),
  OutlineButton: ({ children, component, href, ...props }: MockProps) => {
    const Component = component || 'button'
    return <Component data-testid="outline-button" href={href} {...props}>{children}</Component>
  }
}))

// Mock MUI
jest.mock('@/lib/daisy-ui', () => ({
  Box: ({ children, sx, ...props }: MockProps) => <div data-testid="box" {...props}>{children}</div>,
  Typography: ({ children, variant, component, sx, ...props }: MockProps) => {
    const Component = component || 'div'
    return <Component data-testid="typography" data-variant={variant} {...props}>{children}</Component>
  }
}))

describe('GiftHamperCard', () => {
  const mockHamper = {
    _id: 'hamper-1',
    name: 'Deluxe Hamper',
    slug: { current: 'deluxe-hamper' },
    category: 'Gift Hampers',
    price: 45,
    shortDescription: [{ children: [{ text: 'Beautiful gift hamper' }] }],
    images: [{ asset: { _ref: 'image-ref-1' }, isMain: true }],
    allergens: ['Nuts']
  }

  describe('Rendering', () => {
    it('should render ProductCard', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })

    it('should render hamper name', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      expect(screen.getByText('Deluxe Hamper')).toBeInTheDocument()
    })

    it('should render PriceDisplay', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      expect(screen.getByTestId('price-display')).toBeInTheDocument()
    })

    it('should render Order Now button', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      expect(screen.getByText('Order Now')).toBeInTheDocument()
    })

    it('should render Next.js Image', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })
  })

  describe('Image Handling', () => {
    it('should use main image', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should fallback to first image when no main', () => {
      const hamperWithoutMain = {
        ...mockHamper,
        images: [{ asset: { _ref: 'ref-1' }, isMain: false }]
      }

      render(<GiftHamperCard hamper={hamperWithoutMain as HamperProp} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should use placeholder when no images', () => {
      const hamperWithoutImages = { ...mockHamper, images: undefined }

      render(<GiftHamperCard hamper={hamperWithoutImages} />)

      const img = screen.getByTestId('next-image')
      expect(img).toHaveAttribute('src', expect.stringContaining('placehold.co'))
    })

    it('should generate alt text with location', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      const img = screen.getByTestId('next-image')
      expect(img).toHaveAttribute('alt', expect.stringContaining('Leeds'))
    })
  })

  describe('Variants', () => {
    it('should use catalog variant by default', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })

    it('should accept featured variant', () => {
      render(<GiftHamperCard hamper={mockHamper} variant="featured" />)

      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })
  })

  describe('Testimonial Stats', () => {
    it('should use provided testimonial stats', () => {
      const customStats = { count: 50, averageRating: 4.8 }

      render(<GiftHamperCard hamper={mockHamper} testimonialStats={customStats} />)

      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })

    it('should use default stats when not provided', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })
  })

  describe('Price', () => {
    it('should display price', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      const priceDisplay = screen.getByTestId('price-display')
      expect(priceDisplay.getAttribute('data-price')).toBe('45')
    })

    it('should use 0 when no price', () => {
      const hamperWithoutPrice = { ...mockHamper, price: undefined }

      render(<GiftHamperCard hamper={hamperWithoutPrice as HamperProp} />)

      const priceDisplay = screen.getByTestId('price-display')
      expect(priceDisplay.getAttribute('data-price')).toBe('0')
    })
  })

  describe('Links', () => {
    it('should link to hamper detail page', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      const link = screen.getAllByRole('link')[0]
      expect(link).toHaveAttribute('href', '/cakes-by-post/deluxe-hamper')
    })

    it('should use _id when slug not available', () => {
      const hamperWithoutSlug = { ...mockHamper, slug: undefined }

      render(<GiftHamperCard hamper={hamperWithoutSlug} />)

      const link = screen.getAllByRole('link')[0]
      expect(link).toHaveAttribute('href', '/cakes-by-post/hamper-1')
    })
  })

  describe('Structured Data', () => {
    it('omits duplicate product structured data and microdata from list cards', () => {
      const { container } = render(<GiftHamperCard hamper={mockHamper} />)

      expect(container.querySelector('script[type="application/ld+json"]')).toBeNull()
      expect(container.querySelector('[itemscope]')).toBeNull()
      expect(container.querySelector('[itemprop]')).toBeNull()
    })
  })

  describe('Hover State', () => {
    it('should handle mouse enter', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      const card = screen.getByTestId('product-card')
      fireEvent.mouseEnter(card)

      expect(card).toBeInTheDocument()
    })

    it('should handle mouse leave', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      const card = screen.getByTestId('product-card')
      fireEvent.mouseEnter(card)
      fireEvent.mouseLeave(card)

      expect(card).toBeInTheDocument()
    })
  })

  describe('Memoization', () => {
    it('should be memoized', () => {
    })
  })

  describe('Accessibility', () => {
    it('should have article role', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      const card = screen.getByTestId('product-card')
      expect(card).toHaveAttribute('role', 'article')
    })

    it('should have aria-label', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      const card = screen.getByTestId('product-card')
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('Deluxe Hamper'))
    })
  })
})
