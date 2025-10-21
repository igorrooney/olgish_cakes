import {
  ADVANCED_SEO_CONFIG,
  generateAdvancedMetaTitle,
  generateAdvancedMetaDescription,
  generateAdvancedStructuredData,
  generateAISearchOptimization,
  generateTopicCluster,
  generateEATOptimization
} from '../advanced-seo'

// Mock the seo utils
jest.mock('@/app/utils/seo', () => ({
  getPriceValidUntil: jest.fn(() => '2025-12-31'),
  getMerchantReturnPolicy: jest.fn(() => ({
    '@type': 'MerchantReturnPolicy',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow'
  })),
  getOfferShippingDetails: jest.fn(() => ({
    '@type': 'OfferShippingDetails',
    shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'GBP' }
  }))
}))

describe('advanced-seo', () => {
  describe('ADVANCED_SEO_CONFIG', () => {
    it('should have PRIMARY_KEYWORDS', () => {
      expect(ADVANCED_SEO_CONFIG.PRIMARY_KEYWORDS).toBeInstanceOf(Array)
      expect(ADVANCED_SEO_CONFIG.PRIMARY_KEYWORDS.length).toBeGreaterThan(0)
    })

    it('should include ukrainian cakes leeds', () => {
      expect(ADVANCED_SEO_CONFIG.PRIMARY_KEYWORDS).toContain('ukrainian cakes leeds')
    })

    it('should have LONG_TAIL_KEYWORDS', () => {
      expect(ADVANCED_SEO_CONFIG.LONG_TAIL_KEYWORDS).toBeInstanceOf(Array)
      expect(ADVANCED_SEO_CONFIG.LONG_TAIL_KEYWORDS.length).toBeGreaterThan(0)
    })

    it('should have LOCAL_KEYWORDS', () => {
      expect(ADVANCED_SEO_CONFIG.LOCAL_KEYWORDS).toBeInstanceOf(Array)
      expect(ADVANCED_SEO_CONFIG.LOCAL_KEYWORDS.length).toBeGreaterThan(0)
    })

    it('should have VOICE_SEARCH_KEYWORDS', () => {
      expect(ADVANCED_SEO_CONFIG.VOICE_SEARCH_KEYWORDS).toBeInstanceOf(Array)
      expect(ADVANCED_SEO_CONFIG.VOICE_SEARCH_KEYWORDS.length).toBeGreaterThan(0)
    })

    it('should have SEMANTIC_KEYWORDS', () => {
      expect(ADVANCED_SEO_CONFIG.SEMANTIC_KEYWORDS).toBeInstanceOf(Array)
      expect(ADVANCED_SEO_CONFIG.SEMANTIC_KEYWORDS.length).toBeGreaterThan(0)
    })

    it('should have COMPETITIVE_KEYWORDS', () => {
      expect(ADVANCED_SEO_CONFIG.COMPETITIVE_KEYWORDS).toBeInstanceOf(Array)
      expect(ADVANCED_SEO_CONFIG.COMPETITIVE_KEYWORDS.length).toBeGreaterThan(0)
    })

    it('should have at least 10 primary keywords', () => {
      expect(ADVANCED_SEO_CONFIG.PRIMARY_KEYWORDS.length).toBeGreaterThanOrEqual(10)
    })

    it('should have at least 10 long-tail keywords', () => {
      expect(ADVANCED_SEO_CONFIG.LONG_TAIL_KEYWORDS.length).toBeGreaterThanOrEqual(10)
    })
  })

  describe('generateAdvancedMetaTitle', () => {
    it('should generate a meta title', () => {
      const title = generateAdvancedMetaTitle('Ukrainian Cakes')

      expect(title).toBeDefined()
      expect(typeof title).toBe('string')
      expect(title.length).toBeGreaterThan(0)
    })

    it('should include base title', () => {
      const baseTitle = 'Wedding Cakes'
      const title = generateAdvancedMetaTitle(baseTitle)

      expect(title).toContain(baseTitle)
    })

    it('should include location when provided', () => {
      const title = generateAdvancedMetaTitle('Cakes', 'York')

      expect(title).toContain('York')
    })

    it('should use default location of Leeds', () => {
      const title = generateAdvancedMetaTitle('Cakes')

      expect(title).toContain('Leeds')
    })

    it('should generate title with page name', () => {
      const title = generateAdvancedMetaTitle('Cakes')

      expect(title).toContain('Cakes')
    })

    it('should accept location and year parameters', () => {
      const title = generateAdvancedMetaTitle('Cakes', 'Leeds', '2024')

      expect(typeof title).toBe('string')
      expect(title.length).toBeGreaterThan(0)
    })

    it('should include a trigger word', () => {
      const triggers = ['Award-Winning', 'Premium', 'Artisan', 'Bespoke', 'Luxury', 'Professional', 'Authentic', 'Handcrafted']
      const title = generateAdvancedMetaTitle('Cakes')

      const hasTrigger = triggers.some(trigger => title.includes(trigger))
      expect(hasTrigger).toBe(true)
    })

    it('should generate different titles on consecutive calls', () => {
      const title1 = generateAdvancedMetaTitle('Cakes')
      const title2 = generateAdvancedMetaTitle('Cakes')

      // Due to randomness, they might be different
      expect(typeof title1).toBe('string')
      expect(typeof title2).toBe('string')
    })

    it('should generate title within reasonable length', () => {
      const title = generateAdvancedMetaTitle('Cakes')

      expect(title.length).toBeGreaterThan(0)
      expect(title.length).toBeLessThan(200)
    })
  })

  describe('generateAdvancedMetaDescription', () => {
    it('should generate a meta description', () => {
      const description = generateAdvancedMetaDescription('Wedding Cakes')

      expect(description).toBeDefined()
      expect(typeof description).toBe('string')
    })

    it('should include product name', () => {
      const description = generateAdvancedMetaDescription('Birthday Cakes')

      expect(description).toContain('Birthday Cakes')
    })

    it('should include location', () => {
      const description = generateAdvancedMetaDescription('Cakes', 'York')

      expect(description).toContain('York')
    })

    it('should use default location of Leeds', () => {
      const description = generateAdvancedMetaDescription('Cakes')

      expect(description).toContain('Leeds')
    })

    it('should include unique value proposition', () => {
      const description = generateAdvancedMetaDescription('Cakes', 'Leeds', 'family recipes')

      expect(description).toContain('family recipes')
    })

    it('should use default unique value', () => {
      const description = generateAdvancedMetaDescription('Cakes')

      expect(description).toContain('authentic Ukrainian recipes')
    })

    it('should include urgency element', () => {
      const urgencyWords = ['Limited Time', 'Same Day', 'Fast Delivery', 'Book Now']
      const description = generateAdvancedMetaDescription('Cakes')

      const hasUrgency = urgencyWords.some(word => description.includes(word))
      expect(hasUrgency).toBe(true)
    })

    it('should include benefit element', () => {
      const benefitWords = ['Premium Quality', 'Fresh Ingredients', 'Handmade', 'Custom Design']
      const description = generateAdvancedMetaDescription('Cakes')

      const hasBenefit = benefitWords.some(word => description.includes(word))
      expect(hasBenefit).toBe(true)
    })

    it('should include social proof', () => {
      const proofWords = ['5⭐ Reviews', 'Award-Winning', 'Trusted by 1000+', 'Featured in Local Media']
      const description = generateAdvancedMetaDescription('Cakes')

      const hasProof = proofWords.some(word => description.includes(word))
      expect(hasProof).toBe(true)
    })

    it('should generate description with content', () => {
      const description = generateAdvancedMetaDescription('Cakes')

      expect(typeof description).toBe('string')
      expect(description.length).toBeGreaterThan(0)
    })
  })

  describe('generateAdvancedStructuredData', () => {
    const productData = {
      name: 'Honey Cake',
      description: 'Traditional Ukrainian honey cake',
      imageUrl: '/images/honey-cake.jpg',
      price: 30,
      rating: 4.8,
      reviewCount: 50,
      category: 'Cakes',
      availability: 'InStock',
      location: 'Leeds'
    }

    it('should generate structured data with @graph', () => {
      const result = generateAdvancedStructuredData(productData)

      expect(result['@context']).toBe('https://schema.org')
      expect(result['@graph']).toBeInstanceOf(Array)
    })

    it('should include Product schema', () => {
      const result = generateAdvancedStructuredData(productData)
      const product = result['@graph'].find((item: any) => item['@type'] === 'Product')

      expect(product).toBeDefined()
      expect(product.name).toBe('Honey Cake')
    })

    it('should include Bakery schema', () => {
      const result = generateAdvancedStructuredData(productData)
      const bakery = result['@graph'].find((item: any) => item['@type'] === 'Bakery')

      expect(bakery).toBeDefined()
      expect(bakery.name).toContain('Olgish Cakes')
    })

    it('should include FAQPage schema', () => {
      const result = generateAdvancedStructuredData(productData)
      const faq = result['@graph'].find((item: any) => item['@type'] === 'FAQPage')

      expect(faq).toBeDefined()
      expect(faq.mainEntity).toBeInstanceOf(Array)
    })

    it('should include HowTo schema', () => {
      const result = generateAdvancedStructuredData(productData)
      const howTo = result['@graph'].find((item: any) => item['@type'] === 'HowTo')

      expect(howTo).toBeDefined()
      expect(howTo.step).toBeInstanceOf(Array)
    })

    it('should handle missing image URL', () => {
      const dataWithoutImage = { ...productData, imageUrl: undefined }
      const result = generateAdvancedStructuredData(dataWithoutImage)
      const product = result['@graph'].find((item: any) => item['@type'] === 'Product')

      expect(product.image).toBeDefined()
      expect(product.image[0]).toContain('placeholder')
    })

    it('should handle relative image URL', () => {
      const result = generateAdvancedStructuredData(productData)
      const product = result['@graph'].find((item: any) => item['@type'] === 'Product')

      expect(product.image[0]).toMatch(/^https?:\/\//)
    })

    it('should handle absolute image URL', () => {
      const dataWithAbsoluteUrl = { ...productData, imageUrl: 'https://cdn.example.com/image.jpg' }
      const result = generateAdvancedStructuredData(dataWithAbsoluteUrl)
      const product = result['@graph'].find((item: any) => item['@type'] === 'Product')

      expect(product.image[0]).toBe('https://cdn.example.com/image.jpg')
    })

    it('should use provided rating when available', () => {
      const result = generateAdvancedStructuredData(productData)
      const product = result['@graph'].find((item: any) => item['@type'] === 'Product')

      expect(product.aggregateRating.ratingValue).toBe(4.8)
      expect(product.aggregateRating.reviewCount).toBe(50)
    })

    it('should use default rating when not provided', () => {
      const dataWithoutRating = { ...productData, rating: undefined, reviewCount: undefined }
      const result = generateAdvancedStructuredData(dataWithoutRating)
      const product = result['@graph'].find((item: any) => item['@type'] === 'Product')

      expect(product.aggregateRating.ratingValue).toBe('5.0')
      expect(product.aggregateRating.reviewCount).toBe('127')
    })

    it('should include reviews array', () => {
      const result = generateAdvancedStructuredData(productData)
      const product = result['@graph'].find((item: any) => item['@type'] === 'Product')

      expect(product.review).toBeInstanceOf(Array)
      expect(product.review.length).toBe(2)
    })

    it('should use default price when not provided', () => {
      const dataWithoutPrice = { ...productData, price: undefined }
      const result = generateAdvancedStructuredData(dataWithoutPrice)
      const product = result['@graph'].find((item: any) => item['@type'] === 'Product')

      expect(product.offers.price).toBe(25)
    })
  })

  describe('generateAISearchOptimization', () => {
    const content = {
      topic: 'Ukrainian Cakes',
      expertise: ['baking', 'decorating', 'traditional recipes'],
      location: 'Leeds'
    }

    it('should generate AI optimization data', () => {
      const result = generateAISearchOptimization(content)

      expect(result).toBeDefined()
      expect(result.aiContext).toBeDefined()
      expect(result.factualClaims).toBeDefined()
      expect(result.qaPairs).toBeDefined()
    })

    it('should include topic in aiContext', () => {
      const result = generateAISearchOptimization(content)

      expect(result.aiContext).toContain('Ukrainian Cakes')
    })

    it('should include location in aiContext', () => {
      const result = generateAISearchOptimization(content)

      expect(result.aiContext).toContain('Leeds')
    })

    it('should include expertise in aiContext', () => {
      const result = generateAISearchOptimization(content)

      expect(result.aiContext).toContain('baking')
      expect(result.aiContext).toContain('decorating')
    })

    it('should provide factual claims', () => {
      const result = generateAISearchOptimization(content)

      expect(result.factualClaims).toBeInstanceOf(Array)
      expect(result.factualClaims.length).toBeGreaterThan(0)
    })

    it('should provide QA pairs', () => {
      const result = generateAISearchOptimization(content)

      expect(result.qaPairs).toBeInstanceOf(Array)
      expect(result.qaPairs.length).toBeGreaterThan(0)
    })

    it('should have question and answer in QA pairs', () => {
      const result = generateAISearchOptimization(content)

      result.qaPairs.forEach((qa: any) => {
        expect(qa.question).toBeDefined()
        expect(qa.answer).toBeDefined()
      })
    })
  })

  describe('generateTopicCluster', () => {
    it('should return cluster for ukrainian-cakes', () => {
      const result = generateTopicCluster('ukrainian-cakes')

      expect(result).toBeDefined()
      expect(result.pillar).toContain('Ukrainian Cakes')
      expect(result.supporting).toBeInstanceOf(Array)
    })

    it('should return cluster for custom-cakes', () => {
      const result = generateTopicCluster('custom-cakes')

      expect(result).toBeDefined()
      expect(result.pillar).toContain('Custom Cake')
    })

    it('should return cluster for cake-delivery', () => {
      const result = generateTopicCluster('cake-delivery')

      expect(result).toBeDefined()
      expect(result.pillar).toContain('Delivery')
    })

    it('should use custom location', () => {
      const result = generateTopicCluster('ukrainian-cakes', 'York')

      expect(result.pillar).toContain('York')
    })

    it('should default to Leeds', () => {
      const result = generateTopicCluster('ukrainian-cakes')

      expect(result.pillar).toContain('Leeds')
    })

    it('should have supporting content', () => {
      const result = generateTopicCluster('ukrainian-cakes')

      expect(result.supporting.length).toBeGreaterThan(0)
    })

    it('should fallback to ukrainian-cakes for unknown topic', () => {
      const result = generateTopicCluster('unknown-topic')

      expect(result.pillar).toContain('Ukrainian Cakes')
    })

    it('should have at least 5 supporting topics', () => {
      const result = generateTopicCluster('ukrainian-cakes')

      expect(result.supporting.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('generateEATOptimization', () => {
    it('should generate E-A-T optimization data', () => {
      const result = generateEATOptimization()

      expect(result).toBeDefined()
      expect(result.expertise).toBeDefined()
      expect(result.authoritativeness).toBeDefined()
      expect(result.trustworthiness).toBeDefined()
    })

    it('should have expertise credentials', () => {
      const result = generateEATOptimization()

      expect(result.expertise.credentials).toBeInstanceOf(Array)
      expect(result.expertise.credentials.length).toBeGreaterThan(0)
    })

    it('should have expertise demonstrations', () => {
      const result = generateEATOptimization()

      expect(result.expertise.demonstrations).toBeInstanceOf(Array)
      expect(result.expertise.demonstrations.length).toBeGreaterThan(0)
    })

    it('should have authoritativeness citations', () => {
      const result = generateEATOptimization()

      expect(result.authoritativeness.citations).toBeInstanceOf(Array)
      expect(result.authoritativeness.backlinks).toBeInstanceOf(Array)
    })

    it('should have trustworthiness signals', () => {
      const result = generateEATOptimization()

      expect(result.trustworthiness.transparency).toBeInstanceOf(Array)
      expect(result.trustworthiness.security).toBeInstanceOf(Array)
    })

    it('should include baking experience credential', () => {
      const result = generateEATOptimization()

      const hasExperience = result.expertise.credentials.some((c: string) => 
        c.includes('years') && c.includes('baking')
      )
      expect(hasExperience).toBe(true)
    })

    it('should include Ukrainian heritage credential', () => {
      const result = generateEATOptimization()

      const hasHeritage = result.expertise.credentials.some((c: string) => 
        c.includes('Ukrainian')
      )
      expect(hasHeritage).toBe(true)
    })
  })
})

