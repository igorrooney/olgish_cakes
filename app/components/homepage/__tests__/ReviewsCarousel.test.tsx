/**
 * @jest-environment jsdom
 */
import React from 'react'
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

const setScrollToMock = (element: HTMLDivElement) => {
  const scrollTo = jest.fn()
  Object.defineProperty(element, 'scrollTo', {
    value: scrollTo,
    configurable: true
  })
  return scrollTo
}

const setClientWidth = (element: HTMLDivElement, width: number) => {
  Object.defineProperty(element, 'clientWidth', {
    value: width,
    configurable: true
  })
}

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

  it('handles navigation and scroll updates', () => {
    const testimonials = Array.from({ length: 7 }, (_, index) =>
      createTestimonial({
        _id: `nav-${index}`,
        date: new Date(now.getTime() - index * days).toISOString(),
        customerName: `Customer ${index + 1}`,
        text: `Review ${index + 1}`
      })
    )

    const { container } = render(<ReviewsCarousel testimonials={testimonials} />)
    const carousels = Array.from(container.querySelectorAll<HTMLDivElement>('.carousel'))
    const [mobileCarousel, tabletCarousel, smallLaptopCarousel] = carousels

    const mobileScrollTo = setScrollToMock(mobileCarousel)
    const tabletScrollTo = setScrollToMock(tabletCarousel)
    const smallLaptopScrollTo = setScrollToMock(smallLaptopCarousel)

    setClientWidth(tabletCarousel, 900)
    setClientWidth(smallLaptopCarousel, 1200)

    const nextReview = screen.getByRole('button', { name: 'Next review' })
    const previousReview = screen.getByRole('button', { name: 'Previous review' })

    fireEvent.click(nextReview)
    expect(mobileScrollTo).toHaveBeenCalledWith({ left: 378, behavior: 'smooth' })

    const itemWidth = 342 + 20
    const lastIndex = testimonials.length - 1
    const lastLeft = 16 + lastIndex * itemWidth

    mobileCarousel.scrollLeft = lastLeft
    fireEvent.scroll(mobileCarousel)
    expect(nextReview).toBeDisabled()

    nextReview.removeAttribute('disabled')
    mobileScrollTo.mockClear()
    fireEvent.click(nextReview)
    expect(mobileScrollTo).not.toHaveBeenCalled()

    previousReview.removeAttribute('disabled')
    fireEvent.click(previousReview)
    expect(mobileScrollTo).toHaveBeenCalledWith({ left: lastLeft - itemWidth, behavior: 'smooth' })

    const nextReviewsButtons = screen.getAllByRole('button', { name: 'Next reviews' })
    const previousReviewsButtons = screen.getAllByRole('button', { name: 'Previous reviews' })
    const nextTablet = nextReviewsButtons[0]
    const previousTablet = previousReviewsButtons[0]

    fireEvent.click(nextTablet)
    expect(tabletScrollTo).toHaveBeenCalledWith({ left: 900, behavior: 'smooth' })

    tabletCarousel.scrollLeft = 900
    fireEvent.scroll(tabletCarousel)

    nextTablet.removeAttribute('disabled')
    tabletScrollTo.mockClear()
    fireEvent.click(nextTablet)
    expect(tabletScrollTo).not.toHaveBeenCalled()

    fireEvent.click(previousTablet)
    expect(tabletScrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' })

    const nextSmallLaptop = nextReviewsButtons[1]
    const previousSmallLaptop = previousReviewsButtons[1]

    fireEvent.click(nextSmallLaptop)
    expect(smallLaptopScrollTo).toHaveBeenCalledWith({ left: 1200, behavior: 'smooth' })

    smallLaptopCarousel.scrollLeft = 1200
    fireEvent.scroll(smallLaptopCarousel)

    nextSmallLaptop.removeAttribute('disabled')
    smallLaptopScrollTo.mockClear()
    fireEvent.click(nextSmallLaptop)
    expect(smallLaptopScrollTo).not.toHaveBeenCalled()

    fireEvent.click(previousSmallLaptop)
    expect(smallLaptopScrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' })
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

    expect(screen.getByRole('button', { name: 'Next review' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next reviews' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Previous reviews' })).toBeNull()
  })
})
