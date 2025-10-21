/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'
import HamperDetailPage, { generateStaticParams, generateMetadata } from '../page'
import { notFound } from 'next/navigation'

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
    it('should generate metadata', async () => {
      mockFetch.mockResolvedValue(mockHamper)

      const metadata = await generateMetadata({ params: { slug: 'deluxe-hamper' } })

      expect(metadata.title).toContain('Deluxe Hamper')
    })

    it('should return 404 metadata for missing hamper', async () => {
      mockFetch.mockResolvedValue(null)

      const metadata = await generateMetadata({ params: { slug: 'non-existent' } })

      expect(metadata.title).toContain('Not Found')
    })
  })

  describe('Rendering', () => {
    it('should render hamper page', async () => {
      mockFetch.mockResolvedValue(mockHamper)

      const page = await HamperDetailPage({ params: { slug: 'deluxe-hamper' } })

      expect(() => render(page)).not.toThrow()
    })

    it('should call notFound for missing hamper', async () => {
      mockFetch.mockResolvedValue(null)

      await expect(async () => {
        await HamperDetailPage({ params: { slug: 'non-existent' } })
      }).rejects.toThrow('NEXT_NOT_FOUND')
      
      expect(notFound).toHaveBeenCalled()
    })
  })
})

