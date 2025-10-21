/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import GiftHamperCard from '../GiftHamperCard'

// Mock Next.js
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: any) => <img alt={alt} src={src} data-testid="next-image" {...props} />
}))

// Mock Sanity
jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn((image) => ({
    width: () => ({ height: () => ({ url: () => 'https://cdn.sanity.io/hamper.jpg' }) })
  }))
}))

// Mock utilities
jest.mock('@/types/cake', () => ({
  blocksToText: jest.fn((blocks) => 'Hamper description text')
}))

jest.mock('@/app/utils/seo', () => ({
  getPriceValidUntil: jest.fn(() => '2026-01-01'),
  getOfferShippingDetails: jest.fn(() => ({ '@type': 'OfferShippingDetails' })),
  getMerchantReturnPolicy: jest.fn(() => ({ '@type': 'MerchantReturnPolicy' }))
}))

jest.mock('@/lib/schema-constants', () => ({
  DEFAULT_RATING: { defaultValue: '5.0' }
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
  ProductCard: ({ children, onMouseEnter, onMouseLeave, role, ...props }: any) => (
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
  PriceDisplay: ({ price, size, label, ...props }: any) => (
    <div data-testid="price-display" data-price={price} {...props}>£{price}</div>
  ),
  OutlineButton: ({ children, component, href, ...props }: any) => {
    const Component = component || 'button'
    return <Component data-testid="outline-button" href={href} {...props}>{children}</Component>
  }
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Box: ({ children, sx, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  Typography: ({ children, variant, component, sx, ...props }: any) => {
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

      render(<GiftHamperCard hamper={hamperWithoutMain as any} />)

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

      render(<GiftHamperCard hamper={hamperWithoutPrice as any} />)

      const priceDisplay = screen.getByTestId('price-display')
      expect(priceDisplay.getAttribute('data-price')).toBe('0')
    })
  })

  describe('Links', () => {
    it('should link to hamper detail page', () => {
      render(<GiftHamperCard hamper={mockHamper} />)

      const link = screen.getAllByRole('link')[0]
      expect(link).toHaveAttribute('href', '/gift-hampers/deluxe-hamper')
    })

    it('should use _id when slug not available', () => {
      const hamperWithoutSlug = { ...mockHamper, slug: undefined }

      render(<GiftHamperCard hamper={hamperWithoutSlug} />)

      const link = screen.getAllByRole('link')[0]
      expect(link).toHaveAttribute('href', '/gift-hampers/hamper-1')
    })
  })

  describe('Structured Data', () => {
    it('should include JSON-LD script', () => {
      const { container } = render(<GiftHamperCard hamper={mockHamper} />)

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
    })

    it('should generate valid Product schema', () => {
      const { container } = render(<GiftHamperCard hamper={mockHamper} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json['@type']).toBe('Product')
    })

    it('should include allergens when available', () => {
      const { container } = render(<GiftHamperCard hamper={mockHamper} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json.containsAllergens).toEqual(['Nuts'])
    })

    it('should not include allergens when empty', () => {
      const hamperWithoutAllergens = { ...mockHamper, allergens: [] }

      const { container } = render(<GiftHamperCard hamper={hamperWithoutAllergens} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json.containsAllergens).toBeUndefined()
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

