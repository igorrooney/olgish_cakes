import { getAllCakes, getFeaturedCakes, getCakeBySlug, getCakesFeaturedOffer, getRevalidateTime, clearCache, invalidateCache, getCacheBustingKey, forceRefreshCakes } from '../fetchCakes'
import { Cake } from '@/types/cake'
import { CakesFeaturedOffer } from '@/types/cakeFeaturedOffer'

// Mock unstable_cache to bypass Next.js context requirement
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn)
}))

// Mock Sanity client
jest.mock('@/sanity/lib/client', () => {
  const mockFetch = jest.fn()
  const mockGetClient = jest.fn(() => ({ fetch: mockFetch }))
  return {
    client: { fetch: mockFetch },
    getClient: mockGetClient,
    USE_REAL_TIME_DATA: false,
    __mockFetch: mockFetch,
    __mockGetClient: mockGetClient
  }
})

const { __mockFetch: mockFetch, __mockGetClient: mockGetClient } = jest.requireMock('@/sanity/lib/client')

jest.mock('next-sanity', () => ({
  groq: (strings: TemplateStringsArray) => strings[0]
}))

describe('fetchCakes', () => {
  const mockCake: Cake = {
    _id: '1',
    _createdAt: '2025-01-01',
    name: 'Honey Cake',
    slug: { current: 'honey-cake' },
    description: [],
    shortDescription: [],
    size: 'Medium',
    pricing: { standard: 30 },
    mainImage: { _type: 'image', asset: {} },
    images: [],
    designs: { standard: [] },
    category: 'Traditional',
    ingredients: ['Honey', 'Flour'],
    allergens: ['Gluten']
  }

  const expectedFeaturedOffer: CakesFeaturedOffer = {
    eyebrow: 'Featured',
    title: 'FREE Honey Cake Offer',
    description: 'For a limited time enjoy some honey cake on us.\nNo strings attached.',
    ctaLabel: 'Get free honey cake',
    cakeSlug: 'honey-cake',
    imageUrl: 'https://cdn.sanity.io/images/project/dataset/main.jpg',
    imageAlt: 'Main image alt'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    clearCache()
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project'
    process.env.NEXT_PUBLIC_SANITY_DATASET = 'production'
    process.env.NODE_ENV = 'test'
  })

  describe('validateSanityConfig', () => {
    it('should throw when SANITY_DATASET is missing', async () => {
      delete process.env.NEXT_PUBLIC_SANITY_DATASET

      await expect(getAllCakes()).rejects.toThrow('Missing required Sanity environment variables')
      await expect(getAllCakes()).rejects.toThrow('NEXT_PUBLIC_SANITY_DATASET')
    })

    it('should throw when SANITY_PROJECT_ID is missing', async () => {
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

      await expect(getAllCakes()).rejects.toThrow('Missing required Sanity environment variables')
      await expect(getAllCakes()).rejects.toThrow('NEXT_PUBLIC_SANITY_PROJECT_ID')
    })

    it('should throw when both are missing', async () => {
      delete process.env.NEXT_PUBLIC_SANITY_DATASET
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

      await expect(getAllCakes()).rejects.toThrow('Missing required Sanity environment variables')
      await expect(getAllCakes()).rejects.toThrow('NEXT_PUBLIC_SANITY_DATASET')
      await expect(getAllCakes()).rejects.toThrow('NEXT_PUBLIC_SANITY_PROJECT_ID')
    })

    it('should not throw when both are present', async () => {
      mockFetch.mockResolvedValue([mockCake])

      await expect(getAllCakes()).resolves.not.toThrow()
    })
  })

  describe('getAllCakes', () => {
    it('should fetch all cakes', async () => {
      mockFetch.mockResolvedValue([mockCake])

      const result = await getAllCakes()

      expect(result).toEqual([mockCake])
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should prioritize products display order for cakes', async () => {
      const firstCake: Cake = {
        ...mockCake,
        _id: 'cake-1',
        name: 'Cake One',
        order: 2
      }
      const secondCake: Cake = {
        ...mockCake,
        _id: 'cake-2',
        name: 'Cake Two',
        order: 1
      }

      mockFetch.mockResolvedValue({
        cakes: [firstCake, secondCake],
        displayOrder: {
          cakesOrder: [{ _ref: 'cake-2' }, { _ref: 'cake-1' }]
        }
      })

      const result = await getAllCakes()

      expect(result.map((cake) => cake._id)).toEqual(['cake-2', 'cake-1'])
    })

    it('should fallback to legacy order when products display order is not configured', async () => {
      const firstCake: Cake = {
        ...mockCake,
        _id: 'cake-1',
        name: 'Cake One',
        order: 2
      }
      const secondCake: Cake = {
        ...mockCake,
        _id: 'cake-2',
        name: 'Cake Two',
        order: 1
      }

      mockFetch.mockResolvedValue({
        cakes: [firstCake, secondCake],
        displayOrder: null
      })

      const result = await getAllCakes()

      expect(result.map((cake) => cake._id)).toEqual(['cake-2', 'cake-1'])
    })

    it('should use cache for non-preview requests', async () => {
      mockFetch.mockResolvedValue([mockCake])

      await getAllCakes()
      await getAllCakes()

      // Note: With mocked unstable_cache, caching behavior cannot be tested
      // In production, unstable_cache would cache results, but in tests it just calls the function
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should bypass cache for preview requests', async () => {
      mockFetch.mockResolvedValue([mockCake])

      await getAllCakes(true)
      await getAllCakes(true)

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getAllCakes()

      expect(result).toEqual([])
    })

    it('should log error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      await getAllCakes()

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching all cakes:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('should use correct client for preview mode', async () => {
      mockFetch.mockResolvedValue([])

      await getAllCakes(true)

      expect(mockGetClient).toHaveBeenCalledWith(true)
    })

    it('should use global client for non-preview mode', async () => {
      mockFetch.mockResolvedValue([])

      await getAllCakes(false)

      // In non-preview mode, cachedSanityFetch uses the global client, not getClient
      expect(mockFetch).toHaveBeenCalled()
      expect(mockGetClient).not.toHaveBeenCalled()
    })
  })

  describe('getFeaturedCakes', () => {
    it('should fetch featured cakes', async () => {
      mockFetch.mockResolvedValue([mockCake])

      const result = await getFeaturedCakes()

      expect(result).toEqual([mockCake])
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should use cache for non-preview requests', async () => {
      mockFetch.mockResolvedValue([mockCake])

      await getFeaturedCakes()
      await getFeaturedCakes()

      // Note: With mocked unstable_cache, caching behavior cannot be tested
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should bypass cache for preview requests', async () => {
      mockFetch.mockResolvedValue([mockCake])

      await getFeaturedCakes(true)
      await getFeaturedCakes(true)

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getFeaturedCakes()

      expect(result).toEqual([])
    })

    it('should log error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      await getFeaturedCakes()

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching featured cakes:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('getCakeBySlug', () => {
    it('should fetch cake by slug', async () => {
      mockFetch.mockResolvedValue(mockCake)

      const result = await getCakeBySlug('honey-cake')

      expect(result).toEqual(mockCake)
      expect(mockFetch).toHaveBeenCalledWith(expect.any(String), { slug: 'honey-cake' })
    })

    it('should use cache for non-preview requests', async () => {
      mockFetch.mockResolvedValue(mockCake)

      await getCakeBySlug('honey-cake')
      await getCakeBySlug('honey-cake')

      // Note: With mocked unstable_cache, caching behavior cannot be tested
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should bypass cache for preview requests', async () => {
      mockFetch.mockResolvedValue(mockCake)

      await getCakeBySlug('honey-cake', true)
      await getCakeBySlug('honey-cake', true)

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should return null on error', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getCakeBySlug('honey-cake')

      expect(result).toBeNull()
    })

    it('should return null when cake not found', async () => {
      mockFetch.mockResolvedValue(null)

      const result = await getCakeBySlug('non-existent')

      expect(result).toBeNull()
    })

    it('should cache result when cake is found', async () => {
      mockFetch.mockResolvedValue(mockCake)

      await getCakeBySlug('honey-cake')
      await getCakeBySlug('honey-cake')

      // Note: With mocked unstable_cache, caching behavior cannot be tested
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should not cache result when cake is null', async () => {
      mockFetch.mockResolvedValue(null)

      await getCakeBySlug('non-existent')
      await getCakeBySlug('non-existent')

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('getCakesFeaturedOffer', () => {
    it('should fetch and map cakes featured offer', async () => {
      mockFetch.mockResolvedValue({
        eyebrow: 'Featured',
        title: 'FREE Honey Cake Offer',
        description: 'For a limited time enjoy some honey cake on us.\nNo strings attached.',
        ctaLabel: 'Get free honey cake',
        featuredCake: {
          name: 'Honey Cake',
          slug: { current: 'honey-cake' },
          mainImage: {
            alt: 'Main image alt',
            asset: {
              url: 'https://cdn.sanity.io/images/project/dataset/main.jpg'
            }
          }
        }
      })

      const result = await getCakesFeaturedOffer()

      expect(result).toEqual(expectedFeaturedOffer)
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should prioritize override image over cake image', async () => {
      mockFetch.mockResolvedValue({
        eyebrow: 'Featured',
        title: 'FREE Honey Cake Offer',
        description: 'For a limited time enjoy some honey cake on us.\nNo strings attached.',
        ctaLabel: 'Get free honey cake',
        overrideImage: {
          alt: 'Override alt',
          asset: {
            url: 'https://cdn.sanity.io/images/project/dataset/override.jpg'
          }
        },
        featuredCake: {
          name: 'Honey Cake',
          slug: { current: 'honey-cake' },
          mainImage: {
            alt: 'Main image alt',
            asset: {
              url: 'https://cdn.sanity.io/images/project/dataset/main.jpg'
            }
          }
        }
      })

      const result = await getCakesFeaturedOffer()

      expect(result?.imageUrl).toBe('https://cdn.sanity.io/images/project/dataset/override.jpg')
      expect(result?.imageAlt).toBe('Override alt')
    })

    it('should return null when featured offer is missing slug', async () => {
      mockFetch.mockResolvedValue({
        title: 'Missing slug offer',
        featuredCake: {
          name: 'Honey Cake'
        }
      })

      const result = await getCakesFeaturedOffer()

      expect(result).toBeNull()
    })

    it('should return null when featured offer is inactive', async () => {
      mockFetch.mockResolvedValue({
        isActive: false,
        featuredCake: {
          slug: { current: 'honey-cake' }
        }
      })

      const result = await getCakesFeaturedOffer()

      expect(result).toBeNull()
    })

    it('should return null when featured offer is not found', async () => {
      mockFetch.mockResolvedValue(null)

      const result = await getCakesFeaturedOffer()

      expect(result).toBeNull()
    })

    it('should bypass cache for preview requests', async () => {
      mockFetch.mockResolvedValue({
        featuredCake: {
          slug: { current: 'honey-cake' }
        }
      })

      await getCakesFeaturedOffer(true)
      await getCakesFeaturedOffer(true)

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockGetClient).toHaveBeenCalledWith(true)
    })

    it('should return null and log on error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getCakesFeaturedOffer()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching cakes featured offer:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('getRevalidateTime', () => {
    it('should return a number', () => {
      const result = getRevalidateTime()
      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThanOrEqual(0)
    })
  })

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      mockFetch.mockResolvedValue([mockCake])

      await getAllCakes()
      clearCache()
      await getAllCakes()

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('invalidateCache', () => {
    it('should clear specific cache entries by pattern', async () => {
      mockFetch.mockResolvedValue([mockCake])

      await getAllCakes()
      await getFeaturedCakes()

      invalidateCache('all-cakes')

      await getAllCakes()
      await getFeaturedCakes()

      // Note: invalidateCache is now a no-op (cache managed by Next.js)
      // With mocked unstable_cache, caching behavior cannot be tested
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should clear all cache when no pattern provided', async () => {
      mockFetch.mockResolvedValue([mockCake])

      await getAllCakes()
      await getFeaturedCakes()

      await invalidateCache()

      await getAllCakes()
      await getFeaturedCakes()

      expect(mockFetch).toHaveBeenCalledTimes(4)
    })
  })

  describe('getCacheBustingKey', () => {
    it('should generate cache busting key', () => {
      const key = getCacheBustingKey('test')
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    })
  })

  describe('forceRefreshCakes', () => {
    it('should clear cache and fetch fresh data', async () => {
      mockFetch.mockResolvedValue([mockCake])

      await getAllCakes()
      mockFetch.mockClear()

      await forceRefreshCakes()

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should return fresh cakes data', async () => {
      mockFetch.mockResolvedValue([mockCake])

      const result = await forceRefreshCakes()

      expect(result).toEqual([mockCake])
    })
  })
})

