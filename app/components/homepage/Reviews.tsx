import { getAllTestimonials } from '@/app/utils/fetchTestimonials'
import { ReviewsCarousel } from './ReviewsCarousel'

export async function Reviews() {
  const testimonials = await getAllTestimonials()

  if (testimonials.length === 0) {
    return null
  }

  return <ReviewsCarousel testimonials={testimonials} />
}
