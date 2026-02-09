import {
  buildAggregateRating,
  DEFAULT_REVIEW_STATS,
  formatRatingValue,
  formatReviewCount,
  normalizeReviewStats
} from '../review-stats'
import { getReviewStats } from '../review-stats.server'
import { getAllTestimonialsStats } from '../fetchTestimonials'

jest.mock('../fetchTestimonials', () => ({
  getAllTestimonialsStats: jest.fn()
}))

const mockedGetAllTestimonialsStats = getAllTestimonialsStats as jest.MockedFunction<typeof getAllTestimonialsStats>

describe('review-stats', () => {
  beforeEach(() => {
    mockedGetAllTestimonialsStats.mockReset()
  })

  it('normalizes missing stats to defaults', () => {
    expect(normalizeReviewStats()).toEqual(DEFAULT_REVIEW_STATS)
  })

  it('normalizes invalid values', () => {
    const result = normalizeReviewStats({ count: -2, averageRating: Number.NaN })
    expect(result).toEqual({ count: 0, averageRating: DEFAULT_REVIEW_STATS.averageRating })
  })

  it('formats rating value with one decimal', () => {
    expect(formatRatingValue(4.236)).toBe('4.2')
    expect(formatRatingValue(Number.NaN)).toBe(DEFAULT_REVIEW_STATS.averageRating.toFixed(1))
  })

  it('formats review count as a string', () => {
    expect(formatReviewCount(12)).toBe('12')
    expect(formatReviewCount(-1)).toBe('0')
  })

  it('builds aggregate rating only when count is positive', () => {
    expect(buildAggregateRating({ count: 0, averageRating: 5 })).toBeNull()
    expect(buildAggregateRating({ count: 3, averageRating: 4.25 })).toEqual({
      '@type': 'AggregateRating',
      ratingValue: '4.3',
      reviewCount: '3',
      bestRating: '5',
      worstRating: '1'
    })
  })

  it('fetches review stats via testimonials helper', async () => {
    mockedGetAllTestimonialsStats.mockResolvedValue({ count: 2, averageRating: 4.6 })
    await expect(getReviewStats()).resolves.toEqual({ count: 2, averageRating: 4.6 })
    expect(mockedGetAllTestimonialsStats).toHaveBeenCalledTimes(1)
  })
})
