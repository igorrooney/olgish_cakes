/**
 * @jest-environment jsdom
 */

// Mock unstable_cache to bypass Next.js context requirement
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn)
}))
import { render } from '@testing-library/react'
import { notFound, permanentRedirect } from 'next/navigation'
import HamperDetailPage, { generateMetadata, generateStaticParams } from '../page'
let capturedGiftHamperPageClientProps: Record<string, unknown> | null = null
type UnknownRecord = Record<string, unknown>

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
  permanentRedirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT')
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

jest.mock('@/app/utils/fetchGiftHampers', () => ({
  getAllGiftHampers: jest.fn(),
  getGiftHamperBySlug: jest.fn()
}))

const { __mockFetch: mockFetch, __mockGetClient: mockGetClient } = jest.requireMock('@/sanity/lib/client')
const { getAllGiftHampers: mockGetAllGiftHampers, getGiftHamperBySlug: mockGetGiftHamperBySlug } = jest.requireMock('@/app/utils/fetchGiftHampers')
const { getOfferShippingDetails: mockGetOfferShippingDetails } = jest.requireMock('@/app/utils/seo')
jest.mock('@/types/cake', () => ({ blocksToText: jest.fn(() => 'Text') }))
const { blocksToText: mockBlocksToText } = jest.requireMock('@/types/cake')
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
  GiftHamperPageClient: (props: Record<string, unknown>) => {
    capturedGiftHamperPageClientProps = props
    return <div data-testid="hamper-client">Client</div>
  }
}))

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
    capturedGiftHamperPageClientProps = null
    mockBlocksToText.mockReturnValue('Text')
    mockGetGiftHamperBySlug.mockResolvedValue(mockHamper)
    mockGetAllGiftHampers.mockResolvedValue([])
  })

  describe('generateStaticParams', () => {
    it('should generate params', async () => {
      mockGetAllGiftHampers.mockResolvedValue([
        { slug: { current: 'deluxe-hamper' } }
      ])

      const params = await generateStaticParams()

      expect(params).toEqual([{ slug: 'deluxe-hamper' }])
      expect(mockGetAllGiftHampers).toHaveBeenCalledWith(false)
    })

    it('should handle errors', async () => {
      mockGetAllGiftHampers.mockRejectedValue(new Error('Failed'))

      const params = await generateStaticParams()

      expect(params).toEqual([])
    })
  })

  describe('generateMetadata', () => {
    it('should generate metadata with default fallback', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue(mockHamper)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })

      expect(metadata.title).toContain('Deluxe Hamper')
      expect(metadata.title).toContain('Cakes by Post UK')
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
      mockGetGiftHamperBySlug.mockResolvedValue(hamperWithSEO)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })

      expect(metadata.title).toBe('Custom SEO Title for Testing')
      expect(metadata.description).toBe('Custom SEO Description for Testing')
      expect(metadata.keywords).toBe('custom, seo, keywords')
    })

    it('should normalize a CMS title that already includes the Olgish Cakes suffix', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue({
        ...mockHamper,
        seo: {
          metaTitle: 'Postal Medovik | Olgish Cakes',
          metaDescription: 'Custom SEO Description for Testing',
          keywords: ['custom']
        }
      })

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })

      expect(metadata.title).toBe('Postal Medovik')
    })

    it('should not truncate long shortDescription fallback and should normalize whitespace', async () => {
      const longDescription = `${'H'.repeat(110)}   \n\n ${'I'.repeat(120)}`
      const hamperWithoutSEO = {
        ...mockHamper,
        seo: undefined,
        shortDescription: [{ children: [{ text: 'Ignored by blocksToText mock' }] }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(hamperWithoutSEO)
      mockBlocksToText.mockReturnValueOnce(longDescription)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const description = metadata.description as string

      expect(description).toBe(`${'H'.repeat(110)} ${'I'.repeat(120)}`)
      expect(description.length).toBeGreaterThan(160)
    })

    it('should fall back to default description when normalized shortDescription is empty', async () => {
      const hamperWithoutSEO = {
        ...mockHamper,
        seo: undefined,
        shortDescription: [{ children: [{ text: '' }] }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(hamperWithoutSEO)
      mockBlocksToText.mockReturnValueOnce('   \n\t   ')

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })

      expect(metadata.description).toBe('Deluxe Hamper premium Ukrainian gift hamper. Handcrafted in Leeds. UK delivery.')
    })

    it('should prioritize normalized SEO metaDescription over shortDescription fallback', async () => {
      const hamperWithSEOAndShortDescription = {
        ...mockHamper,
        seo: {
          metaTitle: 'Custom SEO Title for Testing',
          metaDescription: '  Custom  SEO \n Description for Testing  ',
          keywords: ['custom', 'seo', 'keywords']
        },
        shortDescription: [{ children: [{ text: 'Ignored by blocksToText mock' }] }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(hamperWithSEOAndShortDescription)
      mockBlocksToText.mockReturnValueOnce(`${'Z'.repeat(210)}`)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })

      expect(metadata.description).toBe('Custom SEO Description for Testing')
    })

    it('should use special "cake-by-post" optimization when no custom SEO', async () => {
      const cakeByPostHamper = {
        ...mockHamper,
        slug: { current: 'cake-by-post' }
      }
      mockGetGiftHamperBySlug.mockResolvedValue(cakeByPostHamper)

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
      mockGetGiftHamperBySlug.mockResolvedValue(cakeByPostWithSEO)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'cake-by-post' }) })

      // Custom SEO should override the hardcoded "cake-by-post" optimization
      expect(metadata.title).toBe('My Custom Cake by Post Title')
      expect(metadata.description).toBe('My custom description')
      expect(metadata.keywords).toBe('custom, keywords')
    })

    it('should return 404 metadata for missing hamper', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue(null)

      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'non-existent' }) })

      expect(metadata.title).toBe('Gift hamper not found')
    })
  })

  describe('Rendering', () => {
    function getProductStructuredData(container: HTMLElement) {
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find((script) =>
        script.textContent?.includes('"@type":"Product"') || script.textContent?.includes('"@graph"')
      )

      expect(productScript).toBeDefined()

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      const product = jsonLd['@graph']
        ? jsonLd['@graph'].find((item: UnknownRecord) => item['@type'] === 'Product')
        : jsonLd

      expect(product).toBeDefined()

      return product as UnknownRecord
    }

    it('should render hamper page', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue(mockHamper)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })

      const { queryByText } = render(page)

      expect(queryByText('Breadcrumbs')).not.toBeInTheDocument()
    })

    it('should escape html fragments in JSON-LD script output', async () => {
      const hamperWithUnsafeContent = {
        ...mockHamper,
        name: 'Deluxe <script>alert("xss")</script> Hamper',
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(hamperWithUnsafeContent)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find((script) =>
        script.textContent?.includes('"@type":"Product"') || script.textContent?.includes('"@graph"')
      )

      expect(productScript).toBeDefined()

      const scriptText = productScript?.textContent || ''
      expect(scriptText).toContain('\\u003cscript')
      expect(scriptText).not.toContain('<script')
    })

    it('should not include BreadcrumbList structured data', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue(mockHamper)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const breadcrumbScript = Array.from(scripts).find((script) =>
        script.textContent?.includes('"@type":"BreadcrumbList"')
      )

      expect(breadcrumbScript).toBeUndefined()
    })

    it('uses visible description source for cake-by-post Product schema when description exists', async () => {
      const cakeByPostHamper = {
        ...mockHamper,
        slug: { current: 'cake-by-post' },
        description: [{ _type: 'block', children: [{ text: 'Ignored by blocksToText mock' }] }],
        shortDescription: [{ _type: 'block', children: [{ text: 'Fallback short description text' }] }],
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(cakeByPostHamper)
      mockBlocksToText
        .mockReturnValueOnce('We dispatch cake-by-post orders within 2-3 working days. Free UK shipping is included.')
        .mockReturnValueOnce('  Visible   CMS \n description text  ')

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'cake-by-post' }) })
      const { container } = render(page)

      const product = getProductStructuredData(container)
      const description = product.description as string

      expect(description).toBe('Visible CMS description text')
      expect(description).not.toContain('pack of 2 slices')
      expect(description).not.toContain('vacuum-packed')
    })

    it('uses shortDescription for Product schema when full description is unavailable', async () => {
      const hamperWithoutDescription = {
        ...mockHamper,
        description: [],
        shortDescription: [{ _type: 'block', children: [{ text: 'Ignored by blocksToText mock' }] }],
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(hamperWithoutDescription)
      mockBlocksToText
        .mockReturnValueOnce('We dispatch cake-by-post orders within 2-3 working days. Free UK shipping is included.')
        .mockReturnValueOnce('  Short   description \n from CMS  ')

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const product = getProductStructuredData(container)
      expect(product.description).toBe('Short description from CMS')
    })

    it('uses visible fallback for Product schema when both description fields are absent', async () => {
      const hamperWithoutDescriptions = {
        ...mockHamper,
        description: [],
        shortDescription: [],
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(hamperWithoutDescriptions)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const product = getProductStructuredData(container)
      expect(product.description).toBe('Handmade cake-by-post hamper prepared in Leeds and packed with care for UK delivery.')
    })

    it('includes shippingDetails in Offer when delivery text matches policy', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue({
        ...mockHamper,
        deliverySection: {
          descriptionSource: 'custom',
          customDescription: [{ _type: 'block', children: [{ text: 'We dispatch cake-by-post orders within 2-3 working days. Free UK shipping is included.' }] }]
        },
        giftHampersDeliverySection: {
          name: 'Delivery',
          policy: {
            dispatchMinDays: 2,
            dispatchMaxDays: 3,
            shippingFeeGbp: 0,
            shippingDestinationCountry: 'GB',
            deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
          }
        },
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      })
      mockBlocksToText
        .mockReturnValueOnce('We dispatch cake-by-post orders within 2-3 working days. Free UK shipping is included.')
        .mockReturnValueOnce('We dispatch cake-by-post orders within 2-3 working days. Free UK shipping is included.')

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const product = getProductStructuredData(container)
      const offer = product.offers as UnknownRecord

      expect(offer.shippingDetails).toBeDefined()
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
        deliveryMethod: true
      })
    })

    it('omits shippingDetails when delivery text conflicts with policy values', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      const previousNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      mockGetGiftHamperBySlug.mockResolvedValue({
        ...mockHamper,
        seo: {
          metaTitle: 'Custom Title',
          metaDescription: 'Custom Description'
        },
        deliverySection: {
          descriptionSource: 'custom',
          customDescription: [{ _type: 'block', children: [{ text: 'We dispatch cake-by-post orders within 5-7 working days. Free UK shipping is included.' }] }]
        },
        giftHampersDeliverySection: {
          name: 'Delivery',
          policy: {
            dispatchMinDays: 2,
            dispatchMaxDays: 3,
            shippingFeeGbp: 0,
            shippingDestinationCountry: 'GB',
            deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
          }
        },
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      })
      mockBlocksToText
        .mockReturnValueOnce('We dispatch cake-by-post orders within 5-7 working days. Free UK shipping is included.')
        .mockReturnValueOnce('We dispatch cake-by-post orders within 5-7 working days. Free UK shipping is included.')

      try {
        const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
        const { container } = render(page)

        const product = getProductStructuredData(container)
        const offer = product.offers as UnknownRecord

        expect(offer.shippingDetails).toBeUndefined()
        expect(offer.hasMerchantReturnPolicy).toBeDefined()
        expect(consoleWarnSpy).not.toHaveBeenCalled()
      } finally {
        process.env.NODE_ENV = previousNodeEnv
        consoleWarnSpy.mockRestore()
      }
    })

    it('omits shippingDetails when explicit paid fee conflicts with policy fee', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      mockGetGiftHamperBySlug.mockResolvedValue({
        ...mockHamper,
        deliverySection: {
          descriptionSource: 'custom',
          customDescription: [{ _type: 'block', children: [{ text: 'Dispatch in 2-3 working days. UK delivery is \u00A35.' }] }]
        },
        giftHampersDeliverySection: {
          name: 'Delivery',
          policy: {
            dispatchMinDays: 2,
            dispatchMaxDays: 3,
            shippingFeeGbp: 6,
            shippingDestinationCountry: 'GB',
            deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
          }
        },
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      })
      mockBlocksToText
        .mockReturnValueOnce('Dispatch in 2-3 working days. UK delivery is \u00A35.')
        .mockReturnValueOnce('Dispatch in 2-3 working days. UK delivery is \u00A35.')

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)
      const product = getProductStructuredData(container)
      const offer = product.offers as UnknownRecord

      expect(offer.shippingDetails).toBeUndefined()
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('shipping fee \u00A35'))

      consoleWarnSpy.mockRestore()
    })

    it('keeps shippingDetails when delivery text says UK and policy country input is non-GB', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      mockGetGiftHamperBySlug.mockResolvedValue({
        ...mockHamper,
        deliverySection: {
          descriptionSource: 'custom',
          customDescription: [{ _type: 'block', children: [{ text: 'We dispatch cake-by-post orders within 2-3 working days. Free UK shipping is included.' }] }]
        },
        giftHampersDeliverySection: {
          name: 'Delivery',
          policy: {
            dispatchMinDays: 2,
            dispatchMaxDays: 3,
            shippingFeeGbp: 0,
            shippingDestinationCountry: 'DE',
            deliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail'
          }
        },
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      })
      mockBlocksToText
        .mockReturnValueOnce('We dispatch cake-by-post orders within 2-3 working days. Free UK shipping is included.')
        .mockReturnValueOnce('We dispatch cake-by-post orders within 2-3 working days. Free UK shipping is included.')

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)
      const product = getProductStructuredData(container)
      const offer = product.offers as UnknownRecord

      expect(offer.shippingDetails).toBeDefined()
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })

    it('normalizes unsupported deliveryMethod to default before emitting shippingDetails', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue({
        ...mockHamper,
        deliverySection: {
          descriptionSource: 'custom',
          customDescription: [{ _type: 'block', children: [{ text: 'Dispatch in 2-3 working days. UK delivery is \u00A36.' }] }],
          policySource: 'custom',
          customPolicy: {
            dispatchMinDays: 2,
            dispatchMaxDays: 3,
            shippingFeeGbp: 6,
            shippingDestinationCountry: 'GB',
            deliveryMethod: 'https://example.com/custom-delivery-method'
          }
        },
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      })
      mockBlocksToText.mockReturnValue('Dispatch in 2-3 working days. UK delivery is \u00A36.')

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
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

    it('omits aggregateRating from Product structured data', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue({
        ...mockHamper,
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      })

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find((script) =>
        script.textContent?.includes('"@type":"Product"') || script.textContent?.includes('"@graph"')
      )

      expect(productScript).toBeDefined()

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      const product = jsonLd['@graph']
        ? jsonLd['@graph'].find((item: UnknownRecord) => item['@type'] === 'Product')
        : jsonLd

      expect(product).toBeDefined()
      expect(product.aggregateRating).toBeUndefined()
    })

    it('omits review from Product structured data', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue({
        ...mockHamper,
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      })

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find((script) =>
        script.textContent?.includes('"@type":"Product"') || script.textContent?.includes('"@graph"')
      )

      expect(productScript).toBeDefined()

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      const product = jsonLd['@graph']
        ? jsonLd['@graph'].find((item: UnknownRecord) => item['@type'] === 'Product')
        : jsonLd

      expect(product).toBeDefined()
      expect(product.review).toBeUndefined()
    })

    it('should call notFound for missing hamper', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue(null)

      await expect(async () => {
        await HamperDetailPage({ params: Promise.resolve({ slug: 'non-existent' }) })
      }).rejects.toThrow('NEXT_NOT_FOUND')
      
      expect(notFound).toHaveBeenCalled()
    })

    it('passes fallback backHref to GiftHamperPageClient when from param is missing', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue(mockHamper)

      const page = await HamperDetailPage({
        params: Promise.resolve({ slug: 'deluxe-hamper' }),
        searchParams: Promise.resolve({})
      })
      render(page)

      expect(capturedGiftHamperPageClientProps).not.toBeNull()
      expect(capturedGiftHamperPageClientProps?.backHref).toBe('/cakes-by-post')
    })

    it('omits FAQPage JSON-LD and does not pass faqItems for a standard hamper', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue(mockHamper)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      expect(capturedGiftHamperPageClientProps).not.toBeNull()
      expect(capturedGiftHamperPageClientProps?.faqItems).toBeUndefined()

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const faqScript = Array.from(scripts).find((script) =>
        script.textContent?.includes('"@type":"FAQPage"')
      )

      expect(faqScript).toBeUndefined()
    })

    it('omits FAQPage JSON-LD and faqItems for cake-by-post slug', async () => {
      const cakeByPostHamper = {
        ...mockHamper,
        slug: { current: 'cake-by-post' }
      }
      mockGetGiftHamperBySlug.mockResolvedValue(cakeByPostHamper)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'cake-by-post' }) })
      const { container } = render(page)

      expect(capturedGiftHamperPageClientProps).not.toBeNull()
      expect(capturedGiftHamperPageClientProps?.faqItems).toBeUndefined()

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const faqScript = Array.from(scripts).find((script) =>
        script.textContent?.includes('"@type":"FAQPage"')
      )
      expect(faqScript).toBeUndefined()
    })

    it('omits FAQPage JSON-LD and faqItems even when seo.faq exists', async () => {
      const hamperWithSeoFaq = {
        ...mockHamper,
        seo: {
          faq: [
            { question: 'Q1', answer: 'A1' },
            { question: 'Q2', answer: 'A2' },
            { question: 'Q3', answer: 'A3' },
            { question: 'Q4', answer: 'A4' },
            { question: 'Q5', answer: 'A5' },
            { question: 'Q6', answer: 'A6' },
            { question: 'Q7', answer: 'A7' },
            { question: 'Missing answer', answer: '' }
          ]
        }
      }
      mockGetGiftHamperBySlug.mockResolvedValue(hamperWithSeoFaq)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      expect(capturedGiftHamperPageClientProps).not.toBeNull()
      expect(capturedGiftHamperPageClientProps?.faqItems).toBeUndefined()

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const faqScript = Array.from(scripts).find((script) =>
        script.textContent?.includes('"@type":"FAQPage"')
      )
      expect(faqScript).toBeUndefined()
    })

    it('uses the originating cakes listing as backHref when from is valid', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue(mockHamper)

      const page = await HamperDetailPage({
        params: Promise.resolve({ slug: 'deluxe-hamper' }),
        searchParams: Promise.resolve({
          from: '/cakes?byPost=true&custom=false&page=3'
        })
      })
      render(page)

      expect(capturedGiftHamperPageClientProps?.backHref).toBe('/cakes?byPost=true&custom=false&page=3')
    })

    it('falls back to /cakes-by-post when from includes disallowed query keys', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue(mockHamper)

      const page = await HamperDetailPage({
        params: Promise.resolve({ slug: 'deluxe-hamper' }),
        searchParams: Promise.resolve({
          from: '/cakes?byPost=true&custom=false&page=3&utm_medium=email'
        })
      })
      render(page)

      expect(capturedGiftHamperPageClientProps?.backHref).toBe('/cakes-by-post')
    })

    it('falls back to /cakes-by-post when from is external or fragment-based', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue(mockHamper)

      const externalPage = await HamperDetailPage({
        params: Promise.resolve({ slug: 'deluxe-hamper' }),
        searchParams: Promise.resolve({
          from: 'https://example.com/cakes?page=3'
        })
      })
      render(externalPage)
      expect(capturedGiftHamperPageClientProps?.backHref).toBe('/cakes-by-post')

      const fragmentPage = await HamperDetailPage({
        params: Promise.resolve({ slug: 'deluxe-hamper' }),
        searchParams: Promise.resolve({
          from: '/cakes?page=3#catalog'
        })
      })
      render(fragmentPage)

      expect(capturedGiftHamperPageClientProps?.backHref).toBe('/cakes-by-post')
    })

    it('passes fallback backHref to GiftHamperPageClient when from param is absent and other params exist', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue(mockHamper)

      const page = await HamperDetailPage({
        params: Promise.resolve({ slug: 'deluxe-hamper' }),
        searchParams: Promise.resolve({
          page: '3'
        })
      })
      render(page)

      expect(capturedGiftHamperPageClientProps).not.toBeNull()
      expect(capturedGiftHamperPageClientProps?.backHref).toBe('/cakes-by-post')
    })
  })

  describe('Structured Data - additionalProperty Bug Fix', () => {
    it('should not include non-visible delivery/packaging/shelf-life properties for cake-by-post hampers', async () => {
      const cakeByPostHamper = {
        ...mockHamper,
        slug: { current: 'cake-by-post' },
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(cakeByPostHamper)

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
        ? jsonLd['@graph'].find((item: UnknownRecord) => item['@type'] === 'Product')
        : jsonLd

      expect(product.additionalProperty).toBeUndefined()
    })

    it('should not include nutrition when it is not visible on page', async () => {
      const cakeByPostHamper = {
        ...mockHamper,
        slug: { current: 'cake-by-post' },
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(cakeByPostHamper)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'cake-by-post' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script =>
        script.textContent?.includes('"@type":"Product"')
      )

      expect(productScript).toBeDefined()
      const jsonLd = JSON.parse(productScript!.textContent || '{}')

      const product = jsonLd['@graph']
        ? jsonLd['@graph'].find((item: UnknownRecord) => item['@type'] === 'Product')
        : jsonLd

      expect(product.nutrition).toBeUndefined()
    })

    it('should include ingredient properties when present', async () => {
      const hamperWithIngredients = {
        ...mockHamper,
        ingredients: ['Flour', 'Honey', 'Eggs', 'Sugar'],
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(hamperWithIngredients)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Extract Product from @graph if present
      const product = jsonLd['@graph'] 
        ? jsonLd['@graph'].find((item: UnknownRecord) => item['@type'] === 'Product')
        : jsonLd
      
      const properties = product.additionalProperty
      
      const ingredients = properties.find((p: UnknownRecord) => p.name === 'Ingredients')
      expect(ingredients).toBeDefined()
      expect(ingredients.value).toBe('Flour, Honey, Eggs, Sugar')
    })

    it('should include allergen properties when present', async () => {
      const hamperWithAllergens = {
        ...mockHamper,
        allergens: ['Gluten', 'Eggs', 'Dairy'],
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(hamperWithAllergens)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Extract Product from @graph if present
      const product = jsonLd['@graph'] 
        ? jsonLd['@graph'].find((item: UnknownRecord) => item['@type'] === 'Product')
        : jsonLd
      
      const properties = product.additionalProperty
      
      const allergens = properties.find((p: UnknownRecord) => p.name === 'Allergens')
      expect(allergens).toBeDefined()
      expect(allergens.value).toBe('Gluten, Eggs, Dairy')
    })

    it('CRITICAL: should preserve only visible additionalProperty fields when multiple conditions are true', async () => {
      const fullHamper = {
        ...mockHamper,
        slug: { current: 'cake-by-post' },
        ingredients: ['Flour', 'Honey', 'Eggs', 'Sugar'],
        allergens: ['Gluten', 'Eggs', 'Dairy'],
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(fullHamper)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'cake-by-post' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Extract Product from @graph if present
      const product = jsonLd['@graph'] 
        ? jsonLd['@graph'].find((item: UnknownRecord) => item['@type'] === 'Product')
        : jsonLd
      
      const properties = product.additionalProperty
      
      expect(properties).toHaveLength(2)

      const ingredients = properties.find((p: UnknownRecord) => p.name === 'Ingredients')
      expect(ingredients).toBeDefined()
      expect(ingredients.value).toBe('Flour, Honey, Eggs, Sugar')

      const allergens = properties.find((p: UnknownRecord) => p.name === 'Allergens')
      expect(allergens).toBeDefined()
      expect(allergens.value).toBe('Gluten, Eggs, Dairy')

      const deliveryMethod = properties.find((p: UnknownRecord) => p.name === 'Delivery Method')
      const packaging = properties.find((p: UnknownRecord) => p.name === 'Packaging')
      const shelfLife = properties.find((p: UnknownRecord) => p.name === 'Shelf Life')
      expect(deliveryMethod).toBeUndefined()
      expect(packaging).toBeUndefined()
      expect(shelfLife).toBeUndefined()

      const propertyNames = properties.map((p: UnknownRecord) => p.name)
      const uniqueNames = [...new Set(propertyNames)]
      expect(propertyNames.length).toBe(uniqueNames.length)
    })

    it('should not include additionalProperty when visible fields are absent', async () => {
      const basicHamper = {
        ...mockHamper,
        ingredients: [],
        allergens: [],
        images: [{ asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, isMain: true }]
      }
      mockGetGiftHamperBySlug.mockResolvedValue(basicHamper)

      const page = await HamperDetailPage({ params: Promise.resolve({ slug: 'deluxe-hamper' }) })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      const productScript = Array.from(scripts).find(script => 
        script.textContent?.includes('"@type":"Product"')
      )

      const jsonLd = JSON.parse(productScript!.textContent || '{}')
      
      // Extract Product from @graph if present
      const product = jsonLd['@graph'] 
        ? jsonLd['@graph'].find((item: UnknownRecord) => item['@type'] === 'Product')
        : jsonLd

      expect(product.additionalProperty).toBeUndefined()
    })
  })

  describe('Brand Field Duplication Prevention', () => {
    it('should use @graph format for Product structured data', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue({
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
      mockGetGiftHamperBySlug.mockResolvedValue({
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
      const brandEntities = graph.filter((entity: UnknownRecord) => entity['@type'] === 'Brand')
      
      // Should have exactly one Brand entity
      expect(brandEntities).toHaveLength(1)
      
      // Brand should have unique @id
      expect(brandEntities[0]['@id']).toBe('https://olgishcakes.co.uk/#brand')
      expect(brandEntities[0].name).toBe('Olgish Cakes')
    })

    it('should reference brand by @id in product, not inline object', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue({
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
      const product = graph.find((entity: UnknownRecord) => entity['@type'] === 'Product')
      expect(product).toBeDefined()
      
      // Brand should be a reference by @id, not an inline object
      expect(product.brand).toBeDefined()
      expect(product.brand['@id']).toBe('https://olgishcakes.co.uk/#brand')
      
      // Should NOT have inline brand object with @type
      expect(product.brand['@type']).toBeUndefined()
      expect(product.brand.name).toBeUndefined()
    })

    it('should NOT have duplicate brand fields in structured data', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue({
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
      const product = graph.find((entity: UnknownRecord) => entity['@type'] === 'Product')
      expect(product).toBeDefined()
      
      // Check if brand is an inline object (has @type) - should be false
      const hasInlineBrand = product.brand && product.brand['@type'] === 'Brand'
      expect(hasInlineBrand).toBe(false)
    })

    it('should have consistent brand @id in product structured data', async () => {
      mockGetGiftHamperBySlug.mockResolvedValue({
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
      const brandEntity = graph.find((entity: UnknownRecord) => entity['@type'] === 'Brand')
      expect(brandEntity).toBeDefined()
      const brandId = brandEntity['@id']
      
      // Find Product
      const product = graph.find((entity: UnknownRecord) => entity['@type'] === 'Product')
      expect(product).toBeDefined()
      
      // Verify product references the same brand @id
      expect(product.brand['@id']).toBe(brandId)
    })
  })
})

