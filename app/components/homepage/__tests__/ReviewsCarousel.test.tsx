/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import type { Testimonial } from '@/app/types/testimonial'
import { ReviewsCarousel } from '../ReviewsCarousel'

const hours = 60 * 60 * 1000
const days = 24 * hours

const longReviewPrefix = 'This review is long enough to overflow after three lines in the review card layout.'
const exactThreeLineReviewPrefix = 'This review fits exactly within the visible three-line clamp and should not render a disclosure.'
const responsiveReviewPrefix = 'This review changes between three lines and four lines as the available width changes.'

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

const getReviewTextElement = (controlId: string | null): HTMLElement => {
  const reviewText = controlId ? document.getElementById(controlId) : null

  if (!reviewText) {
    throw new Error(`Review text element not found for control id: ${controlId}`)
  }

  return reviewText
}

const mockViewport = (viewport: 'mobile' | 'tablet' | 'small-laptop') => {
  window.matchMedia = jest.fn((query: string) => ({
    matches:
      viewport === 'small-laptop' ||
      (viewport === 'tablet' && query === '(min-width: 64rem)'),
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
}

describe('ReviewsCarousel', () => {
  const now = new Date('2026-01-29T12:00:00Z')
  let clientWidthSpy: jest.SpyInstance<number, []>
  let clientHeightSpy: jest.SpyInstance<number, []>
  let scrollHeightSpy: jest.SpyInstance<number, []>
  let currentReviewWidth = 342

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(now)
    mockViewport('mobile')

    clientWidthSpy = jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      if (this.tagName === 'P') {
        return currentReviewWidth
      }

      return 0
    })

    scrollHeightSpy = jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLElement) {
      if (this.tagName !== 'P') {
        return 0
      }

      const textContent = this.textContent ?? ''

      if (textContent.includes(longReviewPrefix)) {
        return 110
      }

      if (textContent.includes(responsiveReviewPrefix)) {
        return currentReviewWidth >= 342 ? 66 : 88
      }

      if (textContent.includes(exactThreeLineReviewPrefix)) {
        return 66
      }

      return 66
    })

    clientHeightSpy = jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
      if (this.tagName !== 'P') {
        return 0
      }

      const element = this as HTMLParagraphElement
      const isClamped = element.style.maxHeight === '66px'
      const height = element.scrollHeight

      if (!isClamped) {
        return height
      }

      return Math.min(height, 66)
    })
  })

  afterEach(() => {
    clientWidthSpy.mockRestore()
    clientHeightSpy.mockRestore()
    scrollHeightSpy.mockRestore()
    currentReviewWidth = 342
    jest.useRealTimers()
  })

  it('returns null when no testimonials are provided', () => {
    const { container } = render(<ReviewsCarousel testimonials={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders reviews with absolute dates and fallback names', () => {
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
        date: new Date(now.getTime() - 6 * days).toISOString(),
        customerName: '',
        text: 'Soft and fresh.'
      })
    ]

    render(<ReviewsCarousel testimonials={testimonials} />)

    expect(screen.getByText('Our reviews')).toBeInTheDocument()
    expect(screen.getAllByText('Amazing cake')).toHaveLength(1)
    expect(screen.getAllByText(/29 January 2026/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/23 January 2026/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText(/days ago/i)).not.toBeInTheDocument()
    expect(screen.getAllByText('Anonymous')).toHaveLength(1)
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
    const [mobileCarousel] = carousels
    const mobileItems = Array.from(mobileCarousel.querySelectorAll<HTMLElement>('.carousel-item'))

    expect(previousReviewButton).toHaveAttribute('aria-controls', mobileItems[0].id)
    expect(nextReviewButton).toHaveAttribute('aria-controls', mobileItems[1].id)
    expect(previousReviewButton).toBeDisabled()
    expect(nextReviewButton).not.toBeDisabled()
    expect(previousReviewButton).toHaveAttribute('aria-disabled', 'true')
    expect(nextReviewButton).toHaveAttribute('aria-disabled', 'false')
    expect(screen.queryByRole('button', { name: 'Previous reviews' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next reviews' })).not.toBeInTheDocument()

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
  })

  it('updates tablet carousel navigation after the tablet view mounts', async () => {
    mockViewport('tablet')

    const testimonials = Array.from({ length: 9 }, (_, index) =>
      createTestimonial({
        _id: `tablet-nav-${index}`,
        date: new Date(now.getTime() - index * days).toISOString(),
        customerName: `Customer ${index + 1}`,
        text: `Tablet review ${index + 1}`
      })
    )

    const { container } = render(<ReviewsCarousel testimonials={testimonials} />)
    const previousReviewsButton = await screen.findByRole('button', { name: 'Previous reviews' })
    const nextReviewsButton = screen.getByRole('button', { name: 'Next reviews' })
    const tabletCarousel = container.querySelector<HTMLDivElement>('.carousel')

    if (!tabletCarousel) {
      throw new Error('Expected tablet carousel to render')
    }

    const tabletItems = Array.from(tabletCarousel.querySelectorAll<HTMLElement>('.carousel-item'))
    const scrollTo = jest.fn()

    Object.defineProperties(tabletCarousel, {
      clientWidth: {
        value: 900,
        configurable: true
      },
      scrollTo: {
        value: scrollTo,
        configurable: true
      },
      scrollWidth: {
        value: 2700,
        configurable: true
      }
    })

    tabletItems.forEach((item, index) => {
      Object.defineProperty(item, 'offsetLeft', {
        value: index * 900,
        configurable: true
      })
    })

    expect(previousReviewsButton).toBeDisabled()
    expect(nextReviewsButton).not.toBeDisabled()

    fireEvent.click(nextReviewsButton)
    expect(scrollTo).toHaveBeenCalledWith(900, 0)

    Object.defineProperty(tabletCarousel, 'scrollLeft', {
      value: 900,
      writable: true,
      configurable: true
    })

    fireEvent.scroll(tabletCarousel)

    expect(previousReviewsButton).not.toBeDisabled()
    expect(nextReviewsButton).not.toBeDisabled()
  })

  it('shows an accessible disclosure control only for overflowing reviews', () => {
    const longReview = `${longReviewPrefix} It keeps going with extra detail about taste, texture, design, service, and delivery so the button should appear.`
    const shortReview = 'Short review that fits.'

    render(
      <ReviewsCarousel
        testimonials={[
          createTestimonial({
            _id: 'overflowing-review',
            text: longReview,
            customerName: 'Iryna'
          }),
          createTestimonial({
            _id: 'short-review',
            text: shortReview,
            customerName: 'Olha'
          })
        ]}
      />
    )

    expect(screen.getAllByTestId('review-disclosure-slot')).toHaveLength(2)
    const readMoreButtons = screen.getAllByRole('button', { name: 'Read more' })
    expect(readMoreButtons).toHaveLength(1)
    expect(screen.getAllByText(shortReview)).toHaveLength(1)

    const longReviewText = getReviewTextElement(readMoreButtons[0].getAttribute('aria-controls'))
    expect(longReviewText).toHaveStyle({ maxHeight: '66px', overflow: 'hidden' })
    expect(readMoreButtons[0]).toHaveAttribute('aria-expanded', 'false')
    expect(readMoreButtons[0]).toHaveAttribute('aria-controls', longReviewText.id)
    expect(screen.getAllByText('...')).toHaveLength(1)
  })

  it('toggles overflowing reviews independently without affecting review metadata', () => {
    const longReviewOne = `${longReviewPrefix} It keeps going with extra detail about taste, texture, design, service, and delivery so the button should appear.`
    const longReviewTwo = `${longReviewPrefix} Another customer adds extra words about celebration photos, family reactions, and perfect packaging.`

    render(
      <ReviewsCarousel
        testimonials={[
          createTestimonial({
            _id: 'overflowing-review-one',
            title: 'Amazing cake',
            text: longReviewOne,
            customerName: 'Iryna'
          }),
          createTestimonial({
            _id: 'overflowing-review-two',
            title: 'Wonderful service',
            text: longReviewTwo,
            customerName: 'Kateryna'
          })
        ]}
      />
    )

    const readMoreButtons = screen.getAllByRole('button', { name: 'Read more' })
    const firstReviewText = getReviewTextElement(readMoreButtons[0].getAttribute('aria-controls'))
    const secondReviewText = getReviewTextElement(readMoreButtons[1].getAttribute('aria-controls'))

    fireEvent.click(readMoreButtons[0])

    expect(readMoreButtons[0]).toHaveAttribute('aria-expanded', 'true')
    expect(readMoreButtons[0]).toHaveTextContent('Show less')
    expect(firstReviewText).not.toHaveStyle({ maxHeight: '66px' })
    expect(secondReviewText).toHaveStyle({ maxHeight: '66px', overflow: 'hidden' })
    expect(screen.getAllByText('...')).toHaveLength(1)
    expect(screen.getAllByText('Amazing cake')).toHaveLength(1)
    expect(screen.getAllByText('Iryna')).toHaveLength(1)
    expect(screen.getAllByText(/1 January 2026/i)).toHaveLength(2)

    fireEvent.click(readMoreButtons[1])

    expect(readMoreButtons[1]).toHaveAttribute('aria-expanded', 'true')
    expect(secondReviewText).not.toHaveStyle({ maxHeight: '66px' })
    expect(screen.queryByText('...')).not.toBeInTheDocument()
  })

  it('keeps expanded reviews open after resize remeasurement', () => {
    const longReview = `${longReviewPrefix} It keeps going with extra detail about taste, texture, design, service, and delivery so the button should appear.`

    render(
      <ReviewsCarousel
        testimonials={[
          createTestimonial({
            _id: 'persistent-overflowing-review',
            text: longReview,
            customerName: 'Iryna'
          })
        ]}
      />
    )

    const disclosureButton = screen.getAllByRole('button', { name: 'Read more' })[0]
    const reviewText = getReviewTextElement(disclosureButton.getAttribute('aria-controls'))

    fireEvent.click(disclosureButton)

    expect(disclosureButton).toHaveAttribute('aria-expanded', 'true')
    expect(reviewText).not.toHaveStyle({ maxHeight: '66px' })

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    const showLessButtons = screen.getAllByRole('button', { name: 'Show less' })

    expect(showLessButtons).toHaveLength(1)
    expect(showLessButtons[0]).toHaveAttribute('aria-expanded', 'true')
    expect(reviewText).not.toHaveStyle({ maxHeight: '66px' })
  })

  it('does not show a disclosure for reviews that fit exactly within three lines', () => {
    const exactThreeLineReview = `${exactThreeLineReviewPrefix} The copy is still readable without hidden content.`

    render(
      <ReviewsCarousel
        testimonials={[
          createTestimonial({
            _id: 'exact-three-lines-review',
            text: exactThreeLineReview,
            customerName: 'Olha'
          })
        ]}
      />
    )

    expect(screen.getAllByText(exactThreeLineReview)).toHaveLength(1)
    expect(screen.queryByRole('button', { name: 'Read more' })).not.toBeInTheDocument()
    expect(screen.queryByText('...')).not.toBeInTheDocument()
  })

  it('updates disclosure visibility when the review width changes after resize', () => {
    const responsiveReview = `${responsiveReviewPrefix} It should only reveal the button once the layout becomes narrow enough to truncate it.`

    render(
      <ReviewsCarousel
        testimonials={[
          createTestimonial({
            _id: 'responsive-review',
            text: responsiveReview,
            customerName: 'Iryna'
          })
        ]}
      />
    )

    expect(screen.queryByRole('button', { name: 'Read more' })).not.toBeInTheDocument()

    currentReviewWidth = 240

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(screen.getAllByRole('button', { name: 'Read more' })).toHaveLength(1)
  })

  it('removes the clamp when a resized review no longer overflows', () => {
    const responsiveReview = `${responsiveReviewPrefix} It should stop truncating once the layout becomes wide enough again.`

    render(
      <ReviewsCarousel
        testimonials={[
          createTestimonial({
            _id: 'responsive-unclamped-review',
            text: responsiveReview,
            customerName: 'Iryna'
          })
        ]}
      />
    )

    currentReviewWidth = 240

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    const disclosureButton = screen.getAllByRole('button', { name: 'Read more' })[0]
    const reviewText = getReviewTextElement(disclosureButton.getAttribute('aria-controls'))

    expect(reviewText).toHaveStyle({ maxHeight: '66px', overflow: 'hidden' })

    currentReviewWidth = 342

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(screen.queryByRole('button', { name: 'Read more' })).not.toBeInTheDocument()
    expect(reviewText).not.toHaveStyle({ maxHeight: '66px', overflow: 'hidden' })
  })

})
