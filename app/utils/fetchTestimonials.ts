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
import { logger } from '@/lib/logger'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'
import {
  isReviewSource,
  isReviewSourceUrl
} from '@/lib/testimonials/review-source'

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
  source?: unknown
  sourceUrl?: unknown
  incentivised?: unknown
  incentiveDisclosure?: unknown
}

type TestimonialStatsRecord = {
  rating?: unknown
}

type TestimonialRecord = PaginatedTestimonialRecord & {
  _type?: unknown
  _createdAt?: unknown
  _updatedAt?: unknown
  cakeType?: unknown
  cakeImage?: Testimonial['cakeImage']
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

const normalizeReviewSource = (source: unknown): HomepageReview['source'] =>
  isReviewSource(source) ? source : 'historical'

const getSafeReviewSourceUrl = (
  source: HomepageReview['source'],
  sourceUrl: unknown
) => isReviewSourceUrl(source, sourceUrl) ? sourceUrl : undefined

const getRecordCursor = (
  record: PaginatedTestimonialRecord
): Omit<TestimonialCursor, 'version'> | null => {
  if (
    typeof record.date !== 'string' ||
    !isValidDateValue(record.date) ||
    typeof record._id !== 'string' ||
    !isValidDocumentId(record._id)
  ) {
    return null
  }

  return {
    date: record.date,
    id: record._id
  }
}

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

  const source = normalizeReviewSource(record.source)
  const title = typeof record.title === 'string' ? record.title.trim() : ''
  const customerName = typeof record.customerName === 'string'
    ? record.customerName.trim()
    : ''
  const sourceUrl = getSafeReviewSourceUrl(source, record.sourceUrl)
  const incentiveDisclosure = typeof record.incentiveDisclosure === 'string'
    ? record.incentiveDisclosure.trim()
    : ''

  return {
    _id: record._id,
    customerName,
    rating: record.rating,
    date: record.date,
    text: record.text.trim(),
    source,
    incentivised: record.incentivised === true,
    ...(title ? { title } : {}),
    ...(sourceUrl ? { sourceUrl } : {}),
    ...(incentiveDisclosure ? { incentiveDisclosure } : {})
  }
}

export async function getTestimonialsPage(
  cursorValue: string | null = null
): Promise<PaginatedReviewsResponse> {
  const cursor = cursorValue === null
    ? null
    : decodeTestimonialsCursor(cursorValue)
  const config = getCacheConfig('testimonials')
  const targetReviewCount = testimonialsPageSize + 1
  const seenReviewIds = new Set<string>()
  const validReviews: HomepageReview[] = []
  let scanCursor = cursor

  while (validReviews.length < targetReviewCount) {
    const records = await cachedSanityFetch<PaginatedTestimonialRecord[]>(
      PAGINATED_TESTIMONIALS_QUERY,
      {
        hasCursor: Boolean(scanCursor),
        cursorDate: scanCursor?.date ?? '',
        cursorId: scanCursor?.id ?? '',
        limit: targetReviewCount
      },
      config
    )

    for (const record of records) {
      const review = mapPaginatedReview(record)

      if (review && !seenReviewIds.has(review._id)) {
        validReviews.push(review)
        seenReviewIds.add(review._id)
      }

      if (validReviews.length === targetReviewCount) {
        break
      }
    }

    if (validReviews.length === targetReviewCount || records.length < targetReviewCount) {
      break
    }

    const nextScanCursor = getRecordCursor(records.at(-1) ?? {})

    if (
      !nextScanCursor ||
      (
        nextScanCursor.date === scanCursor?.date &&
        nextScanCursor.id === scanCursor.id
      )
    ) {
      break
    }

    scanCursor = {
      ...nextScanCursor,
      version: 1
    }
  }

  const reviews = validReviews.slice(0, testimonialsPageSize)
  const hasNextPage = validReviews.length > testimonialsPageSize
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
    const testimonials = await cachedSanityFetch<TestimonialRecord[]>(
      ALL_TESTIMONIALS_QUERY,
      {},
      config
    )
    return testimonials
      .map(mapTestimonial)
      .filter((testimonial): testimonial is Testimonial => testimonial !== null)
  } catch (error) {
    logger.error('Error fetching testimonials', {
      operation: 'testimonials.fetch_all',
      ...toSafeOperationalError(error)
    })
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
    const allTestimonials = await cachedSanityFetch<TestimonialRecord[]>(
      FEATURED_TESTIMONIALS_QUERY,
      {},
      config
    )
    return allTestimonials
      .map(mapTestimonial)
      .filter((testimonial): testimonial is Testimonial => testimonial !== null)
      .slice(0, limit)
  } catch (error) {
    logger.error('Error fetching featured testimonials', {
      operation: 'testimonials.fetch_featured',
      ...toSafeOperationalError(error)
    })
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
    const config = getCacheConfig('testimonialStats')
    const testimonials = await cachedSanityFetch<TestimonialStatsRecord[]>(
      TESTIMONIAL_STATS_QUERY,
      {},
      config
    )

    const validTestimonials = testimonials.filter(isValidTestimonialStatsRecord)
    const count = validTestimonials.length
    const averageRating = count > 0
      ? validTestimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0) / count
      : 0

    return { count, averageRating }
  } catch (error) {
    logger.error('Error fetching testimonial statistics', {
      operation: 'testimonials.fetch_stats',
      ...toSafeOperationalError(error)
    })
    return { count: 0, averageRating: 0 }
  }
}

const mapTestimonial = (record: TestimonialRecord): Testimonial | null => {
  const mappedReview = mapPaginatedReview(record)

  if (!mappedReview) {
    return null
  }

  const cakeType = typeof record.cakeType === 'string'
    ? record.cakeType.trim()
    : ''

  return {
    _id: mappedReview._id,
    _type: typeof record._type === 'string' ? record._type : 'testimonial',
    _createdAt: typeof record._createdAt === 'string' ? record._createdAt : '',
    _updatedAt: typeof record._updatedAt === 'string' ? record._updatedAt : '',
    customerName: mappedReview.customerName,
    cakeType,
    rating: mappedReview.rating,
    date: mappedReview.date,
    text: mappedReview.text,
    source: mappedReview.source,
    ...(mappedReview.title ? { title: mappedReview.title } : {}),
    ...(mappedReview.sourceUrl ? { sourceUrl: mappedReview.sourceUrl } : {}),
    ...(typeof record.incentivised === 'boolean'
      ? { incentivised: record.incentivised }
      : {}),
    ...(mappedReview.incentiveDisclosure
      ? { incentiveDisclosure: mappedReview.incentiveDisclosure }
      : {}),
    ...(record.cakeImage ? { cakeImage: record.cakeImage } : {})
  }
}

const isValidTestimonialStatsRecord = (
  testimonial: TestimonialStatsRecord
): testimonial is TestimonialStatsRecord & { rating: number } =>
  typeof testimonial.rating === 'number' &&
  Number.isFinite(testimonial.rating) &&
  testimonial.rating >= 1 &&
  testimonial.rating <= 5
