import { getFeaturedTestimonials, getAllTestimonialsStats } from '../fetchTestimonials'
import { Testimonial } from '@/app/types/testimonial'

// Mock Sanity client
jest.mock('@/sanity/lib/client', () => {
  const mockFetch = jest.fn()
  return {
    client: { fetch: mockFetch },
    __mockFetch: mockFetch
  }
})

const { __mockFetch: mockFetch } = jest.requireMock('@/sanity/lib/client')

// Mock performance
global.performance = {
  now: jest.fn(() => 1000)
} as any

// Mock Date.now to control cache expiration
let mockDateNow = 0
const HOUR_IN_MS = 60 * 60 * 1000
global.Date.now = jest.fn(() => mockDateNow)

describe('fetchTestimonials', () => {
  const mockTestimonial: Testimonial = {
    _id: '1',
    customerName: 'John Doe',
    cakeType: 'Honey Cake',
    rating: 5,
    date: '2025-01-01',
    text: 'Amazing cake!',
    cakeImage: null,
    source: 'Google'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    // Advance time to expire cache between tests (2 hours to ensure expiration)
    mockDateNow += 2 * HOUR_IN_MS
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('getFeaturedTestimonials', () => {
    it('should fetch testimonials with default limit', async () => {
      mockFetch.mockResolvedValue([mockTestimonial])

      const result = await getFeaturedTestimonials()

      expect(result).toEqual([mockTestimonial])
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should fetch testimonials with custom limit', async () => {
      mockFetch.mockResolvedValue([mockTestimonial, mockTestimonial, mockTestimonial, mockTestimonial, mockTestimonial])

      const result = await getFeaturedTestimonials(5)

      expect(result).toHaveLength(5)
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getFeaturedTestimonials()

      expect(result).toEqual([])
    })

    it('should log error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      await getFeaturedTestimonials()

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching testimonials:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('should order by date descending', async () => {
      mockFetch.mockResolvedValue([mockTestimonial])

      await getFeaturedTestimonials()

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('order(date desc)')
    })
  })

  describe('getAllTestimonialsStats', () => {
    it('should fetch stats', async () => {
      mockFetch.mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
        { rating: 5 }
      ])

      const result = await getAllTestimonialsStats()

      expect(result.count).toBeGreaterThanOrEqual(0)
      expect(result.averageRating).toBeGreaterThan(0)
    })

    it('should return stats on multiple calls', async () => {
      mockFetch.mockResolvedValue([{ rating: 5 }])

      const result1 = await getAllTestimonialsStats()
      const result2 = await getAllTestimonialsStats()

      // Both calls should return the same cached result
      expect(result1.count).toBe(result2.count)
      expect(result1.averageRating).toBe(result2.averageRating)
    })

    it('should return default rating of 5.0 when no testimonials', async () => {
      // Advance time to expire cache
      mockDateNow += 2 * HOUR_IN_MS
      mockFetch.mockResolvedValue([])

      const result = await getAllTestimonialsStats()

      expect(result.count).toBeGreaterThanOrEqual(0)
      expect(result.averageRating).toBeGreaterThanOrEqual(4.5)
      expect(result.averageRating).toBeLessThanOrEqual(5)
    })

    it('should handle missing ratings', async () => {
      mockFetch.mockResolvedValue([
        { rating: 5 },
        { rating: null },
        { rating: undefined },
        { rating: 4 }
      ])

      const result = await getAllTestimonialsStats()

      expect(result.count).toBeGreaterThanOrEqual(0)
      expect(result.averageRating).toBeGreaterThan(0) // (5 + 0 + 0 + 4) / 4
    })

    it('should return cached stats on error', async () => {
      // Advance time to start fresh
      mockDateNow += 2 * HOUR_IN_MS
      mockFetch.mockResolvedValue([{ rating: 5 }])

      const firstResult = await getAllTestimonialsStats()

      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getAllTestimonialsStats()

      // Should return the cached result from the first call
      expect(result.count).toBe(firstResult.count)
      expect(result.averageRating).toBe(firstResult.averageRating)
    })

    it('should return defaults when no cached stats on error', async () => {
      // Advance time to expire any cache
      mockDateNow += 2 * HOUR_IN_MS
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getAllTestimonialsStats()

      expect(result.count).toBeGreaterThanOrEqual(0)
      expect(result.averageRating).toBeGreaterThanOrEqual(4.5)
      expect(result.averageRating).toBeLessThanOrEqual(5)
    })

    it('should handle cache in development', async () => {
      process.env.NODE_ENV = 'development'
      mockFetch.mockResolvedValue([{ rating: 5 }])

      const result1 = await getAllTestimonialsStats()
      const result2 = await getAllTestimonialsStats()

      // Both calls should return the same cached result
      expect(result1.count).toBe(result2.count)
      expect(result1.averageRating).toBe(result2.averageRating)
    })

    it('should not log in production', async () => {
      process.env.NODE_ENV = 'production'
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      mockFetch.mockResolvedValue([{ rating: 5 }])

      await getAllTestimonialsStats()
      await getAllTestimonialsStats()

      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})

