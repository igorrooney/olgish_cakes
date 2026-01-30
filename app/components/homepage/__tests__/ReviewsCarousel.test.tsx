/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import type { Testimonial } from '@/app/types/testimonial'
import { ReviewsCarousel } from '../ReviewsCarousel'

const minutes = 60 * 1000
const hours = 60 * minutes
const days = 24 * hours

const createTestimonial = (overrides: Partial<Testimonial>): Testimonial => ({
  _id: 'testimonial-1',
  _type: 'testimonial',
  _createdAt: '2026-01-01T00:00:00Z',
  _updatedAt: '2026-01-01T00:00:00Z',
  customerName: 'Olha',
  cakeType: 'Honey cake',
  rating: 5,
  date: '2026-01-01T00:00:00Z',
  text: 'So tasty!',
  ...overrides
})

describe('ReviewsCarousel', () => {
  const now = new Date('2026-01-29T12:00:00Z')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(now)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns null when no testimonials are provided', () => {
    const { container } = render(<ReviewsCarousel testimonials={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders reviews with relative dates and fallback names', () => {
    const testimonials = [
      createTestimonial({
        _id: 't-1',
        title: 'Amazing cake',
        date: now.toISOString(),
        customerName: 'Iryna',
        text: 'Loved every bite.'
      }),
      createTestimonial({
        _id: 't-2',
        date: new Date(now.getTime() - 10 * minutes).toISOString(),
        customerName: '',
        text: 'Soft and fresh.'
      }),
      createTestimonial({
        _id: 't-3',
        title: 'So tasty',
        date: new Date(now.getTime() - 2 * hours).toISOString(),
        customerName: 'Kateryna',
        text: 'Perfect layers.'
      }),
      createTestimonial({
        _id: 't-4',
        date: new Date(now.getTime() - 3 * days).toISOString(),
        customerName: 'Sofiia',
        text: 'We will order again.'
      }),
      createTestimonial({
        _id: 't-5',
        date: new Date(now.getTime() - 4 * days).toISOString(),
        customerName: 'Mila',
        text: 'Great for celebrations.'
      }),
      createTestimonial({
        _id: 't-6',
        date: new Date(now.getTime() - 5 * days).toISOString(),
        customerName: 'Nina',
        text: 'Wonderful service.'
      }),
      createTestimonial({
        _id: 't-7',
        date: new Date(now.getTime() - 6 * days).toISOString(),
        customerName: 'Olia',
        text: 'Absolutely delicious.'
      })
    ]

    render(<ReviewsCarousel testimonials={testimonials} />)

    expect(screen.getByText('Our reviews')).toBeInTheDocument()
    expect(screen.getAllByText('Amazing cake')).toHaveLength(3)
    expect(screen.getAllByText('So tasty')).toHaveLength(3)
    expect(screen.getAllByText('just now')).toHaveLength(3)
    expect(screen.getAllByText('10 minutes ago')).toHaveLength(3)
    expect(screen.getAllByText('2 hours ago')).toHaveLength(3)
    expect(screen.getAllByText('3 days ago')).toHaveLength(3)
    expect(screen.getAllByText('4 days ago')).toHaveLength(3)
    expect(screen.getAllByText('5 days ago')).toHaveLength(3)
    expect(screen.getAllByText('6 days ago')).toHaveLength(3)
    expect(screen.getAllByText('Anonymous')).toHaveLength(3)
  })

  it('renders fixed carousel navigation buttons with disabled edges', () => {
    const testimonials = Array.from({ length: 7 }, (_, index) =>
      createTestimonial({
        _id: `nav-${index}`,
        date: new Date(now.getTime() - index * days).toISOString(),
        customerName: `Customer ${index + 1}`,
        text: `Review ${index + 1}`
      })
    )

    const { container } = render(<ReviewsCarousel testimonials={testimonials} />)

    const previousReviewButton = screen.getByRole('button', { name: 'Previous review' })
    const nextReviewButton = screen.getByRole('button', { name: 'Next review' })

    const carousels = Array.from(container.querySelectorAll<HTMLDivElement>('.carousel'))
    const [mobileCarousel, tabletCarousel, smallLaptopCarousel] = carousels
    const mobileItems = Array.from(mobileCarousel.querySelectorAll<HTMLElement>('.carousel-item'))
    const tabletItems = Array.from(tabletCarousel.querySelectorAll<HTMLElement>('.carousel-item'))
    const smallLaptopItems = Array.from(smallLaptopCarousel.querySelectorAll<HTMLElement>('.carousel-item'))

    expect(previousReviewButton).toHaveAttribute('aria-controls', mobileItems[0].id)
    expect(nextReviewButton).toHaveAttribute('aria-controls', mobileItems[1].id)
    expect(previousReviewButton).toBeDisabled()
    expect(nextReviewButton).not.toBeDisabled()
    expect(previousReviewButton).toHaveAttribute('aria-disabled', 'true')
    expect(nextReviewButton).toHaveAttribute('aria-disabled', 'false')

    const previousReviewsButtons = screen.getAllByRole('button', { name: 'Previous reviews' })
    const nextReviewsButtons = screen.getAllByRole('button', { name: 'Next reviews' })

    expect(previousReviewsButtons).toHaveLength(2)
    expect(nextReviewsButtons).toHaveLength(2)
    expect(previousReviewsButtons[0]).toHaveAttribute('aria-controls', tabletItems[0].id)
    expect(nextReviewsButtons[0]).toHaveAttribute('aria-controls', tabletItems[1].id)
    expect(previousReviewsButtons[1]).toHaveAttribute('aria-controls', smallLaptopItems[0].id)
    expect(nextReviewsButtons[1]).toHaveAttribute('aria-controls', smallLaptopItems[1].id)
    expect(previousReviewsButtons[0]).toHaveAttribute('aria-disabled', 'true')
    expect(nextReviewsButtons[0]).toHaveAttribute('aria-disabled', 'false')
    expect(previousReviewsButtons[1]).toHaveAttribute('aria-disabled', 'true')
    expect(nextReviewsButtons[1]).toHaveAttribute('aria-disabled', 'false')

    const scrollTo = jest.fn()
    Object.defineProperty(mobileCarousel, 'scrollTo', {
      value: scrollTo,
      configurable: true
    })

    mobileItems.forEach((item, index) => {
      Object.defineProperty(item, 'offsetLeft', {
        value: index * 360,
        configurable: true
      })
    })

    fireEvent.click(nextReviewButton)
    expect(scrollTo).toHaveBeenCalledWith(360, 0)

    Object.defineProperty(mobileCarousel, 'scrollLeft', {
      value: 360 * (mobileItems.length - 1),
      writable: true,
      configurable: true
    })

    fireEvent.scroll(mobileCarousel)

    expect(previousReviewButton).not.toBeDisabled()
    expect(nextReviewButton).toBeDisabled()
    expect(previousReviewButton).toHaveAttribute('aria-disabled', 'false')
    expect(nextReviewButton).toHaveAttribute('aria-disabled', 'true')
  })

  it('hides multi-review controls when only one slide is needed', () => {
    const testimonials = Array.from({ length: 4 }, (_, index) =>
      createTestimonial({
        _id: `single-slide-${index}`,
        date: new Date(now.getTime() - index * days).toISOString(),
        customerName: `Customer ${index + 1}`,
        text: `Review ${index + 1}`
      })
    )

    render(<ReviewsCarousel testimonials={testimonials} />)

    expect(screen.getAllByRole('button', { name: 'Next review' })).toHaveLength(1)
    expect(screen.queryByRole('button', { name: 'Next reviews' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Previous reviews' })).toBeNull()
  })
})
