import type { Testimonial } from '@/app/types/testimonial'
import { getAllTestimonials } from '@/app/utils/fetchTestimonials'
import { DeferredReviewsCarousel } from './DeferredReviewsCarousel'

interface ReviewsProps {
  testimonials?: Testimonial[]
}

export async function Reviews({ testimonials }: ReviewsProps = {}) {
  const resolvedTestimonials = testimonials ?? await getAllTestimonials()

  if (resolvedTestimonials.length === 0) {
    return null
  }

  return <DeferredReviewsCarousel testimonials={resolvedTestimonials} />
}
