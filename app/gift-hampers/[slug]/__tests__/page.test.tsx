/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'
import HamperDetailPage, { generateMetadata, generateStaticParams } from '../page'

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  })
}))

jest.mock('@/sanity/lib/client', () => {
  const mockFetch = jest.fn()
  const mockGetClient = jest.fn(() => ({ fetch: mockFetch }))
  return {
    getClient: mockGetClient,
    __mockFetch: mockFetch,
    __mockGetClient: mockGetClient
  }
})

const { __mockFetch: mockFetch, __mockGetClient: mockGetClient } = jest.requireMock('@/sanity/lib/client')
jest.mock('@/types/cake', () => ({ blocksToText: jest.fn(() => 'Text') }))
jest.mock('@/app/utils/seo', () => ({
  getPriceValidUntil: jest.fn(() => '2026-01-01'),
  getMerchantReturnPolicy: jest.fn(() => ({})),
  getOfferShippingDetails: jest.fn(() => ({}))
}))

jest.mock('@/lib/schema-constants', () => ({
  BRAND_ID: 'https://olgishcakes.co.uk/#brand'
}))

jest.mock('@/lib/constants', () => ({
  BUSINESS_CONSTANTS: {
    NAME: 'Olgish Cakes',
    WEBSITE: 'https://olgishcakes.co.uk'
  }
}))

jest.mock('../GiftHamperPageClient', () => ({
  GiftHamperPageClient: () => <div data-testid="hamper-client">Client</div>
}))

jest.mock('@/app/components/Breadcrumbs', () => ({ Breadcrumbs: () => <nav>Breadcrumbs</nav> }))
jest.mock('@mui/material', () => ({ Container: ({ children }: any) => <div>{children}</div> }))

describe('HamperDetailPage', () => {
  const mockHamper = {
    _id: '1',
    name: 'Deluxe Hamper',
    slug: { current: 'deluxe-hamper' },
    price: 45,
    description: [],
    shortDescription: [],
    category: 'Gift Hampers',
    images: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateStaticParams', () => {
    it('should generate params', async () => {
      mockFetch.mockResolvedValue([{ slug: 'deluxe-hamper' }])

      const params = await generateStaticParams()

      expect(params).toEqual([{ slug: 'deluxe-hamper' }])
    })

    it('should handle errors', async () => {
      mockFetch.mockRejectedValue(new Error('Failed'))

      const params = await generateStaticParams()

      expect(params).toEqual([])
    })
  })

  describe('generateMetadata', () => {
    it('should generate metadata with default fallback', async () => {
      mockFetch.mockResolvedValue(mockHamper)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })

      expect(metadata.title).toContain('Deluxe Hamper')
      expect(metadata.title).toContain('Luxury Gift Hampers')
    })

    it('should prioritize custom SEO fields over defaults', async () => {
      const hamperWithSEO = {
        ...mockHamper,
        seo: {
          metaTitle: 'Custom SEO Title for Testing',
          metaDescription: 'Custom SEO Description for Testing',
          keywords: ['custom', 'seo', 'keywords']
        }
      }
      mockFetch.mockResolvedValue(hamperWithSEO)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })

      expect(metadata.title).toBe('Custom SEO Title for Testing')
      expect(metadata.description).toBe('Custom SEO Description for Testing')
      expect(metadata.keywords).toBe('custom, seo, keywords')
    })

    it('should use special "cake-by-post" optimization when no custom SEO', async () => {
      const cakeByPostHamper = {
        ...mockHamper,
        slug: { current: 'cake-by-post' }
      }
      mockFetch.mockResolvedValue(cakeByPostHamper)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'cake-by-post' }) })

      expect(metadata.title).toContain('Cake by Post')
      expect(metadata.title).toContain('Ukrainian Honey Cake')
      expect(metadata.description).toContain('Letterbox-friendly')
    })

    it('should prioritize custom SEO even for "cake-by-post" hamper', async () => {
      const cakeByPostWithSEO = {
        ...mockHamper,
        slug: { current: 'cake-by-post' },
        seo: {
          metaTitle: 'My Custom Cake by Post Title',
          metaDescription: 'My custom description',
          keywords: ['custom', 'keywords']
        }
      }
      mockFetch.mockResolvedValue(cakeByPostWithSEO)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'cake-by-post' }) })

      // Custom SEO should override the hardcoded "cake-by-post" optimization
      expect(metadata.title).toBe('My Custom Cake by Post Title')
      expect(metadata.description).toBe('My custom description')
      expect(metadata.keywords).toBe('custom, keywords')
    })

    it('should return 404 metadata for missing hamper', async () => {
      mockFetch.mockResolvedValue(null)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'non-existent' }) })

      expect(metadata.title).toContain('Not Found')
    })
  })

  describe('Rendering', () => {
    it('should render hamper page', async () => {
      mockFetch.mockResolvedValue(mockHamper)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })

      expect(() => render(page)).not.toThrow()
    })

    it('should call notFound for missing hamper', async () => {
      mockFetch.mockResolvedValue(null)

      await expect(async () => {
        await HamperDetailPage({ params: Promise.resolve({ slug: 'non-existent' }) })
      }).rejects.toThrow('NEXT_NOT_FOUND')
      
      expect(notFound).toHaveBeenCalled()
    })
  })

  describe('Structured Data - additionalProperty Bug Fix', () => {
    it('should include delivery method properties for cake-by-post hampers', async () => {
      const cakeByPostHamper = {
        ...mockHamper,
        slug: { current: 'cake-by-post' },
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockFetch.mockResolvedValue(cakeByPostHamper)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'cake-by-post' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      expect(productScript).toBeDefined()
      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Extract Product from @graph if present
      const product = jsonLd['@graph'] 
        ? jsonLd['@graph'].find((item: any) => item['@type'] === 'Product')
        : jsonLd
      
      // Verify cake-by-post specific properties exist
      expect(product.additionalProperty).toBeDefined()
      const properties = product.additionalProperty
      
      const deliveryMethod = properties.find((p: any) => p.name === 'Delivery Method')
      const packaging = properties.find((p: any) => p.name === 'Packaging')
      const shelfLife = properties.find((p: any) => p.name === 'Shelf Life')
      
      expect(deliveryMethod).toBeDefined()
      expect(deliveryMethod.value).toBe('Letterbox Post')
      expect(packaging).toBeDefined()
      expect(packaging.value).toBe('Vacuum Sealed')
      expect(shelfLife).toBeDefined()
      expect(shelfLife.value).toBe('7 days')
    })

    it('should include ingredient properties when present', async () => {
      const hamperWithIngredients = {
        ...mockHamper,
        ingredients: ['Flour', 'Honey', 'Eggs', 'Sugar'],
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockFetch.mockResolvedValue(hamperWithIngredients)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Extract Product from @graph if present
      const product = jsonLd['@graph'] 
        ? jsonLd['@graph'].find((item: any) => item['@type'] === 'Product')
        : jsonLd
      
      const properties = product.additionalProperty
      
      const ingredients = properties.find((p: any) => p.name === 'Ingredients')
      expect(ingredients).toBeDefined()
      expect(ingredients.value).toBe('Flour, Honey, Eggs, Sugar')
    })

    it('should include allergen properties when present', async () => {
      const hamperWithAllergens = {
        ...mockHamper,
        allergens: ['Gluten', 'Eggs', 'Dairy'],
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockFetch.mockResolvedValue(hamperWithAllergens)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Extract Product from @graph if present
      const product = jsonLd['@graph'] 
        ? jsonLd['@graph'].find((item: any) => item['@type'] === 'Product')
        : jsonLd
      
      const properties = product.additionalProperty
      
      const allergens = properties.find((p: any) => p.name === 'Allergens')
      expect(allergens).toBeDefined()
      expect(allergens.value).toBe('Gluten, Eggs, Dairy')
    })

    it('CRITICAL: should preserve ALL additionalProperty fields when multiple conditions are true', async () => {
      // This is the critical test for the bug fix
      // Previously, when both isCakeByPost and allergens/ingredients existed,
      // the spread operator would overwrite the first additionalProperty array
      const fullHamper = {
        ...mockHamper,
        slug: { current: 'cake-by-post' },
        ingredients: ['Flour', 'Honey', 'Eggs', 'Sugar'],
        allergens: ['Gluten', 'Eggs', 'Dairy'],
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockFetch.mockResolvedValue(fullHamper)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'cake-by-post' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Extract Product from @graph if present
      const product = jsonLd['@graph'] 
        ? jsonLd['@graph'].find((item: any) => item['@type'] === 'Product')
        : jsonLd
      
      const properties = product.additionalProperty
      
      // Verify ALL properties are present (no overwrites occurred)
      expect(properties).toHaveLength(5) // 3 from cake-by-post + 1 ingredients + 1 allergens
      
      // Verify cake-by-post properties
      const deliveryMethod = properties.find((p: any) => p.name === 'Delivery Method')
      const packaging = properties.find((p: any) => p.name === 'Packaging')
      const shelfLife = properties.find((p: any) => p.name === 'Shelf Life')
      
      expect(deliveryMethod).toBeDefined()
      expect(deliveryMethod.value).toBe('Letterbox Post')
      expect(packaging).toBeDefined()
      expect(packaging.value).toBe('Vacuum Sealed')
      expect(shelfLife).toBeDefined()
      expect(shelfLife.value).toBe('7 days')
      
      // Verify ingredients property
      const ingredients = properties.find((p: any) => p.name === 'Ingredients')
      expect(ingredients).toBeDefined()
      expect(ingredients.value).toBe('Flour, Honey, Eggs, Sugar')
      
      // Verify allergens property
      const allergens = properties.find((p: any) => p.name === 'Allergens')
      expect(allergens).toBeDefined()
      expect(allergens.value).toBe('Gluten, Eggs, Dairy')
      
      // Ensure no duplicates
      const propertyNames = properties.map((p: any) => p.name)
      const uniqueNames = [...new Set(propertyNames)]
      expect(propertyNames.length).toBe(uniqueNames.length)
    })

    it('should not include properties when conditions are false', async () => {
      const basicHamper = {
        ...mockHamper,
        // No cake-by-post, no ingredients, no allergens
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockFetch.mockResolvedValue(basicHamper)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Extract Product from @graph if present
      const product = jsonLd['@graph'] 
        ? jsonLd['@graph'].find((item: any) => item['@type'] === 'Product')
        : jsonLd
      
      const properties = product.additionalProperty || []
      
      // Should be an empty array when no conditions are met
      expect(properties).toHaveLength(0)
    })
  })

  describe('Brand Field Duplication Prevention', () => {
    it('should use @graph format for Product structured data', async () => {
      mockFetch.mockResolvedValue({
        ...mockHamper,
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      })

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"') || script.textContent?.includes('"@graph"')
      )

      expect(productScript).toBeDefined()
      
      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Should use @graph format to prevent duplicate brand fields
      expect(jsonLd['@graph']).toBeDefined()
      expect(Array.isArray(jsonLd['@graph'])).toBe(true)
    })

    it('should have exactly one Brand entity in @graph', async () => {
      mockFetch.mockResolvedValue({
        ...mockHamper,
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      })

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@graph"')
      )

      expect(productScript).toBeDefined()
      
      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      const graph = jsonLd['@graph'] || []
      
      // Count Brand entities
      const brandEntities = graph.filter((entity: any) => entity['@type'] === 'Brand')
      
      // Should have exactly one Brand entity
      expect(brandEntities).toHaveLength(1)
      
      // Brand should have unique @id
      expect(brandEntities[0]['@id']).toBe('https://olgishcakes.co.uk/#brand')
      expect(brandEntities[0].name).toBe('Olgish Cakes')
    })

    it('should reference brand by @id in product, not inline object', async () => {
      mockFetch.mockResolvedValue({
        ...mockHamper,
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      })

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@graph"')
      )

      expect(productScript).toBeDefined()
      
      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      const graph = jsonLd['@graph'] || []
      
      // Find Product
      const product = graph.find((entity: any) => entity['@type'] === 'Product')
      expect(product).toBeDefined()
      
      // Brand should be a reference by @id, not an inline object
      expect(product.brand).toBeDefined()
      expect(product.brand['@id']).toBe('https://olgishcakes.co.uk/#brand')
      
      // Should NOT have inline brand object with @type
      expect(product.brand['@type']).toBeUndefined()
      expect(product.brand.name).toBeUndefined()
    })

    it('should NOT have duplicate brand fields in structured data', async () => {
      mockFetch.mockResolvedValue({
        ...mockHamper,
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      })

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@graph"')
      )

      expect(productScript).toBeDefined()
      
      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      const graph = jsonLd['@graph'] || []
      
      // Find Product
      const product = graph.find((entity: any) => entity['@type'] === 'Product')
      expect(product).toBeDefined()
      
      // Check if brand is an inline object (has @type) - should be false
      const hasInlineBrand = product.brand && product.brand['@type'] === 'Brand'
      expect(hasInlineBrand).toBe(false)
    })

    it('should have consistent brand @id in product structured data', async () => {
      mockFetch.mockResolvedValue({
        ...mockHamper,
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      })

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@graph"')
      )

      expect(productScript).toBeDefined()
      
      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      const graph = jsonLd['@graph'] || []
      
      // Find Brand entity
      const brandEntity = graph.find((entity: any) => entity['@type'] === 'Brand')
      expect(brandEntity).toBeDefined()
      const brandId = brandEntity['@id']
      
      // Find Product
      const product = graph.find((entity: any) => entity['@type'] === 'Product')
      expect(product).toBeDefined()
      
      // Verify product references the same brand @id
      expect(product.brand['@id']).toBe(brandId)
    })
  })
})

