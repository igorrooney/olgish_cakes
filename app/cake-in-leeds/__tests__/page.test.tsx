/**
 * @jest-environment jsdom
 */

import { Metadata } from 'next'

// Mock all dependencies before importing
jest.mock('@mui/material', () => ({
  Container: jest.fn(({ children }) => children),
  Typography: jest.fn(({ children }) => children),
  Box: jest.fn(({ children }) => children),
  Grid: jest.fn(({ children }) => children),
  Paper: jest.fn(({ children }) => children),
  Button: jest.fn(({ children }) => children),
  Chip: jest.fn(({ label }) => label),
  Card: jest.fn(({ children }) => children),
  CardContent: jest.fn(({ children }) => children)
}))

jest.mock('next/link', () => {
  return jest.fn(({ children }) => children)
})

jest.mock('../../components/Breadcrumbs', () => ({
  Breadcrumbs: jest.fn(() => null)
}))

jest.mock('@/lib/mui-optimization', () => ({
  ArrowForwardIcon: jest.fn(() => null),
  CheckCircleIcon: jest.fn(() => null),
  LocalShippingIcon: jest.fn(() => null),
  CakeOutlinedIcon: jest.fn(() => null),
  StarIcon: jest.fn(() => null)
}))

describe('CakeInLeedsPage', () => {
  let metadata: Metadata
  let CakeInLeedsPage: () => JSX.Element

  beforeAll(async () => {
    const module = await import('../page')
    metadata = module.metadata
    CakeInLeedsPage = module.default
  })

  describe('Metadata Structure', () => {
    it('should have correct title', () => {
      expect(metadata.title).toBe('Cake in Leeds | Best Ukrainian Bakery Leeds Yorkshire')
    })

    it('should have correct description', () => {
      const description = metadata.description as string
      expect(description).toContain('cake in Leeds')
      expect(description).toContain('Ukrainian cakes')
      expect(description).toContain('same-day delivery')
    })

    it('should have correct keywords', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('cake in leeds')
      expect(keywords).toContain('cakes leeds')
      expect(keywords).toContain('leeds bakery')
      expect(keywords).toContain('ukrainian bakery leeds')
    })

    it('should have Open Graph metadata', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph.url).toBe('https://olgishcakes.co.uk/cake-in-leeds')
      expect(metadata.openGraph.type).toBe('website')
    })

    it('should have Twitter metadata', () => {
      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter.card).toBe('summary_large_image')
    })

    it('should have geo metadata', () => {
      expect(metadata.other).toBeDefined()
      expect(metadata.other['geo.region']).toBe('GB-ENG')
      expect(metadata.other['geo.placename']).toBe('Leeds')
      expect(metadata.other['geo.position']).toContain('53.8008')
    })

    it('should have canonical URL', () => {
      expect(metadata.alternates.canonical).toBe('https://olgishcakes.co.uk/cake-in-leeds')
    })

    it('should have proper authors', () => {
      expect(metadata.authors).toBeDefined()
      expect(Array.isArray(metadata.authors)).toBe(true)
    })

    it('should have creator and publisher', () => {
      expect(metadata.creator).toBe('Olgish Cakes')
      expect(metadata.publisher).toBe('Olgish Cakes')
    })

    it('should have robots configuration', () => {
      expect(metadata.robots).toBeDefined()
      expect(metadata.robots.index).toBe(true)
      expect(metadata.robots.follow).toBe(true)
    })
  })

  describe('SEO Compliance', () => {
    it('should have meta description within acceptable length', () => {
      const description = metadata.description as string
      expect(description.length).toBeGreaterThanOrEqual(135)
      expect(description.length).toBeLessThanOrEqual(165)
    })

    it('should have title within acceptable length', () => {
      const title = metadata.title as string
      expect(title.length).toBeGreaterThanOrEqual(40)
      expect(title.length).toBeLessThanOrEqual(70)
    })

    it('should have keywords targeting cake in Leeds', () => {
      const keywords = metadata.keywords as string
      expect(keywords.toLowerCase()).toContain('cake in leeds')
      expect(keywords.toLowerCase()).toContain('leeds bakery')
    })

    it('should have Open Graph images with proper dimensions', () => {
      expect(metadata.openGraph.images).toBeDefined()
      expect(metadata.openGraph.images.length).toBeGreaterThan(0)
      expect(metadata.openGraph.images[0].width).toBe(1200)
      expect(metadata.openGraph.images[0].height).toBe(630)
    })

    it('should have proper locale', () => {
      expect(metadata.openGraph.locale).toBe('en_GB')
    })

    it('should have siteName', () => {
      expect(metadata.openGraph.siteName).toBe('Olgish Cakes')
    })
  })

  describe('Local SEO', () => {
    it('should include Leeds location in metadata', () => {
      expect(metadata.other['geo.placename']).toBe('Leeds')
      expect(metadata.other['geo.position']).toContain('53.8008')
      expect(metadata.other.ICBM).toContain('53.8008')
    })

    it('should have Leeds-specific keywords', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('cake in leeds')
      expect(keywords).toContain('birthday cake leeds')
      expect(keywords).toContain('wedding cake leeds')
    })

    it('should have Leeds in description', () => {
      const description = metadata.description as string
      expect(description.toLowerCase()).toContain('leeds')
    })

    it('should have Leeds coordinates', () => {
      expect(metadata.other['geo.position']).toBe('53.8008;-1.5491')
      expect(metadata.other.ICBM).toBe('53.8008, -1.5491')
    })
  })

  describe('Content Requirements', () => {
    it('should have keywords for SEO', () => {
      expect(metadata.keywords).toBeDefined()
      expect(typeof metadata.keywords).toBe('string')
      expect((metadata.keywords as string).length).toBeGreaterThan(50)
    })

    it('should have metadataBase set', () => {
      expect(metadata.metadataBase).toBeDefined()
      expect(metadata.metadataBase.toString()).toContain('olgishcakes.co.uk')
    })

    it('should have formatDetection disabled', () => {
      expect(metadata.formatDetection).toBeDefined()
      expect(metadata.formatDetection.email).toBe(false)
      expect(metadata.formatDetection.address).toBe(false)
      expect(metadata.formatDetection.telephone).toBe(false)
    })

    it('should have googleBot configuration', () => {
      expect(metadata.robots.googleBot).toBeDefined()
      expect(metadata.robots.googleBot['max-image-preview']).toBe('large')
      expect(metadata.robots.googleBot['max-snippet']).toBe(-1)
    })
  })

  describe('Images and Media', () => {
    it('should have Open Graph images', () => {
      expect(metadata.openGraph.images).toBeDefined()
      expect(metadata.openGraph.images[0].url).toContain('olgishcakes.co.uk')
      expect(metadata.openGraph.images[0].url).toContain('cakes-leeds-delivery.jpg')
    })

    it('should have Twitter images', () => {
      expect(metadata.twitter.images).toBeDefined()
      expect(metadata.twitter.images[0]).toContain('olgishcakes.co.uk')
      expect(metadata.twitter.images[0]).toContain('cakes-leeds-delivery.jpg')
    })

    it('should have proper image alt text', () => {
      expect(metadata.openGraph.images[0].alt).toContain('Leeds')
      expect(metadata.openGraph.images[0].alt).toContain('Ukrainian')
    })

    it('should have correct image type', () => {
      expect(metadata.openGraph.images[0].type).toBe('image/jpeg')
    })
  })

  describe('Component Rendering', () => {
    it('should render without errors', () => {
      expect(() => CakeInLeedsPage()).not.toThrow()
    })

    it('should return JSX element', () => {
      const result = CakeInLeedsPage()
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })
  })
})
