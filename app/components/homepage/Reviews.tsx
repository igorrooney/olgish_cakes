import type {
  HomepageReview,
  PaginatedReviewsResponse,
  Testimonial
} from '@/app/types/testimonial'
import { getTestimonialsPage } from '@/app/utils/fetchTestimonials'
import { DeferredReviewsCarousel } from './DeferredReviewsCarousel'

interface ReviewsProps {
  testimonials?: Testimonial[]
  initialPage?: PaginatedReviewsResponse
  titleClassName?: string
}

const hasVisibleReviewText = (testimonial: Testimonial) =>
  Boolean(testimonial.text && testimonial.text.trim().length > 0)

const hasValidReviewRating = (testimonial: Testimonial) =>
  Number.isFinite(testimonial.rating) &&
  testimonial.rating >= 1 &&
  testimonial.rating <= 5

const hasValidReviewIdentity = (testimonial: Testimonial) =>
  Boolean(testimonial._id?.trim()) &&
  Boolean(testimonial.date?.trim()) &&
  !Number.isNaN(new Date(testimonial.date).getTime())

const mapHomepageReview = (testimonial: Testimonial): HomepageReview => ({
  _id: testimonial._id,
  customerName: testimonial.customerName,
  rating: testimonial.rating,
  date: testimonial.date,
  text: testimonial.text,
  ...(testimonial.title ? { title: testimonial.title } : {})
})

export async function Reviews({
  testimonials,
  initialPage,
  titleClassName
}: ReviewsProps = {}) {
  if (testimonials === undefined) {
    const resolvedInitialPage = initialPage ?? await getTestimonialsPage()
      .catch((): PaginatedReviewsResponse => ({
        reviews: [],
        nextCursor: null
      }))

    if (resolvedInitialPage.reviews.length === 0) {
      return null
    }

    return (
      <DeferredReviewsCarousel
        testimonials={resolvedInitialPage.reviews}
        initialPage={resolvedInitialPage}
        titleClassName={titleClassName}
      />
    )
  }

  const displayTestimonials = testimonials
    .filter((testimonial) =>
      hasVisibleReviewText(testimonial) &&
      hasValidReviewRating(testimonial) &&
      hasValidReviewIdentity(testimonial)
    )
  const homepageReviews = displayTestimonials.map(mapHomepageReview)

  if (homepageReviews.length === 0) {
    return null
  }

  return <DeferredReviewsCarousel testimonials={homepageReviews} titleClassName={titleClassName} />
}
