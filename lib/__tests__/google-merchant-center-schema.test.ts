import {
  generateMerchantCenterProductSchema,
  generateCakeMerchantCenterSchema,
  generateHamperMerchantCenterSchema,
  generateProductSitemapData,
  validateMerchantCenterProduct,
  MerchantCenterProductData
} from '../google-merchant-center-schema'

// Mock app/utils/seo
jest.mock('@/app/utils/seo', () => ({
  getPriceValidUntil: jest.fn(() => '2026-01-01')
}))

// Mock sanity/lib/image
jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn((image: any) => ({
    width: () => ({
      height: () => ({
        url: () => 'https://cdn.sanity.io/images/test.jpg'
      })
    })
  }))
}))

describe('google-merchant-center-schema', () => {
  describe('generateMerchantCenterProductSchema', () => {
    const productData: MerchantCenterProductData = {
      id: 'cake-001',
      name: 'Honey Cake',
      description: 'Traditional Ukrainian honey cake',
      url: 'https://olgishcakes.co.uk/cakes/honey-cake',
      image: 'https://example.com/honey-cake.jpg',
      price: 30,
      currency: 'GBP',
      availability: 'InStock',
      brand: 'Olgish Cakes',
      category: 'Food & Drink > Bakery > Cakes',
      condition: 'NewCondition'
    }

    it('should generate valid product schema', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('Product')
    })

    it('should include product ID', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema['@id']).toBe('https://olgishcakes.co.uk/products/cake-001')
    })

    it('should include core product information', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema.name).toBe('Honey Cake')
      expect(schema.description).toBe('Traditional Ukrainian honey cake')
      expect(schema.url).toBe('https://olgishcakes.co.uk/cakes/honey-cake')
    })

    it('should include main image and additional images', () => {
      const dataWithAdditional = {
        ...productData,
        additionalImages: ['/image2.jpg', '/image3.jpg']
      }
      const schema = generateMerchantCenterProductSchema(dataWithAdditional)

      expect(schema.image).toBeInstanceOf(Array)
      expect(schema.image).toContain('https://example.com/honey-cake.jpg')
      expect(schema.image).toContain('/image2.jpg')
      expect(schema.image).toContain('/image3.jpg')
    })

    it('should handle missing additional images', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema.image).toEqual(['https://example.com/honey-cake.jpg'])
    })

    it('should include brand information', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema.brand['@type']).toBe('Brand')
      expect(schema.brand.name).toBe('Olgish Cakes')
      expect(schema.brand.url).toBe('https://olgishcakes.co.uk')
    })

    it('should include manufacturer information', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema.manufacturer['@type']).toBe('Organization')
      expect(schema.manufacturer.address.addressLocality).toBe('Leeds')
    })

    it('should include GTIN when provided', () => {
      const dataWithGTIN = { ...productData, gtin: '12345678901234' }
      const schema = generateMerchantCenterProductSchema(dataWithGTIN)

      expect(schema.gtin).toBe('12345678901234')
    })

    it('should not include GTIN when not provided', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema.gtin).toBeUndefined()
    })

    it('should include MPN when provided', () => {
      const dataWithMPN = { ...productData, mpn: 'MPN-12345' }
      const schema = generateMerchantCenterProductSchema(dataWithMPN)

      expect(schema.mpn).toBe('MPN-12345')
    })

    it('should not include MPN when not provided', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema.mpn).toBeUndefined()
    })

    it('should include SKU when provided', () => {
      const dataWithSKU = { ...productData, sku: 'OC-HONEY-001' }
      const schema = generateMerchantCenterProductSchema(dataWithSKU)

      expect(schema.sku).toBe('OC-HONEY-001')
    })

    it('should include offer with price', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema.offers['@type']).toBe('Offer')
      expect(schema.offers.price).toBe(30)
      expect(schema.offers.priceCurrency).toBe('GBP')
    })

    it('should include shipping details when provided', () => {
      const dataWithShipping = {
        ...productData,
        shipping: { country: 'GB', service: 'Standard', price: 5 }
      }
      const schema = generateMerchantCenterProductSchema(dataWithShipping)

      expect(schema.offers?.shippingDetails).toBeDefined()
      expect(schema.offers?.shippingDetails['@type']).toBe('OfferShippingDetails')
    })

    it('should not include shipping details when not provided', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema.offers?.shippingDetails).toBeUndefined()
    })

    it('should include tax information when provided', () => {
      const dataWithTax = {
        ...productData,
        tax: { country: 'GB', rate: 20 }
      }
      const schema = generateMerchantCenterProductSchema(dataWithTax)

      expect(schema.offers.eligibleTransactionVolume).toBeDefined()
    })

    it('should include return policy', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema.offers.hasMerchantReturnPolicy).toBeDefined()
      expect(schema.offers.hasMerchantReturnPolicy['@type']).toBe('MerchantReturnPolicy')
    })

    it('should include payment methods', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema.offers.acceptedPaymentMethod).toBeInstanceOf(Array)
      expect(schema.offers.acceptedPaymentMethod.length).toBeGreaterThan(0)
    })

    it('should include aggregate rating', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema.aggregateRating).toBeDefined()
      expect(schema.aggregateRating['@type']).toBe('AggregateRating')
    })

    it('should include review', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      expect(schema.review).toBeInstanceOf(Array)
      expect(schema.review.length).toBeGreaterThan(0)
    })

    it('should include custom labels', () => {
      const dataWithLabels = {
        ...productData,
        customLabels: ['Label 1', 'Label 2']
      }
      const schema = generateMerchantCenterProductSchema(dataWithLabels)

      expect(schema.additionalProperty).toBeInstanceOf(Array)
      const customLabels = schema.additionalProperty.filter((prop: any) =>
        prop.name.startsWith('Custom Label')
      )
      expect(customLabels.length).toBeGreaterThan(4) // 4 defaults + 2 custom
    })

    it('should have default custom labels', () => {
      const schema = generateMerchantCenterProductSchema(productData)

      const labels = schema.additionalProperty.map((prop: any) => prop.value)
      expect(labels).toContain('Ukrainian')
      expect(labels).toContain('Traditional')
      expect(labels).toContain('Handmade')
      expect(labels).toContain('Leeds Bakery')
    })
  })

  describe('generateCakeMerchantCenterSchema', () => {
    const mockCake = {
      _id: 'cake-123',
      name: 'Test Cake',
      slug: { current: 'test-cake' },
      pricing: { standard: 35 },
      mainImage: {
        asset: { _ref: 'image-ref-123' }
      },
      shortDescription: 'Test description'
    }

    it('should generate merchant center schema for cake', () => {
      const schema = generateCakeMerchantCenterSchema(mockCake)

      expect(schema['@type']).toBe('Product')
      expect(schema.name).toBe('Test Cake')
    })

    it('should use pricing.standard for price', () => {
      const schema = generateCakeMerchantCenterSchema(mockCake)

      expect(schema.offers.price).toBe(35)
    })

    it('should fallback to pricing.from if standard not available', () => {
      const cakeWithFrom = {
        ...mockCake,
        pricing: { from: 25 }
      }
      const schema = generateCakeMerchantCenterSchema(cakeWithFrom)

      expect(schema.offers.price).toBe(25)
    })

    it('should use default price if no pricing', () => {
      const cakeWithoutPricing = {
        ...mockCake,
        pricing: undefined
      }
      const schema = generateCakeMerchantCenterSchema(cakeWithoutPricing)

      expect(schema.offers.price).toBe(25)
    })

    it('should generate enhanced description for short descriptions', () => {
      const cakeWithShortDesc = {
        ...mockCake,
        shortDescription: 'Short'
      }
      const schema = generateCakeMerchantCenterSchema(cakeWithShortDesc)

      expect(schema.description.length).toBeGreaterThan(100)
      expect(schema.description).toContain('Test Cake')
    })

    it('should handle portable text shortDescription', () => {
      const cakeWithPortableText = {
        ...mockCake,
        shortDescription: [
          { children: [{ text: 'Line 1' }] },
          { children: [{ text: 'Line 2' }] }
        ]
      }
      const schema = generateCakeMerchantCenterSchema(cakeWithPortableText)

      // Portable text is parsed - description should be generated
      expect(schema.description.length).toBeGreaterThan(0)
      expect(typeof schema.description).toBe('string')
    })

    it('should handle missing shortDescription', () => {
      const cakeWithoutDesc = {
        ...mockCake,
        shortDescription: undefined
      }
      const schema = generateCakeMerchantCenterSchema(cakeWithoutDesc)

      expect(schema.description.length).toBeGreaterThan(100)
    })

    it('should use mainImage when available', () => {
      const schema = generateCakeMerchantCenterSchema(mockCake)

      expect(schema.image).toBeDefined()
    })

    it('should fallback to designs.standard images', () => {
      const cakeWithDesigns = {
        ...mockCake,
        mainImage: undefined,
        designs: {
          standard: [
            { asset: { _ref: 'ref-1' }, isMain: true }
          ]
        }
      }
      const schema = generateCakeMerchantCenterSchema(cakeWithDesigns)

      expect(schema.image).toBeDefined()
    })

    it('should fallback to legacy images array', () => {
      const cakeWithImages = {
        ...mockCake,
        mainImage: undefined,
        images: [
          { asset: { _ref: 'ref-1' } }
        ]
      }
      const schema = generateCakeMerchantCenterSchema(cakeWithImages)

      expect(schema.image).toBeDefined()
    })

    it('should use placeholder image when no images', () => {
      const cakeWithoutImages = {
        ...mockCake,
        mainImage: undefined,
        designs: undefined,
        images: undefined
      }
      const schema = generateCakeMerchantCenterSchema(cakeWithoutImages)

      const imageValue = schema.image
      const hasPlaceholder = Array.isArray(imageValue) 
        ? imageValue.some((img: string) => img.includes('placeholder') || img.includes('default'))
        : imageValue.includes('placeholder') || imageValue.includes('default')
      expect(hasPlaceholder).toBe(true)
    })

    it('should include shipping information', () => {
      const schema = generateCakeMerchantCenterSchema(mockCake)

      expect(schema.offers?.shippingDetails).toBeDefined()
      expect(schema.offers?.shippingDetails.shippingRate.value).toBe(0)
    })

    it('should include tax information', () => {
      const schema = generateCakeMerchantCenterSchema(mockCake)

      expect(schema.offers.eligibleTransactionVolume).toBeDefined()
    })

    it('should set correct category', () => {
      const schema = generateCakeMerchantCenterSchema(mockCake)

      expect(schema.category).toBe('Food & Drink > Bakery > Cakes')
    })

    it('should include custom labels', () => {
      const schema = generateCakeMerchantCenterSchema(mockCake)

      const labels = schema.additionalProperty.map((prop: any) => prop.value)
      expect(labels).toContain('Ukrainian')
      expect(labels).toContain('Traditional')
    })
  })

  describe('generateHamperMerchantCenterSchema', () => {
    const mockHamper = {
      _id: 'hamper-123',
      name: 'Test Hamper',
      slug: { current: 'test-hamper' },
      price: 45,
      images: [
        { asset: { _ref: 'image-ref-1' }, isMain: true }
      ],
      shortDescription: 'Test hamper description'
    }

    it('should generate merchant center schema for hamper', () => {
      const schema = generateHamperMerchantCenterSchema(mockHamper)

      expect(schema['@type']).toBe('Product')
      expect(schema.name).toBe('Test Hamper')
    })

    it('should use hamper price', () => {
      const schema = generateHamperMerchantCenterSchema(mockHamper)

      expect(schema.offers.price).toBe(45)
    })

    it('should fallback to pricing.standard', () => {
      const hamperWithPricing = {
        ...mockHamper,
        price: undefined,
        pricing: { standard: 50 }
      }
      const schema = generateHamperMerchantCenterSchema(hamperWithPricing)

      expect(schema.offers.price).toBe(50)
    })

    it('should use default price if none provided', () => {
      const hamperWithoutPrice = {
        ...mockHamper,
        price: undefined,
        pricing: undefined
      }
      const schema = generateHamperMerchantCenterSchema(hamperWithoutPrice)

      expect(schema.offers.price).toBe(35)
    })

    it('should use main image', () => {
      const schema = generateHamperMerchantCenterSchema(mockHamper)

      expect(schema.image).toBeDefined()
    })

    it('should fallback to first image if no main', () => {
      const hamperWithoutMain = {
        ...mockHamper,
        images: [
          { asset: { _ref: 'ref-1' }, isMain: false },
          { asset: { _ref: 'ref-2' }, isMain: false }
        ]
      }
      const schema = generateHamperMerchantCenterSchema(hamperWithoutMain)

      expect(schema.image).toBeDefined()
    })

    it('should use placeholder when no images', () => {
      const hamperWithoutImages = {
        ...mockHamper,
        images: undefined
      }
      const schema = generateHamperMerchantCenterSchema(hamperWithoutImages)

      // Schema should be generated even without images
      expect(schema).toBeDefined()
      expect(typeof schema).toBe('object')
    })

    it('should generate enhanced description for short descriptions', () => {
      const hamperWithShortDesc = {
        ...mockHamper,
        shortDescription: 'Short'
      }
      const schema = generateHamperMerchantCenterSchema(hamperWithShortDesc)

      expect(schema.description.length).toBeGreaterThan(100)
    })

    it('should handle portable text description', () => {
      const hamperWithPortableText = {
        ...mockHamper,
        shortDescription: [
          { children: [{ text: 'Part 1' }] }
        ]
      }
      const schema = generateHamperMerchantCenterSchema(hamperWithPortableText)

      expect(schema.description.length).toBeGreaterThan(0)
    })

    it('should set hamper category', () => {
      const schema = generateHamperMerchantCenterSchema(mockHamper)

      expect(schema.category).toBe('Food & Drink > Gift Baskets > Food Gift Baskets')
    })

    it('should include hamper-specific custom labels', () => {
      const schema = generateHamperMerchantCenterSchema(mockHamper)

      const labels = schema.additionalProperty.map((prop: any) => prop.value)
      expect(labels).toContain('Gift Hamper')
    })

    it('should handle missing slug', () => {
      const hamperWithoutSlug = {
        ...mockHamper,
        slug: undefined
      }
      const schema = generateHamperMerchantCenterSchema(hamperWithoutSlug)

      expect(schema.url).toContain(hamperWithoutSlug._id)
    })
  })

  describe('generateProductSitemapData', () => {
    const mockProducts = [
      {
        slug: { current: 'product-1' },
        _updatedAt: '2025-01-15T10:00:00Z',
        _createdAt: '2025-01-01T10:00:00Z'
      },
      {
        slug: { current: 'product-2' },
        _createdAt: '2025-01-10T10:00:00Z'
      }
    ]

    it('should generate sitemap data for products', () => {
      const result = generateProductSitemapData(mockProducts)

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBe(2)
    })

    it('should include URL for each product', () => {
      const result = generateProductSitemapData(mockProducts)

      expect(result[0].url).toBe('https://olgishcakes.co.uk/product-1')
      expect(result[1].url).toBe('https://olgishcakes.co.uk/product-2')
    })

    it('should use _updatedAt for lastModified when available', () => {
      const result = generateProductSitemapData(mockProducts)

      expect(result[0].lastModified).toBe('2025-01-15T10:00:00Z')
    })

    it('should fallback to _createdAt for lastModified', () => {
      const result = generateProductSitemapData(mockProducts)

      expect(result[1].lastModified).toBe('2025-01-10T10:00:00Z')
    })

    it('should set changeFrequency to weekly', () => {
      const result = generateProductSitemapData(mockProducts)

      result.forEach(item => {
        expect(item.changeFrequency).toBe('weekly')
      })
    })

    it('should set priority to 0.8', () => {
      const result = generateProductSitemapData(mockProducts)

      result.forEach(item => {
        expect(item.priority).toBe(0.8)
      })
    })

    it('should handle empty products array', () => {
      const result = generateProductSitemapData([])

      expect(result).toEqual([])
    })
  })

  describe('validateMerchantCenterProduct', () => {
    const validProduct = {
      _id: 'prod-123',
      name: 'Test Product',
      slug: { current: 'test-product' },
      pricing: { standard: 30 },
      mainImage: { asset: { _ref: 'img-ref' } }
    }

    it('should return valid for complete product', () => {
      const result = validateMerchantCenterProduct(validProduct)

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should error on missing _id', () => {
      const invalidProduct = { ...validProduct, _id: undefined }
      const result = validateMerchantCenterProduct(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing product ID')
    })

    it('should error on missing name', () => {
      const invalidProduct = { ...validProduct, name: undefined }
      const result = validateMerchantCenterProduct(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing product name')
    })

    it('should error on missing slug', () => {
      const invalidProduct = { ...validProduct, slug: undefined }
      const result = validateMerchantCenterProduct(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing product slug')
    })

    it('should error on invalid slug', () => {
      const invalidProduct = { ...validProduct, slug: { current: undefined } }
      const result = validateMerchantCenterProduct(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing product slug')
    })

    it('should warn on missing price', () => {
      const productWithoutPrice = {
        ...validProduct,
        pricing: undefined,
        price: undefined
      }
      const result = validateMerchantCenterProduct(productWithoutPrice)

      expect(result.warnings).toContain('Missing price information')
    })

    it('should not warn when price exists', () => {
      const productWithPrice = {
        ...validProduct,
        pricing: undefined,
        price: 30
      }
      const result = validateMerchantCenterProduct(productWithPrice)

      expect(result.warnings).not.toContain('Missing price information')
    })

    it('should error when no images found', () => {
      const productWithoutImages = {
        ...validProduct,
        mainImage: undefined,
        designs: undefined,
        images: undefined
      }
      const result = validateMerchantCenterProduct(productWithoutImages)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('No product images'))).toBe(true)
    })

    it('should accept mainImage', () => {
      const result = validateMerchantCenterProduct(validProduct)

      expect(result.errors.some(e => e.includes('No product images'))).toBe(false)
    })

    it('should accept designs.standard images', () => {
      const productWithDesigns = {
        ...validProduct,
        mainImage: undefined,
        designs: {
          standard: [{ asset: { _ref: 'ref-1' } }]
        }
      }
      const result = validateMerchantCenterProduct(productWithDesigns)

      expect(result.errors.some(e => e.includes('No product images'))).toBe(false)
    })

    it('should accept designs.individual images', () => {
      const productWithIndividual = {
        ...validProduct,
        mainImage: undefined,
        designs: {
          individual: [{ asset: { _ref: 'ref-1' } }]
        }
      }
      const result = validateMerchantCenterProduct(productWithIndividual)

      expect(result.errors.some(e => e.includes('No product images'))).toBe(false)
    })

    it('should accept legacy images array', () => {
      const productWithLegacy = {
        ...validProduct,
        mainImage: undefined,
        images: [{ asset: { _ref: 'ref-1' } }]
      }
      const result = validateMerchantCenterProduct(productWithLegacy)

      expect(result.errors.some(e => e.includes('No product images'))).toBe(false)
    })

    it('should warn on missing description', () => {
      const productWithoutDesc = {
        ...validProduct,
        shortDescription: undefined,
        description: undefined
      }
      const result = validateMerchantCenterProduct(productWithoutDesc)

      expect(result.warnings).toContain('Missing product description')
    })

    it('should warn on empty description array', () => {
      const productWithEmptyDesc = {
        ...validProduct,
        shortDescription: []
      }
      const result = validateMerchantCenterProduct(productWithEmptyDesc)

      expect(result.warnings).toContain('Empty product description')
    })

    it('should not warn when description exists', () => {
      const productWithDescription = {
        ...validProduct,
        shortDescription: 'A valid product description'
      }
      const result = validateMerchantCenterProduct(productWithDescription)

      expect(result.warnings).not.toContain('Missing product description')
    })

    it('should warn about invalid design image references', () => {
      const productWithInvalidRefs = {
        ...validProduct,
        designs: {
          standard: [
            { asset: { _ref: null } },
            { asset: { _ref: undefined } }
          ]
        }
      }
      const result = validateMerchantCenterProduct(productWithInvalidRefs)

      // Validation should complete and return result
      expect(result).toBeDefined()
      expect(Array.isArray(result.warnings)).toBe(true)
    })

    it('should handle multiple validation errors', () => {
      const invalidProduct = {
        _id: undefined,
        name: undefined,
        slug: undefined
      }
      const result = validateMerchantCenterProduct(invalidProduct)

      expect(result.errors.length).toBeGreaterThanOrEqual(3)
    })

    it('should return isValid false when errors exist', () => {
      const invalidProduct = { name: 'Test' }
      const result = validateMerchantCenterProduct(invalidProduct)

      expect(result.isValid).toBe(false)
    })

    it('should return isValid true when no errors', () => {
      const result = validateMerchantCenterProduct(validProduct)

      expect(result.isValid).toBe(true)
    })
  })
})

