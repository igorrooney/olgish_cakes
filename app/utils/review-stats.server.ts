import 'server-only'

import { getAllTestimonialsStats } from './fetchTestimonials'
import type { ReviewStats } from './review-stats'

export async function getReviewStats(): Promise<ReviewStats> {
  return getAllTestimonialsStats()
}
