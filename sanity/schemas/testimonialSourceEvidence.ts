import {
  isExternalReviewSource,
  isReviewSourceUrl
} from '../../lib/testimonials/review-source'

export const validateTestimonialSourceUrl = (
  value: unknown,
  source: unknown
): true | string => {
  const hasValue = typeof value === 'string' && value.trim().length > 0

  if (!hasValue) {
    return true
  }

  if (isExternalReviewSource(source) && !isReviewSourceUrl(source, value)) {
    return `Use an HTTPS URL on the declared ${source} platform.`
  }

  return true
}
