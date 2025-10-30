/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import HomePage, { generateMetadata } from '../page'
import type { ReactNode } from 'react'

// Type definitions for test mocks
interface AnimatedComponentProps {
  children?: ReactNode
  [key: string]: unknown
}

interface LinkProps {
  children: ReactNode
  href: string
  [key: string]: unknown
}

interface ImageProps {
  alt?: string
  src?: string
  [key: string]: unknown
}

interface MUIComponentProps {
  children?: ReactNode
  component?: string | React.ComponentType<unknown>
  href?: string
  label?: string
  value?: number
  itemProp?: string
  [key: string]: unknown
}

// Mock all dependencies
jest.mock('../utils/fetchCakes', () => ({
  getFeaturedCakes: jest.fn(() => Promise.resolve([]))
}))

jest.mock('../utils/fetchGiftHampers', () => ({
  getFeaturedGiftHampers: jest.fn(() => Promise.resolve([]))
}))

jest.mock('../utils/fetchTestimonials', () => ({
  getFeaturedTestimonials: jest.fn(() => Promise.resolve([])),
  getAllTestimonialsStats: jest.fn(() => Promise.resolve({ count: 127, averageRating: 5.0 }))
}))

jest.mock('../utils/fetchMarketSchedule', () => ({
  getMarketSchedule: jest.fn(() => Promise.resolve([]))
}))

jest.mock('../utils/seo', () => ({
  getPriceValidUntil: jest.fn(() => '2026-01-01'),
  getOfferShippingDetails: jest.fn(() => ({ '@type': 'OfferShippingDetails' })),
  generateEventSEOMetadata: jest.fn(() => ({ additionalKeywords: [], totalUpcomingEvents: 0 }))
}))

jest.mock('../utils/generateEventStructuredData', () => ({
  generateEventSEOMetadata: jest.fn(() => ({ additionalKeywords: [], totalUpcomingEvents: 0 }))
}))

// Mock components
jest.mock('../components/AnimatedSection', () => ({
  AnimatedSection: ({ children, ...props }: AnimatedComponentProps) => <section {...props}>{children}</section>,
  AnimatedDiv: ({ children, ...props }: AnimatedComponentProps) => <div {...props}>{children}</div>
}))

jest.mock('../components/MarketSchedule', () => ({
  __esModule: true,
  default: () => <div data-testid="market-schedule">Market Schedule</div>
}))

// Mock Next.js components
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: LinkProps) => <a href={href} {...props}>{children}</a>
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: ImageProps) => <img alt={alt} src={src} data-testid="next-image" {...props} />
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Avatar: ({ children, ...props }: MUIComponentProps) => <div data-testid="avatar" {...props}>{children}</div>,
  Box: ({ children, ...props }: MUIComponentProps) => <div {...props}>{children}</div>,
  Button: ({ children, component, href, ...props }: MUIComponentProps) => {
    const Component = component || 'button'
    return <Component href={href} {...props}>{children}</Component>
  },
  Card: ({ children, ...props }: MUIComponentProps) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: MUIComponentProps) => <div {...props}>{children}</div>,
  Chip: ({ label, ...props }: MUIComponentProps) => <span {...props}>{label}</span>,
  Container: ({ children, ...props }: MUIComponentProps) => <div {...props}>{children}</div>,
  Grid: ({ children, ...props }: MUIComponentProps) => <div {...props}>{children}</div>,
  Rating: ({ value, ...props }: MUIComponentProps) => <div data-testid="rating" data-value={value} {...props}></div>,
  Stack: ({ children, ...props }: MUIComponentProps) => <div {...props}>{children}</div>,
  Typography: ({ children, component, ...props }: MUIComponentProps) => {
    const Tag = component || 'div'
    // Remove itemProp if it's not a valid HTML attribute
    const { itemProp, ...validProps } = props
    return <Tag {...validProps}>{children}</Tag>
  },
  ArrowForwardIcon: () => <span>→</span>,
  CakeOutlinedIcon: () => <span>🎂</span>,
  CelebrationIcon: () => <span>🎉</span>,
  CheckCircleIcon: () => <span>✓</span>,
  FavoriteIcon: () => <span>❤️</span>,
  LocalShippingIcon: () => <span>🚚</span>,
  VerifiedIcon: () => <span>✓</span>,
  StarIcon: () => <span>⭐</span>,
  LocationOnIcon: () => <span>📍</span>,
  PhoneIcon: () => <span>📞</span>,
  EmailIcon: () => <span>📧</span>
}))

// Mock design system
jest.mock('@/lib/design-system', () => ({
  colors: { 
    primary: { main: '#2E3192', dark: '#1F2368', contrast: '#FFF' }, 
    secondary: { main: '#FDB913', dark: '#C9C200' },
    success: { main: '#1D8348' },
    text: { primary: '#000', secondary: '#666' },
    background: { default: '#FFF8E7', paper: '#FFF', subtle: '#FFF5E6' },
    border: { light: '#E0E0E0' }
  },
  spacing: { sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
  typography: {
    fontWeight: { bold: 700, semibold: 600, medium: 500 },
    fontSize: { base: '1rem', lg: '1.125rem', sm: '0.875rem' },
    lineHeight: { relaxed: 1.75 },
    fontFamily: { primary: 'Inter', display: 'Playfair Display' }
  },
  borderRadius: { md: '0.375rem', lg: '0.5rem' },
  shadows: { base: '0 1px 3px rgba(0,0,0,0.1)' },
  designTokens: {
    colors: { 
      primary: { main: '#2E3192', dark: '#1F2368', contrast: '#FFF' }, 
      secondary: { main: '#FDB913', dark: '#C9C200' },
      success: { main: '#1D8348' },
      text: { primary: '#000', secondary: '#666' },
      background: { default: '#FFF8E7', paper: '#FFF', subtle: '#FFF5E6' },
      border: { light: '#E0E0E0' }
    },
    spacing: { sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
    typography: {
      fontWeight: { bold: 700, semibold: 600, medium: 500 },
      fontSize: { base: '1rem', lg: '1.125rem', sm: '0.875rem' },
      lineHeight: { relaxed: 1.75 }
    },
    borderRadius: { md: '0.375rem', lg: '0.5rem' },
    shadows: { base: '0 1px 3px rgba(0,0,0,0.1)' }
  }
}))

// Mock constants
jest.mock('@/lib/constants', () => ({
  BUSINESS_CONSTANTS: {
    businessName: 'Olgish Cakes',
    phone: '07123456789',
    email: 'info@olgishcakes.co.uk'
  }
}))

// Mock structured data defaults
jest.mock('@/lib/structured-data-defaults', () => ({
  DEFAULT_REVIEWS: [],
  DEFAULT_AGGREGATE_RATING: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    reviewCount: '127'
  }
}))

describe('HomePage', () => {
  describe('Metadata Generation', () => {
    it('should generate metadata', async () => {
      const metadata = await generateMetadata()

      expect(metadata).toBeDefined()
      expect(metadata.title).toBeDefined()
      expect(metadata.description).toBeDefined()
    })

    it('should include OpenGraph data', async () => {
      const metadata = await generateMetadata()

      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.title).toBeDefined()
      expect(metadata.openGraph?.description).toBeDefined()
    })

    it('should include Twitter card data', async () => {
      const metadata = await generateMetadata()

      expect(metadata.twitter).toBeDefined()
    })

    it('should include keywords', async () => {
      const metadata = await generateMetadata()

      expect(metadata.keywords).toBeDefined()
    })

    it('should include canonical URL', async () => {
      const metadata = await generateMetadata()

      expect(metadata.alternates?.canonical).toBeDefined()
    })
  })

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      const page = await HomePage()

      expect(() => render(page)).not.toThrow()
    })

    it('should include structured data scripts', async () => {
      const page = await HomePage()
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBeGreaterThan(0)
    })

    it('should render Areas We Serve section with location links', async () => {
      const page = await HomePage()
      const { container } = render(page)

      const areasSection = container.textContent || ''
      expect(areasSection).toMatch(/Areas We Serve|areas we serve/i)

      // Check for location page links
      const links = container.querySelectorAll('a[href]')
      const locationLinks = Array.from(links).filter(link => {
        const href = link.getAttribute('href') || ''
        return href.includes('/cakes-leeds') || 
               href.includes('/cakes-wakefield') || 
               href.includes('/cakes-bradford') || 
               href.includes('/cakes-huddersfield')
      })

      expect(locationLinks.length).toBeGreaterThan(0)
    })

    it('should have link to delivery areas page', async () => {
      const page = await HomePage()
      const { container } = render(page)
      const links = container.querySelectorAll('a[href="/delivery-areas"]')
      expect(links.length).toBeGreaterThan(0)
    })
  })

  describe('Data Fetching', () => {
    it('should fetch featured cakes', async () => {
      const { getFeaturedCakes } = require('../utils/fetchCakes')

      await HomePage()

      expect(getFeaturedCakes).toHaveBeenCalled()
    })

    it('should fetch featured gift hampers', async () => {
      const { getFeaturedGiftHampers } = require('../utils/fetchGiftHampers')

      await HomePage()

      expect(getFeaturedGiftHampers).toHaveBeenCalled()
    })

    it('should fetch testimonials', async () => {
      const { getFeaturedTestimonials, getAllTestimonialsStats } = require('../utils/fetchTestimonials')

      await HomePage()

      expect(getFeaturedTestimonials).toHaveBeenCalled()
      expect(getAllTestimonialsStats).toHaveBeenCalled()
    })

    it('should fetch market schedule', async () => {
      const { getMarketSchedule } = require('../utils/fetchMarketSchedule')

      await HomePage()

      expect(getMarketSchedule).toHaveBeenCalled()
    })
  })
})

