/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'
import CakeDetailPage, { generateStaticParams, generateMetadata, revalidate } from '../page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  })
}))

import { notFound } from 'next/navigation'

// Mock Sanity client
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

// Mock utils
jest.mock('@/app/utils/fetchCakes', () => ({
  getRevalidateTime: jest.fn(() => 60)
}))

jest.mock('@/app/utils/seo', () => ({
  getPriceValidUntil: jest.fn(() => '2026-01-01'),
  getMerchantReturnPolicy: jest.fn(() => ({ '@type': 'MerchantReturnPolicy' })),
  getOfferShippingDetails: jest.fn(() => ({ '@type': 'OfferShippingDetails' }))
}))

jest.mock('@/types/cake', () => ({
  blocksToText: jest.fn((blocks) => 'Converted text')
}))

// Mock components
jest.mock('../CakePageClient', () => ({
  CakePageClient: () => <div data-testid="cake-page-client">Cake Page Client</div>
}))

jest.mock('@/app/components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav>Breadcrumbs</nav>
}))

jest.mock('@mui/material', () => ({
  Container: ({ children }: any) => <div>{children}</div>
}))

// Mock Sanity image URL builder
jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn((source) => ({
    width: jest.fn(() => ({
      height: jest.fn(() => ({
        url: jest.fn(() => 'https://cdn.sanity.io/images/test-project/test-dataset/test-image.jpg')
      }))
    }))
  }))
}))

const { urlFor } = jest.requireMock('@/sanity/lib/image')
const mockUrlFor = urlFor as jest.Mock

describe('CakeDetailPage', () => {
  const mockCake = {
    _id: '1',
    _createdAt: '2025-01-01',
    name: 'Honey Cake',
    slug: { current: 'honey-cake' },
    description: [],
    shortDescription: [],
    size: 'Medium',
    pricing: { standard: 30 },
    designs: { standard: [] },
    category: 'Traditional',
    ingredients: ['Honey'],
    allergens: ['Gluten'],
    mainImage: {},
    images: [],
    seo: { metaTitle: 'Custom Title', metaDescription: 'Custom Description' },
    structuredData: {}
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset urlFor mock to default behavior
    mockUrlFor.mockReturnValue({
      width: jest.fn(() => ({
        height: jest.fn(() => ({
          url: jest.fn(() => 'https://cdn.sanity.io/images/test-project/test-dataset/test-image.jpg')
        }))
      }))
    })
  })

  describe('Static Configuration', () => {
    it('should have 60 second revalidation', () => {
      expect(revalidate).toBe(60)
    })
  })

  describe('generateStaticParams', () => {
    it('should generate params for all cakes', async () => {
      mockFetch.mockResolvedValue([
        { slug: 'honey-cake' },
        { slug: 'kyiv-cake' }
      ])

      const params = await generateStaticParams()

      expect(params).toEqual([
        { slug: 'honey-cake' },
        { slug: 'kyiv-cake' }
      ])
    })

    it('should handle errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const params = await generateStaticParams()

      expect(params).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Error generating static params for cakes:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should use production client', async () => {
      mockFetch.mockResolvedValue([])

      await generateStaticParams()

      expect(mockGetClient).toHaveBeenCalledWith(false)
    })
  })

  describe('generateMetadata', () => {
    it('should generate metadata for existing cake', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })

      expect(metadata.title).toBe('Custom Title')
      expect(metadata.description).toBe('Custom Description')
    })

    it('should use default title when no SEO title', async () => {
      const cakeWithoutSEO = { ...mockCake, seo: undefined }
      mockFetch.mockResolvedValue(cakeWithoutSEO)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })

      expect(metadata.title).toContain('Honey Cake')
    })

    it('should generate description from shortDescription', async () => {
      const cakeWithoutSEO = {
        ...mockCake,
        name: 'Vanilla Cake',
        seo: undefined,
        shortDescription: [{ children: [{ text: 'Test description' }] }]
      }
      mockFetch.mockResolvedValue(cakeWithoutSEO)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'vanilla-cake' }) })

      expect(metadata.description).toContain('Converted text')
    })

    it('should optimize honey cake for "buy honey cake online" keyword', async () => {
      const honeyCake = {
        ...mockCake,
        name: 'Honey Cake (Medovik)',
        seo: undefined
      }
      mockFetch.mockResolvedValue(honeyCake)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake-medovik' }) })

      expect(metadata.title).toContain('Buy Honey Cake Online')
      expect(metadata.description).toContain('Buy authentic honey cake')
      expect(metadata.keywords).toContain('buy honey cake online')
    })

    it('should return 404 metadata for missing cake', async () => {
      mockFetch.mockResolvedValue(null)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'non-existent' }) })

      expect(metadata.title).toContain('Not Found')
    })

    it('should include OpenGraph data', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })

      expect(metadata.openGraph).toBeDefined()
    })

    it('should include keywords', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })

      expect(metadata.keywords).toBeDefined()
    })
  })

  describe('Page Rendering', () => {
    it('should render cake page', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })

      expect(() => render(page)).not.toThrow()
    })

    it('should call notFound for missing cake', async () => {
      mockFetch.mockResolvedValue(null)

      await expect(async () => {
        await CakeDetailPage({ params: Promise.resolve({ slug: 'non-existent' }) })
      }).rejects.toThrow('NEXT_NOT_FOUND')

      expect(notFound).toHaveBeenCalled()
    })

    it('should include structured data', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBeGreaterThan(0)
    })
  })

  describe('Structured Data - GSC Merchant Listings Compliance', () => {
    it('should include Product structured data with required fields', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      expect(productScript).toBeDefined()
      
      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Verify Product exists
      expect(jsonLd['@type']).toBe('Product')
      expect(jsonLd.name).toBeDefined()
      expect(jsonLd.description).toBeDefined()
      expect(jsonLd.image).toBeDefined()
    })

    it('should include image field in Offer (GSC Merchant listings fix)', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Verify Offer has image field (required by Google Merchant listings)
      expect(jsonLd.offers).toBeDefined()
      expect(jsonLd.offers['@type']).toBe('Offer')
      expect(jsonLd.offers.image).toBeDefined()
      expect(typeof jsonLd.offers.image).toBe('string')
    })

    it('should include shippingDetails in Offer', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      expect(jsonLd.offers.shippingDetails).toBeDefined()
      expect(jsonLd.offers.shippingDetails['@type']).toBe('OfferShippingDetails')
    })

    it('should include hasMerchantReturnPolicy in Offer', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      expect(jsonLd.offers.hasMerchantReturnPolicy).toBeDefined()
      expect(jsonLd.offers.hasMerchantReturnPolicy['@type']).toBe('MerchantReturnPolicy')
    })

    it('should include aggregateRating', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      expect(jsonLd.aggregateRating).toBeDefined()
      expect(jsonLd.aggregateRating['@type']).toBe('AggregateRating')
      expect(jsonLd.aggregateRating.ratingValue).toBeDefined()
      expect(jsonLd.aggregateRating.reviewCount).toBeDefined()
    })

    it('should include review array', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      expect(jsonLd.review).toBeDefined()
      expect(Array.isArray(jsonLd.review)).toBe(true)
      expect(jsonLd.review.length).toBeGreaterThan(0)
    })
  })

  describe('Image Field Validation - Google Merchant Center Compliance', () => {
    it('should always include image field in Product schema', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Image field must be present (required by Google Merchant Center)
      expect(jsonLd.image).toBeDefined()
      expect(jsonLd.image).not.toBeNull()
      expect(jsonLd.image).not.toBeUndefined()
    })

    it('should have image as a string (not array or object)', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Image must be a string for Google Merchant Center
      expect(typeof jsonLd.image).toBe('string')
      expect(Array.isArray(jsonLd.image)).toBe(false)
      expect(typeof jsonLd.image).not.toBe('object')
    })

    it('should have absolute image URL (starts with http:// or https://)', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Image URL must be absolute for Google Merchant Center
      expect(jsonLd.image).toMatch(/^https?:\/\//)
      expect(jsonLd.image).not.toMatch(/^\/\//)
      expect(jsonLd.image).not.toMatch(/^\/[^/]/)
    })

    it('should use fallback placeholder when no images are available', async () => {
      const cakeWithoutImages = {
        ...mockCake,
        mainImage: undefined,
        designs: { standard: [], individual: [] },
        images: []
      }
      mockFetch.mockResolvedValue(cakeWithoutImages)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Should use fallback placeholder
      expect(jsonLd.image).toBe('https://olgishcakes.co.uk/images/placeholder-cake.jpg')
      expect(jsonLd.image).toMatch(/^https:\/\//)
    })

    it('should use mainImage when available', async () => {
      // Override mock to return a specific URL
      mockUrlFor.mockReturnValueOnce({
        width: jest.fn(() => ({
          height: jest.fn(() => ({
            url: jest.fn(() => 'https://cdn.sanity.io/images/test/main-image.jpg')
          }))
        }))
      })

      const cakeWithMainImage = {
        ...mockCake,
        mainImage: {
          asset: { _ref: 'image-main', _type: 'reference' }
        }
      }
      mockFetch.mockResolvedValue(cakeWithMainImage)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Should use mainImage
      expect(jsonLd.image).toBe('https://cdn.sanity.io/images/test/main-image.jpg')
      expect(jsonLd.image).toMatch(/^https:\/\//)
    })

    it('should fallback to designs.standard when mainImage is not available', async () => {
      mockUrlFor.mockReturnValueOnce({
        width: jest.fn(() => ({
          height: jest.fn(() => ({
            url: jest.fn(() => 'https://cdn.sanity.io/images/test/design-image.jpg')
          }))
        }))
      })

      const cakeWithDesignImage = {
        ...mockCake,
        mainImage: undefined,
        designs: {
          standard: [{
            asset: { _ref: 'image-design', _type: 'reference' },
            isMain: true
          }],
          individual: []
        },
        images: []
      }
      mockFetch.mockResolvedValue(cakeWithDesignImage)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Should use design image
      expect(jsonLd.image).toBe('https://cdn.sanity.io/images/test/design-image.jpg')
      expect(jsonLd.image).toMatch(/^https:\/\//)
    })

    it('should fallback to legacy images array when other sources are not available', async () => {
      mockUrlFor.mockReturnValueOnce({
        width: jest.fn(() => ({
          height: jest.fn(() => ({
            url: jest.fn(() => 'https://cdn.sanity.io/images/test/legacy-image.jpg')
          }))
        }))
      })

      const cakeWithLegacyImages = {
        ...mockCake,
        mainImage: undefined,
        designs: { standard: [], individual: [] },
        images: [{
          asset: { _ref: 'image-legacy', _type: 'reference' }
        }]
      }
      mockFetch.mockResolvedValue(cakeWithLegacyImages)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Should use legacy image
      expect(jsonLd.image).toBe('https://cdn.sanity.io/images/test/legacy-image.jpg')
      expect(jsonLd.image).toMatch(/^https:\/\//)
    })

    it('should ensure image URL is absolute even if Sanity returns relative URL', async () => {
      // Simulate Sanity returning a relative URL
      mockUrlFor.mockReturnValueOnce({
        width: jest.fn(() => ({
          height: jest.fn(() => ({
            url: jest.fn(() => '/images/relative-path.jpg')
          }))
        }))
      })

      const cakeWithMainImage = {
        ...mockCake,
        mainImage: {
          asset: { _ref: 'image-main', _type: 'reference' }
        }
      }
      mockFetch.mockResolvedValue(cakeWithMainImage)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Should convert relative URL to absolute
      expect(jsonLd.image).toMatch(/^https:\/\//)
      expect(jsonLd.image).not.toMatch(/^\/[^/]/)
    })

    it('should include image in Offer schema as well', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Offer should also have image field
      expect(jsonLd.offers).toBeDefined()
      expect(jsonLd.offers.image).toBeDefined()
      expect(typeof jsonLd.offers.image).toBe('string')
      expect(jsonLd.offers.image).toMatch(/^https?:\/\//)
    })

    it('should have same image URL in both Product and Offer', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Product and Offer should have the same image URL
      expect(jsonLd.image).toBe(jsonLd.offers.image)
    })
  })
})

