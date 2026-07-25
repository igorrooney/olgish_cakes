'use client'

import dynamic from 'next/dynamic'
import type {
  HomepageReview,
  PaginatedReviewsResponse
} from '@/app/types/testimonial'
import { Providers } from '@/app/providers'

const ReviewsCarousel = dynamic(
  async () => import('./ReviewsCarousel').then(module => module.ReviewsCarousel)
)

type DeferredReviewsCarouselProps = {
  testimonials: HomepageReview[]
  initialPage?: PaginatedReviewsResponse
  titleClassName?: string
}

export function DeferredReviewsCarousel({
  testimonials,
  initialPage,
  titleClassName
}: DeferredReviewsCarouselProps) {
  return (
    <Providers>
      <ReviewsCarousel
        testimonials={testimonials}
        initialPage={initialPage}
        titleClassName={titleClassName}
      />
    </Providers>
  )
}
