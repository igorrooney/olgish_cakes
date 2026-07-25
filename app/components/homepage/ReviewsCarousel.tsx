'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject
} from 'react'
import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryFunctionContext
} from '@tanstack/react-query'
import type {
  HomepageReview,
  PaginatedReviewsResponse
} from '@/app/types/testimonial'
import { CarouselNavButton } from './CarouselNavButton'

export type { HomepageReview } from '@/app/types/testimonial'

interface ReviewProps {
  testimonials: HomepageReview[]
  initialPage?: PaginatedReviewsResponse
  titleClassName?: string
}

interface ReviewCardProps {
  testimonial: HomepageReview
  reviewTextId: string
  className?: string
}

interface CarouselControlsProps {
  className: string
  carouselRef: RefObject<HTMLDivElement | null>
  currentIndex: number
  hasNextPage: boolean
  idPrefix: string
  isFetchingNextPage: boolean
  nextLabel: string
  onFetchNext: () => void
  prevLabel: string
  total: number
}

const reviewsQueryKey = ['testimonials', 'carousel'] as const
const disclosureSlotClassName = 'h-6'
const overflowTolerance = 1
const collapsedReviewMaxHeight = 66
const reviewTextBaseClassName = 'font-sans text-sm leading-[22px] text-black'
const reviewPreviewEllipsisClassName =
  'pointer-events-none absolute bottom-0 right-0 bg-amber-50 pl-2 font-sans text-sm leading-[22px] text-black'
const collapsedReviewStyle = {
  maxHeight: `${collapsedReviewMaxHeight}px`,
  overflow: 'hidden'
} as const
const tabletMediaQuery = '(min-width: 64rem)'
const smallLaptopMediaQuery = '(min-width: 80rem)'

type ReviewsViewport = 'mobile' | 'tablet' | 'small-laptop'

const getCurrentViewport = (): ReviewsViewport => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'mobile'
  }

  if (window.matchMedia(smallLaptopMediaQuery).matches) {
    return 'small-laptop'
  }

  if (window.matchMedia(tabletMediaQuery).matches) {
    return 'tablet'
  }

  return 'mobile'
}

const useReviewsViewport = () => {
  const [viewport, setViewport] = useState<ReviewsViewport | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setViewport('mobile')
      return
    }

    const tabletQuery = window.matchMedia(tabletMediaQuery)
    const smallLaptopQuery = window.matchMedia(smallLaptopMediaQuery)
    const updateViewport = () => setViewport(getCurrentViewport())

    updateViewport()
    tabletQuery.addEventListener('change', updateViewport)
    smallLaptopQuery.addEventListener('change', updateViewport)

    return () => {
      tabletQuery.removeEventListener('change', updateViewport)
      smallLaptopQuery.removeEventListener('change', updateViewport)
    }
  }, [])

  return viewport
}

const getValidDate = (dateString: string) => {
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? null : date
}

type ReviewDateMeta = {
  dateTime?: string
  absoluteDate: string
  isValid: boolean
}

const reviewDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London'
})

function getReviewDateMeta(dateString: string): ReviewDateMeta {
  const date = getValidDate(dateString)

  if (!date) {
    return {
      absoluteDate: 'Recently',
      isValid: false
    }
  }

  return {
    dateTime: date.toISOString(),
    absoluteDate: reviewDateFormatter.format(date),
    isValid: true
  }
}

const getPrevIndex = (index: number) => Math.max(index - 1, 0)
const getNextIndex = (index: number, total: number) => Math.min(index + 1, total - 1)

const getCarouselItems = (carousel: HTMLDivElement) =>
  Array.from(carousel.querySelectorAll<HTMLElement>('.carousel-item'))

const getCarouselPaddingLeft = (carousel: HTMLDivElement) => {
  const paddingLeft = Number.parseFloat(getComputedStyle(carousel).paddingLeft)
  return Number.isNaN(paddingLeft) ? 0 : paddingLeft
}

const scrollToIndex = (
  carouselRef: RefObject<HTMLDivElement | null>,
  index: number
) => {
  const carousel = carouselRef.current

  if (!carousel) return

  const target = getCarouselItems(carousel)[index]

  if (!target) return

  const paddingLeft = getCarouselPaddingLeft(carousel)
  const left = Math.max(target.offsetLeft - paddingLeft, 0)

  carousel.scrollTo(left, 0)
}

const useCarouselIndex = (
  carouselRef: RefObject<HTMLDivElement | null>,
  itemCount: number,
  isActive: boolean
) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setIndex(0)
      return
    }

    const carousel = carouselRef.current

    if (!carousel) return

    const items = getCarouselItems(carousel)

    if (items.length === 0) return

    const updateIndex = () => {
      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth
      const paddingLeft = getCarouselPaddingLeft(carousel)
      const paddingRight = Number.parseFloat(getComputedStyle(carousel).paddingRight) || 0

      if (carousel.scrollLeft <= paddingLeft + 1) {
        setIndex(0)
        return
      }

      if (carousel.scrollLeft >= maxScrollLeft - paddingRight - 1) {
        setIndex(items.length - 1)
        return
      }

      const anchor = carousel.scrollLeft + paddingLeft
      let closestIndex = 0
      let minDistance = Math.abs(items[0].offsetLeft - anchor)

      for (let itemIndex = 1; itemIndex < items.length; itemIndex += 1) {
        const distance = Math.abs(items[itemIndex].offsetLeft - anchor)

        if (distance < minDistance) {
          minDistance = distance
          closestIndex = itemIndex
        }
      }

      setIndex(closestIndex)
    }

    updateIndex()
    carousel.addEventListener('scroll', updateIndex, { passive: true })
    window.addEventListener('resize', updateIndex)

    return () => {
      carousel.removeEventListener('scroll', updateIndex)
      window.removeEventListener('resize', updateIndex)
    }
  }, [carouselRef, isActive, itemCount])

  return index
}

const isHomepageReview = (value: unknown): value is HomepageReview => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const review = value as Partial<HomepageReview>

  return typeof review._id === 'string' &&
    review._id.length > 0 &&
    typeof review.customerName === 'string' &&
    typeof review.date === 'string' &&
    review.date.length > 0 &&
    typeof review.text === 'string' &&
    review.text.trim().length > 0 &&
    typeof review.rating === 'number' &&
    Number.isFinite(review.rating) &&
    review.rating >= 1 &&
    review.rating <= 5 &&
    (review.title === undefined || typeof review.title === 'string')
}

const isPaginatedReviewsResponse = (
  value: unknown
): value is PaginatedReviewsResponse => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const response = value as Partial<PaginatedReviewsResponse>

  return Array.isArray(response.reviews) &&
    response.reviews.every(isHomepageReview) &&
    (
      response.nextCursor === null ||
      (typeof response.nextCursor === 'string' && response.nextCursor.length <= 512)
    )
}

export async function fetchTestimonialsPage({
  pageParam,
  signal
}: QueryFunctionContext<typeof reviewsQueryKey, string | null>) {
  const query = pageParam
    ? `?cursor=${encodeURIComponent(pageParam)}`
    : ''
  const response = await fetch(`/api/testimonials${query}`, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json'
    },
    signal
  })

  if (!response.ok) {
    throw new Error('We could not load more reviews.')
  }

  const data = await response.json() as unknown

  if (!isPaginatedReviewsResponse(data)) {
    throw new Error('We could not load more reviews.')
  }

  return data
}

function CarouselControls({
  className,
  carouselRef,
  currentIndex,
  hasNextPage,
  idPrefix,
  isFetchingNextPage,
  nextLabel,
  onFetchNext,
  prevLabel,
  total
}: CarouselControlsProps) {
  if (total <= 1 && !hasNextPage) return null

  const isFirst = currentIndex <= 0
  const isLastLoaded = currentIndex >= total - 1
  const isTrueEnd = isLastLoaded && !hasNextPage
  const prevIndex = getPrevIndex(currentIndex)
  const nextIndex = isLastLoaded && hasNextPage
    ? currentIndex + 1
    : getNextIndex(currentIndex, total)
  const prevTargetId = `${idPrefix}-${prevIndex + 1}`
  const nextTargetId = `${idPrefix}-${nextIndex + 1}`
  const handleNext = () => {
    if (isLastLoaded && hasNextPage) {
      if (!isFetchingNextPage) {
        onFetchNext()
      }
      return
    }

    scrollToIndex(carouselRef, nextIndex)
  }

  return (
    <div className={className}>
      <CarouselNavButton
        ariaControls={prevTargetId}
        ariaLabel={prevLabel}
        direction='previous'
        disabled={isFirst}
        onClick={() => scrollToIndex(carouselRef, prevIndex)}
      />
      <CarouselNavButton
        ariaControls={nextTargetId}
        ariaLabel={nextLabel}
        direction='next'
        disabled={isTrueEnd}
        onClick={handleNext}
      />
    </div>
  )
}

function StarRating() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='107' height='20' viewBox='0 0 107 20' fill='none'>
      <g clipPath='url(#clip0_2136_116)'>
        <path d='M20 0H0V20H20V0Z' fill='#219653' />
        <path d='M41.6667 0H21.6667V20H41.6667V0Z' fill='#219653' />
        <path d='M63.3333 0H43.3333V20H63.3333V0Z' fill='#219653' />
        <path d='M85 0H65V20H85V0Z' fill='#219653' />
        <path d='M106.667 0H86.6667V20H106.667V0Z' fill='#219653' />
        <path d='M9.99973 13.4792L13.0414 12.7083L14.3122 16.625L9.99973 13.4792ZM16.9997 8.41667H11.6456L9.99973 3.375L8.35389 8.41667H2.99973L7.33306 11.5417L5.68723 16.5833L10.0206 13.4583L12.6872 11.5417L16.9997 8.41667Z' fill='white' />
        <path d='M31.6664 13.4792L34.7081 12.7083L35.9789 16.625L31.6664 13.4792ZM38.6664 8.41667H33.3122L31.6664 3.375L30.0206 8.41667H24.6664L28.9997 11.5417L27.3539 16.5833L31.6872 13.4583L34.3539 11.5417L38.6664 8.41667Z' fill='white' />
        <path d='M53.3331 13.4792L56.3747 12.7083L57.6456 16.625L53.3331 13.4792ZM60.3331 8.41667H54.9789L53.3331 3.375L51.6872 8.41667H46.3331L50.6664 11.5417L49.0206 16.5833L53.3539 13.4583L56.0206 11.5417L60.3331 8.41667Z' fill='white' />
        <path d='M74.9997 13.4792L78.0414 12.7083L79.3122 16.625L74.9997 13.4792ZM81.9997 8.41667H76.6456L74.9997 3.375L73.3539 8.41667H67.9997L72.3331 11.5417L70.6872 16.5833L75.0206 13.4583L77.6872 11.5417L81.9997 8.41667Z' fill='white' />
        <path d='M96.6664 13.4792L99.7081 12.7083L100.979 16.625L96.6664 13.4792ZM103.666 8.41667H98.3122L96.6664 3.375L95.0206 8.41667H89.6664L93.9997 11.5417L92.3539 16.5833L96.6872 13.4583L99.3539 11.5417L103.666 8.41667Z' fill='white' />
      </g>
      <defs>
        <clipPath id='clip0_2136_116'>
          <rect width='106.667' height='20' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

const getReviewOverflow = (reviewText: HTMLParagraphElement) =>
  reviewText.scrollHeight > collapsedReviewMaxHeight + overflowTolerance

function ReviewCard({ testimonial, reviewTextId, className }: ReviewCardProps) {
  const reviewTitle = testimonial.title?.trim()
  const { dateTime, absoluteDate, isValid } = getReviewDateMeta(testimonial.date)
  const displayName = testimonial.customerName || 'Anonymous'
  const visibleDate = absoluteDate
  const reviewTextRef = useRef<HTMLParagraphElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    const reviewText = reviewTextRef.current

    if (!reviewText) {
      return
    }

    const measureCollapsedOverflow = () => {
      setHasOverflow(getReviewOverflow(reviewText))
    }

    measureCollapsedOverflow()
    window.addEventListener('resize', measureCollapsedOverflow)

    return () => {
      window.removeEventListener('resize', measureCollapsedOverflow)
    }
  }, [testimonial.text])

  useEffect(() => {
    setIsExpanded(false)
  }, [testimonial._id, testimonial.text])

  const shouldClampReviewText = !isExpanded

  return (
    <div
      className={`flex h-full w-full flex-col rounded-[16px] border border-[rgba(0,0,0,0.2)] bg-amber-50 p-5 ${className || ''}`}
    >
      <div className='flex h-full flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <div>
            <StarRating />
          </div>
          <time
            className='font-sans text-xs text-base-content'
            dateTime={dateTime}
            title={isValid ? `Reviewed on ${absoluteDate}` : 'Reviewed recently'}
          >
            {visibleDate}
          </time>
        </div>
        {reviewTitle && (
          <h3 className='font-sans text-lg font-medium text-black'>
            {reviewTitle}
          </h3>
        )}
        <div className='relative'>
          <p
            ref={reviewTextRef}
            id={reviewTextId}
            className={reviewTextBaseClassName}
            style={shouldClampReviewText ? collapsedReviewStyle : undefined}
          >
            {testimonial.text}
          </p>
          {shouldClampReviewText && (
            <span
              aria-hidden='true'
              className={reviewPreviewEllipsisClassName}
            >
              ...
            </span>
          )}
        </div>
        <div className={disclosureSlotClassName} data-testid='review-disclosure-slot'>
          {hasOverflow ? (
            <button
              type='button'
              className='w-fit cursor-pointer font-sans text-sm font-semibold text-primary-700 underline underline-offset-4 transition-colors hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50'
              aria-controls={reviewTextId}
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((current) => !current)}
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          ) : (
            <span aria-hidden='true' className='block h-6 w-full' />
          )}
        </div>
        <div className='h-px w-[60px] bg-base-300' />
        <p className='font-sans text-sm font-bold text-base-content'>
          {displayName}
        </p>
      </div>
    </div>
  )
}

const defaultReviewsTitleClassName = 'font-moreSugar text-[24px] uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center tablet:text-[36px] tablet:leading-[52px]'

const deduplicateReviews = (pages: PaginatedReviewsResponse[]) => {
  const reviewsById = new Map<string, HomepageReview>()

  pages.forEach((page) => {
    page.reviews.forEach((review) => {
      if (!reviewsById.has(review._id)) {
        reviewsById.set(review._id, review)
      }
    })
  })

  return Array.from(reviewsById.values())
}

export function ReviewsCarousel({
  testimonials,
  initialPage,
  titleClassName = defaultReviewsTitleClassName
}: ReviewProps) {
  const mobileCarouselRef = useRef<HTMLDivElement>(null)
  const tabletCarouselRef = useRef<HTMLDivElement>(null)
  const smallLaptopCarouselRef = useRef<HTMLDivElement>(null)
  const finalItemRef = useRef<HTMLDivElement | null>(null)
  const viewport = useReviewsViewport()
  const baseId = 'reviews-carousel'
  const paginationEnabled = Boolean(initialPage)
  const initialData: InfiniteData<PaginatedReviewsResponse, string | null> | undefined =
    initialPage
      ? {
          pages: [initialPage],
          pageParams: [null]
        }
      : undefined
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: reviewsQueryKey,
    queryFn: fetchTestimonialsPage,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData,
    enabled: paginationEnabled,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })
  const reviews = useMemo(
    () => paginationEnabled
      ? deduplicateReviews(data?.pages ?? (initialPage ? [initialPage] : []))
      : testimonials,
    [data?.pages, initialPage, paginationEnabled, testimonials]
  )
  const finalReviewId = reviews.at(-1)?._id
  const mobileSlideCount = reviews.length
  const tabletSlides = useMemo(() =>
    Array.from({ length: Math.ceil(reviews.length / 4) }, (_, slideIndex) =>
      reviews.slice(slideIndex * 4, slideIndex * 4 + 4)
    ), [reviews]
  )
  const tabletSlideCount = tabletSlides.length
  const smallLaptopSlides = useMemo(() =>
    Array.from({ length: Math.ceil(reviews.length / 6) }, (_, slideIndex) =>
      reviews.slice(slideIndex * 6, slideIndex * 6 + 6)
    ), [reviews]
  )
  const smallLaptopSlideCount = smallLaptopSlides.length
  const mobileIndex = useCarouselIndex(
    mobileCarouselRef,
    mobileSlideCount,
    viewport === 'mobile'
  )
  const tabletIndex = useCarouselIndex(
    tabletCarouselRef,
    tabletSlideCount,
    viewport === 'tablet'
  )
  const smallLaptopIndex = useCarouselIndex(
    smallLaptopCarouselRef,
    smallLaptopSlideCount,
    viewport === 'small-laptop'
  )
  useEffect(() => {
    const finalItem = finalItemRef.current
    const activeCarousel = viewport === 'small-laptop'
      ? smallLaptopCarouselRef.current
      : viewport === 'tablet'
        ? tabletCarouselRef.current
        : mobileCarouselRef.current

    if (
      !viewport ||
      !paginationEnabled ||
      !finalItem ||
      !activeCarousel ||
      !hasNextPage ||
      isFetchingNextPage ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        void fetchNextPage()
      }
    }, {
      root: activeCarousel,
      threshold: 0.75
    })

    observer.observe(finalItem)

    return () => observer.disconnect()
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    paginationEnabled,
    reviews.length,
    viewport
  ])

  if (reviews.length === 0) {
    return null
  }

  const loadNextPage = () => {
    void fetchNextPage()
  }

  return (
    <section className='content-auto-section bg-base-100 px-4 py-8 tablet:py-12'>
      <div className='homepage-container flex flex-col gap-6'>
        <h2 className={titleClassName}>
          Our reviews
        </h2>

        <div className='relative -mx-4 tablet:mx-0'>
          {viewport === null || viewport === 'mobile' ? (
            <div
              key='reviews-mobile-layout'
              className={viewport === null ? 'contents tablet:hidden' : 'contents'}
            >
              <div
                ref={mobileCarouselRef}
                className='carousel carousel-center w-full overflow-x-auto scroll-smooth [scroll-snap-type:x_mandatory] px-4 [scroll-padding-left:calc(var(--spacing)*4)] [scroll-padding-right:calc(var(--spacing)*4)] gap-5'
              >
                {reviews.map((testimonial, index) => (
                  <div
                    key={testimonial._id}
                    id={`${baseId}-reviews-mobile-${index + 1}`}
                    ref={testimonial._id === finalReviewId
                      ? (element) => {
                          finalItemRef.current = element
                        }
                      : undefined}
                    className='carousel-item flex-shrink-0'
                    style={{
                      width: '342px',
                      minWidth: '342px',
                      maxWidth: '342px',
                      scrollSnapAlign: 'start'
                    }}
                  >
                    <ReviewCard
                      testimonial={testimonial}
                      reviewTextId={`${baseId}-mobile-review-text-${index + 1}-${testimonial._id}`}
                    />
                  </div>
                ))}
              </div>
              <CarouselControls
                className='mt-5 flex justify-center gap-3'
                carouselRef={mobileCarouselRef}
                currentIndex={mobileIndex}
                hasNextPage={Boolean(hasNextPage)}
                idPrefix={`${baseId}-reviews-mobile`}
                isFetchingNextPage={isFetchingNextPage}
                nextLabel='Next review'
                onFetchNext={loadNextPage}
                prevLabel='Previous review'
                total={mobileSlideCount}
              />
            </div>
          ) : null}

          {viewport === null || viewport === 'tablet' ? (
            <div
              key='reviews-tablet-layout'
              className={viewport === null
                ? 'relative hidden tablet:block small-laptop:hidden'
                : 'relative'}
            >
              <div className='relative p-6'>
                <div
                  ref={tabletCarouselRef}
                  className='carousel w-full overflow-x-auto scroll-smooth [scroll-snap-type:x_mandatory]'
                >
                  {tabletSlides.map((slide, slideIndex) => (
                    <div
                      key={`reviews-slide-${slideIndex}`}
                      id={`${baseId}-reviews-tablet-${slideIndex + 1}`}
                      className='carousel-item w-full flex-shrink-0'
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className='flex w-full flex-wrap items-stretch justify-center gap-5'>
                        {slide.map((testimonial) => (
                          <div
                            key={testimonial._id}
                            ref={testimonial._id === finalReviewId
                              ? (element) => {
                                  finalItemRef.current = element
                                }
                              : undefined}
                            className='w-full max-w-[342px]'
                          >
                            <ReviewCard
                              testimonial={testimonial}
                              reviewTextId={`${baseId}-tablet-review-text-${slideIndex + 1}-${testimonial._id}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <CarouselControls
                className='mt-5 flex justify-center gap-3'
                carouselRef={tabletCarouselRef}
                currentIndex={tabletIndex}
                hasNextPage={Boolean(hasNextPage)}
                idPrefix={`${baseId}-reviews-tablet`}
                isFetchingNextPage={isFetchingNextPage}
                nextLabel='Next reviews'
                onFetchNext={loadNextPage}
                prevLabel='Previous reviews'
                total={tabletSlideCount}
              />
            </div>
          ) : null}

          {viewport === null || viewport === 'small-laptop' ? (
            <div
              key='reviews-small-laptop-layout'
              className={viewport === null
                ? 'relative hidden small-laptop:block'
                : 'relative'}
            >
              <div className='relative p-6'>
                <div
                  ref={smallLaptopCarouselRef}
                  className='carousel w-full overflow-x-auto scroll-smooth [scroll-snap-type:x_mandatory]'
                >
                  {smallLaptopSlides.map((slide, slideIndex) => (
                    <div
                      key={`reviews-small-laptop-slide-${slideIndex}`}
                      id={`${baseId}-reviews-small-laptop-${slideIndex + 1}`}
                      className='carousel-item w-full flex-shrink-0'
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className='grid w-full grid-cols-[repeat(3,_342px)] justify-start gap-5'>
                        {slide.map((testimonial) => (
                          <div
                            key={testimonial._id}
                            ref={testimonial._id === finalReviewId
                              ? (element) => {
                                  finalItemRef.current = element
                                }
                              : undefined}
                            className='w-full max-w-[342px]'
                          >
                            <ReviewCard
                              testimonial={testimonial}
                              reviewTextId={`${baseId}-small-laptop-review-text-${slideIndex + 1}-${testimonial._id}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <CarouselControls
                className='mt-5 flex justify-center gap-3'
                carouselRef={smallLaptopCarouselRef}
                currentIndex={smallLaptopIndex}
                hasNextPage={Boolean(hasNextPage)}
                idPrefix={`${baseId}-reviews-small-laptop`}
                isFetchingNextPage={isFetchingNextPage}
                nextLabel='Next reviews'
                onFetchNext={loadNextPage}
                prevLabel='Previous reviews'
                total={smallLaptopSlideCount}
              />
            </div>
          ) : null}
        </div>

        {isFetchingNextPage ? (
          <p className='sr-only' role='status' aria-live='polite'>
            Loading more reviews
          </p>
        ) : null}

        {isFetchNextPageError ? (
          <div className='alert alert-error mx-auto w-full max-w-xl items-center text-sm' role='alert'>
            <span>{error instanceof Error ? error.message : 'We could not load more reviews.'}</span>
            <button
              type='button'
              className='btn btn-sm'
              onClick={() => void fetchNextPage()}
            >
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
