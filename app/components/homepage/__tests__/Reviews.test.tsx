/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import type { Testimonial } from '@/app/types/testimonial'
import type { HomepageReview } from '../ReviewsCarousel'
import { Reviews } from '../Reviews'
import { getAllTestimonials } from '@/app/utils/fetchTestimonials'

jest.mock('@/app/utils/fetchTestimonials', () => ({
  getAllTestimonials: jest.fn()
}))


jest.mock('../DeferredReviewsCarousel', () => ({
  DeferredReviewsCarousel: ({ testimonials }: { testimonials: HomepageReview[] }) => (
    <div
      data-testid="reviews-carousel"
      data-count={testimonials.length}
      data-review-fields={Object.keys(testimonials[0] ?? {}).sort().join(',')}
    />
  )
}))

const mockGetAllTestimonials = getAllTestimonials as jest.MockedFunction<typeof getAllTestimonials>

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
  ...overrides
})

describe('Reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when there are no testimonials', async () => {
    mockGetAllTestimonials.mockResolvedValue([])

    const result = await Reviews()

    expect(result).toBeNull()
  })

  it('renders the carousel when testimonials exist', async () => {
    mockGetAllTestimonials.mockResolvedValue([createTestimonial({ _id: 'testimonial-2' })])

    const result = await Reviews()
    render(result as ReactElement)

    expect(screen.getByTestId('reviews-carousel')).toBeInTheDocument()
    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute('data-count', '1')
    expect(screen.getByTestId('reviews-carousel')).toHaveAttribute(
      'data-review-fields',
      '_id,customerName,date,text'
    )
  })

  it('renders with provided testimonials without fetching', async () => {
    const providedTestimonials = [
      createTestimonial({ _id: 'testimonial-3', customerName: 'Katya' })
    ]

    const result = await Reviews({ testimonials: providedTestimonials })
    render(result as ReactElement)

    expect(mockGetAllTestimonials).not.toHaveBeenCalled()
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
})
