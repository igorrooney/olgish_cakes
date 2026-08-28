import type { SanityAsset } from '@sanity/image-url/lib/types/types'
import type { ReviewSourceValue } from '@/lib/testimonials/review-source'

export type ReviewSource = ReviewSourceValue

export interface Testimonial {
  _id: string
  _type: string
  _createdAt: string
  _updatedAt: string
  customerName: string
  cakeType: string
  rating: number
  date: string
  title?: string
  text: string
  cakeImage?: {
    asset?: SanityAsset
    url?: string
    alt?: string
  }
  source: ReviewSource
  sourceUrl?: string
  incentivised?: boolean
  incentiveDisclosure?: string
}

export type HomepageReview = {
  _id: string
  customerName: string
  rating: number
  date: string
  text: string
  title?: string
  source: ReviewSource
  sourceUrl?: string
  incentivised: boolean
  incentiveDisclosure?: string
}

export type PaginatedReviewsResponse = {
  reviews: HomepageReview[]
  nextCursor: string | null
}
