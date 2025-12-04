/**
 * @jest-environment node
 * 
 * Unit tests for Google Merchant Center Feed Route
 * 
 * These tests prevent the "Missing field 'image'" issue in Google Search Console
 * by ensuring all products in the XML feed include the required <g:image_link> tag.
 */

// Mock unstable_cache to bypass Next.js context requirement
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn)
}))

// Mock the data fetching functions
jest.mock('@/app/utils/fetchCakes', () => ({
  getAllCakes: jest.fn()
}))

jest.mock('@/app/utils/fetchGiftHampers', () => ({
  getAllGiftHampers: jest.fn()
}))

jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn((image: { asset?: { _ref: string } }) => ({
    width: () => ({
      height: () => ({
        url: () => image?.asset?._ref 
          ? `https://cdn.sanity.io/images/${image.asset._ref}/800x800.jpg`
          : 'https://olgishcakes.co.uk/images/placeholder-cake.jpg'
      })
    })
  }))
}))

import { getAllCakes } from '@/app/utils/fetchCakes'
import { getAllGiftHampers } from '@/app/utils/fetchGiftHampers'
import type { Cake } from '@/types/cake'
import type { GiftHamper } from '@/types/giftHamper'
import { NextRequest } from 'next/server'
import { GET } from '../route'

const mockGetAllCakes = getAllCakes as jest.MockedFunction<typeof getAllCakes>
const mockGetAllGiftHampers = getAllGiftHampers as jest.MockedFunction<typeof getAllGiftHampers>

describe('Merchant Center Feed Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const baseUrl = 'https://olgishcakes.co.uk'

  const createMockCake = (overrides: Partial<Cake> = {}): Cake => ({
    _id: 'cake-123',
    _createdAt: '2025-01-01',
    name: 'Test Cake',
    slug: { current: 'test-cake' },
    description: [],
    shortDescription: [],
    size: '6',
    pricing: { standard: 30, individual: 35 },
    designs: {
      standard: [],
      individual: []
    },
    category: 'Honey Cake',
    ingredients: ['flour', 'eggs'],
    allergens: [],
    ...overrides
  })

  const createMockHamper = (overrides: Partial<GiftHamper> = {}): GiftHamper => ({
    _id: 'hamper-123',
    _createdAt: '2025-01-01',
    name: 'Test Hamper',
    slug: { current: 'test-hamper' },
    price: 35,
    category: 'Gift Hamper',
    ...overrides
  })

  describe('Image field inclusion', () => {
    it('should include <g:image_link> for cake with mainImage', async () => {
      const cake: Cake = createMockCake({
        mainImage: {
          _type: 'image',
          asset: {
            _ref: 'image-main-123',
            url: 'https://example.com/main.jpg'
          }
        }
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(xml).toContain('<g:image_link>')
      expect(xml).toContain('image-main-123')
      expect(xml).toMatch(/<g:image_link>[^<]+<\/g:image_link>/)
    })

    it('should include <g:image_link> for legacy cake using images array (like Honey Cake)', async () => {
      // This test specifically prevents the missing image field issue for legacy products
      const honeyCake: Cake = createMockCake({
        _id: 'honey-cake-medovik',
        name: 'Honey Cake (Medovik)',
        slug: { current: 'honey-cake-medovik' },
        mainImage: undefined,
        designs: { standard: [], individual: [] },
        images: [
          {
            _type: 'image',
            asset: {
              _ref: 'image-legacy-123',
              _type: 'reference'
            }
          }
        ]
      })

      mockGetAllCakes.mockResolvedValue([honeyCake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(xml).toContain('<g:image_link>')
      expect(xml).toContain('image-legacy-123')
      expect(xml).toMatch(/<g:image_link>[^<]+<\/g:image_link>/)
      expect(xml).toContain('honey-cake-medovik')
    })

    it('should include <g:image_link> for cake with designs.standard images', async () => {
      const cake: Cake = createMockCake({
        mainImage: undefined,
        designs: {
          standard: [
            {
              _type: 'image',
              asset: {
                _ref: 'image-design-123',
                _type: 'reference'
              },
              isMain: true
            }
          ],
          individual: []
        }
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(xml).toContain('<g:image_link>')
      expect(xml).toContain('image-design-123')
    })

    it('should include <g:image_link> for cake with designs.individual images', async () => {
      const cake: Cake = createMockCake({
        mainImage: undefined,
        designs: {
          standard: [],
          individual: [
            {
              _type: 'image',
              asset: {
                _ref: 'image-individual-123',
                _type: 'reference'
              }
            }
          ]
        }
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(xml).toContain('<g:image_link>')
      expect(xml).toContain('image-individual-123')
    })

    it('should use placeholder image when no images available', async () => {
      const cake: Cake = createMockCake({
        mainImage: undefined,
        designs: { standard: [], individual: [] },
        images: undefined
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(xml).toContain('<g:image_link>')
      expect(xml).toContain('placeholder-cake.jpg')
    })

    it('should include <g:image_link> for gift hampers', async () => {
      const hamper: GiftHamper = createMockHamper({
        images: [
          {
            _type: 'image',
            asset: {
              _ref: 'hamper-image-123'
            },
            isMain: true
          }
        ]
      })

      mockGetAllCakes.mockResolvedValue([])
      mockGetAllGiftHampers.mockResolvedValue([hamper])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(xml).toContain('<g:image_link>')
      expect(xml).toContain('hamper-image-123')
    })

    it('should prioritize mainImage over other image sources', async () => {
      const cake: Cake = createMockCake({
        mainImage: {
          _type: 'image',
          asset: {
            _ref: 'main-image-123',
            url: 'https://example.com/main.jpg'
          }
        },
        designs: {
          standard: [
            {
              _type: 'image',
              asset: {
                _ref: 'design-image-123',
                _type: 'reference'
              },
              isMain: true
            }
          ],
          individual: []
        },
        images: [
          {
            _type: 'image',
            asset: {
              _ref: 'legacy-image-123',
              _type: 'reference'
            }
          }
        ]
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(xml).toContain('main-image-123')
      expect(xml).not.toContain('design-image-123')
      expect(xml).not.toContain('legacy-image-123')
    })

    it('should prioritize isMain flag in designs.standard over regular images', async () => {
      const cake: Cake = createMockCake({
        mainImage: undefined,
        designs: {
          standard: [
            {
              _type: 'image',
              asset: {
                _ref: 'regular-image-123',
                _type: 'reference'
              },
              isMain: false
            },
            {
              _type: 'image',
              asset: {
                _ref: 'main-design-image-123',
                _type: 'reference'
              },
              isMain: true
            }
          ],
          individual: []
        },
        images: [
          {
            _type: 'image',
            asset: {
              _ref: 'legacy-image-123',
              _type: 'reference'
            }
          }
        ]
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(xml).toContain('main-design-image-123')
      expect(xml).not.toContain('regular-image-123')
      expect(xml).not.toContain('legacy-image-123')
    })
  })

  describe('XML structure validation', () => {
    it('should generate valid XML structure', async () => {
      const cake: Cake = createMockCake({
        mainImage: {
          _type: 'image',
          asset: {
            _ref: 'image-123',
            url: 'https://example.com/image.jpg'
          }
        }
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xml).toContain('<rss version="2.0"')
      expect(xml).toContain('<channel>')
      expect(xml).toContain('</channel>')
      expect(xml).toContain('</rss>')
    })

    it('should include all required merchant center fields for each product', async () => {
      const cake: Cake = createMockCake({
        mainImage: {
          _type: 'image',
          asset: {
            _ref: 'image-123',
            url: 'https://example.com/image.jpg'
          }
        }
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(xml).toContain('<g:id>')
      expect(xml).toContain('<g:title>')
      expect(xml).toContain('<g:description>')
      expect(xml).toContain('<g:link>')
      expect(xml).toContain('<g:image_link>')
      expect(xml).toContain('<g:price>')
      expect(xml).toContain('<g:availability>')
      expect(xml).toContain('<g:condition>')
      expect(xml).toContain('<g:brand>')
    })

    it('should escape XML special characters in image URLs', async () => {
      // Mock urlFor to return a URL with special characters
      const { urlFor } = require('@/sanity/lib/image')
      jest.mocked(urlFor).mockReturnValueOnce({
        width: () => ({
          height: () => ({
            url: () => 'https://example.com/image.jpg?param=value&other=test'
          })
        })
      })

      const cake: Cake = createMockCake({
        mainImage: {
          _type: 'image',
          asset: {
            _ref: 'image-123',
            url: 'https://example.com/image.jpg?param=value&other=test'
          }
        }
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      // Should escape & to &amp;
      const imageLinkMatch = xml.match(/<g:image_link>([^<]+)<\/g:image_link>/)
      if (imageLinkMatch) {
        expect(imageLinkMatch[1]).toContain('&amp;')
        // Should not contain unescaped & (that's not part of &amp;)
        const unescapedAmpersand = imageLinkMatch[1].match(/&(?!amp;)/)
        expect(unescapedAmpersand).toBeNull()
      }
    })
  })

  describe('Multiple products handling', () => {
    it('should include image_link for all cakes in feed', async () => {
      const cakes: Cake[] = [
        createMockCake({
          _id: 'cake-1',
          name: 'Cake 1',
          slug: { current: 'cake-1' },
          mainImage: {
            _type: 'image',
            asset: { _ref: 'image-1', url: 'https://example.com/1.jpg' }
          }
        }),
        createMockCake({
          _id: 'cake-2',
          name: 'Cake 2',
          slug: { current: 'cake-2' },
          images: [
            {
              _type: 'image',
              asset: { _ref: 'image-2', _type: 'reference' }
            }
          ]
        }),
        createMockCake({
          _id: 'cake-3',
          name: 'Cake 3',
          slug: { current: 'cake-3' },
          designs: {
            standard: [
              {
                _type: 'image',
                asset: { _ref: 'image-3', _type: 'reference' }
              }
            ],
            individual: []
          }
        })
      ]

      mockGetAllCakes.mockResolvedValue(cakes)
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      const imageLinkMatches = xml.match(/<g:image_link>/g)
      expect(imageLinkMatches).toHaveLength(3)
      expect(xml).toContain('image-1')
      expect(xml).toContain('image-2')
      expect(xml).toContain('image-3')
    })

    it('should handle empty product lists', async () => {
      mockGetAllCakes.mockResolvedValue([])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(response.status).toBe(200)
      expect(xml).toContain('<channel>')
      expect(xml).toContain('</channel>')
      expect(xml).not.toContain('<g:image_link>')
    })
  })

  describe('Error handling', () => {
    it('should return 500 error when data fetching fails', async () => {
      mockGetAllCakes.mockRejectedValue(new Error('Fetch failed'))
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json.error).toBe('Failed to generate product feed')
    })

    it('should handle partial failures gracefully', async () => {
      const cake: Cake = createMockCake({
        mainImage: {
          _type: 'image',
          asset: { _ref: 'image-123', url: 'https://example.com/image.jpg' }
        }
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockRejectedValue(new Error('Hamper fetch failed'))

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(500)
    })
  })

  describe('Response headers', () => {
    it('should set correct content type header', async () => {
      const cake: Cake = createMockCake({
        mainImage: {
          _type: 'image',
          asset: { _ref: 'image-123', url: 'https://example.com/image.jpg' }
        }
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)

      expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8')
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600')
    })
  })

  describe('Availability conversion', () => {
    it('should convert Schema.org availability to merchant center format', async () => {
      const cake: Cake = createMockCake({
        mainImage: {
          _type: 'image',
          asset: { _ref: 'image-123', url: 'https://example.com/image.jpg' }
        },
        structuredData: {
          availability: 'InStock'
        }
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(xml).toContain('<g:availability>in stock</g:availability>')
    })

    it('should handle OutOfStock availability', async () => {
      const cake: Cake = createMockCake({
        mainImage: {
          _type: 'image',
          asset: { _ref: 'image-123', url: 'https://example.com/image.jpg' }
        },
        structuredData: {
          availability: 'OutOfStock'
        }
      })

      mockGetAllCakes.mockResolvedValue([cake])
      mockGetAllGiftHampers.mockResolvedValue([])

      const request = new NextRequest(`${baseUrl}/api/merchant-center/feed`)
      const response = await GET(request)
      const xml = await response.text()

      expect(xml).toContain('<g:availability>out of stock</g:availability>')
    })
  })
})

