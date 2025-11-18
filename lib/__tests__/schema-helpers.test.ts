/**
 * @jest-environment jsdom
 */

import { generatePageProductSchemas, generatePageProductSchemaScripts, PageProductConfig } from '../schema-helpers'
import { validateProductHasRequiredFields } from '../schema-validation'

describe('schema-helpers', () => {
  const mockProducts: PageProductConfig[] = [
    {
      name: 'Test Product 1',
      description: 'Test description for product 1',
      image: 'https://example.com/image1.jpg',
      price: 25,
      category: 'Test Category',
    },
    {
      name: 'Test Product 2',
      description: 'Test description for product 2',
      image: 'https://example.com/image2.jpg',
      price: 50,
      currency: 'GBP',
      category: 'Another Category',
    },
  ]

  describe('generatePageProductSchemas', () => {
    it('should generate product schemas for all products', () => {
      const schemas = generatePageProductSchemas(mockProducts, 'test-page')

      expect(schemas).toHaveLength(2)
      expect(schemas[0]).toBeDefined()
      expect(schemas[1]).toBeDefined()
    })

    it('should include required fields (offers, review, aggregateRating)', () => {
      const schemas = generatePageProductSchemas(mockProducts, 'test-page')

      schemas.forEach((schema) => {
        const validation = validateProductHasRequiredFields(schema)
        expect(validation.isValid).toBe(true)
        expect(validation.errors).toHaveLength(0)

        // Verify all required fields are present
        expect(schema.offers).toBeDefined()
        expect(schema.review).toBeDefined()
        expect(schema.aggregateRating).toBeDefined()
      })
    })

    it('should use correct page URL', () => {
      const schemas = generatePageProductSchemas(mockProducts, 'test-page')

      schemas.forEach((schema) => {
        expect(schema.url).toBe('https://olgishcakes.co.uk/test-page')
        expect(schema['@id']).toContain('test-page')
      })
    })

    it('should use default currency when not provided', () => {
      const schemas = generatePageProductSchemas(mockProducts, 'test-page')

      schemas.forEach((schema) => {
        if (schema.offers && typeof schema.offers === 'object' && 'priceCurrency' in schema.offers) {
          expect(schema.offers.priceCurrency).toBe('GBP')
        }
      })
    })

    it('should use custom base URL when provided', () => {
      const customBaseUrl = 'https://custom-domain.com'
      const schemas = generatePageProductSchemas(mockProducts, 'test-page', customBaseUrl)

      schemas.forEach((schema) => {
        expect(schema.url).toBe(`${customBaseUrl}/test-page`)
      })
    })
  })

  describe('generatePageProductSchemaScripts', () => {
    it('should generate scripts with unique IDs', () => {
      const scripts = generatePageProductSchemaScripts(mockProducts, 'test-page')

      expect(scripts).toHaveLength(2)
      expect(scripts[0].id).toBe('test-product-1-product-schema')
      expect(scripts[1].id).toBe('test-product-2-product-schema')
    })

    it('should include schema in each script object', () => {
      const scripts = generatePageProductSchemaScripts(mockProducts, 'test-page')

      scripts.forEach((script) => {
        expect(script.schema).toBeDefined()
        expect(script.schema['@type']).toBe('Product')
        expect(script.schema['@context']).toBe('https://schema.org')
      })
    })

    it('should generate clean IDs from product names', () => {
      const productsWithSpecialChars: PageProductConfig[] = [
        {
          name: 'Product & Co. (Special)',
          description: 'Test',
          image: 'https://example.com/image.jpg',
          price: 25,
        },
      ]

      const scripts = generatePageProductSchemaScripts(productsWithSpecialChars, 'test-page')

      expect(scripts[0].id).toBe('product-co-special-product-schema')
    })

    it('should handle empty product name gracefully', () => {
      const productsWithEmptyName: PageProductConfig[] = [
        {
          name: '',
          description: 'Test',
          image: 'https://example.com/image.jpg',
          price: 25,
        },
      ]

      const scripts = generatePageProductSchemaScripts(productsWithEmptyName, 'test-page')

      expect(scripts[0].id).toBe('product-0-product-schema')
    })
  })

  describe('Google Search Console compliance', () => {
    it('should ensure all generated schemas have at least one required field', () => {
      const schemas = generatePageProductSchemas(mockProducts, 'test-page')

      schemas.forEach((schema) => {
        const hasOffers = schema.offers !== undefined && schema.offers !== null
        const hasReview = schema.review !== undefined && schema.review !== null
        const hasAggregateRating = schema.aggregateRating !== undefined && schema.aggregateRating !== null

        expect(hasOffers || hasReview || hasAggregateRating).toBe(true)
      })
    })

    it('should pass validateProductHasRequiredFields for all schemas', () => {
      const schemas = generatePageProductSchemas(mockProducts, 'test-page')

      schemas.forEach((schema) => {
        const validation = validateProductHasRequiredFields(schema)
        expect(validation.isValid).toBe(true)
      })
    })
  })
})

