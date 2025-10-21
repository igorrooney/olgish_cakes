import { SEO_CONFIG, PRIMARY_KEYWORDS, LONG_TAIL_KEYWORDS } from '../seo'

describe('seo utilities', () => {
  describe('SEO_CONFIG', () => {
    it('should have siteName', () => {
      expect(SEO_CONFIG.siteName).toBe('Olgish Cakes')
    })

    it('should have siteUrl', () => {
      expect(SEO_CONFIG.siteUrl).toBe('https://olgishcakes.co.uk')
    })

    it('should have siteDescription', () => {
      expect(SEO_CONFIG.siteDescription).toContain('Ukrainian')
      expect(SEO_CONFIG.siteDescription).toContain('Leeds')
    })

    it('should have defaultImage', () => {
      expect(SEO_CONFIG.defaultImage).toContain('olgishcakes.co.uk')
      expect(SEO_CONFIG.defaultImage).toContain('logo')
    })

    it('should have twitterHandle', () => {
      expect(SEO_CONFIG.twitterHandle).toBe('@olgish_cakes')
    })

    it('should have locale', () => {
      expect(SEO_CONFIG.locale).toBe('en_GB')
    })

    it('should have type', () => {
      expect(SEO_CONFIG.type).toBe('website')
    })

    it('should be a constant object', () => {
      expect(SEO_CONFIG).toBeDefined()
      expect(typeof SEO_CONFIG).toBe('object')
    })
  })

  describe('PRIMARY_KEYWORDS', () => {
    it('should be an array', () => {
      expect(Array.isArray(PRIMARY_KEYWORDS)).toBe(true)
    })

    it('should have multiple keywords', () => {
      expect(PRIMARY_KEYWORDS.length).toBeGreaterThan(0)
    })

    it('should include Ukrainian cakes Leeds', () => {
      expect(PRIMARY_KEYWORDS).toContain('Ukrainian cakes Leeds')
    })

    it('should include honey cake', () => {
      expect(PRIMARY_KEYWORDS).toContain('honey cake')
    })

    it('should include Medovik', () => {
      expect(PRIMARY_KEYWORDS).toContain('Medovik')
    })

    it('should include location-based keywords', () => {
      const locationKeywords = PRIMARY_KEYWORDS.filter(k => k.includes('Leeds'))
      expect(locationKeywords.length).toBeGreaterThan(0)
    })

    it('should include product-based keywords', () => {
      const productKeywords = PRIMARY_KEYWORDS.filter(k => 
        k.includes('cake') || k.includes('dessert') || k.includes('bakery')
      )
      expect(productKeywords.length).toBeGreaterThan(0)
    })

    it('should be a constant array', () => {
      expect(Array.isArray(PRIMARY_KEYWORDS)).toBe(true)
    })
  })

  describe('LONG_TAIL_KEYWORDS', () => {
    it('should be an array', () => {
      expect(Array.isArray(LONG_TAIL_KEYWORDS)).toBe(true)
    })

    it('should have many keywords', () => {
      expect(LONG_TAIL_KEYWORDS.length).toBeGreaterThan(10)
    })

    it('should include specific long-tail phrases', () => {
      const hasLongPhrases = LONG_TAIL_KEYWORDS.some(k => k.split(' ').length > 3)
      expect(hasLongPhrases).toBe(true)
    })
  })

  describe('Module exports', () => {
    it('should export SEO_CONFIG', () => {
      const module = require('../seo')
      expect(module.SEO_CONFIG).toBeDefined()
    })

    it('should export PRIMARY_KEYWORDS', () => {
      const module = require('../seo')
      expect(module.PRIMARY_KEYWORDS).toBeDefined()
    })

    it('should export LONG_TAIL_KEYWORDS', () => {
      const module = require('../seo')
      expect(module.LONG_TAIL_KEYWORDS).toBeDefined()
    })
  })
})

