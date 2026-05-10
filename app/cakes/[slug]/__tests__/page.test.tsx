/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'
import React from 'react'
import CakeDetailPage, { generateMetadata, generateStaticParams } from '../page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
  permanentRedirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT')
  })
}))

import { notFound, permanentRedirect } from 'next/navigation'
let capturedCakePageClientProps: Record<string, unknown> | null = null

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

// Mock unstable_cache to bypass Next.js context requirement
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn)
}))

// Mock utils
jest.mock('@/app/utils/fetchCakes', () => ({
  getRevalidateTime: jest.fn(() => 60),
  getAllCakes: jest.fn(),
  getCakeBySlug: jest.fn()
}))

const { __mockFetch: mockFetch, __mockGetClient: mockGetClient } = jest.requireMock('@/sanity/lib/client')
const { getAllCakes: mockGetAllCakes, getCakeBySlug: mockGetCakeBySlug } = jest.requireMock('@/app/utils/fetchCakes')
const { getOfferShippingDetails: mockGetOfferShippingDetails } = jest.requireMock('@/app/utils/seo')

jest.mock('@/app/utils/seo', () => ({
  getPriceValidUntil: jest.fn(() => '2026-01-01'),
  getMerchantReturnPolicy: jest.fn(() => ({
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'GB',
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted'
  })),
  getOfferShippingDetails: jest.fn(() => ({ '@type': 'OfferShippingDetails' }))
}))

jest.mock('@/types/cake', () => ({
  blocksToText: jest.fn((blocks) => 'Converted text')
}))
const { blocksToText: mockBlocksToText } = jest.requireMock('@/types/cake')

// Mock components
jest.mock('../CakePageClient', () => ({
  CakePageClient: (props: Record<string, unknown>) => {
    capturedCakePageClientProps = props
    return <div data-testid="cake-page-client">Cake Page Client</div>
  }
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
    capturedCakePageClientProps = null
    mockBlocksToText.mockReturnValue('Converted text')
    // Reset urlFor mock to default behavior
    mockUrlFor.mockReturnValue({
      width: jest.fn(() => ({
        height: jest.fn(() => ({
          url: jest.fn(() => 'https://cdn.sanity.io/images/test-project/test-dataset/test-image.jpg')
        }))
      }))
    })
  })

  describe('generateStaticParams', () => {
    it('should generate params for all cakes', async () => {
      mockGetAllCakes.mockResolvedValue([
        { slug: { current: 'honey-cake' } },
        { slug: { current: 'kyiv-cake' } }
      ])

      const params = await generateStaticParams()

      expect(params).toEqual([
        { slug: 'honey-cake' },
        { slug: 'kyiv-cake' }
      ])
      expect(mockGetAllCakes).toHaveBeenCalledWith(false)
    })

    it('should handle errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockGetAllCakes.mockRejectedValue(new Error('Fetch failed'))

      const params = await generateStaticParams()

      expect(params).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Error generating static params for cakes:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should use getAllCakes with preview false', async () => {
      mockGetAllCakes.mockResolvedValue([])

      await generateStaticParams()

      expect(mockGetAllCakes).toHaveBeenCalledWith(false)
    })
  })

  describe('generateMetadata', () => {
    it('should generate metadata for existing cake', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })

      expect(metadata.title).toBe('Custom Title')
      expect(metadata.description).toBe('Custom Description')
    })

    it('should use default title when no SEO title', async () => {
      const cakeWithoutSEO = { ...mockCake, seo: undefined }
      mockGetCakeBySlug.mockResolvedValue(cakeWithoutSEO)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })

      expect(metadata.title).toContain('Honey Cake')
    })

    it('should normalize a CMS title that already includes the Olgish Cakes suffix', async () => {
      mockGetCakeBySlug.mockResolvedValue({
        ...mockCake,
        seo: {
          metaTitle: 'Custom Title | Olgish Cakes',
          metaDescription: 'Custom Description'
        }
      })

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })

      expect(metadata.title).toBe('Custom Title')
    })

    it('should generate description from shortDescription', async () => {
      const cakeWithoutSEO = {
        ...mockCake,
        name: 'Vanilla Cake',
        seo: undefined,
        shortDescription: [{ children: [{ text: 'Test description' }] }]
      }
      mockGetCakeBySlug.mockResolvedValue(cakeWithoutSEO)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'vanilla-cake' }) })

      expect(metadata.description).toContain('Converted text')
    })

    it('should not truncate long shortDescription fallback and should normalize whitespace', async () => {
      const longDescription = `${'A'.repeat(120)}   \n\n ${'B'.repeat(120)}`
      const cakeWithoutSEO = {
        ...mockCake,
        name: 'Vanilla Cake',
        seo: undefined,
        shortDescription: [{ children: [{ text: 'Ignored by blocksToText mock' }] }]
      }
      mockGetCakeBySlug.mockResolvedValue(cakeWithoutSEO)
      mockBlocksToText.mockReturnValueOnce(longDescription)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'vanilla-cake' }) })
      const description = metadata.description as string

      expect(description).toBe(`${'A'.repeat(120)} ${'B'.repeat(120)}`)
      expect(description.length).toBeGreaterThan(160)
    })

    it('should fall back to default description when normalized shortDescription is empty', async () => {
      const cakeWithoutSEO = {
        ...mockCake,
        name: 'Vanilla Cake',
        seo: undefined,
        shortDescription: [{ children: [{ text: '' }] }]
      }
      mockGetCakeBySlug.mockResolvedValue(cakeWithoutSEO)
      mockBlocksToText.mockReturnValueOnce('   \n\t   ')

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'vanilla-cake' }) })

      expect(metadata.description).toBe('traditional Ukrainian honey cake - Vanilla Cake. Freshly baked in Leeds with real recipes. Free UK delivery.')
    })

    it('should prioritize normalized SEO metaDescription over shortDescription fallback', async () => {
      const cakeWithSeoAndShortDescription = {
        ...mockCake,
        seo: {
          metaTitle: 'Custom Title',
          metaDescription: '  SEO   description \n value  ',
          keywords: ['custom']
        },
        shortDescription: [{ children: [{ text: 'Ignored by blocksToText mock' }] }]
      }
      mockGetCakeBySlug.mockResolvedValue(cakeWithSeoAndShortDescription)
      mockBlocksToText.mockReturnValueOnce(`${'C'.repeat(220)}`)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })

      expect(metadata.description).toBe('SEO description value')
    })

    it('should optimize honey cake for "buy honey cake online" keyword', async () => {
      const honeyCake = {
        ...mockCake,
        name: 'Honey Cake (Medovik)',
        seo: undefined
      }
      mockGetCakeBySlug.mockResolvedValue(honeyCake)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake-medovik' }) })

      expect(metadata.title).toContain('Buy Honey Cake Online')
      expect(metadata.description).toContain('Buy authentic honey cake')
    })

    it('should return 404 metadata for missing cake', async () => {
      mockGetCakeBySlug.mockResolvedValue(null)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'non-existent' }) })

      expect(metadata.title).toBe('Cake not found')
    })

    it('should include OpenGraph data', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })

      expect(metadata.openGraph).toBeDefined()
    })

    it('should keep cakes self-canonical even when legacy canonical data exists in CMS payloads', async () => {
      mockGetCakeBySlug.mockResolvedValue({
        ...mockCake,
        slug: { current: 'honey-cake' },
        seo: {
          metaTitle: 'Custom Title',
          metaDescription: 'Custom Description',
          keywords: ['legacy'],
          canonicalUrl: 'https://legacy.example.com/cakes/honey-cake'
        }
      })

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })

      expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/cakes/honey-cake')
      expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/cakes/honey-cake')
    })

    it('should not include metadata keywords', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })

      expect(metadata.keywords).toBeUndefined()
    })

    it('should use minimum servings price in metadata other fields when available', async () => {
      mockGetCakeBySlug.mockResolvedValue({
        ...mockCake,
        pricing: {
          standard: 30,
          individual: 50
        },
        newDesignPricingByServings: {
          servings2To4: 30,
          servings4To8: 45,
          servings8To12: 60,
          servings2To4IsDefault: false,
          servings4To8IsDefault: false,
          servings8To12IsDefault: true
        }
      })

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const metadataOther = metadata.other as Record<string, string>

      expect(metadataOther.price).toBe('30')
      expect(metadataOther['og:price:amount']).toBe('30')
    })

    it('should fallback metadata other price fields to legacy standard when servings pricing is missing', async () => {
      mockGetCakeBySlug.mockResolvedValue({
        ...mockCake,
        pricing: {
          standard: 31,
          individual: 50
        },
        newDesignPricingByServings: undefined
      })

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const metadataOther = metadata.other as Record<string, string>

      expect(metadataOther.price).toBe('31')
      expect(metadataOther['og:price:amount']).toBe('31')
    })
  })

  describe('Page Rendering', () => {
    it('should render cake page', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })

      const { container } = render(page)

      expect(container.querySelector('nav[aria-label="Breadcrumb navigation"]')).not.toBeInTheDocument()
    })

    it('should call notFound for missing cake', async () => {
      mockGetCakeBySlug.mockResolvedValue(null)

      await expect(async () => {
        await CakeDetailPage({ params: Promise.resolve({ slug: 'non-existent' }) })
      }).rejects.toThrow('NEXT_NOT_FOUND')

      expect(notFound).toHaveBeenCalled()
    })

    it('should include structured data', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBeGreaterThan(0)
    })

    it('should escape html fragments in Product and Organization JSON-LD scripts', async () => {
      const cakeWithUnsafeContent = {
        ...mockCake,
        name: 'Honey <script>alert("xss")</script> Cake',
        seo: undefined,
        shortDescription: [{ children: [{ text: 'Ignored by blocksToText mock' }] }]
      }
      mockGetCakeBySlug.mockResolvedValue(cakeWithUnsafeContent)
      mockBlocksToText.mockReturnValueOnce('Fresh <script>alert("xss")</script> notes')

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find((script) =>
        script.textContent?.includes('"@type":"Product"')
      )
      const organizationScript = Array.from(scripts).find((script) =>
        script.textContent?.includes('"@type":"Organization"') &&
        script.textContent?.includes('"hasOfferCatalog"')
      )

      expect(productScript).toBeDefined()
      expect(organizationScript).toBeDefined()

      const productScriptText = productScript?.textContent || ''
      const organizationScriptText = organizationScript?.textContent || ''

      expect(productScriptText).toContain('\\u003cscript')
      expect(productScriptText).not.toContain('<script')
      expect(organizationScriptText).toContain('\\u003cscript')
      expect(organizationScriptText).not.toContain('<script')
    })

    it('should not include BreadcrumbList structured data', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const breadcrumbScript = Array.from(scripts).find((script) =>
        script.textContent?.includes('"@type":"BreadcrumbList"')
      )

      expect(breadcrumbScript).toBeUndefined()
    })

    it('passes fallback backHref to CakePageClient when from param is missing', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({
        params: Promise.resolve({ slug: 'honey-cake' }),
        searchParams: Promise.resolve({})
      })
      render(page)

      expect(capturedCakePageClientProps).not.toBeNull()
      expect(capturedCakePageClientProps?.backHref).toBe('/cakes')
    })

    it('uses the originating cakes-by-post listing as backHref when from is valid', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({
        params: Promise.resolve({ slug: 'honey-cake' }),
        searchParams: Promise.resolve({
          from: '/cakes-by-post?sort=priceLowToHigh&page=2'
        })
      })
      render(page)

      expect(capturedCakePageClientProps?.backHref).toBe('/cakes-by-post?sort=priceLowToHigh&page=2')
    })

    it('uses the originating category landing listing as backHref when from is a valid landing page', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({
        params: Promise.resolve({ slug: 'honey-cake' }),
        searchParams: Promise.resolve({
          from: '/birthday-cakes?page=2'
        })
      })
      render(page)

      expect(capturedCakePageClientProps?.backHref).toBe('/birthday-cakes?page=2')
    })

    it('falls back to /cakes when from includes disallowed query keys', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({
        params: Promise.resolve({ slug: 'honey-cake' }),
        searchParams: Promise.resolve({
          from: '/cakes-by-post?sort=priceLowToHigh&page=2&evil=true'
        })
      })
      render(page)

      expect(capturedCakePageClientProps?.backHref).toBe('/cakes')
    })

    it('falls back to /cakes when from is external or fragment-based', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const externalPage = await CakeDetailPage({
        params: Promise.resolve({ slug: 'honey-cake' }),
        searchParams: Promise.resolve({
          from: 'https://example.com/cakes-by-post?page=2'
        })
      })
      render(externalPage)
      expect(capturedCakePageClientProps?.backHref).toBe('/cakes')

      const fragmentPage = await CakeDetailPage({
        params: Promise.resolve({ slug: 'honey-cake' }),
        searchParams: Promise.resolve({
          from: '/cakes-by-post?page=2#catalog'
        })
      })
      render(fragmentPage)

      expect(capturedCakePageClientProps?.backHref).toBe('/cakes')
    })

    it('passes fallback backHref to CakePageClient when from param is absent and other params exist', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({
        params: Promise.resolve({ slug: 'honey-cake' }),
        searchParams: Promise.resolve({
          page: '2'
        })
      })
      render(page)

      expect(capturedCakePageClientProps).not.toBeNull()
      expect(capturedCakePageClientProps?.backHref).toBe('/cakes')
    })

    it('omits FAQPage JSON-LD and does not pass faqItems to CakePageClient', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      expect(capturedCakePageClientProps).not.toBeNull()
      expect(capturedCakePageClientProps?.faqItems).toBeUndefined()

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const faqScript = Array.from(scripts).find((script) =>
        script.textContent?.includes('"@type":"FAQPage"')
      )
      expect(faqScript).toBeUndefined()
    })
  })

  describe('Structured Data - GSC Merchant Listings Compliance', () => {
    it('should use minimum servings price across Product and Organization offers when available', async () => {
      mockGetCakeBySlug.mockResolvedValue({
        ...mockCake,
        pricing: {
          standard: 30,
          individual: 50
        },
        newDesignPricingByServings: {
          servings2To4: 30,
          servings4To8: 45,
          servings8To12: 60,
          servings2To4IsDefault: false,
          servings4To8IsDefault: false,
          servings8To12IsDefault: true
        }
      })

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find((script) => {
        return script.textContent?.includes('"@type":"Product"')
      })
      const organizationScript = Array.from(scripts).find((script) => {
        return script.textContent?.includes('"@type":"Organization"') &&
          script.textContent?.includes('"hasOfferCatalog"')
      })

      const productJsonLd = JSON.parse(productScript?.textContent || '{}')
      const organizationJsonLd = JSON.parse(organizationScript?.textContent || '{}')
      const organizationOffer = organizationJsonLd.hasOfferCatalog?.itemListElement?.[0]?.itemOffered?.offers

      expect(productJsonLd.offers.price).toBe(30)
      expect(productJsonLd.offers.eligibleTransactionVolume.price).toBe(30)
      expect(organizationOffer?.price).toBe(30)
    })

    it('should fallback structured data prices to legacy standard when servings pricing is missing', async () => {
      mockGetCakeBySlug.mockResolvedValue({
        ...mockCake,
        pricing: {
          standard: 34,
          individual: 50
        },
        newDesignPricingByServings: undefined
      })

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find((script) => {
        return script.textContent?.includes('"@type":"Product"')
      })
      const organizationScript = Array.from(scripts).find((script) => {
        return script.textContent?.includes('"@type":"Organization"') &&
          script.textContent?.includes('"hasOfferCatalog"')
      })

      const productJsonLd = JSON.parse(productScript?.textContent || '{}')
      const organizationJsonLd = JSON.parse(organizationScript?.textContent || '{}')
      const organizationOffer = organizationJsonLd.hasOfferCatalog?.itemListElement?.[0]?.itemOffered?.offers

      expect(productJsonLd.offers.price).toBe(34)
      expect(productJsonLd.offers.eligibleTransactionVolume.price).toBe(34)
      expect(organizationOffer?.price).toBe(34)
    })

    it('should include Product structured data with required fields', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

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
      mockGetCakeBySlug.mockResolvedValue(mockCake)

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
      mockGetCakeBySlug.mockResolvedValue(mockCake)
      mockBlocksToText.mockReturnValue('We usually prepare cake orders within 2-3 working days. Free UK delivery is included.')

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      expect(jsonLd.offers.shippingDetails).toBeDefined()
      expect(jsonLd.offers.shippingDetails['@type']).toBe('OfferShippingDetails')
      expect(mockGetOfferShippingDetails).toHaveBeenCalledWith({
        dispatchMinDays: 2,
        dispatchMaxDays: 3,
        shippingFeeGbp: 0,
        shippingDestinationCountry: 'GB',
        deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
      }, {
        timing: true,
        shippingCost: true,
        destinationCountry: true,
        deliveryMethod: false
      })
    })

    it('omits shippingDetails when delivery text conflicts with policy values', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      const previousNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      const conflictingDeliveryCake = {
        ...mockCake,
        seo: {
          metaTitle: 'Custom Title',
          metaDescription: 'Custom Description'
        },
        deliverySection: {
          descriptionSource: 'custom',
          customDescription: [
            {
              _type: 'block',
              children: [
                {
                  _type: 'span',
                  text: 'We usually prepare cake orders within 5-7 working days. Free UK delivery is included.'
                }
              ]
            }
          ]
        },
        cakesDeliverySection: {
          name: 'Delivery',
          policy: {
            dispatchMinDays: 2,
            dispatchMaxDays: 3,
            shippingFeeGbp: 0,
            shippingDestinationCountry: 'GB',
            deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
          }
        }
      }
      mockBlocksToText
        .mockReturnValueOnce('We usually prepare cake orders within 5-7 working days. Free UK delivery is included.')
        .mockReturnValueOnce('We usually prepare cake orders within 5-7 working days. Free UK delivery is included.')
      mockGetCakeBySlug.mockResolvedValue(conflictingDeliveryCake)

      try {
        const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
        const { container } = render(page)

        const scripts = container.querySelectorAll('script[type="application/ld+json"]')
        const productScript = Array.from(scripts).find(script =>
          script.textContent?.includes('"@type":"Product"')
        )

        const jsonLd = JSON.parse(productScript!.textContent || '{}')

        expect(jsonLd.offers.shippingDetails).toBeUndefined()
        expect(jsonLd.offers.hasMerchantReturnPolicy).toBeDefined()
        expect(consoleWarnSpy).not.toHaveBeenCalled()
      } finally {
        process.env.NODE_ENV = previousNodeEnv
        consoleWarnSpy.mockRestore()
      }
    })

    it('omits shippingDetails when explicit paid fee conflicts with policy fee', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      mockGetCakeBySlug.mockResolvedValue({
        ...mockCake,
        deliverySection: {
          descriptionSource: 'custom',
          customDescription: [
            {
              _type: 'block',
              children: [
                {
                  _type: 'span',
                  text: 'Dispatch in 2-3 working days. UK delivery is \u00A35.'
                }
              ]
            }
          ]
        },
        cakesDeliverySection: {
          name: 'Delivery',
          policy: {
            dispatchMinDays: 2,
            dispatchMaxDays: 3,
            shippingFeeGbp: 6,
            shippingDestinationCountry: 'GB',
            deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
          }
        }
      })
      mockBlocksToText
        .mockReturnValueOnce('Dispatch in 2-3 working days. UK delivery is \u00A35.')
        .mockReturnValueOnce('Dispatch in 2-3 working days. UK delivery is \u00A35.')

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script =>
        script.textContent?.includes('"@type":"Product"')
      )
      const jsonLd = JSON.parse(productScript!.textContent || '{}')

      expect(jsonLd.offers.shippingDetails).toBeUndefined()
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('shipping fee \u00A35'))

      consoleWarnSpy.mockRestore()
    })

    it('keeps shippingDetails when delivery text says UK and policy country input is non-GB', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      mockGetCakeBySlug.mockResolvedValue({
        ...mockCake,
        deliverySection: {
          descriptionSource: 'custom',
          customDescription: [
            {
              _type: 'block',
              children: [
                {
                  _type: 'span',
                  text: 'We usually prepare cake orders within 2-3 working days. Free UK delivery is included.'
                }
              ]
            }
          ]
        },
        cakesDeliverySection: {
          name: 'Delivery',
          policy: {
            dispatchMinDays: 2,
            dispatchMaxDays: 3,
            shippingFeeGbp: 0,
            shippingDestinationCountry: 'DE',
            deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
          }
        }
      })
      mockBlocksToText
        .mockReturnValueOnce('We usually prepare cake orders within 2-3 working days. Free UK delivery is included.')
        .mockReturnValueOnce('We usually prepare cake orders within 2-3 working days. Free UK delivery is included.')

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script =>
        script.textContent?.includes('"@type":"Product"')
      )
      const jsonLd = JSON.parse(productScript!.textContent || '{}')

      expect(jsonLd.offers.shippingDetails).toBeDefined()
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })

    it('normalizes unsupported deliveryMethod to default before emitting shippingDetails', async () => {
      mockGetCakeBySlug.mockResolvedValue({
        ...mockCake,
        deliverySection: {
          descriptionSource: 'custom',
          customDescription: [
            {
              _type: 'block',
              children: [
                {
                  _type: 'span',
                  text: 'Dispatch in 2-3 working days. UK delivery is \u00A36.'
                }
              ]
            }
          ],
          customPolicy: {
            dispatchMinDays: 2,
            dispatchMaxDays: 3,
            shippingFeeGbp: 6,
            shippingDestinationCountry: 'GB',
            deliveryMethod: 'https://example.com/custom-delivery-method'
          }
        }
      })
      mockBlocksToText.mockReturnValue('Dispatch in 2-3 working days. UK delivery is \u00A36.')

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      render(page)

      expect(mockGetOfferShippingDetails).toHaveBeenCalledWith({
        dispatchMinDays: 2,
        dispatchMaxDays: 3,
        shippingFeeGbp: 6,
        shippingDestinationCountry: 'GB',
        deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
      }, {
        timing: true,
        shippingCost: true,
        destinationCountry: true,
        deliveryMethod: false
      })
    })

    it('should include hasMerchantReturnPolicy in Offer', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      expect(jsonLd.offers.hasMerchantReturnPolicy).toBeDefined()
      expect(jsonLd.offers.hasMerchantReturnPolicy['@type']).toBe('MerchantReturnPolicy')
      expect(jsonLd.offers.hasMerchantReturnPolicy.returnPolicyCategory).toBe('https://schema.org/MerchantReturnNotPermitted')
      expect(jsonLd.offers.hasMerchantReturnPolicy).not.toHaveProperty('merchantReturnDays')
      expect(jsonLd.offers.hasMerchantReturnPolicy).not.toHaveProperty('returnFees')
      expect(jsonLd.offers.hasMerchantReturnPolicy).not.toHaveProperty('returnMethod')
    })

    it('should not include aggregateRating in Product schema', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')

      expect(jsonLd.aggregateRating).toBeUndefined()
    })

    it('should not include review array in Product schema', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')

      expect(jsonLd.review).toBeUndefined()
    })

    it('should not include aggregateRating in nested itemOffered Product under Organization', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: Promise.resolve({ slug: 'honey-cake' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const organizationScript = Array.from(scripts).find(script =>
        script.textContent?.includes('"@type":"Organization"') &&
        script.textContent?.includes('"hasOfferCatalog"')
      )

      expect(organizationScript).toBeDefined()

      const organizationJsonLd = JSON.parse(organizationScript!.textContent || '{}')
      const itemOffered = organizationJsonLd.hasOfferCatalog?.itemListElement?.[0]?.itemOffered

      expect(itemOffered).toBeDefined()
      expect(itemOffered.aggregateRating).toBeUndefined()
    })
  })

  describe('Image Field Validation - Google Merchant Center Compliance', () => {
    it('should always include image field in Product schema', async () => {
      mockGetCakeBySlug.mockResolvedValue(mockCake)

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
      mockGetCakeBySlug.mockResolvedValue(mockCake)

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
      mockGetCakeBySlug.mockResolvedValue(mockCake)

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
      mockGetCakeBySlug.mockResolvedValue(cakeWithoutImages)

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
      mockGetCakeBySlug.mockResolvedValue(cakeWithMainImage)

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
      mockGetCakeBySlug.mockResolvedValue(cakeWithDesignImage)

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
      mockGetCakeBySlug.mockResolvedValue(cakeWithLegacyImages)

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
      mockGetCakeBySlug.mockResolvedValue(cakeWithMainImage)

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
      mockGetCakeBySlug.mockResolvedValue(mockCake)

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
      mockGetCakeBySlug.mockResolvedValue(mockCake)

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




