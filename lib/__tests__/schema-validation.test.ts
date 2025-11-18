import { Product, Review, WithContext } from 'schema-dts'
import {
  batchValidateProductSchemas,
  validateMPNUniqueness,
  validateProductSchema,
  validateReviewSchema
} from '../schema-validation'

describe('schema-validation', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { })
    jest.spyOn(console, 'warn').mockImplementation(() => { })
    jest.spyOn(console, 'error').mockImplementation(() => { })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('validateProductSchema', () => {
    const validSchema: WithContext<Product> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test Cake',
      description: 'A delicious test cake with authentic flavors',
      sku: 'OC-TEST-CAKE-001',
      mpn: 'TEST-CAKE-35-001',
      brand: {
        '@type': 'Brand',
        name: 'Olgish Cakes'
      },
      image: ['https://example.com/image.jpg'],
      offers: {
        '@type': 'Offer',
        price: '35',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    }

    it('should validate a correct schema', () => {
      const result = validateProductSchema(validSchema)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    describe('Name Validation', () => {
      it('should detect missing product name', () => {
        const invalid = { ...validSchema, name: '' }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid product name')
      })

      it('should detect undefined product name', () => {
        const invalid = { ...validSchema, name: undefined }
        const result = validateProductSchema(invalid as any)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid product name')
      })

      it('should detect non-string product name', () => {
        const invalid = { ...validSchema, name: 123 as any }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid product name')
      })

      it('should detect product name too short', () => {
        const invalid = { ...validSchema, name: 'AB' }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Product name too short (minimum 3 characters)')
      })

      it('should accept name with exactly 3 characters', () => {
        const valid = { ...validSchema, name: 'ABC' }
        const result = validateProductSchema(valid)
        expect(result.errors.some(e => e.includes('too short'))).toBe(false)
      })

      it('should detect product name too long', () => {
        const invalid = { ...validSchema, name: 'A'.repeat(151) }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Product name too long (maximum 150 characters)')
      })

      it('should accept name with exactly 150 characters', () => {
        const valid = { ...validSchema, name: 'A'.repeat(150) }
        const result = validateProductSchema(valid)
        expect(result.errors.some(e => e.includes('too long'))).toBe(false)
      })
    })

    describe('Description Validation', () => {
      it('should detect missing description', () => {
        const invalid = { ...validSchema, description: '' }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid product description')
      })

      it('should detect undefined description', () => {
        const invalid = { ...validSchema, description: undefined }
        const result = validateProductSchema(invalid as any)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid product description')
      })

      it('should detect non-string description', () => {
        const invalid = { ...validSchema, description: 123 as any }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid product description')
      })

      it('should detect description too short', () => {
        const invalid = { ...validSchema, description: 'Short' }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Description too short (minimum 10 characters)')
      })

      it('should accept description with exactly 10 characters', () => {
        const valid = { ...validSchema, description: '1234567890' }
        const result = validateProductSchema(valid)
        expect(result.errors.some(e => e.includes('too short'))).toBe(false)
      })

      it('should detect description too long', () => {
        const invalid = { ...validSchema, description: 'A'.repeat(5001) }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Description too long (maximum 5000 characters)')
      })

      it('should accept description with exactly 5000 characters', () => {
        const valid = { ...validSchema, description: 'A'.repeat(5000) }
        const result = validateProductSchema(valid)
        expect(result.errors.some(e => e.includes('too long'))).toBe(false)
      })
    })

    describe('Image Validation', () => {
      it('should detect missing image', () => {
        const invalid = { ...validSchema, image: undefined }
        const result = validateProductSchema(invalid as any)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing product image')
      })

      it('should detect empty image array', () => {
        const invalid = { ...validSchema, image: [] }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing product image')
      })

      it('should accept single image', () => {
        const result = validateProductSchema(validSchema)
        expect(result.errors.some(e => e.includes('image'))).toBe(false)
      })

      it('should accept multiple images', () => {
        const valid = {
          ...validSchema,
          image: ['image1.jpg', 'image2.jpg', 'image3.jpg']
        }
        const result = validateProductSchema(valid)
        expect(result.errors.some(e => e.includes('image'))).toBe(false)
      })
    })

    describe('Offers Validation', () => {
      it('should detect missing offers', () => {
        const invalid = { ...validSchema, offers: undefined }
        const result = validateProductSchema(invalid as any)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing offers object')
      })

      it('should detect missing price', () => {
        const invalid = {
          ...validSchema,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'GBP',
            availability: 'InStock'
          } as any
        }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid offer price (must be a number)')
      })

      it('should accept numeric price (preferred for Google Merchant Center)', () => {
        const valid = {
          ...validSchema,
          offers: {
            '@type': 'Offer',
            price: 35, // Number is now the preferred type
            priceCurrency: 'GBP',
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2026-01-01'
          }
        }
        const result = validateProductSchema(valid as any)
        expect(result.isValid).toBe(true)
        expect(result.errors).not.toContain('Missing or invalid offer price')
      })

      it('should detect NaN price', () => {
        const invalid = {
          ...validSchema,
          offers: {
            '@type': 'Offer',
            price: 'not-a-number',
            priceCurrency: 'GBP',
            availability: 'InStock',
            priceValidUntil: '2026-01-01'
          }
        }
        const result = validateProductSchema(invalid as any)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid offer price (must be a number)')
      })

      it('should detect zero price', () => {
        const invalid = {
          ...validSchema,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'GBP',
            availability: 'InStock',
            priceValidUntil: '2026-01-01'
          }
        }
        const result = validateProductSchema(invalid as any)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Price must be greater than zero')
      })

      it('should detect missing priceCurrency', () => {
        const invalid = {
          ...validSchema,
          offers: {
            '@type': 'Offer',
            price: '35',
            availability: 'InStock',
            priceValidUntil: '2026-01-01'
          } as any
        }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid priceCurrency (must be GBP)')
      })

      it('should detect wrong priceCurrency', () => {
        const invalid = {
          ...validSchema,
          offers: {
            '@type': 'Offer',
            price: '35',
            priceCurrency: 'USD',
            availability: 'InStock',
            priceValidUntil: '2026-01-01'
          }
        }
        const result = validateProductSchema(invalid as any)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid priceCurrency (must be GBP)')
      })

      it('should detect missing availability', () => {
        const invalid = {
          ...validSchema,
          offers: {
            '@type': 'Offer',
            price: '35',
            priceCurrency: 'GBP',
            priceValidUntil: '2026-01-01'
          } as any
        }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing offer availability')
      })

      it('should detect missing priceValidUntil', () => {
        const invalid = {
          ...validSchema,
          offers: {
            '@type': 'Offer',
            price: '35',
            priceCurrency: 'GBP',
            availability: 'InStock'
          } as any
        }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing priceValidUntil date')
      })

      it('should detect invalid priceValidUntil format', () => {
        const invalid = {
          ...validSchema,
          offers: {
            '@type': 'Offer',
            price: '35',
            priceCurrency: 'GBP',
            availability: 'InStock',
            priceValidUntil: '01/01/2026'
          }
        }
        const result = validateProductSchema(invalid as any)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('priceValidUntil must be in YYYY-MM-DD format')
      })
    })

    describe('SKU Validation', () => {
      it('should detect missing SKU', () => {
        const invalid = { ...validSchema, sku: undefined }
        const result = validateProductSchema(invalid as any)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid SKU')
      })

      it('should detect non-string SKU', () => {
        const invalid = { ...validSchema, sku: 123 as any }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid SKU')
      })

      it('should detect invalid SKU prefix', () => {
        const invalid = { ...validSchema, sku: 'WRONG-PREFIX-001' }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.includes('OC-'))).toBe(true)
      })

      it('should detect SKU with too few parts', () => {
        const invalid = { ...validSchema, sku: 'OC-001' }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('SKU format invalid (expected: OC-PRODUCTNAME-001)')
      })

      it('should detect SKU without numeric ending', () => {
        const invalid = { ...validSchema, sku: 'OC-TEST-ABC' }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.includes('3 digits'))).toBe(true)
      })

      it('should detect SKU with wrong number length', () => {
        const invalid = { ...validSchema, sku: 'OC-TEST-1' }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.includes('3 digits'))).toBe(true)
      })

      it('should detect SKU too long', () => {
        const invalid = { ...validSchema, sku: 'OC-' + 'A'.repeat(50) }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('SKU too long (maximum 50 characters)')
      })
    })

    describe('MPN Validation', () => {
      it('should detect missing MPN', () => {
        const invalid = { ...validSchema, mpn: undefined }
        const result = validateProductSchema(invalid as any)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid MPN')
      })

      it('should detect non-string MPN', () => {
        const invalid = { ...validSchema, mpn: 123 as any }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing or invalid MPN')
      })

      it('should detect MPN too short', () => {
        const invalid = { ...validSchema, mpn: 'AB' }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('MPN too short (minimum 3 characters)')
      })

      it('should accept MPN with exactly 3 characters', () => {
        const valid = { ...validSchema, mpn: 'ABC' }
        const result = validateProductSchema(valid)
        expect(result.errors.some(e => e.includes('MPN too short'))).toBe(false)
      })

      it('should detect MPN too long', () => {
        const invalid = { ...validSchema, mpn: 'A'.repeat(71) }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('MPN too long (maximum 70 characters for Google Merchant Center)')
      })

      it('should accept MPN with exactly 70 characters', () => {
        const valid = { ...validSchema, mpn: 'A'.repeat(70) }
        const result = validateProductSchema(valid)
        expect(result.errors.some(e => e.includes('MPN too long'))).toBe(false)
      })
    })

    describe('Brand Validation', () => {
      it('should detect missing brand', () => {
        const invalid = { ...validSchema, brand: undefined }
        const result = validateProductSchema(invalid as any)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing brand information')
      })

      it('should detect non-object brand', () => {
        const invalid = { ...validSchema, brand: 'Brand Name' as any }
        const result = validateProductSchema(invalid)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing brand information')
      })
    })

    describe('Aggregate Rating Validation', () => {
      it('should validate schema with valid aggregateRating', () => {
        const schemaWithRating = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            reviewCount: '10'
          }
        }
        const result = validateProductSchema(schemaWithRating as any)
        expect(result.errors.some(e => e.includes('rating'))).toBe(false)
      })

      it('should detect missing ratingValue', () => {
        const invalid = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            reviewCount: '10'
          }
        }
        const result = validateProductSchema(invalid as any)
        expect(result.errors).toContain('Missing ratingValue in aggregateRating')
      })

      it('should detect rating value too low', () => {
        const invalid = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '0',
            reviewCount: '10'
          }
        }
        const result = validateProductSchema(invalid as any)
        expect(result.errors).toContain('ratingValue must be between 1 and 5')
      })

      it('should detect rating value too high', () => {
        const invalid = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '6',
            reviewCount: '10'
          }
        }
        const result = validateProductSchema(invalid as any)
        expect(result.errors).toContain('ratingValue must be between 1 and 5')
      })

      it('should accept rating value of 1', () => {
        const valid = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '1',
            reviewCount: '10'
          }
        }
        const result = validateProductSchema(valid as any)
        expect(result.errors.some(e => e.includes('between 1 and 5'))).toBe(false)
      })

      it('should accept rating value of 5', () => {
        const valid = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5',
            reviewCount: '10'
          }
        }
        const result = validateProductSchema(valid as any)
        expect(result.errors.some(e => e.includes('between 1 and 5'))).toBe(false)
      })

      it('should handle numeric ratingValue', () => {
        const schemaWithNumericRating = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: 4.5,
            reviewCount: '10'
          }
        }
        const result = validateProductSchema(schemaWithNumericRating as any)
        expect(result.errors.some(e => e.includes('between 1 and 5'))).toBe(false)
      })

      it('should detect NaN ratingValue', () => {
        const invalid = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: 'not-a-number',
            reviewCount: '10'
          }
        }
        const result = validateProductSchema(invalid as any)
        expect(result.errors).toContain('ratingValue must be between 1 and 5')
      })

      it('should detect missing reviewCount', () => {
        const invalid = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5'
          }
        }
        const result = validateProductSchema(invalid as any)
        expect(result.errors).toContain('Missing reviewCount in aggregateRating')
      })

      it('should detect negative reviewCount', () => {
        const invalid = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            reviewCount: '-5'
          }
        }
        const result = validateProductSchema(invalid as any)
        expect(result.errors).toContain('reviewCount must be a positive number')
      })

      it('should accept zero reviewCount', () => {
        const valid = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            reviewCount: '0'
          }
        }
        const result = validateProductSchema(valid as any)
        expect(result.errors.some(e => e.includes('reviewCount must be a positive'))).toBe(false)
      })

      it('should handle numeric reviewCount', () => {
        const schemaWithNumericCount = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            reviewCount: 10
          }
        }
        const result = validateProductSchema(schemaWithNumericCount as any)
        expect(result.errors.some(e => e.includes('reviewCount'))).toBe(false)
      })

      it('should detect NaN reviewCount', () => {
        const invalid = {
          ...validSchema,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            reviewCount: 'not-a-number'
          }
        }
        const result = validateProductSchema(invalid as any)
        expect(result.errors).toContain('reviewCount must be a positive number')
      })

      it('should skip rating validation when aggregateRating missing', () => {
        const schemaWithoutRating = { ...validSchema, aggregateRating: undefined }
        const result = validateProductSchema(schemaWithoutRating as any)
        expect(result.errors.some(e => e.includes('rating'))).toBe(false)
      })

      it('should skip rating validation when not an object', () => {
        const invalid = { ...validSchema, aggregateRating: 'not an object' as any }
        const result = validateProductSchema(invalid)
        expect(result.errors.some(e => e.includes('rating'))).toBe(false)
      })

      it('should skip rating validation when missing @type', () => {
        const invalid = {
          ...validSchema,
          aggregateRating: {
            ratingValue: '4.5',
            reviewCount: '10'
          }
        }
        const result = validateProductSchema(invalid as any)
        expect(result.errors.some(e => e.includes('rating'))).toBe(false)
      })
    })

    describe('Multiple Errors', () => {
      it('should return all validation errors', () => {
        const invalid = {
          ...validSchema,
          name: 'AB',
          description: 'Short',
          sku: 'INVALID',
          mpn: 'AB'
        }
        const result = validateProductSchema(invalid)

        expect(result.errors.length).toBeGreaterThanOrEqual(4)
      })
    })
  })

  describe('validateMPNUniqueness', () => {
    it('should pass with unique MPNs', () => {
      const schemas: WithContext<Product>[] = [
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-001' } as any,
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-002' } as any,
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-003' } as any
      ]

      const result = validateMPNUniqueness(schemas)
      expect(result.isValid).toBe(true)
      expect(result.duplicates).toHaveLength(0)
    })

    it('should detect duplicate MPNs', () => {
      const schemas: WithContext<Product>[] = [
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-001' } as any,
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-002' } as any,
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-001' } as any
      ]

      const result = validateMPNUniqueness(schemas)
      expect(result.isValid).toBe(false)
      expect(result.duplicates).toContain('MPN-001')
    })

    it('should detect multiple duplicates', () => {
      const schemas: WithContext<Product>[] = [
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-001' } as any,
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-001' } as any,
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-002' } as any,
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-002' } as any
      ]

      const result = validateMPNUniqueness(schemas)
      expect(result.isValid).toBe(false)
      expect(result.duplicates).toContain('MPN-001')
      expect(result.duplicates).toContain('MPN-002')
    })

    it('should handle schemas without MPNs', () => {
      const schemas: WithContext<Product>[] = [
        { '@context': 'https://schema.org', '@type': 'Product' } as any,
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-001' } as any
      ]

      const result = validateMPNUniqueness(schemas)
      expect(result.isValid).toBe(true)
    })

    it('should ignore non-string MPNs', () => {
      const schemas: WithContext<Product>[] = [
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 123 as any } as any,
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'MPN-001' } as any
      ]

      const result = validateMPNUniqueness(schemas)
      expect(result.isValid).toBe(true)
    })

    it('should handle empty schemas array', () => {
      const result = validateMPNUniqueness([])

      expect(result.isValid).toBe(true)
      expect(result.duplicates).toEqual([])
    })

    it('should handle three or more of same MPN', () => {
      const schemas: WithContext<Product>[] = [
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'DUP' } as any,
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'DUP' } as any,
        { '@context': 'https://schema.org', '@type': 'Product', mpn: 'DUP' } as any
      ]

      const result = validateMPNUniqueness(schemas)
      expect(result.isValid).toBe(false)
      expect(result.duplicates).toContain('DUP')
      expect(result.duplicates.filter(d => d === 'DUP').length).toBe(1)
    })
  })

  describe('validateReviewSchema', () => {
    const validReview: WithContext<Review> = {
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: 'John Doe'
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
        worstRating: '1'
      },
      reviewBody: 'Excellent cake!',
      datePublished: '2025-10-15'
    }

    it('should validate a correct review schema', () => {
      const result = validateReviewSchema(validReview)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing author', () => {
      const invalid = { ...validReview, author: undefined }
      const result = validateReviewSchema(invalid as any)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing review author')
    })

    it('should detect non-object author', () => {
      const invalid = { ...validReview, author: 'John Doe' as any }
      const result = validateReviewSchema(invalid)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing review author')
    })

    it('should detect missing reviewRating', () => {
      const invalid = { ...validReview, reviewRating: undefined }
      const result = validateReviewSchema(invalid as any)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing reviewRating')
    })

    it('should detect non-object reviewRating', () => {
      const invalid = { ...validReview, reviewRating: '5' as any }
      const result = validateReviewSchema(invalid)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing reviewRating')
    })

    it('should detect missing review body', () => {
      const invalid = { ...validReview, reviewBody: '' }
      const result = validateReviewSchema(invalid)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing or invalid reviewBody')
    })

    it('should detect undefined review body', () => {
      const invalid = { ...validReview, reviewBody: undefined }
      const result = validateReviewSchema(invalid as any)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing or invalid reviewBody')
    })

    it('should detect non-string review body', () => {
      const invalid = { ...validReview, reviewBody: 123 as any }
      const result = validateReviewSchema(invalid)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing or invalid reviewBody')
    })

    it('should detect missing datePublished', () => {
      const invalid = { ...validReview, datePublished: undefined }
      const result = validateReviewSchema(invalid as any)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing datePublished')
    })

    it('should detect invalid date format', () => {
      const invalid = { ...validReview, datePublished: '15/10/2025' }
      const result = validateReviewSchema(invalid)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid datePublished format (should be YYYY-MM-DD)')
    })

    it('should accept valid date format', () => {
      const result = validateReviewSchema(validReview)
      expect(result.errors.some(e => e.includes('date'))).toBe(false)
    })

    it('should return multiple errors', () => {
      const invalid = {
        ...validReview,
        author: undefined,
        reviewBody: '',
        datePublished: 'invalid'
      }
      const result = validateReviewSchema(invalid as any)

      expect(result.errors.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('batchValidateProductSchemas', () => {
    const validSchema: WithContext<Product> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test Cake',
      description: 'A delicious test cake',
      sku: 'OC-TEST-001',
      mpn: 'TEST-001',
      brand: { '@type': 'Brand', name: 'Test' },
      image: ['test.jpg'],
      offers: {
        '@type': 'Offer',
        price: '35',
        priceCurrency: 'GBP',
        availability: 'InStock',
        priceValidUntil: '2026-12-31'
      }
    }

    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true })
    })

    it('should return count of valid schemas', () => {
      const count = batchValidateProductSchemas([validSchema], false)

      expect(count).toBe(1)
    })

    it('should count multiple valid schemas', () => {
      const schemas = [validSchema, { ...validSchema, name: 'Different Cake', sku: 'OC-DIFF-001', mpn: 'DIFF-001' }]
      const count = batchValidateProductSchemas(schemas, false)

      expect(count).toBe(2)
    })

    it('should not count invalid schemas', () => {
      const invalidSchema = { ...validSchema, name: 'AB' }
      const count = batchValidateProductSchemas([validSchema, invalidSchema], false)

      expect(count).toBe(1)
    })

    it('should log errors in development by default', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true })

      const invalidSchema = { ...validSchema, name: 'AB' }
      batchValidateProductSchemas([invalidSchema])

      expect(console.error).toHaveBeenCalled()
    })

    it('should not log errors in production by default', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })

      const invalidSchema = { ...validSchema, name: 'AB' }
      batchValidateProductSchemas([invalidSchema])

      expect(console.error).not.toHaveBeenCalled()
    })

    it('should respect logErrors parameter', () => {
      const invalidSchema = { ...validSchema, name: 'AB' }
      batchValidateProductSchemas([invalidSchema], true)

      expect(console.error).toHaveBeenCalled()
    })

    it('should not log when logErrors is false', () => {
      const invalidSchema = { ...validSchema, name: 'AB' }
      batchValidateProductSchemas([invalidSchema], false)

      expect(console.error).not.toHaveBeenCalled()
    })

    it('should check MPN uniqueness', () => {
      const duplicateSchemas = [
        validSchema,
        { ...validSchema, name: 'Different' }
      ]
      batchValidateProductSchemas(duplicateSchemas, true)

      expect(console.warn).toHaveBeenCalledWith(
        '[Schema Validation] Duplicate MPNs found:',
        expect.arrayContaining(['TEST-001'])
      )
    })

    it('should not warn for unique MPNs', () => {
      const uniqueSchemas = [
        validSchema,
        { ...validSchema, mpn: 'UNIQUE-001' }
      ]
      batchValidateProductSchemas(uniqueSchemas, true)

      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('Duplicate MPNs'),
        expect.anything()
      )
    })

    it('should log summary', () => {
      batchValidateProductSchemas([validSchema], true)

      expect(console.warn).toHaveBeenCalledWith('[Schema Validation] 1/1 schemas are valid')
    })

    it('should handle empty schemas array', () => {
      const count = batchValidateProductSchemas([], false)

      expect(count).toBe(0)
    })

    it('should handle all invalid schemas', () => {
      const invalidSchemas = [
        { ...validSchema, name: 'A' },
        { ...validSchema, name: 'B' }
      ]
      const count = batchValidateProductSchemas(invalidSchemas, false)

      expect(count).toBe(0)
    })

    it('should include schema name in error log', () => {
      const invalidSchema = { ...validSchema, name: 'Test Invalid', sku: 'BAD' }
      batchValidateProductSchemas([invalidSchema], true)

      expect(console.error).toHaveBeenCalled()
    })

    it('should handle schema with non-string name', () => {
      const invalidSchema = { ...validSchema, name: 123 as any }
      batchValidateProductSchemas([invalidSchema], true)

      expect(console.error).toHaveBeenCalled()
    })
  })
})

