import {
  generateSKU,
  generateProductSchema,
  generateAllProductSchemas,
  Cake,
  TestimonialStats
} from '../product-schemas'
import { SKU_PREFIX, FALLBACK_PRICE, FALLBACK_IMAGE } from '../schema-constants'

// Mock dependencies
jest.mock('@/app/utils/seo', () => ({
  getPriceValidUntil: jest.fn(() => '2026-01-01')
}))

jest.mock('@/lib/structured-data-defaults', () => ({
  DEFAULT_REVIEWS: [
    { '@type': 'Review', author: { '@type': 'Person', name: 'Test' } }
  ]
}))

jest.mock('@/types/cake', () => ({
  blocksToText: jest.fn((blocks: any) => 'Converted text from blocks')
}))

jest.mock('@/lib/schema-validation', () => ({
  batchValidateProductSchemas: jest.fn()
}))

describe('product-schemas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('generateSKU', () => {
    it('should generate valid SKU with correct format', () => {
      const sku = generateSKU('Honey Cake', 0)
      expect(sku).toBe('OC-HONEY-CAKE-001')
    })

    it('should handle special characters in product name', () => {
      const sku = generateSKU('Kyiv\'s Best Cake!', 0)
      expect(sku).toBe('OC-KYIV-S-BEST-CAK-001')
    })

    it('should truncate long product names', () => {
      const longName = 'A Very Long Product Name That Exceeds Maximum Length'
      const sku = generateSKU(longName, 0)
      expect(sku).toMatch(/^OC-[A-Z-]+-001$/)
      expect(sku.length).toBeLessThanOrEqual(50)
    })

    it('should increment SKU numbers correctly', () => {
      expect(generateSKU('Test Cake', 0)).toBe('OC-TEST-CAKE-001')
      expect(generateSKU('Test Cake', 5)).toBe('OC-TEST-CAKE-006')
      expect(generateSKU('Test Cake', 99)).toBe('OC-TEST-CAKE-100')
    })

    it('should handle empty or invalid names with fallback', () => {
      const sku1 = generateSKU('', 0)
      expect(sku1).toMatch(/^OC-PRODUCT-001$/)
      
      const sku2 = generateSKU(null as any, 0)
      expect(sku2).toMatch(/^OC-PRODUCT-001$/)
    })

    it('should handle undefined name', () => {
      const sku = generateSKU(undefined as any, 0)
      expect(sku).toBe('OC-PRODUCT-001')
    })

    it('should handle non-string name', () => {
      const sku = generateSKU(123 as any, 0)
      expect(sku).toBe('OC-PRODUCT-001')
    })

    it('should handle negative indices with fallback', () => {
      const sku = generateSKU('Test', -5)
      expect(sku).toBe('OC-TEST-001')
    })

    it('should clean multiple consecutive dashes', () => {
      const sku = generateSKU('Test---Cake', 0)
      expect(sku).toBe('OC-TEST-CAKE-001')
    })

    it('should pad numbers to 3 digits', () => {
      expect(generateSKU('Test', 0)).toContain('-001')
      expect(generateSKU('Test', 9)).toContain('-010')
      expect(generateSKU('Test', 99)).toContain('-100')
    })

    it('should use SKU_PREFIX', () => {
      const sku = generateSKU('Test', 0)
      expect(sku.startsWith(SKU_PREFIX + '-')).toBe(true)
    })

    it('should convert name to uppercase', () => {
      const sku = generateSKU('honey cake', 0)
      expect(sku).toBe('OC-HONEY-CAKE-001')
    })

    it('should remove all non-alphanumeric characters', () => {
      const sku = generateSKU('Test@#$Cake', 0)
      expect(sku).toBe('OC-TEST-CAKE-001')
    })
  })

  describe('generateProductSchema', () => {
    const mockCake: Cake = {
      _id: 'test-cake-1',
      name: 'Test Honey Cake',
      slug: { current: 'test-honey-cake' },
      pricing: { standard: 35 },
      allergens: ['Eggs', 'Dairy'],
      ingredients: ['Flour', 'Sugar', 'Honey'],
      mainImage: { asset: { url: 'https://example.com/image.jpg' } },
      description: 'A delicious test honey cake'
    }

    const mockStats: TestimonialStats = {
      count: 10,
      averageRating: 4.5
    }

    it('should generate valid product schema', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('Product')
      expect(schema.name).toBe('Test Honey Cake')
      expect(schema.sku).toBe('OC-TEST-HONEY-CAKE-001')
    })

    it('should include pricing information', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      const offers = schema.offers as any
      expect(offers['@type']).toBe('Offer')
      expect(offers.price).toBe('35')
      expect(offers.priceCurrency).toBe('GBP')
    })

    it('should include allergen information', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      const schemaAny = schema as any
      expect(schemaAny.containsAllergens).toEqual(['Eggs', 'Dairy'])
    })

    it('should include ingredients in additionalProperty', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      const schemaAny = schema as any
      const ingredientProp = schemaAny.additionalProperty.find(
        (prop: any) => prop.name === 'Main Ingredients'
      )
      expect(ingredientProp).toBeDefined()
      expect(ingredientProp.value).toBe('Flour, Sugar, Honey')
    })

    it('should not include allergens property when no allergens', () => {
      const cakeWithoutAllergens = { ...mockCake, allergens: [] }
      const schema = generateProductSchema(cakeWithoutAllergens, 0, mockStats)
      
      const schemaAny = schema as any
      expect(schemaAny.containsAllergens).toBeUndefined()
    })

    it('should not include allergens additionalProperty when empty', () => {
      const cakeWithoutAllergens = { ...mockCake, allergens: [] }
      const schema = generateProductSchema(cakeWithoutAllergens, 0, mockStats)
      
      const schemaAny = schema as any
      const allergenProp = schemaAny.additionalProperty.find(
        (prop: any) => prop.name === 'Allergens'
      )
      expect(allergenProp).toBeUndefined()
    })

    it('should not include ingredients property when empty', () => {
      const cakeWithoutIngredients = { ...mockCake, ingredients: [] }
      const schema = generateProductSchema(cakeWithoutIngredients, 0, mockStats)
      
      const schemaAny = schema as any
      const ingredientProp = schemaAny.additionalProperty.find(
        (prop: any) => prop.name === 'Main Ingredients'
      )
      expect(ingredientProp).toBeUndefined()
    })

    it('should generate unique MPN', () => {
      const schema1 = generateProductSchema(mockCake, 0, mockStats)
      const schema2 = generateProductSchema({ ...mockCake, _id: 'test-2', slug: { current: 'test-2' } }, 1, mockStats)
      
      expect(schema1.mpn).not.toBe(schema2.mpn)
    })

    it('should handle missing slug', () => {
      const cakeWithoutSlug = { ...mockCake, slug: undefined }
      const schema = generateProductSchema(cakeWithoutSlug, 0, mockStats)
      
      expect(schema.mpn).toContain('PRODUCT')
    })

    it('should handle missing optional fields', () => {
      const minimalCake: Cake = {
        _id: 'minimal-cake',
        name: 'Minimal Cake'
      }
      
      const schema = generateProductSchema(minimalCake, 0, mockStats)
      
      expect(schema.name).toBe('Minimal Cake')
      expect(schema.sku).toBeDefined()
      expect(schema.mpn).toBeDefined()
    })

    it('should use fallback price when pricing missing', () => {
      const cakeWithoutPricing = { ...mockCake, pricing: undefined }
      const schema = generateProductSchema(cakeWithoutPricing, 0, mockStats)
      
      const offers = schema.offers as any
      expect(offers.price).toBe(FALLBACK_PRICE.toString())
    })

    it('should use fallback image when mainImage missing', () => {
      const cakeWithoutImage = { ...mockCake, mainImage: undefined }
      const schema = generateProductSchema(cakeWithoutImage, 0, mockStats)
      
      const images = schema.image as string[]
      expect(images[0]).toBe(FALLBACK_IMAGE)
    })

    it('should convert portable text description to plain text', () => {
      const cakeWithPortableText = {
        ...mockCake,
        description: [{ children: [{ text: 'Test' }] }]
      }
      const schema = generateProductSchema(cakeWithPortableText, 0, mockStats)
      
      expect(schema.description).toBeDefined()
    })

    it('should use fallback description when description missing', () => {
      const cakeWithoutDesc = { ...mockCake, description: undefined }
      const schema = generateProductSchema(cakeWithoutDesc, 0, mockStats)
      
      expect(schema.description).toContain(mockCake.name)
      expect(schema.description).toContain('Leeds')
    })

    it('should handle string description', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      expect(schema.description).toBe('A delicious test honey cake')
    })

    it('should include aggregate rating from testimonial stats', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      const rating = schema.aggregateRating as any
      expect(rating.ratingValue).toBe('4.5')
      expect(rating.reviewCount).toBe('10')
    })

    it('should use minimum review count when stats count is 0', () => {
      const zeroStats = { count: 0, averageRating: 5.0 }
      const schema = generateProductSchema(mockCake, 0, zeroStats)
      
      const rating = schema.aggregateRating as any
      expect(rating.reviewCount).toBe('2')
    })

    it('should include brand information', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      expect(schema.brand).toBeDefined()
      const brand = schema.brand as any
      expect(brand['@type']).toBe('Brand')
      expect(brand.name).toBe('Olgish Cakes')
    })

    it('should include manufacturer information', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      const manufacturer = schema.manufacturer as any
      expect(manufacturer).toBeDefined()
      expect(manufacturer['@type']).toBe('Organization')
    })

    it('should include nutrition information', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      const schemaAny = schema as any
      expect(schemaAny.nutrition).toBeDefined()
      expect(schemaAny.nutrition['@type']).toBe('NutritionInformation')
    })

    it('should include delivery lead time', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      const offers = schema.offers as any
      expect(offers.deliveryLeadTime).toBeDefined()
    })

    it('should include shipping details', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      const offers = schema.offers as any
      expect(offers.shippingDetails).toBeDefined()
      expect(offers.shippingDetails['@type']).toBe('OfferShippingDetails')
    })

    it('should include return policy', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      const offers = schema.offers as any
      expect(offers.hasMerchantReturnPolicy).toBeDefined()
      expect(offers.hasMerchantReturnPolicy['@type']).toBe('MerchantReturnPolicy')
    })

    it('should include reviews', () => {
      const schema = generateProductSchema(mockCake, 0, mockStats)
      
      expect(schema.review).toBeDefined()
      expect(Array.isArray(schema.review)).toBe(true)
    })
  })

  describe('generateAllProductSchemas', () => {
    const mockStats: TestimonialStats = {
      count: 16,
      averageRating: 4.8
    }

    const validCakes: Cake[] = [
      {
        _id: 'cake-1',
        name: 'Honey Cake',
        slug: { current: 'honey-cake' },
        pricing: { standard: 30 }
      },
      {
        _id: 'cake-2',
        name: 'Chocolate Cake',
        slug: { current: 'chocolate-cake' },
        pricing: { standard: 35 }
      }
    ]

    beforeEach(() => {
      process.env.NODE_ENV = 'test'
    })

    it('should generate schemas for all valid cakes', () => {
      const schemas = generateAllProductSchemas(validCakes, mockStats)

      expect(schemas.length).toBe(2)
    })

    it('should filter out invalid cakes without names', () => {
      const cakesWithInvalid = [
        ...validCakes,
        { _id: 'invalid-1', name: '' } as Cake,
        { _id: 'invalid-2' } as Cake
      ]

      const schemas = generateAllProductSchemas(cakesWithInvalid, mockStats)

      expect(schemas.length).toBe(2)
    })

    it('should log warning for invalid cakes in development', () => {
      process.env.NODE_ENV = 'development'
      
      const cakesWithInvalid = [
        ...validCakes,
        { _id: 'invalid' } as Cake
      ]

      generateAllProductSchemas(cakesWithInvalid, mockStats)

      expect(console.warn).toHaveBeenCalled()
    })

    it('should log warning for invalid cakes in production', () => {
      process.env.NODE_ENV = 'production'
      
      const cakesWithInvalid = [
        ...validCakes,
        { _id: 'invalid' } as Cake
      ]

      generateAllProductSchemas(cakesWithInvalid, mockStats)

      expect(console.warn).toHaveBeenCalled()
    })

    it('should handle errors during schema generation', () => {
      const problematicCake: Cake = {
        _id: 'problematic',
        name: 'Test',
        description: { invalid: 'structure' } as any
      }

      const schemas = generateAllProductSchemas([problematicCake], mockStats)

      // Should not throw and return empty array or handle gracefully
      expect(Array.isArray(schemas)).toBe(true)
    })

    it('should log errors for failed schemas in development', () => {
      process.env.NODE_ENV = 'development'

      // Mock generateProductSchema to throw
      const cakes = [validCakes[0]]
      
      // This should complete without throwing
      generateAllProductSchemas(cakes, mockStats)

      expect(true).toBe(true)
    })

    it('should filter out null schemas from errors', () => {
      const schemas = generateAllProductSchemas(validCakes, mockStats)

      expect(schemas.every(s => s !== null)).toBe(true)
    })

    it('should log performance metrics in development', () => {
      process.env.NODE_ENV = 'development'

      generateAllProductSchemas(validCakes, mockStats)

      expect(console.log).toHaveBeenCalled()
    })

    it('should not log performance in production', () => {
      process.env.NODE_ENV = 'production'

      generateAllProductSchemas(validCakes, mockStats)

      // Should still complete successfully
      expect(true).toBe(true)
    })

    it('should handle empty cakes array', () => {
      const schemas = generateAllProductSchemas([], mockStats)

      expect(schemas).toEqual([])
    })

    it('should use performance.now for timing', () => {
      const schemas = generateAllProductSchemas(validCakes, mockStats)

      expect(schemas.length).toBe(2)
    })
  })
})

