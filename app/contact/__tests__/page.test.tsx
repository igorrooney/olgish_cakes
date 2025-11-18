/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { Product, WithContext } from 'schema-dts'
import { validateProductHasRequiredFields } from '../../../lib/schema-validation'
import ContactPage, { metadata } from '../page'

// Mock components
jest.mock('../../components/ContactForm', () => ({
  ContactForm: () => <div data-testid="contact-form">Contact Form</div>
}))

jest.mock('../../components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>
}))

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, component, ...props }: any) => {
    const Component = component || 'div'
    return <Component {...props}>{children}</Component>
  },
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Stack: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
  Grid: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Paper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Divider: () => <hr />,
  PhoneIcon: () => <span>📞</span>,
  EmailIcon: () => <span>📧</span>,
  InstagramIcon: () => <span>📷</span>,
  FacebookIcon: () => <span>📘</span>,
  WhatsAppIcon: () => <span>💬</span>
}))

// Mock SEO utilities
jest.mock('../../utils/seo', () => ({
  generateProductSchema: jest.fn((product: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${product.url}#product`,
    name: product.name,
    description: product.description,
    image: product.image,
    url: product.url,
    brand: {
      '@type': 'Brand',
      name: 'Olgish Cakes'
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'GBP',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: product.aggregateRating ? {
      '@type': 'AggregateRating',
      ratingValue: product.aggregateRating.ratingValue.toString(),
      reviewCount: product.aggregateRating.reviewCount.toString(),
      bestRating: '5',
      worstRating: '1'
    } : undefined,
    review: [
      {
        '@type': 'Review',
        itemReviewed: { '@id': `${product.url}#product` },
        reviewRating: { '@type': 'Rating', ratingValue: '5' },
        author: { '@type': 'Person', name: 'Sarah M.' },
        reviewBody: `Excellent ${product.name}!`,
        datePublished: '2025-09-30'
      }
    ]
  }))
}))

jest.mock('@/lib/structured-data-defaults', () => ({
  DEFAULT_AGGREGATE_RATING: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '2',
    bestRating: '5',
    worstRating: '1'
  }
}))

describe('ContactPage', () => {
  describe('Metadata', () => {
    it('should have title', () => {
      expect(metadata.title).toContain('Contact')
      expect(metadata.title).toContain('Olgish Cakes')
    })

    it('should have description', () => {
      expect(metadata.description).toBeDefined()
      expect(metadata.description).toContain('touch')
    })

    it('should have OpenGraph data', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.title).toBeDefined()
      expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/contact')
    })

    it('should have Twitter card data', () => {
      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter?.card).toBe('summary_large_image')
    })

    it('should have canonical URL', () => {
      expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/contact')
    })

    it('should have keywords', () => {
      expect(metadata.keywords).toBeDefined()
    })
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      expect(() => render(<ContactPage />)).not.toThrow()
    })

    it('should render ContactForm', () => {
      render(<ContactPage />)

      expect(screen.getByTestId('contact-form')).toBeInTheDocument()
    })

    it('should render Breadcrumbs', () => {
      render(<ContactPage />)

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })
  })

  describe('Product Structured Data - Google Search Console Compliance', () => {
    it('should have Product schemas for Custom Wedding Cakes and Ukrainian Honey Cake', () => {
      const { container } = render(<ContactPage />)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      
      const productSchemas: WithContext<Product>[] = []
      
      scripts.forEach((script) => {
        if (script.textContent) {
          try {
            const data = JSON.parse(script.textContent)
            if (data['@type'] === 'Product') {
              productSchemas.push(data)
            }
          } catch (e) {
            // Ignore non-JSON scripts
          }
        }
      })

      expect(productSchemas.length).toBeGreaterThanOrEqual(2)
      
      const customWeddingCakes = productSchemas.find(s => s.name === 'Custom Wedding Cakes')
      const ukrainianHoneyCake = productSchemas.find(s => s.name === 'Ukrainian Honey Cake')
      
      expect(customWeddingCakes).toBeDefined()
      expect(ukrainianHoneyCake).toBeDefined()
    })

    it('should have Custom Wedding Cakes Product schema with required fields', () => {
      const { container } = render(<ContactPage />)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      
      let customWeddingCakesSchema: WithContext<Product> | null = null
      
      scripts.forEach((script) => {
        if (script.textContent) {
          try {
            const data = JSON.parse(script.textContent)
            if (data['@type'] === 'Product' && data.name === 'Custom Wedding Cakes') {
              customWeddingCakesSchema = data
            }
          } catch (e) {
            // Ignore non-JSON scripts
          }
        }
      })

      expect(customWeddingCakesSchema).toBeDefined()
      if (customWeddingCakesSchema) {
        const validation = validateProductHasRequiredFields(customWeddingCakesSchema)
        expect(validation.isValid).toBe(true)
        expect(validation.errors).toHaveLength(0)
        
        // Verify it has at least one required field
        const hasOffers = customWeddingCakesSchema.offers !== undefined && customWeddingCakesSchema.offers !== null
        const hasReview = customWeddingCakesSchema.review !== undefined && customWeddingCakesSchema.review !== null
        const hasAggregateRating = customWeddingCakesSchema.aggregateRating !== undefined && customWeddingCakesSchema.aggregateRating !== null
        
        expect(hasOffers || hasReview || hasAggregateRating).toBe(true)
        
        // Verify specific fields
        expect(hasOffers).toBe(true)
        expect(hasReview).toBe(true)
        expect(hasAggregateRating).toBe(true)
      }
    })

    it('should have Ukrainian Honey Cake Product schema with required fields', () => {
      const { container } = render(<ContactPage />)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      
      let ukrainianHoneyCakeSchema: WithContext<Product> | null = null
      
      scripts.forEach((script) => {
        if (script.textContent) {
          try {
            const data = JSON.parse(script.textContent)
            if (data['@type'] === 'Product' && data.name === 'Ukrainian Honey Cake') {
              ukrainianHoneyCakeSchema = data
            }
          } catch (e) {
            // Ignore non-JSON scripts
          }
        }
      })

      expect(ukrainianHoneyCakeSchema).toBeDefined()
      if (ukrainianHoneyCakeSchema) {
        const validation = validateProductHasRequiredFields(ukrainianHoneyCakeSchema)
        expect(validation.isValid).toBe(true)
        expect(validation.errors).toHaveLength(0)
        
        // Verify it has at least one required field
        const hasOffers = ukrainianHoneyCakeSchema.offers !== undefined && ukrainianHoneyCakeSchema.offers !== null
        const hasReview = ukrainianHoneyCakeSchema.review !== undefined && ukrainianHoneyCakeSchema.review !== null
        const hasAggregateRating = ukrainianHoneyCakeSchema.aggregateRating !== undefined && ukrainianHoneyCakeSchema.aggregateRating !== null
        
        expect(hasOffers || hasReview || hasAggregateRating).toBe(true)
        
        // Verify specific fields
        expect(hasOffers).toBe(true)
        expect(hasReview).toBe(true)
        expect(hasAggregateRating).toBe(true)
      }
    })

    it('should reject Product schemas without offers, review, or aggregateRating', () => {
      const invalidSchema: WithContext<Product> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Test Product',
        description: 'Test description',
        image: 'https://example.com/image.jpg'
        // Missing offers, review, and aggregateRating
      }

      const validation = validateProductHasRequiredFields(invalidSchema)
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain(
        'Product schema must have at least one of: offers, review, or aggregateRating (Google Search Console requirement)'
      )
    })
  })
})

