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

      const metadata = await generateMetadata({ params: { slug: 'honey-cake' } })

      expect(metadata.title).toBe('Custom Title')
      expect(metadata.description).toBe('Custom Description')
    })

    it('should use default title when no SEO title', async () => {
      const cakeWithoutSEO = { ...mockCake, seo: undefined }
      mockFetch.mockResolvedValue(cakeWithoutSEO)

      const metadata = await generateMetadata({ params: { slug: 'honey-cake' } })

      expect(metadata.title).toContain('Honey Cake')
    })

    it('should generate description from shortDescription', async () => {
      const cakeWithoutSEO = {
        ...mockCake,
        seo: undefined,
        shortDescription: [{ children: [{ text: 'Test description' }] }]
      }
      mockFetch.mockResolvedValue(cakeWithoutSEO)

      const metadata = await generateMetadata({ params: { slug: 'honey-cake' } })

      expect(metadata.description).toContain('Converted text')
    })

    it('should return 404 metadata for missing cake', async () => {
      mockFetch.mockResolvedValue(null)

      const metadata = await generateMetadata({ params: { slug: 'non-existent' } })

      expect(metadata.title).toContain('Not Found')
    })

    it('should include OpenGraph data', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const metadata = await generateMetadata({ params: { slug: 'honey-cake' } })

      expect(metadata.openGraph).toBeDefined()
    })

    it('should include keywords', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const metadata = await generateMetadata({ params: { slug: 'honey-cake' } })

      expect(metadata.keywords).toBeDefined()
    })
  })

  describe('Page Rendering', () => {
    it('should render cake page', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: { slug: 'honey-cake' } })

      expect(() => render(page)).not.toThrow()
    })

    it('should call notFound for missing cake', async () => {
      mockFetch.mockResolvedValue(null)

      await expect(async () => {
        await CakeDetailPage({ params: { slug: 'non-existent' } })
      }).rejects.toThrow('NEXT_NOT_FOUND')

      expect(notFound).toHaveBeenCalled()
    })

    it('should include structured data', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const page = await CakeDetailPage({ params: { slug: 'honey-cake' } })
      const { container } = render(page)

      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBeGreaterThan(0)
    })
  })
})

