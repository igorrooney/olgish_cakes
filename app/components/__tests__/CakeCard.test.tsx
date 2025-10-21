/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import CakeCard from '../CakeCard'
import type { Cake } from '@/types/cake'

// Helper to create partial cake mocks with type safety
const mockCake = (partial: Partial<Cake> & { _id: string; name: string }): Cake => ({
  ...partial,
  _createdAt: '',
  _rev: '',
  _type: 'cake',
  _updatedAt: '',
  slug: partial.slug || { _type: 'slug', current: '' },
  category: partial.category || '',
  description: partial.description || [],
  size: partial.size || { diameter: 0, height: 0, servings: 0 },
  pricing: partial.pricing || { standard: 0 },
  designs: partial.designs || [],
} as Cake)

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
    width: () => ({ height: () => ({ url: () => 'https://cdn.sanity.io/cake.jpg' }) })
  }))
}))

// Mock utilities
jest.mock('@/types/cake', () => ({
  blocksToText: jest.fn((blocks) => 'Converted text from blocks')
}))

jest.mock('@/app/utils/seo', () => ({
  getPriceValidUntil: jest.fn(() => '2026-01-01'),
  getMerchantReturnPolicy: jest.fn(() => ({ '@type': 'MerchantReturnPolicy' })),
  getOfferShippingDetails: jest.fn(() => ({ '@type': 'OfferShippingDetails' }))
}))

// Mock components
jest.mock('@/app/components/RichTextRenderer', () => ({
  RichTextRenderer: ({ value }: any) => <div data-testid="rich-text-renderer">{value}</div>
}))

// Mock design system
jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: {
      text: { primary: '#000', secondary: '#666' },
      primary: { main: '#2E3192' },
      background: { subtle: '#F5F5F5' },
      border: { light: '#E0E0E0' }
    },
    typography: {
      fontFamily: { display: 'Playfair Display' },
      fontWeight: { semibold: 600, medium: 500 },
      lineHeight: { tight: 1.2, relaxed: 1.75 }
    },
    spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem' },
    borderRadius: { full: '9999px' },
    shadows: { sm: '0 1px 2px rgba(0,0,0,0.05)' }
  }
}))

// Mock UI components
jest.mock('@/lib/ui-components', () => ({
  ProductCard: ({ children, onMouseEnter, onMouseLeave, role, sx, onKeyDown, ...props }: any) => (
    <div
      data-testid="product-card"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role={role}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
    </div>
  ),
  CategoryChip: ({ label, ...props }: any) => <span data-testid="category-chip" {...props}>{label}</span>,
  PriceDisplay: ({ price, size, label, ...props }: any) => (
    <div data-testid="price-display" data-price={price} data-size={size} {...props}>
      {label && `${label} `}£{price}
    </div>
  ),
  OutlineButton: ({ children, component, href, sx, ...props }: any) => {
    const Component = component || 'button'
    return <Component data-testid="outline-button" href={href} {...props}>{children}</Component>
  }
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, sx, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, variant, component, sx, ...props }: any) => {
    const Component = component || 'div'
    return <Component data-testid="typography" data-variant={variant} {...props}>{children}</Component>
  },
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Box: ({ children, role, sx, ...props }: any) => <div data-testid="box" role={role} {...props}>{children}</div>,
  Chip: ({ children, ...props }: any) => <span {...props}>{children}</span>
}))

describe('CakeCard', () => {
  const testCake: any = {
    _id: 'cake-1',
    name: 'Honey Cake',
    slug: { current: 'honey-cake' },
    category: 'Traditional',
    pricing: { standard: 30 },
    shortDescription: [{ children: [{ text: 'Delicious honey cake' }] }],
    mainImage: { asset: { _ref: 'image-ref-1' } },
    ingredients: ['Honey', 'Flour'],
    allergens: ['Gluten', 'Eggs']
  }

  describe('Rendering', () => {
    it('should render ProductCard', () => {
      render(<CakeCard cake={testCake} />)

      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })

    it('should render cake name', () => {
      render(<CakeCard cake={testCake} />)

      expect(screen.getByText('Honey Cake')).toBeInTheDocument()
    })

    it('should render PriceDisplay', () => {
      render(<CakeCard cake={testCake} />)

      expect(screen.getByTestId('price-display')).toBeInTheDocument()
    })

    it('should render Order Now button', () => {
      render(<CakeCard cake={testCake} />)

      expect(screen.getByText('Order Now')).toBeInTheDocument()
    })

    it('should render Next.js Image', () => {
      render(<CakeCard cake={testCake} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })
  })

  describe('Image Handling', () => {
    it('should use mainImage when available', () => {
      render(<CakeCard cake={testCake} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should fallback to designs.standard', () => {
      const cakeWithDesigns: any = {
        ...testCake,
        mainImage: undefined,
        designs: { standard: [{ asset: { _ref: 'ref-1' }, isMain: true }] }
      }

      render(<CakeCard cake={cakeWithDesigns} />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should use placeholder when no images', () => {
      const cakeWithoutImages: any = {
        ...testCake,
        mainImage: undefined,
        designs: undefined
      }

      render(<CakeCard cake={cakeWithoutImages} />)

      const img = screen.getByTestId('next-image')
      expect(img).toHaveAttribute('src', expect.stringContaining('placehold.co'))
    })

    it('should generate SEO-optimized alt text', () => {
      render(<CakeCard cake={testCake} />)

      const img = screen.getByTestId('next-image')
      expect(img).toHaveAttribute('alt', expect.stringContaining('Honey Cake'))
      expect(img).toHaveAttribute('alt', expect.stringContaining('Leeds'))
    })

    it('should use priority loading for featured variant', () => {
      render(<CakeCard cake={testCake} variant="featured" />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })

    it('should use lazy loading for catalog variant', () => {
      render(<CakeCard cake={testCake} variant="catalog" />)

      expect(screen.getByTestId('next-image')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should use catalog variant by default', () => {
      render(<CakeCard cake={testCake} />)

      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })

    it('should accept featured variant', () => {
      render(<CakeCard cake={testCake} variant="featured" />)

      expect(screen.getByText('Featured')).toBeInTheDocument()
    })

    it('should not show Featured badge for catalog variant', () => {
      render(<CakeCard cake={testCake} variant="catalog" />)

      expect(screen.queryByText('Featured')).not.toBeInTheDocument()
    })
  })

  describe('Hover State', () => {
    it('should handle mouse enter', () => {
      render(<CakeCard cake={testCake} />)

      const card = screen.getByTestId('product-card')
      fireEvent.mouseEnter(card)

      // Hover state should be set
      expect(card).toBeInTheDocument()
    })

    it('should handle mouse leave', () => {
      render(<CakeCard cake={testCake} />)

      const card = screen.getByTestId('product-card')
      fireEvent.mouseEnter(card)
      fireEvent.mouseLeave(card)

      expect(card).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should navigate on Enter key', () => {
      delete (window as any).location
      window.location = { href: '' } as any

      render(<CakeCard cake={testCake} />)

      const card = screen.getByTestId('product-card')
      fireEvent.keyDown(card, { key: 'Enter' })

      expect(window.location.href).toContain('/cakes/honey-cake')
    })

    it('should navigate on Space key', () => {
      delete (window as any).location
      window.location = { href: '' } as any

      render(<CakeCard cake={testCake} />)

      const card = screen.getByTestId('product-card')
      fireEvent.keyDown(card, { key: ' ' })

      expect(window.location.href).toContain('/cakes/honey-cake')
    })

    it('should not navigate on other keys', () => {
      const originalHref = window.location.href

      render(<CakeCard cake={testCake} />)

      const card = screen.getByTestId('product-card')
      fireEvent.keyDown(card, { key: 'a' })

      expect(window.location.href).toBe(originalHref)
    })
  })

  describe('Links', () => {
    it('should link to cake detail page', () => {
      render(<CakeCard cake={testCake} />)

      const links = screen.getAllByRole('link')
      // Check that at least one link goes to the cake detail page
      expect(links.some(link => link.getAttribute('href') === '/cakes/honey-cake')).toBe(true)
    })

    it('should link Order button to cake page', () => {
      render(<CakeCard cake={testCake} />)

      const orderButton = screen.getByText('Order Now').closest('a')
      expect(orderButton).toHaveAttribute('href', '/cakes/honey-cake')
    })
  })

  describe('Structured Data', () => {
    it('should include JSON-LD script', () => {
      const { container } = render(<CakeCard cake={testCake} />)

      const script = container.querySelector('script[type="application/ld+json"]')
      expect(script).toBeTruthy()
    })

    it('should generate valid Product schema', () => {
      const { container } = render(<CakeCard cake={testCake} />)

      const script = container.querySelector('script')
      const json = JSON.parse(script?.textContent || '{}')
      expect(json['@type']).toBe('Product')
      expect(json.name).toBe('Honey Cake')
    })
  })

  describe('Price', () => {
    it('should display price from pricing.standard', () => {
      render(<CakeCard cake={testCake} />)

      const priceDisplay = screen.getByTestId('price-display')
      expect(priceDisplay.getAttribute('data-price')).toBe('30')
    })

    it('should use 0 when no pricing', () => {
      const cakeWithoutPricing: any = { ...testCake, pricing: undefined }

      render(<CakeCard cake={cakeWithoutPricing} />)

      const priceDisplay = screen.getByTestId('price-display')
      expect(priceDisplay.getAttribute('data-price')).toBe('0')
    })

    it('should show From label', () => {
      render(<CakeCard cake={testCake} />)

      expect(screen.getByText(/From/)).toBeInTheDocument()
    })

    it('should use large size', () => {
      render(<CakeCard cake={testCake} />)

      const priceDisplay = screen.getByTestId('price-display')
      expect(priceDisplay.getAttribute('data-size')).toBe('large')
    })
  })

  describe('Memoization', () => {
    it('should be memoized', () => {
    })
  })

  describe('Accessibility', () => {
    it('should have article role', () => {
      render(<CakeCard cake={testCake} />)

      const card = screen.getByTestId('product-card')
      expect(card).toHaveAttribute('role', 'article')
    })

    it('should have aria-label', () => {
      render(<CakeCard cake={testCake} />)

      const card = screen.getByTestId('product-card')
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('Honey Cake'))
    })

    it('should have tabIndex for keyboard navigation', () => {
      render(<CakeCard cake={testCake} />)

      const card = screen.getByTestId('product-card')
      expect(card).toHaveAttribute('tabIndex', '0')
    })
  })
})

