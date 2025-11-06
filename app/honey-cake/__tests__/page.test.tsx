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
  Accordion: jest.fn(({ children }) => children),
  AccordionSummary: jest.fn(({ children }) => children),
  AccordionDetails: jest.fn(({ children }) => children)
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
  ExpandMoreIcon: jest.fn(() => null)
}))

describe('HoneyCakePage - Metadata', () => {
  let metadata: Metadata

  beforeAll(async () => {
    const module = await import('../page')
    metadata = module.metadata
  })

  describe('Metadata Structure', () => {
    it('should have correct title', () => {
      expect(metadata.title).toBe('Honey Cake | Authentic Ukrainian Medovik Leeds')
    })

    it('should have correct description', () => {
      const description = metadata.description as string
      expect(description).toContain('honey cake')
      expect(description).toContain('Medovik')
      expect(description).toContain('Leeds')
      expect(description).toContain('Traditional Ukrainian')
    })

    it('should have correct keywords', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('honey cake')
      expect(keywords).toContain('medovik')
      expect(keywords).toContain('honey cake near me')
      expect(keywords).toContain('buy honey cake')
      expect(keywords).toContain('traditional honey cake')
    })

    it('should have Open Graph metadata', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph.url).toBe('https://olgishcakes.co.uk/honey-cake')
      expect(metadata.openGraph.type).toBe('article')
    })

    it('should have Twitter metadata', () => {
      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter.card).toBe('summary_large_image')
    })

    it('should have canonical URL', () => {
      expect(metadata.alternates.canonical).toBe('https://olgishcakes.co.uk/honey-cake')
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
    })

    it('should have geo metadata', () => {
      expect(metadata.other).toBeDefined()
      expect(metadata.other['geo.region']).toBe('GB-ENG')
      expect(metadata.other['geo.placename']).toBe('Leeds')
    })
  })

  describe('SEO Compliance', () => {
    it('should have meta description within acceptable length', () => {
      const description = metadata.description as string
      expect(description.length).toBeGreaterThanOrEqual(140)
      expect(description.length).toBeLessThanOrEqual(165)
    })

    it('should have title within acceptable length', () => {
      const title = metadata.title as string
      expect(title.length).toBeGreaterThanOrEqual(45)
      expect(title.length).toBeLessThanOrEqual(65)
    })

    it('should have keywords targeting honey cake', () => {
      const keywords = metadata.keywords as string
      expect(keywords.toLowerCase()).toContain('honey cake')
      expect(keywords.toLowerCase()).toContain('medovik')
      expect(keywords.toLowerCase()).toContain('near me')
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

    it('should have googleBot configuration', () => {
      expect(metadata.robots.googleBot).toBeDefined()
      expect(metadata.robots.googleBot.index).toBe(true)
      expect(metadata.robots.googleBot.follow).toBe(true)
      expect(metadata.robots.googleBot['max-image-preview']).toBe('large')
    })
  })

  describe('Keyword Targeting', () => {
    it('should target primary keyword "honey cake"', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('honey cake')
    })

    it('should target "medovik" keyword', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('medovik')
    })

    it('should target "buy honey cake" keyword', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('buy honey cake')
    })

    it('should target "honey cake near me" keyword', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('honey cake near me')
    })

    it('should target "traditional honey cake" keyword', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('traditional honey cake')
    })

    it('should target "honey cake leeds" keyword', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('honey cake leeds')
    })

    it('should target "ukrainian honey cake" keyword', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('ukrainian honey cake')
    })

    it('should target "order medovik" keyword', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('medovik')
    })
  })

  describe('Images and Media', () => {
    it('should have Open Graph images', () => {
      expect(metadata.openGraph.images).toBeDefined()
      expect(metadata.openGraph.images[0].url).toContain('olgishcakes.co.uk')
      expect(metadata.openGraph.images[0].url).toContain('honey-cake')
    })

    it('should have Twitter images', () => {
      expect(metadata.twitter.images).toBeDefined()
      expect(metadata.twitter.images[0]).toContain('olgishcakes.co.uk')
    })

    it('should have proper image alt text', () => {
      expect(metadata.openGraph.images[0].alt).toContain('Medovik')
      expect(metadata.openGraph.images[0].alt).toContain('Ukrainian')
    })

    it('should have correct image type', () => {
      expect(metadata.openGraph.images[0].type).toBe('image/jpeg')
    })
  })

  describe('Local SEO', () => {
    it('should have Leeds in geo metadata', () => {
      expect(metadata.other['geo.placename']).toBe('Leeds')
    })

    it('should have honey cake Leeds in keywords', () => {
      const keywords = metadata.keywords as string
      expect(keywords.toLowerCase()).toContain('leeds')
    })

    it('should mention Leeds in title or description', () => {
      const title = metadata.title as string
      const description = metadata.description as string
      const hasLeeds = title.includes('Leeds') || description.includes('Leeds')
      expect(hasLeeds).toBe(true)
    })
  })
})
