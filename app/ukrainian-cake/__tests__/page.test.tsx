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
  Chip: jest.fn(({ label }) => label)
}))

jest.mock('next/link', () => {
  return jest.fn(({ children }) => children)
})

jest.mock('../../components/Breadcrumbs', () => ({
  Breadcrumbs: jest.fn(() => null)
}))

jest.mock('@/lib/mui-optimization', () => ({
  ArrowForwardIcon: jest.fn(() => null),
  CakeOutlinedIcon: jest.fn(() => null),
  CheckCircleIcon: jest.fn(() => null),
  VerifiedIcon: jest.fn(() => null),
  LocalOfferIcon: jest.fn(() => null),
  SchoolIcon: jest.fn(() => null),
  FavoriteIcon: jest.fn(() => null)
}))

describe('UkrainianCakePage', () => {
  // Import after mocking
  let metadata: Metadata
  let UkrainianCakePage: () => JSX.Element

  beforeAll(async () => {
    const module = await import('../page')
    metadata = module.metadata
    UkrainianCakePage = module.default
  })

  describe('Metadata Structure', () => {
    it('should have correct title', () => {
      expect(metadata.title).toBe('Ukrainian Cake | Authentic Traditional Cakes Leeds')
    })

    it('should have correct description', () => {
      const description = metadata.description as string
      expect(description).toContain('authentic Ukrainian cakes')
      expect(description).toContain('Leeds')
      expect(description).toContain('Traditional Medovik')
    })

    it('should have correct keywords', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('ukrainian cake')
      expect(keywords).toContain('traditional ukrainian cake')
      expect(keywords).toContain('medovik')
      expect(keywords).toContain('kyiv cake')
      expect(keywords).toContain('ukrainian desserts')
    })

    it('should have Open Graph metadata', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph.title).toBe('Ukrainian Cake | Authentic Traditional Cakes Leeds')
      expect(metadata.openGraph.url).toBe('https://olgishcakes.co.uk/ukrainian-cake')
      expect(metadata.openGraph.type).toBe('article')
    })

    it('should have Twitter metadata', () => {
      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter.card).toBe('summary_large_image')
      expect(metadata.twitter.title).toBe('Ukrainian Cake | Authentic Traditional Cakes Leeds')
    })

    it('should have canonical URL', () => {
      expect(metadata.alternates.canonical).toBe('https://olgishcakes.co.uk/ukrainian-cake')
    })

    it('should have proper authors', () => {
      expect(metadata.authors).toBeDefined()
      expect(Array.isArray(metadata.authors)).toBe(true)
      expect(metadata.authors[0].name).toBe('Olgish Cakes')
    })

    it('should have creator and publisher', () => {
      expect(metadata.creator).toBe('Olgish Cakes')
      expect(metadata.publisher).toBe('Olgish Cakes')
    })

    it('should have robots configuration', () => {
      expect(metadata.robots).toBeDefined()
      expect(metadata.robots.index).toBe(true)
      expect(metadata.robots.follow).toBe(true)
      expect(metadata.robots.googleBot).toBeDefined()
      expect(metadata.robots.googleBot.index).toBe(true)
      expect(metadata.robots.googleBot.follow).toBe(true)
    })

    it('should have geo metadata', () => {
      expect(metadata.other).toBeDefined()
      expect(metadata.other['geo.region']).toBe('GB-ENG')
      expect(metadata.other['geo.placename']).toBe('Leeds')
    })
  })

  describe('SEO Compliance', () => {
    it('should have meta description within 145-165 characters', () => {
      const description = metadata.description as string
      expect(description.length).toBeGreaterThanOrEqual(145)
      expect(description.length).toBeLessThanOrEqual(165)
    })

    it('should have title within 48-62 characters', () => {
      const title = metadata.title as string
      expect(title.length).toBeGreaterThanOrEqual(48)
      expect(title.length).toBeLessThanOrEqual(62)
    })

    it('should have keywords targeting ukrainian cake', () => {
      const keywords = metadata.keywords as string
      expect(keywords.toLowerCase()).toContain('ukrainian cake')
      expect(keywords.toLowerCase()).toContain('traditional')
      expect(keywords.toLowerCase()).toContain('medovik')
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

    it('should have googleBot max-image-preview set to large', () => {
      expect(metadata.robots.googleBot['max-image-preview']).toBe('large')
    })

    it('should have googleBot max-snippet set to -1', () => {
      expect(metadata.robots.googleBot['max-snippet']).toBe(-1)
    })
  })

  describe('Open Graph Properties', () => {
    it('should have correct image type', () => {
      expect(metadata.openGraph.images[0].type).toBe('image/jpeg')
    })

    it('should have descriptive image alt text', () => {
      const alt = metadata.openGraph.images[0].alt
      expect(alt).toContain('Ukrainian Cakes')
      expect(alt).toContain('Medovik')
    })

    it('should have Twitter images', () => {
      expect(metadata.twitter.images).toBeDefined()
      expect(metadata.twitter.images[0]).toContain('ukrainian-cakes-collection.jpg')
    })
  })

  describe('Component Rendering', () => {
    it('should render without errors', () => {
      expect(() => UkrainianCakePage()).not.toThrow()
    })

    it('should return JSX element', () => {
      const result = UkrainianCakePage()
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })
  })
})
