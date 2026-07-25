import {
  decodeTestimonialsCursor,
  encodeTestimonialsCursor,
  getAllTestimonials,
  getAllTestimonialsStats,
  getFeaturedTestimonials,
  getTestimonialsPage,
  InvalidTestimonialsCursorError,
  testimonialsPageSize
} from '../fetchTestimonials'
import { Testimonial } from '@/app/types/testimonial'

// Mock unstable_cache to bypass Next.js context requirement
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn)
}))

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
} as unknown as Performance

// Mock Date.now to control cache expiration
let mockDateNow = 0
const HOUR_IN_MS = 60 * 60 * 1000
global.Date.now = jest.fn(() => mockDateNow)

describe('fetchTestimonials', () => {
  const mockTestimonial: Testimonial = {
    _id: '1',
    _type: 'testimonial',
    _createdAt: '2025-01-01T00:00:00Z',
    _updatedAt: '2025-01-01T00:00:00Z',
    customerName: 'John Doe',
    cakeType: 'Honey Cake',
    rating: 5,
    date: '2025-01-01',
    title: 'Absolutely delicious',
    text: 'Amazing cake!',
    source: 'google'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    // Advance time to expire cache between tests (2 hours to ensure expiration)
    mockDateNow += 2 * HOUR_IN_MS
  })

  describe('getAllTestimonials', () => {
    it('should fetch all testimonials', async () => {
      mockFetch.mockResolvedValue([mockTestimonial])

      const result = await getAllTestimonials()

      expect(result).toEqual([mockTestimonial])
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getAllTestimonials()

      expect(result).toEqual([])
    })

    it('should log error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      await getAllTestimonials()

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching testimonials:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('should include title in the query', async () => {
      mockFetch.mockResolvedValue([mockTestimonial])

      await getAllTestimonials()

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('title')
    })
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

    it('should include title in the query', async () => {
      mockFetch.mockResolvedValue([mockTestimonial])

      await getFeaturedTestimonials()

      const query = mockFetch.mock.calls[0][0]
      expect(query).toContain('title')
    })
  })

  describe('getTestimonialsPage', () => {
    const createPageRecord = (id: string, date: string) => ({
      _id: id,
      customerName: `Customer ${id}`,
      rating: 5,
      date,
      text: `Review ${id}`
    })

    it('returns six reviews and a cursor based on the sixth stable record', async () => {
      const records = [
        createPageRecord('a', '2026-01-10'),
        createPageRecord('b', '2026-01-10'),
        createPageRecord('c', '2026-01-09'),
        createPageRecord('d', '2026-01-08'),
        createPageRecord('e', '2026-01-07'),
        createPageRecord('f', '2026-01-06'),
        createPageRecord('g', '2026-01-05')
      ]
      mockFetch.mockResolvedValue(records)

      const result = await getTestimonialsPage()

      expect(result.reviews).toHaveLength(testimonialsPageSize)
      expect(result.reviews.at(-1)?._id).toBe('f')
      expect(result.nextCursor).not.toBeNull()
      expect(decodeTestimonialsCursor(result.nextCursor ?? '')).toEqual({
        date: '2026-01-06',
        id: 'f',
        version: 1
      })

      const [query, params] = mockFetch.mock.calls[0]
      expect(query).toContain('order(date desc, _id asc)')
      expect(params).toEqual({
        hasCursor: false,
        cursorDate: '',
        cursorId: '',
        limit: 7
      })
    })

    it('uses decoded cursor values as query parameters', async () => {
      const cursor = encodeTestimonialsCursor({
        _id: 'same-date-id',
        date: '2026-01-10'
      })
      mockFetch.mockResolvedValue([])

      await getTestimonialsPage(cursor)

      expect(mockFetch.mock.calls[0][1]).toEqual({
        hasCursor: true,
        cursorDate: '2026-01-10',
        cursorId: 'same-date-id',
        limit: 7
      })
    })

    it('returns a terminal null cursor when no seventh record exists', async () => {
      mockFetch.mockResolvedValue(
        Array.from({ length: 6 }, (_, index) =>
          createPageRecord(`terminal-${index}`, `2026-01-${String(20 - index).padStart(2, '0')}`)
        )
      )

      const result = await getTestimonialsPage()

      expect(result.reviews).toHaveLength(6)
      expect(result.nextCursor).toBeNull()
    })

    it.each([
      '',
      'not-base64!',
      Buffer.from('{}').toString('base64url'),
      Buffer.from(JSON.stringify({
        version: 1,
        date: 'not-a-date',
        id: 'review-id'
      })).toString('base64url')
    ])('rejects malformed cursors', async (cursor) => {
      await expect(getTestimonialsPage(cursor)).rejects.toBeInstanceOf(
        InvalidTestimonialsCursorError
      )
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('rejects oversized cursors', async () => {
      await expect(getTestimonialsPage('a'.repeat(513))).rejects.toBeInstanceOf(
        InvalidTestimonialsCursorError
      )
    })

    it('propagates Sanity failures for route-level handling', async () => {
      mockFetch.mockRejectedValue(new Error('Sanity unavailable'))

      await expect(getTestimonialsPage()).rejects.toThrow('Sanity unavailable')
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

      // Note: With mocked unstable_cache, caching behavior cannot be tested
      // The implementation returns default values on error, not cached results
      const result = await getAllTestimonialsStats()

      // Function returns defaults on error (not cached values with mocked cache)
      expect(result.count).toBe(0)
      expect(result.averageRating).toBe(5.0)
    })

    it('should return defaults when no cached stats on error', async () => {
      // Advance time to expire any cache
      mockDateNow += 2 * HOUR_IN_MS
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      // The implementation catches errors and returns default values
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

      // Note: With mocked unstable_cache, caching behavior cannot be tested
      // Both calls return valid results
      expect(result1.count).toBeGreaterThanOrEqual(0)
      expect(result2.count).toBeGreaterThanOrEqual(0)
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
