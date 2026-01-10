import { getAllTestimonials } from '@/app/utils/fetchTestimonials'
import { MobileReviewsCarousel } from './MobileReviewsCarousel'

export async function MobileReviews() {
  const testimonials = await getAllTestimonials()

  if (testimonials.length === 0) {
    return null
  }

  return <MobileReviewsCarousel testimonials={testimonials} />
}
