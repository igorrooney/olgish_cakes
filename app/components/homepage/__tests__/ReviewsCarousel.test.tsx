/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type {
  HomepageReview,
  PaginatedReviewsResponse
} from '@/app/types/testimonial'
import {
  fetchTestimonialsPage,
  ReviewsCarousel
} from '../ReviewsCarousel'

const createReview = (
  overrides: Partial<HomepageReview> = {}
): HomepageReview => ({
  _id: 'testimonial-1',
  customerName: 'Olha',
  rating: 5,
  date: '2026-01-01',
  text: 'So tasty!',
  ...overrides
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('ReviewsCarousel', () => {
  let intersectionCallback: IntersectionObserverCallback | null
  let observe: jest.Mock
  let disconnect: jest.Mock
  let scrollHeightSpy: jest.SpyInstance<number, []>

  beforeEach(() => {
    jest.clearAllMocks()
    intersectionCallback = null
    observe = jest.fn()
    disconnect = jest.fn()
    global.IntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => {
      intersectionCallback = callback

      return {
        disconnect,
        observe,
        root: null,
        rootMargin: '',
        takeRecords: jest.fn(() => []),
        thresholds: [0.75],
        unobserve: jest.fn()
      }
    }) as unknown as typeof IntersectionObserver
    scrollHeightSpy = jest
      .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return this.tagName === 'P' && this.textContent?.includes('Long review')
          ? 110
          : 44
      })
  })

  afterEach(() => {
    scrollHeightSpy.mockRestore()
    jest.restoreAllMocks()
  })

  it('returns null when no reviews are provided', () => {
    const { container } = render(
      <ReviewsCarousel testimonials={[]} />,
      { wrapper: createWrapper() }
    )

    expect(container.firstChild).toBeNull()
  })

  it('preserves the approved review-card design and absolute dates', () => {
    const { container } = render(
      <ReviewsCarousel
        testimonials={[
          createReview({
            _id: 'review-1',
            customerName: '',
            rating: 4,
            title: 'Amazing cake'
          }),
          createReview({
            _id: 'review-2',
            customerName: 'Iryna',
            date: '2026-01-02',
            text: 'Soft and fresh.'
          })
        ]}
      />,
      { wrapper: createWrapper() }
    )

    expect(container.querySelectorAll('.carousel')).toHaveLength(1)
    expect(screen.getAllByText('Amazing cake')).toHaveLength(1)
    expect(container.querySelector('svg[width="107"][height="20"]')).toBeInTheDocument()
    expect(container.querySelector('path[fill="#219653"]')).toBeInTheDocument()
    expect(container.querySelector('.rounded-\\[16px\\].bg-amber-50')).toBeInTheDocument()
    expect(container.querySelector('.carousel-item')).toHaveStyle({
      width: '342px',
      minWidth: '342px',
      maxWidth: '342px',
      scrollSnapAlign: 'start'
    })
    expect(screen.getAllByTestId('review-disclosure-slot')[0]).toHaveClass('h-6')
    expect(screen.getByText('Anonymous')).toBeInTheDocument()
    expect(screen.getByText('1 January 2026')).toBeInTheDocument()
    expect(screen.getByText('2 January 2026')).toBeInTheDocument()
  })

  it('keeps long reviews collapsed initially and supports disclosure', () => {
    render(
      <ReviewsCarousel
        testimonials={[
          createReview({
            text: 'Long review with enough detail to overflow the three-line preview.'
          })
        ]}
      />,
      { wrapper: createWrapper() }
    )

    const disclosure = screen.getByRole('button', { name: 'Read more' })
    const reviewText = document.getElementById(
      disclosure.getAttribute('aria-controls') ?? ''
    )

    expect(reviewText).toHaveStyle({
      maxHeight: '66px',
      overflow: 'hidden'
    })

    fireEvent.click(disclosure)

    expect(disclosure).toHaveTextContent('Show less')
    expect(disclosure).toHaveAttribute('aria-expanded', 'true')
    expect(reviewText).not.toHaveStyle({ maxHeight: '66px' })
  })

  it('keeps static consumers network-free', () => {
    const fetchSpy = jest.spyOn(global, 'fetch')

    render(
      <ReviewsCarousel testimonials={[createReview()]} />,
      { wrapper: createWrapper() }
    )

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(observe).not.toHaveBeenCalled()
  })

  it('forwards the query AbortSignal to the testimonials request', async () => {
    const page: PaginatedReviewsResponse = {
      reviews: [],
      nextCursor: null
    }
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => page
    } as Response)
    const controller = new AbortController()

    await fetchTestimonialsPage({
      client: {} as QueryClient,
      direction: 'forward',
      meta: undefined,
      pageParam: 'opaque-cursor',
      queryKey: ['testimonials', 'carousel'],
      signal: controller.signal
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/testimonials?cursor=opaque-cursor',
      expect.objectContaining({
        signal: controller.signal
      })
    )
  })

  it('automatically appends and deduplicates the next page when the final card is visible', async () => {
    const initialPage: PaginatedReviewsResponse = {
      reviews: [
        createReview({ _id: 'review-1', text: 'First review' }),
        createReview({ _id: 'review-2', text: 'Second review' })
      ],
      nextCursor: 'next-cursor'
    }
    const nextPage: PaginatedReviewsResponse = {
      reviews: [
        createReview({ _id: 'review-2', text: 'Duplicate review' }),
        createReview({ _id: 'review-3', text: 'Third review' })
      ],
      nextCursor: null
    }
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => nextPage
    } as Response)

    const { container } = render(
      <ReviewsCarousel
        testimonials={initialPage.reviews}
        initialPage={initialPage}
      />,
      { wrapper: createWrapper() }
    )

    expect(observe).toHaveBeenCalled()

    act(() => {
      intersectionCallback?.([
        { isIntersecting: true } as IntersectionObserverEntry
      ], {} as IntersectionObserver)
    })

    await screen.findByText('Third review')

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/testimonials?cursor=next-cursor',
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    )
    expect(container.querySelectorAll('.carousel-item')).toHaveLength(3)
    expect(screen.getAllByText('Second review')).toHaveLength(1)
    expect(screen.queryByText('Duplicate review')).not.toBeInTheDocument()
  })

  it('shows an inline retry and recovers after a pagination failure', async () => {
    const initialPage: PaginatedReviewsResponse = {
      reviews: [createReview()],
      nextCursor: 'retry-cursor'
    }
    const recoveredPage: PaginatedReviewsResponse = {
      reviews: [createReview({ _id: 'recovered-review', text: 'Recovered review' })],
      nextCursor: null
    }
    const fetchSpy = jest.spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('Network failed'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => recoveredPage
      } as Response)

    render(
      <ReviewsCarousel
        testimonials={initialPage.reviews}
        initialPage={initialPage}
      />,
      { wrapper: createWrapper() }
    )

    act(() => {
      intersectionCallback?.([
        { isIntersecting: true } as IntersectionObserverEntry
      ], {} as IntersectionObserver)
    })

    const retryButton = await screen.findByRole('button', { name: 'Try again' })
    fireEvent.click(retryButton)

    await screen.findByText('Recovered review')

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
    })
  })
})
