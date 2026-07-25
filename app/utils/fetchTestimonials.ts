import { Buffer } from 'node:buffer'
import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'
import {
  ALL_TESTIMONIALS_QUERY,
  FEATURED_TESTIMONIALS_QUERY,
  PAGINATED_TESTIMONIALS_QUERY,
  TESTIMONIAL_STATS_QUERY
} from '@/lib/queries/testimonials'
import type {
  HomepageReview,
  PaginatedReviewsResponse,
  Testimonial
} from '../types/testimonial'

export const testimonialsPageSize = 6
export const maxTestimonialsCursorLength = 512

type TestimonialCursor = {
  date: string
  id: string
  version: 1
}

type PaginatedTestimonialRecord = {
  _id?: unknown
  customerName?: unknown
  rating?: unknown
  date?: unknown
  title?: unknown
  text?: unknown
}

export class InvalidTestimonialsCursorError extends Error {
  constructor() {
    super('Invalid testimonials cursor')
    this.name = 'InvalidTestimonialsCursorError'
  }
}

const isValidDateValue = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`)

  return !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value
}

const isValidDocumentId = (value: string) =>
  value.length > 0 &&
  value.length <= 128 &&
  /^[A-Za-z0-9._-]+$/.test(value)

const isTestimonialCursor = (value: unknown): value is TestimonialCursor => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<TestimonialCursor>

  return candidate.version === 1 &&
    typeof candidate.date === 'string' &&
    isValidDateValue(candidate.date) &&
    typeof candidate.id === 'string' &&
    isValidDocumentId(candidate.id)
}

export const encodeTestimonialsCursor = (review: Pick<HomepageReview, '_id' | 'date'>) => {
  const cursor: TestimonialCursor = {
    date: review.date,
    id: review._id,
    version: 1
  }

  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')
}

export const decodeTestimonialsCursor = (cursor: string): TestimonialCursor => {
  if (
    cursor.length === 0 ||
    cursor.length > maxTestimonialsCursorLength ||
    !/^[A-Za-z0-9_-]+$/.test(cursor)
  ) {
    throw new InvalidTestimonialsCursorError()
  }

  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as unknown

    if (!isTestimonialCursor(decoded)) {
      throw new InvalidTestimonialsCursorError()
    }

    return decoded
  } catch (error) {
    if (error instanceof InvalidTestimonialsCursorError) {
      throw error
    }

    throw new InvalidTestimonialsCursorError()
  }
}

const mapPaginatedReview = (record: PaginatedTestimonialRecord): HomepageReview | null => {
  if (
    typeof record._id !== 'string' ||
    !isValidDocumentId(record._id) ||
    typeof record.date !== 'string' ||
    !isValidDateValue(record.date) ||
    typeof record.text !== 'string' ||
    record.text.trim().length === 0 ||
    typeof record.rating !== 'number' ||
    !Number.isFinite(record.rating) ||
    record.rating < 1 ||
    record.rating > 5
  ) {
    return null
  }

  const title = typeof record.title === 'string' ? record.title.trim() : ''
  const customerName = typeof record.customerName === 'string'
    ? record.customerName.trim()
    : ''

  return {
    _id: record._id,
    customerName,
    rating: record.rating,
    date: record.date,
    text: record.text.trim(),
    ...(title ? { title } : {})
  }
}

export async function getTestimonialsPage(
  cursorValue: string | null = null
): Promise<PaginatedReviewsResponse> {
  const cursor = cursorValue === null
    ? null
    : decodeTestimonialsCursor(cursorValue)
  const config = getCacheConfig('testimonials')
  const records = await cachedSanityFetch<PaginatedTestimonialRecord[]>(
    PAGINATED_TESTIMONIALS_QUERY,
    {
      hasCursor: Boolean(cursor),
      cursorDate: cursor?.date ?? '',
      cursorId: cursor?.id ?? '',
      limit: testimonialsPageSize + 1
    },
    config
  )
  const validReviews = records
    .map(mapPaginatedReview)
    .filter((review): review is HomepageReview => review !== null)
  const reviews = validReviews.slice(0, testimonialsPageSize)
  const hasNextPage = records.length > testimonialsPageSize
  const lastReview = reviews.at(-1)

  return {
    reviews,
    nextCursor: hasNextPage && lastReview
      ? encodeTestimonialsCursor(lastReview)
      : null
  }
}

/**
 * Fetch all testimonials from Sanity CMS
 * @returns Array of all testimonial objects sorted by date (newest first)
 * @example
 * const testimonials = await getAllTestimonials();
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    const config = getCacheConfig('testimonials')
    const testimonials = await cachedSanityFetch<Testimonial[]>(
      ALL_TESTIMONIALS_QUERY,
      {},
      config
    )
    return testimonials
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }
}

/**
 * Fetch featured testimonials from Sanity CMS
 * @param limit - Maximum number of testimonials to return (default: 3)
 * @returns Array of testimonial objects sorted by date
 * @example
 * const testimonials = await getFeaturedTestimonials(5);
 */
export async function getFeaturedTestimonials(limit: number = 3): Promise<Testimonial[]> {
  try {
    const config = getCacheConfig('testimonials')
    const allTestimonials = await cachedSanityFetch<Testimonial[]>(
      FEATURED_TESTIMONIALS_QUERY,
      {},
      config
    )
    return allTestimonials.slice(0, limit)
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }
}

/**
 * Fetch testimonial statistics with caching to reduce Sanity queries
 * @returns Object containing total count and average rating of all testimonials
 * @example
 * const stats = await getAllTestimonialsStats();
 * // Returns: { count: 16, averageRating: 4.8 }
 */
export async function getAllTestimonialsStats(): Promise<{ count: number; averageRating: number }> {
  try {
    const queryStartTime = performance.now()
    const config = getCacheConfig('testimonialStats')
    const testimonials = await cachedSanityFetch<Array<{ rating: number }>>(
      TESTIMONIAL_STATS_QUERY,
      {},
      config
    )

    const count = testimonials.length
    const averageRating = count > 0
      ? testimonials.reduce((sum: number, t: { rating: number }) => sum + (t.rating || 0), 0) / count
      : 5.0

    const queryEndTime = performance.now()
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Testimonials] Stats fetched in ${(queryEndTime - queryStartTime).toFixed(2)}ms: ${count} testimonials, avg rating: ${averageRating.toFixed(1)}`)
    }

    return { count, averageRating }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching testimonial stats:', error)
    }
    return { count: 0, averageRating: 5.0 }
  }
}
