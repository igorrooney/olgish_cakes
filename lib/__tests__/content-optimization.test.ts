import {
  SEARCH_INTENT_OPTIMIZATION,
  analyzeContentGaps,
  CONTENT_TEMPLATES,
  generateContentUpdateStrategy,
  USER_SEGMENTATION,
  optimizeForFeaturedSnippets,
  generateInternalLinkingStrategy
} from '../content-optimization'

describe('content-optimization', () => {
  describe('SEARCH_INTENT_OPTIMIZATION', () => {
    it('should have informational intent configuration', () => {
      expect(SEARCH_INTENT_OPTIMIZATION.informational).toBeDefined()
      expect(SEARCH_INTENT_OPTIMIZATION.informational.intent).toContain('Ukrainian')
      expect(SEARCH_INTENT_OPTIMIZATION.informational.contentTypes).toBeInstanceOf(Array)
      expect(SEARCH_INTENT_OPTIMIZATION.informational.keywords).toBeInstanceOf(Array)
    })

    it('should have navigational intent configuration', () => {
      expect(SEARCH_INTENT_OPTIMIZATION.navigational).toBeDefined()
      expect(SEARCH_INTENT_OPTIMIZATION.navigational.intent).toContain('Olgish Cakes')
    })

    it('should have commercial intent configuration', () => {
      expect(SEARCH_INTENT_OPTIMIZATION.commercial).toBeDefined()
      expect(SEARCH_INTENT_OPTIMIZATION.commercial.intent).toContain('compare')
    })

    it('should have transactional intent configuration', () => {
      expect(SEARCH_INTENT_OPTIMIZATION.transactional).toBeDefined()
      expect(SEARCH_INTENT_OPTIMIZATION.transactional.intent).toContain('Order')
    })

    it('should have structure with headings for informational', () => {
      expect(SEARCH_INTENT_OPTIMIZATION.informational.structure.headings).toBeDefined()
      expect(SEARCH_INTENT_OPTIMIZATION.informational.structure.headings).toContain('H1: Main topic')
    })

    it('should have word count recommendations', () => {
      expect(SEARCH_INTENT_OPTIMIZATION.informational.structure.wordCount).toBe('1500-3000 words')
      expect(SEARCH_INTENT_OPTIMIZATION.navigational.structure.wordCount).toBe('500-1000 words')
      expect(SEARCH_INTENT_OPTIMIZATION.commercial.structure.wordCount).toBe('1000-2000 words')
      expect(SEARCH_INTENT_OPTIMIZATION.transactional.structure.wordCount).toBe('300-800 words')
    })

    it('should have media types for each intent', () => {
      expect(SEARCH_INTENT_OPTIMIZATION.informational.structure.mediaTypes).toContain('video tutorials')
      expect(SEARCH_INTENT_OPTIMIZATION.navigational.structure.mediaTypes).toContain('maps')
      expect(SEARCH_INTENT_OPTIMIZATION.commercial.structure.mediaTypes).toContain('testimonials')
      expect(SEARCH_INTENT_OPTIMIZATION.transactional.structure.mediaTypes).toContain('order buttons')
    })
  })

  describe('analyzeContentGaps', () => {
    it('should return content gap analysis', () => {
      const result = analyzeContentGaps()

      expect(result).toBeDefined()
      expect(result.missingTopics).toBeInstanceOf(Array)
      expect(result.contentImprovements).toBeInstanceOf(Array)
      expect(result.seoOpportunities).toBeInstanceOf(Array)
    })

    it('should include Ukrainian culture topics', () => {
      const result = analyzeContentGaps()

      expect(result.missingTopics).toContain('Ukrainian cake traditions and cultural significance')
    })

    it('should include practical content improvements', () => {
      const result = analyzeContentGaps()

      expect(result.contentImprovements.length).toBeGreaterThan(0)
      expect(result.contentImprovements).toContain('Add more detailed product descriptions')
    })

    it('should include SEO opportunities', () => {
      const result = analyzeContentGaps()

      expect(result.seoOpportunities.length).toBeGreaterThan(0)
      expect(result.seoOpportunities).toContain('Target featured snippet opportunities')
    })

    it('should have at least 10 missing topics', () => {
      const result = analyzeContentGaps()

      expect(result.missingTopics.length).toBeGreaterThanOrEqual(10)
    })

    it('should have at least 10 content improvements', () => {
      const result = analyzeContentGaps()

      expect(result.contentImprovements.length).toBeGreaterThanOrEqual(10)
    })

    it('should have at least 10 SEO opportunities', () => {
      const result = analyzeContentGaps()

      expect(result.seoOpportunities.length).toBeGreaterThanOrEqual(10)
    })
  })

  describe('CONTENT_TEMPLATES', () => {
    it('should have product page template', () => {
      expect(CONTENT_TEMPLATES.productPage).toBeDefined()
      expect(CONTENT_TEMPLATES.productPage.title).toContain('{Product Name}')
      expect(CONTENT_TEMPLATES.productPage.description).toContain('{Product Name}')
    })

    it('should have category page template', () => {
      expect(CONTENT_TEMPLATES.categoryPage).toBeDefined()
      expect(CONTENT_TEMPLATES.categoryPage.title).toContain('{Category}')
    })

    it('should have local landing page template', () => {
      expect(CONTENT_TEMPLATES.localLandingPage).toBeDefined()
      expect(CONTENT_TEMPLATES.localLandingPage.title).toContain('{City}')
    })

    it('should have structure array for product page', () => {
      expect(CONTENT_TEMPLATES.productPage.structure).toBeInstanceOf(Array)
      expect(CONTENT_TEMPLATES.productPage.structure.length).toBeGreaterThan(0)
    })

    it('should include Hero section in product page', () => {
      const heroSection = CONTENT_TEMPLATES.productPage.structure.find(s => s.section === 'Hero')

      expect(heroSection).toBeDefined()
      expect(heroSection?.seoElements).toContain('H1 tag')
    })

    it('should include Customer Reviews section', () => {
      const reviewSection = CONTENT_TEMPLATES.productPage.structure.find(s => s.section === 'Customer Reviews')

      expect(reviewSection).toBeDefined()
      expect(reviewSection?.seoElements).toContain('Review schema')
    })

    it('should have SEO elements for each section', () => {
      CONTENT_TEMPLATES.productPage.structure.forEach(section => {
        expect(section.seoElements).toBeInstanceOf(Array)
        expect(section.seoElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('generateContentUpdateStrategy', () => {
    it('should return update strategy with priorities', () => {
      const result = generateContentUpdateStrategy()

      expect(result.highPriority).toBeDefined()
      expect(result.mediumPriority).toBeDefined()
      expect(result.lowPriority).toBeDefined()
      expect(result.seasonal).toBeDefined()
    })

    it('should have weekly frequency for high priority', () => {
      const result = generateContentUpdateStrategy()

      expect(result.highPriority.frequency).toBe('Weekly')
    })

    it('should have monthly frequency for medium priority', () => {
      const result = generateContentUpdateStrategy()

      expect(result.mediumPriority.frequency).toBe('Monthly')
    })

    it('should have quarterly frequency for low priority', () => {
      const result = generateContentUpdateStrategy()

      expect(result.lowPriority.frequency).toBe('Quarterly')
    })

    it('should have as-needed frequency for seasonal', () => {
      const result = generateContentUpdateStrategy()

      expect(result.seasonal.frequency).toBe('As needed')
    })

    it('should include content items for each priority', () => {
      const result = generateContentUpdateStrategy()

      expect(result.highPriority.content.length).toBeGreaterThan(0)
      expect(result.mediumPriority.content.length).toBeGreaterThan(0)
      expect(result.lowPriority.content.length).toBeGreaterThan(0)
      expect(result.seasonal.content.length).toBeGreaterThan(0)
    })

    it('should include blog post publishing in high priority', () => {
      const result = generateContentUpdateStrategy()

      expect(result.highPriority.content).toContain('Blog post publishing')
    })
  })

  describe('USER_SEGMENTATION', () => {
    it('should have bridesToBe segment', () => {
      expect(USER_SEGMENTATION.bridesToBe).toBeDefined()
      expect(USER_SEGMENTATION.bridesToBe.interests).toContain('wedding planning')
    })

    it('should have parentsPlanning segment', () => {
      expect(USER_SEGMENTATION.parentsPlanning).toBeDefined()
      expect(USER_SEGMENTATION.parentsPlanning.interests).toContain('birthday parties')
    })

    it('should have corporateClients segment', () => {
      expect(USER_SEGMENTATION.corporateClients).toBeDefined()
      expect(USER_SEGMENTATION.corporateClients.interests).toContain('bulk orders')
    })

    it('should have foodEnthusiasts segment', () => {
      expect(USER_SEGMENTATION.foodEnthusiasts).toBeDefined()
      expect(USER_SEGMENTATION.foodEnthusiasts.interests).toContain('authentic recipes')
    })

    it('should have localResidents segment', () => {
      expect(USER_SEGMENTATION.localResidents).toBeDefined()
      expect(USER_SEGMENTATION.localResidents.interests).toContain('convenient delivery')
    })

    it('should have keywords for each segment', () => {
      Object.values(USER_SEGMENTATION).forEach(segment => {
        expect(segment.keywords).toBeInstanceOf(Array)
        expect(segment.keywords.length).toBeGreaterThan(0)
      })
    })

    it('should have touchpoints for each segment', () => {
      Object.values(USER_SEGMENTATION).forEach(segment => {
        expect(segment.touchpoints).toBeInstanceOf(Array)
        expect(segment.touchpoints.length).toBeGreaterThan(0)
      })
    })
  })

  describe('optimizeForFeaturedSnippets', () => {
    it('should return optimization data for given topic', () => {
      const result = optimizeForFeaturedSnippets('honey cake')

      expect(result).toBeDefined()
      expect(result.targetQueries).toBeInstanceOf(Array)
      expect(result.optimizationTips).toBeInstanceOf(Array)
    })

    it('should include "What is" query', () => {
      const result = optimizeForFeaturedSnippets('medovik')

      expect(result.targetQueries).toContain('What is medovik?')
    })

    it('should include "How to order" query', () => {
      const result = optimizeForFeaturedSnippets('custom cake')

      expect(result.targetQueries).toContain('How to order custom cake')
    })

    it('should include "Best in Leeds" query', () => {
      const result = optimizeForFeaturedSnippets('wedding cake')

      expect(result.targetQueries).toContain('Best wedding cake in Leeds')
    })

    it('should include comparison query', () => {
      const result = optimizeForFeaturedSnippets('Ukrainian cake')

      expect(result.targetQueries).toContain('Ukrainian cake vs alternatives')
    })

    it('should include "Where to buy" query', () => {
      const result = optimizeForFeaturedSnippets('honey cake')

      expect(result.targetQueries).toContain('Where to buy honey cake')
    })

    it('should provide optimization tips', () => {
      const result = optimizeForFeaturedSnippets('cake')

      expect(result.optimizationTips.length).toBeGreaterThanOrEqual(5)
      expect(result.optimizationTips).toContain('Use clear, concise definitions')
    })

    it('should handle different topic inputs', () => {
      const topics = ['birthday cake', 'wedding cake', 'custom cake']

      topics.forEach(topic => {
        const result = optimizeForFeaturedSnippets(topic)
        expect(result.targetQueries.length).toBeGreaterThan(0)
      })
    })
  })

  describe('generateInternalLinkingStrategy', () => {
    it('should return internal linking strategy', () => {
      const result = generateInternalLinkingStrategy()

      expect(result).toBeDefined()
      expect(result.hubPages).toBeInstanceOf(Array)
      expect(result.linkingRules).toBeInstanceOf(Array)
      expect(result.anchorTextStrategy).toBeInstanceOf(Array)
    })

    it('should have /cakes as hub page', () => {
      const result = generateInternalLinkingStrategy()
      const cakesHub = result.hubPages.find(p => p.page === '/cakes')

      expect(cakesHub).toBeDefined()
      expect(cakesHub?.purpose).toBe('Main category hub')
    })

    it('should have /about as hub page', () => {
      const result = generateInternalLinkingStrategy()
      const aboutHub = result.hubPages.find(p => p.page === '/about')

      expect(aboutHub).toBeDefined()
      expect(aboutHub?.purpose).toBe('Authority building')
    })

    it('should have /testimonials as hub page', () => {
      const result = generateInternalLinkingStrategy()
      const testimonialsHub = result.hubPages.find(p => p.page === '/testimonials')

      expect(testimonialsHub).toBeDefined()
      expect(testimonialsHub?.purpose).toBe('Social proof hub')
    })

    it('should have hub pages with linkTo arrays', () => {
      const result = generateInternalLinkingStrategy()

      result.hubPages.forEach(hub => {
        expect(hub.linkTo).toBeInstanceOf(Array)
        expect(hub.linkTo.length).toBeGreaterThan(0)
      })
    })

    it('should have hub pages with anchor texts', () => {
      const result = generateInternalLinkingStrategy()

      result.hubPages.forEach(hub => {
        expect(hub.anchorTexts).toBeInstanceOf(Array)
        expect(hub.anchorTexts.length).toBeGreaterThan(0)
      })
    })

    it('should provide linking rules', () => {
      const result = generateInternalLinkingStrategy()

      expect(result.linkingRules.length).toBeGreaterThan(0)
      expect(result.linkingRules).toContain('Link from high-authority pages to new content')
    })

    it('should have anchor text strategy percentages', () => {
      const result = generateInternalLinkingStrategy()

      expect(result.anchorTextStrategy.length).toBe(4)
      expect(result.anchorTextStrategy.some(s => s.includes('20%'))).toBe(true)
      expect(result.anchorTextStrategy.some(s => s.includes('30%'))).toBe(true)
      expect(result.anchorTextStrategy.some(s => s.includes('25%'))).toBe(true)
    })

    it('should recommend 3-click rule', () => {
      const result = generateInternalLinkingStrategy()

      expect(result.linkingRules).toContain('Ensure all important pages are within 3 clicks of homepage')
    })
  })
})

