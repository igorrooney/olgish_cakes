/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import type { Testimonial } from '@/app/types/testimonial'
import type { PaginatedReviewsResponse } from '@/app/types/testimonial'
import type { HomepageReview } from '../ReviewsCarousel'
import { Reviews } from '../Reviews'
import { getTestimonialsPage } from '@/app/utils/fetchTestimonials'

jest.mock('@/app/utils/fetchTestimonials', () => ({
  getTestimonialsPage: jest.fn()
}))


jest.mock('../DeferredReviewsCarousel', () => ({
  DeferredReviewsCarousel: ({
    testimonials,
    initialPage,
    titleClassName
  }: {
    testimonials: HomepageReview[]
    initialPage?: PaginatedReviewsResponse
    titleClassName?: string
  }) => (
    <div
      data-testid="reviews-carousel"
      data-count={testimonials.length}
      data-review-fields={Object.keys(testimonials[0] ?? {}).sort().join(',')}
      data-paginated={initialPage ? 'true' : 'false'}
      data-title-class-name={titleClassName ?? ''}
    />
  )
}))

const mockGetTestimonialsPage = getTestimonialsPage as jest.MockedFunction<typeof getTestimonialsPage>

const createTestimonial = (overrides: Partial<Testimonial>): Testimonial => ({
  _id: 'testimonial-1',
  _type: 'testimonial',
  _createdAt: '2026-01-01T00:00:00Z',
  _updatedAt: '2026-01-01T00:00:00Z',
  customerName: 'Olha',
  cakeType: 'Honey cake',
  rating: 5,
  date: '2026-01-10',
  text: 'Beautiful and tasty.',
  source: 'trustpilot',
  sourceUrl: 'https://uk.trustpilot.com/reviews/example',
  incentivised: false,
  ...overrides
})

describe('Reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when there are no testimonials', async () => {
    mockGetTestimonialsPage.mockResolvedValue({
      reviews: [],
      nextCursor: null
    })

    const result = await Reviews()

    expect(result).toBeNull()
  })

  it('renders the paginated carousel when testimonials exist', async () => {
    mockGetTestimonialsPage.mockResolvedValue({
      reviews: [{
        _id: 'testimonial-2',
        customerName: 'Olha',
        rating: 5,
        date: '2026-01-10',
        text: 'Beautiful and tasty.',
        source: 'trustpilot',
        sourceUrl: 'https://uk.trustpilot.com/reviews/example',
        incentivised: false
      }],
      nextCursor: 'opaque-cursor'
    })

    const result = await Reviews()
    render(result as ReactElement)

    expect(screen.getByTestId('reviews-carousel')).toBeInTheDocument()
    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute('data-count', '1')
    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute('data-paginated', 'true')
    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute(
      'data-review-fields',
      '_id,customerName,date,incentivised,rating,source,sourceUrl,text'
    )
  })

  it('renders with provided testimonials without fetching', async () => {
    const providedTestimonials = [
      createTestimonial({ _id: 'testimonial-3', customerName: 'Katya' })
    ]

    const result = await Reviews({ testimonials: providedTestimonials })
    render(result as ReactElement)

    expect(mockGetTestimonialsPage).not.toHaveBeenCalled()
    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute('data-count', '1')
  })

  it('passes all valid visible testimonials to the carousel', async () => {
    const providedTestimonials = [
      createTestimonial({ _id: 'testimonial-1' }),
      createTestimonial({ _id: 'testimonial-2', text: '  ' }),
      createTestimonial({ _id: 'testimonial-3', rating: 0 }),
      ...Array.from({ length: 7 }, (_, index) =>
        createTestimonial({ _id: `testimonial-extra-${index}`, customerName: `Customer ${index}` })
      )
    ]

    const result = await Reviews({ testimonials: providedTestimonials })
    render(result as ReactElement)

    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute('data-count', '8')
  })

  it('shows reviews with a mismatched source URL without rendering the unsafe link', async () => {
    const result = await Reviews({
      testimonials: [createTestimonial({
        source: 'trustpilot',
        sourceUrl: 'https://www.google.com/maps/reviews/example'
      })]
    })

    render(result as ReactElement)

    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute('data-count', '1')
    expect(screen.getByTestId('reviews-carousel')).not.toHaveAttribute(
      'data-review-fields',
      expect.stringContaining('sourceUrl')
    )
  })

  it('shows direct reviews with an external URL without rendering the unsafe link', async () => {
    const result = await Reviews({
      testimonials: [createTestimonial({
        source: 'direct',
        sourceUrl: 'https://example.com/direct-review'
      })]
    })

    render(result as ReactElement)

    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute('data-count', '1')
    expect(screen.getByTestId('reviews-carousel')).not.toHaveAttribute(
      'data-review-fields',
      expect.stringContaining('sourceUrl')
    )
  })

  it('shows supplied reviews without an incentive classification', async () => {
    const result = await Reviews({
      testimonials: [createTestimonial({ incentivised: undefined })]
    })

    render(result as ReactElement)

    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute('data-count', '1')
  })

  it('shows URL-less external reviews without requiring attribution metadata', async () => {
    const result = await Reviews({
      testimonials: [createTestimonial({ sourceUrl: undefined })]
    })

    render(result as ReactElement)

    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute('data-count', '1')
  })

  it('renders a supplied paginated page without fetching static testimonials', async () => {
    const initialPage: PaginatedReviewsResponse = {
      reviews: [{
        _id: 'paged-review',
        customerName: 'Olha',
        rating: 4,
        date: '2026-01-10',
        text: 'A lovely celebration cake.',
        source: 'google',
        sourceUrl: 'https://www.google.com/maps/reviews/example',
        incentivised: false
      }],
      nextCursor: 'opaque-cursor'
    }

    const result = await Reviews({ initialPage })
    render(result as ReactElement)

    expect(mockGetTestimonialsPage).not.toHaveBeenCalled()
    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute('data-paginated', 'true')
    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute(
      'data-review-fields',
      '_id,customerName,date,incentivised,rating,source,sourceUrl,text'
    )
  })

  it('fails gracefully when the initial review request fails', async () => {
    mockGetTestimonialsPage.mockRejectedValue(new Error('Sanity unavailable'))

    const result = await Reviews()

    expect(result).toBeNull()
  })

  it('passes an optional title class override to the carousel', async () => {
    const providedTestimonials = [
      createTestimonial({ _id: 'testimonial-4', customerName: 'Iryna' })
    ]

    const result = await Reviews({
      testimonials: providedTestimonials,
      titleClassName: 'custom-title-class'
    })
    render(result as ReactElement)

    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute('data-title-class-name', 'custom-title-class')
  })
})
