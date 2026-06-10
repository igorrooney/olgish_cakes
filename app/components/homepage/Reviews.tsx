import type { Testimonial } from '@/app/types/testimonial'
import { getAllTestimonials } from '@/app/utils/fetchTestimonials'
import { DeferredReviewsCarousel } from './DeferredReviewsCarousel'
import type { HomepageReview } from './ReviewsCarousel'

interface ReviewsProps {
  testimonials?: Testimonial[]
  titleClassName?: string
}

const hasVisibleReviewText = (testimonial: Testimonial) =>
  Boolean(testimonial.text && testimonial.text.trim().length > 0)

const hasValidReviewRating = (testimonial: Testimonial) =>
  Number.isFinite(testimonial.rating) && testimonial.rating > 0

const mapHomepageReview = (testimonial: Testimonial): HomepageReview => ({
  _id: testimonial._id,
  customerName: testimonial.customerName,
  date: testimonial.date,
  text: testimonial.text,
  ...(testimonial.title ? { title: testimonial.title } : {})
})

export async function Reviews({
  testimonials,
  titleClassName
}: ReviewsProps = {}) {
  const resolvedTestimonials = testimonials ?? await getAllTestimonials()
  const displayTestimonials = resolvedTestimonials
    .filter((testimonial) => hasVisibleReviewText(testimonial) && hasValidReviewRating(testimonial))
  const homepageReviews = displayTestimonials.map(mapHomepageReview)

  if (homepageReviews.length === 0) {
    return null
  }

  return <DeferredReviewsCarousel testimonials={homepageReviews} titleClassName={titleClassName} />
}
