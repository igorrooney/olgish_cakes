'use client'

import dynamic from 'next/dynamic'
import type { HomepageReview } from './ReviewsCarousel'

const ReviewsCarousel = dynamic(
  async () => import('./ReviewsCarousel').then(module => module.ReviewsCarousel)
)

type DeferredReviewsCarouselProps = {
  testimonials: HomepageReview[]
  titleClassName?: string
}

export function DeferredReviewsCarousel({
  testimonials,
  titleClassName
}: DeferredReviewsCarouselProps) {
  return <ReviewsCarousel testimonials={testimonials} titleClassName={titleClassName} />
}
