import {
  LOCAL_SEO_STRATEGY,
  generateGMBOptimization,
  CITATION_STRATEGY,
  generateLocalContentStrategy,
  LOCAL_LINK_BUILDING,
  generateReviewStrategy,
  generateLocalSEOMonitoring
} from '../local-seo-domination'

describe('local-seo-domination', () => {
  describe('LOCAL_SEO_STRATEGY', () => {
    describe('primaryMarket', () => {
      it('should have Leeds as primary city', () => {
        expect(LOCAL_SEO_STRATEGY.primaryMarket.city).toBe('Leeds')
      })

      it('should have population data', () => {
        expect(LOCAL_SEO_STRATEGY.primaryMarket.population).toBe(789194)
      })

      it('should have market size', () => {
        expect(LOCAL_SEO_STRATEGY.primaryMarket.marketSize).toBe('Large urban center')
      })

      it('should have competition level', () => {
        expect(LOCAL_SEO_STRATEGY.primaryMarket.competition).toBe('Medium-High')
      })

      it('should have keywords array', () => {
        expect(LOCAL_SEO_STRATEGY.primaryMarket.keywords).toBeInstanceOf(Array)
        expect(LOCAL_SEO_STRATEGY.primaryMarket.keywords.length).toBeGreaterThan(0)
      })

      it('should include cakes leeds keyword', () => {
        expect(LOCAL_SEO_STRATEGY.primaryMarket.keywords).toContain('cakes leeds')
      })

      it('should include ukrainian bakery leeds keyword', () => {
        expect(LOCAL_SEO_STRATEGY.primaryMarket.keywords).toContain('ukrainian bakery leeds')
      })
    })

    describe('secondaryMarkets', () => {
      it('should be an array', () => {
        expect(LOCAL_SEO_STRATEGY.secondaryMarkets).toBeInstanceOf(Array)
      })

      it('should have multiple secondary markets', () => {
        expect(LOCAL_SEO_STRATEGY.secondaryMarkets.length).toBeGreaterThan(0)
      })

      it('should include York', () => {
        const york = LOCAL_SEO_STRATEGY.secondaryMarkets.find(m => m.city === 'York')
        expect(york).toBeDefined()
        expect(york?.distance).toBe('24 miles')
      })

      it('should include Bradford', () => {
        const bradford = LOCAL_SEO_STRATEGY.secondaryMarkets.find(m => m.city === 'Bradford')
        expect(bradford).toBeDefined()
        expect(bradford?.distance).toBe('9 miles')
      })

      it('should include Halifax', () => {
        const halifax = LOCAL_SEO_STRATEGY.secondaryMarkets.find(m => m.city === 'Halifax')
        expect(halifax).toBeDefined()
      })

      it('should have keywords for each market', () => {
        LOCAL_SEO_STRATEGY.secondaryMarkets.forEach(market => {
          expect(market.keywords).toBeInstanceOf(Array)
          expect(market.keywords.length).toBeGreaterThan(0)
        })
      })

      it('should have market potential for each market', () => {
        LOCAL_SEO_STRATEGY.secondaryMarkets.forEach(market => {
          expect(market.marketPotential).toBeDefined()
          expect(typeof market.marketPotential).toBe('string')
        })
      })
    })

    describe('neighborhoods', () => {
      it('should be an array', () => {
        expect(LOCAL_SEO_STRATEGY.neighborhoods).toBeInstanceOf(Array)
      })

      it('should include Leeds neighborhoods', () => {
        expect(LOCAL_SEO_STRATEGY.neighborhoods).toContain('City Centre')
        expect(LOCAL_SEO_STRATEGY.neighborhoods).toContain('Headingley')
        expect(LOCAL_SEO_STRATEGY.neighborhoods).toContain('Chapel Allerton')
      })

      it('should have multiple neighborhoods', () => {
        expect(LOCAL_SEO_STRATEGY.neighborhoods.length).toBeGreaterThan(10)
      })
    })
  })

  describe('generateGMBOptimization', () => {
    it('should return GMB optimization data', () => {
      const result = generateGMBOptimization()

      expect(result).toBeDefined()
      expect(result.businessName).toBeDefined()
      expect(result.categories).toBeDefined()
      expect(result.description).toBeDefined()
    })

    it('should have business name', () => {
      const result = generateGMBOptimization()

      expect(result.businessName).toBe('Olgish Cakes - Ukrainian Bakery Leeds')
    })

    it('should have primary and secondary categories', () => {
      const result = generateGMBOptimization()

      expect(result.categories.primary).toBe('Bakery')
      expect(result.categories.secondary).toBeInstanceOf(Array)
    })

    it('should have comprehensive description', () => {
      const result = generateGMBOptimization()

      expect(result.description.length).toBeGreaterThan(100)
      expect(result.description).toContain('Ukrainian')
      expect(result.description).toContain('Leeds')
    })

    it('should have business attributes', () => {
      const result = generateGMBOptimization()

      expect(result.attributes).toBeInstanceOf(Array)
      expect(result.attributes.length).toBeGreaterThan(5)
    })

    it('should have products', () => {
      const result = generateGMBOptimization()

      expect(result.products).toBeInstanceOf(Array)
      expect(result.products.length).toBeGreaterThan(0)
    })

    it('should have services', () => {
      const result = generateGMBOptimization()

      expect(result.services).toBeInstanceOf(Array)
      expect(result.services.length).toBeGreaterThan(0)
    })

    it('should have posts strategy', () => {
      const result = generateGMBOptimization()

      expect(result.posts).toBeDefined()
      expect(result.posts.weekly).toBeInstanceOf(Array)
      expect(result.posts.monthly).toBeInstanceOf(Array)
    })
  })

  describe('CITATION_STRATEGY', () => {
    it('should have tier1 citations', () => {
      expect(CITATION_STRATEGY.tier1).toBeInstanceOf(Array)
      expect(CITATION_STRATEGY.tier1).toContain('Google My Business')
    })

    it('should have tier2 citations', () => {
      expect(CITATION_STRATEGY.tier2).toBeInstanceOf(Array)
      expect(CITATION_STRATEGY.tier2.length).toBeGreaterThan(0)
    })

    it('should have tier3 citations', () => {
      expect(CITATION_STRATEGY.tier3).toBeInstanceOf(Array)
      expect(CITATION_STRATEGY.tier3.length).toBeGreaterThan(0)
    })

    it('should have citation format', () => {
      expect(CITATION_STRATEGY.citationFormat).toBeDefined()
      expect(CITATION_STRATEGY.citationFormat.businessName).toBe('Olgish Cakes')
    })

    it('should have complete citation information', () => {
      expect(CITATION_STRATEGY.citationFormat.phone).toBeDefined()
      expect(CITATION_STRATEGY.citationFormat.website).toBe('https://olgishcakes.co.uk')
      expect(CITATION_STRATEGY.citationFormat.email).toBe('hello@olgishcakes.co.uk')
    })

    it('should have categories in citation format', () => {
      expect(CITATION_STRATEGY.citationFormat.categories).toBeInstanceOf(Array)
      expect(CITATION_STRATEGY.citationFormat.categories).toContain('Bakery')
    })
  })

  describe('generateLocalContentStrategy', () => {
    it('should return local content strategy', () => {
      const result = generateLocalContentStrategy()

      expect(result).toBeDefined()
      expect(result.locationPages).toBeInstanceOf(Array)
    })

    it('should have cakes-leeds location page', () => {
      const result = generateLocalContentStrategy()
      const cakesLeeds = result.locationPages.find(p => p.url === '/cakes-leeds')

      expect(cakesLeeds).toBeDefined()
      expect(cakesLeeds?.title).toContain('Leeds')
    })

    it('should have wedding-cakes-leeds page', () => {
      const result = generateLocalContentStrategy()
      const weddingLeeds = result.locationPages.find(p => p.url === '/wedding-cakes-leeds')

      expect(weddingLeeds).toBeDefined()
    })

    it('should have neighborhood targeting strategy', () => {
      const result = generateLocalContentStrategy()

      expect(result.neighborhoodTargeting).toBeDefined()
      expect(result.neighborhoodTargeting.strategy).toContain('neighborhood')
    })

    it('should have local events strategy', () => {
      const result = generateLocalContentStrategy()

      expect(result.localEvents).toBeDefined()
      expect(result.localEvents.annual).toBeInstanceOf(Array)
      expect(result.localEvents.seasonal).toBeInstanceOf(Array)
    })
  })

  describe('LOCAL_LINK_BUILDING', () => {
    it('should have strategies array', () => {
      expect(LOCAL_LINK_BUILDING.strategies).toBeInstanceOf(Array)
    })

    it('should have venue partnerships strategy', () => {
      const venueStrategy = LOCAL_LINK_BUILDING.strategies.find(s => s.type === 'Venue Partnerships')

      expect(venueStrategy).toBeDefined()
      expect(venueStrategy?.linkValue).toContain('High')
    })

    it('should have outreach templates', () => {
      expect(LOCAL_LINK_BUILDING.outreachTemplates).toBeDefined()
      expect(LOCAL_LINK_BUILDING.outreachTemplates.venuePartnership).toContain('Partnership')
    })

    it('should have local business network strategy', () => {
      const networkStrategy = LOCAL_LINK_BUILDING.strategies.find(s => s.type === 'Local Business Network')

      expect(networkStrategy).toBeDefined()
    })
  })

  describe('generateReviewStrategy', () => {
    it('should return review strategy', () => {
      const result = generateReviewStrategy()

      expect(result).toBeDefined()
      expect(result.platforms).toBeInstanceOf(Array)
    })

    it('should prioritize Google My Business', () => {
      const result = generateReviewStrategy()
      const gmb = result.platforms.find(p => p.name === 'Google My Business')

      expect(gmb).toBeDefined()
      expect(gmb?.priority).toBe('Highest')
    })

    it('should have review request process', () => {
      const result = generateReviewStrategy()

      expect(result.reviewRequestProcess).toBeDefined()
      expect(result.reviewRequestProcess.timing).toBeInstanceOf(Array)
      expect(result.reviewRequestProcess.methods).toBeInstanceOf(Array)
    })

    it('should have response strategy', () => {
      const result = generateReviewStrategy()

      expect(result.responseStrategy).toBeDefined()
      expect(result.responseStrategy.positiveReviews).toBeInstanceOf(Array)
      expect(result.responseStrategy.negativeReviews).toBeInstanceOf(Array)
    })
  })

  describe('generateLocalSEOMonitoring', () => {
    it('should return monitoring strategy', () => {
      const result = generateLocalSEOMonitoring()

      expect(result).toBeDefined()
      expect(result.keyMetrics).toBeInstanceOf(Array)
    })

    it('should track Google Maps ranking', () => {
      const result = generateLocalSEOMonitoring()
      const mapsMetric = result.keyMetrics.find(m => m.metric === 'Google Maps Ranking')

      expect(mapsMetric).toBeDefined()
      expect(mapsMetric?.goal).toContain('#1')
    })

    it('should have reporting schedule', () => {
      const result = generateLocalSEOMonitoring()

      expect(result.reportingSchedule).toBeDefined()
      expect(result.reportingSchedule.daily).toBeInstanceOf(Array)
      expect(result.reportingSchedule.weekly).toBeInstanceOf(Array)
      expect(result.reportingSchedule.monthly).toBeInstanceOf(Array)
    })

    it('should list monitoring tools', () => {
      const result = generateLocalSEOMonitoring()

      expect(result.tools).toBeInstanceOf(Array)
      expect(result.tools.length).toBeGreaterThan(0)
    })
  })
})

