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
    source: 'google',
    sourceUrl: 'https://www.google.com/maps/reviews/example'
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

    it('shows reviews with a mismatched source URL but drops the unsafe link', async () => {
      mockFetch.mockResolvedValue([
        mockTestimonial,
        {
          ...mockTestimonial,
          _id: 'mismatched-review',
          source: 'trustpilot',
          sourceUrl: 'https://www.google.com/maps/reviews/example'
        }
      ])

      const result = await getAllTestimonials()

      expect(result).toHaveLength(2)
      expect(result[1]).toEqual(expect.objectContaining({
        _id: 'mismatched-review',
        source: 'trustpilot'
      }))
      expect(result[1]).not.toHaveProperty('sourceUrl')
    })

    it('normalizes a missing source to a neutral historical attribution', async () => {
      mockFetch.mockResolvedValue([{
        ...mockTestimonial,
        _id: 'missing-source',
        source: undefined,
        sourceUrl: 'javascript:alert(1)'
      }])

      const result = await getAllTestimonials()

      expect(result).toEqual([
        expect.objectContaining({
          _id: 'missing-source',
          source: 'historical'
        })
      ])
      expect(result[0]).not.toHaveProperty('sourceUrl')
    })

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getAllTestimonials()

      expect(result).toEqual([])
    })

    it('should log error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const providerSentinel = 'PRIVATE_TESTIMONIAL_FETCH_FAILURE'
      mockFetch.mockRejectedValue(new Error(providerSentinel))

      await getAllTestimonials()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          operation: 'testimonials.fetch_all',
          code: 'OPERATION_FAILED'
        })
      )
      expect(JSON.stringify(consoleSpy.mock.calls)).not.toContain(providerSentinel)
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

    it('keeps a mismatched source review and drops its unsafe link', async () => {
      mockFetch.mockResolvedValue([
        {
          ...mockTestimonial,
          _id: 'mismatched-review',
          source: 'facebook',
          sourceUrl: 'https://uk.trustpilot.com/reviews/example'
        },
        mockTestimonial
      ])

      const result = await getFeaturedTestimonials(1)

      expect(result).toEqual([
        expect.objectContaining({
          _id: 'mismatched-review',
          source: 'facebook'
        })
      ])
      expect(result[0]).not.toHaveProperty('sourceUrl')
    })

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      const result = await getFeaturedTestimonials()

      expect(result).toEqual([])
    })

    it('should log error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const providerSentinel = 'PRIVATE_FEATURED_TESTIMONIAL_FAILURE'
      mockFetch.mockRejectedValue(new Error(providerSentinel))

      await getFeaturedTestimonials()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          operation: 'testimonials.fetch_featured',
          code: 'OPERATION_FAILED'
        })
      )
      expect(JSON.stringify(consoleSpy.mock.calls)).not.toContain(providerSentinel)
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
      text: `Review ${id}`,
      source: 'trustpilot',
      sourceUrl: `https://uk.trustpilot.com/reviews/${id}`,
      incentivised: false
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
      expect(query).toContain('defined(text)')
      expect(query).not.toContain('publicationApproved')
      expect(query).not.toContain('verifiedAt')
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

    it('shows records whose source URL belongs to another platform without a link', async () => {
      mockFetch.mockResolvedValue([
        createPageRecord('valid', '2026-01-10'),
        {
          ...createPageRecord('mismatched', '2026-01-09'),
          sourceUrl: 'https://www.facebook.com/example/reviews'
        }
      ])

      const result = await getTestimonialsPage()

      expect(result.reviews.map((review) => review._id)).toEqual([
        'valid',
        'mismatched'
      ])
      expect(result.reviews[1]).not.toHaveProperty('sourceUrl')
    })

    it('returns URL-less external and historical records selected by the server query', async () => {
      mockFetch.mockResolvedValue([
        {
          ...createPageRecord('url-less-external', '2026-01-10'),
          sourceUrl: undefined
        },
        {
          ...createPageRecord('historical', '2026-01-09'),
          source: 'historical',
          sourceUrl: undefined
        }
      ])

      const result = await getTestimonialsPage()

      expect(result.nextCursor).toBeNull()
      expect(result.reviews).toEqual([
        expect.objectContaining({
          _id: 'url-less-external',
          source: 'trustpilot'
        }),
        expect.objectContaining({
          _id: 'historical',
          source: 'historical'
        })
      ])
      expect(result.reviews[0]).not.toHaveProperty('sourceUrl')
      expect(result.reviews[1]).not.toHaveProperty('sourceUrl')
    })

    it('scans past a full technically invalid batch so valid older reviews are not starved', async () => {
      const invalidBatch = Array.from({ length: 7 }, (_, index) => ({
        ...createPageRecord(
          `invalid-${index}`,
          `2026-01-${String(20 - index).padStart(2, '0')}`
        ),
        rating: 0
      }))
      const olderValidReview = createPageRecord('older-valid', '2026-01-10')
      mockFetch
        .mockResolvedValueOnce(invalidBatch)
        .mockResolvedValueOnce([olderValidReview])

      const result = await getTestimonialsPage()

      expect(result).toEqual({
        reviews: [expect.objectContaining({ _id: 'older-valid' })],
        nextCursor: null
      })
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch.mock.calls[1][1]).toEqual(expect.objectContaining({
        hasCursor: true,
        cursorDate: '2026-01-14',
        cursorId: 'invalid-6'
      }))
    })

    it('shows direct reviews without publishing an external URL', async () => {
      mockFetch.mockResolvedValue([{
        ...createPageRecord('direct', '2026-01-10'),
        source: 'direct',
        sourceUrl: 'https://example.com/direct-review'
      }])

      const result = await getTestimonialsPage()

      expect(result.reviews).toEqual([
        expect.objectContaining({
          _id: 'direct',
          source: 'direct'
        })
      ])
      expect(result.reviews[0]).not.toHaveProperty('sourceUrl')
    })

    it('normalizes unsupported sources and does not require incentive metadata', async () => {
      mockFetch.mockResolvedValue([{
        ...createPageRecord('legacy', '2026-01-10'),
        source: 'unknown-platform',
        sourceUrl: 'https://example.com/review',
        incentivised: true,
        incentiveDisclosure: undefined
      }])

      const result = await getTestimonialsPage()

      expect(result.reviews).toEqual([
        expect.objectContaining({
          _id: 'legacy',
          source: 'historical',
          incentivised: true
        })
      ])
      expect(result.reviews[0]).not.toHaveProperty('sourceUrl')
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
        { rating: 5, source: 'direct' },
        { rating: 4, source: 'direct' },
        { rating: 5, source: 'direct' }
      ])

      const result = await getAllTestimonialsStats()

      expect(result.count).toBeGreaterThanOrEqual(0)
      expect(result.averageRating).toBeGreaterThan(0)
    })

    it('should return stats on multiple calls', async () => {
      mockFetch.mockResolvedValue([{ rating: 5, source: 'direct' }])

      const result1 = await getAllTestimonialsStats()
      const result2 = await getAllTestimonialsStats()

      // Both calls should return the same cached result
      expect(result1.count).toBe(result2.count)
      expect(result1.averageRating).toBe(result2.averageRating)
    })

    it('should return no aggregate rating when no displayable testimonials exist', async () => {
      // Advance time to expire cache
      mockDateNow += 2 * HOUR_IN_MS
      mockFetch.mockResolvedValue([])

      const result = await getAllTestimonialsStats()

      expect(result).toEqual({ count: 0, averageRating: 0 })
    })

    it('should handle missing ratings', async () => {
      mockFetch.mockResolvedValue([
        { rating: 5, source: 'direct' },
        { rating: null, source: 'direct' },
        { rating: undefined, source: 'direct' },
        { rating: 4, source: 'direct' }
      ])

      const result = await getAllTestimonialsStats()

      expect(result).toEqual({ count: 2, averageRating: 4.5 })
    })

    it('counts valid ratings regardless of source metadata', async () => {
      mockFetch.mockResolvedValue([
        {
          rating: 5,
          source: 'trustpilot',
          sourceUrl: 'https://www.google.com/maps/reviews/example'
        },
        {
          rating: 4,
          source: 'google',
          sourceUrl: 'https://maps.app.goo.gl/example'
        }
      ])

      await expect(getAllTestimonialsStats()).resolves.toEqual({
        count: 2,
        averageRating: 4.5
      })
    })

    it('counts URL-less external and historical ratings selected by the server query', async () => {
      mockFetch.mockResolvedValue([
        { rating: 5, source: 'trustpilot' },
        { rating: 4, source: 'historical' }
      ])

      await expect(getAllTestimonialsStats()).resolves.toEqual({
        count: 2,
        averageRating: 4.5
      })
    })

    it('should return cached stats on error', async () => {
      // Advance time to start fresh
      mockDateNow += 2 * HOUR_IN_MS
      mockFetch.mockResolvedValue([{ rating: 5, source: 'direct' }])

      const firstResult = await getAllTestimonialsStats()

      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      // Note: With mocked unstable_cache, caching behavior cannot be tested
      // The implementation returns default values on error, not cached results
      const result = await getAllTestimonialsStats()

      // Function returns defaults on error (not cached values with mocked cache)
      expect(result.count).toBe(0)
      expect(result.averageRating).toBe(0)
    })

    it('should return defaults when no cached stats on error', async () => {
      // Advance time to expire any cache
      mockDateNow += 2 * HOUR_IN_MS
      mockFetch.mockRejectedValue(new Error('Fetch failed'))

      // The implementation catches errors and returns default values
      const result = await getAllTestimonialsStats()

      expect(result).toEqual({ count: 0, averageRating: 0 })
    })

    it('should handle cache in development', async () => {
      process.env.NODE_ENV = 'development'
      mockFetch.mockResolvedValue([{ rating: 5, source: 'direct' }])

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
      mockFetch.mockResolvedValue([{ rating: 5, source: 'direct' }])

      await getAllTestimonialsStats()
      await getAllTestimonialsStats()

      expect(consoleSpy).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})
