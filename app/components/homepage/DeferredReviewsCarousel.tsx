'use client'

import dynamic from 'next/dynamic'
import type { HomepageReview } from './ReviewsCarousel'

const ReviewsCarousel = dynamic(
  async () => import('./ReviewsCarousel').then(module => module.ReviewsCarousel)
)

type DeferredReviewsCarouselProps = {
  testimonials: HomepageReview[]
}

export function DeferredReviewsCarousel({
  testimonials
}: DeferredReviewsCarouselProps) {
  return <ReviewsCarousel testimonials={testimonials} />
}
