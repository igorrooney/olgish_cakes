'use client'

import dynamic from 'next/dynamic'
import type { Testimonial } from '@/app/types/testimonial'

const ReviewsCarousel = dynamic(
  async () => import('./ReviewsCarousel').then(module => module.ReviewsCarousel)
)

type DeferredReviewsCarouselProps = {
  testimonials: Testimonial[]
}

export function DeferredReviewsCarousel({
  testimonials
}: DeferredReviewsCarouselProps) {
  return <ReviewsCarousel testimonials={testimonials} />
}
