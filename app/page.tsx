import type { Metadata } from 'next'
import Image from 'next/image'
import type { Testimonial } from './types/testimonial'
import {
  OlgishCakesFounder,
  Bestsellers,
  EnquiryForm,
  HomeHero,
  Instagram,
  Markets,
  MobileOccasions,
  Reviews,
} from './components/homepage'
import { DEFAULT_AGGREGATE_RATING, DEFAULT_REVIEWS } from '@/lib/structured-data-defaults'
import { getAllTestimonials } from './utils/fetchTestimonials'

const organizationId = 'https://olgishcakes.co.uk/#organization'
const maxReviewSchemas = 6

type AggregateRatingSchema = {
  '@type': 'AggregateRating'
  ratingValue: string
  reviewCount: string
  bestRating: string
  worstRating: string
}

type ReviewSchema = {
  '@type': 'Review'
  itemReviewed: { '@id': string }
  author: {
    '@type': 'Person'
    name: string
  }
  reviewRating: {
    '@type': 'Rating'
    ratingValue: string
    bestRating: string
    worstRating: string
  }
  reviewBody: string
  datePublished: string
}

const buildReviewSchema = (data: {
  authorName: string
  reviewBody: string
  ratingValue: number | string
  datePublished: string
}): ReviewSchema => ({
  '@type': 'Review',
  itemReviewed: { '@id': organizationId },
  author: {
    '@type': 'Person',
    name: data.authorName
  },
  reviewRating: {
    '@type': 'Rating',
    ratingValue: data.ratingValue.toString(),
    bestRating: '5',
    worstRating: '1'
  },
  reviewBody: data.reviewBody,
  datePublished: data.datePublished
})

const mapDefaultReview = (review: typeof DEFAULT_REVIEWS[number]): ReviewSchema => {
  const authorName =
    review.author &&
      typeof review.author === 'object' &&
      'name' in review.author &&
      typeof review.author.name === 'string'
      ? review.author.name
      : 'Anonymous'

  const ratingValue =
    review.reviewRating &&
      typeof review.reviewRating === 'object' &&
      'ratingValue' in review.reviewRating &&
      (typeof review.reviewRating.ratingValue === 'string' || typeof review.reviewRating.ratingValue === 'number')
      ? review.reviewRating.ratingValue
      : '5'

  const reviewBody =
    typeof review.reviewBody === 'string' && review.reviewBody.trim().length > 0
      ? review.reviewBody
      : 'Lovely cake and kind service.'

  const datePublished =
    typeof review.datePublished === 'string' && review.datePublished.length > 0
      ? review.datePublished
      : '2025-09-30'

  return buildReviewSchema({
    authorName,
    reviewBody,
    ratingValue,
    datePublished
  })
}

const mapTestimonialReview = (testimonial: Testimonial): ReviewSchema => {
  const authorName = testimonial.customerName?.trim() ? testimonial.customerName : 'Anonymous'
  const ratingValue = Number.isFinite(testimonial.rating) && testimonial.rating > 0 ? testimonial.rating : 5
  const reviewBody = testimonial.text?.trim() ? testimonial.text : 'Lovely cake and kind service.'
  const datePublished = testimonial.date

  return buildReviewSchema({
    authorName,
    reviewBody,
    ratingValue,
    datePublished
  })
}

const buildAggregateRating = (testimonials: Testimonial[]): AggregateRatingSchema => {
  if (testimonials.length === 0) {
    return { ...DEFAULT_AGGREGATE_RATING }
  }

  const totalRating = testimonials.reduce((sum, testimonial) => {
    const ratingValue = Number.isFinite(testimonial.rating) && testimonial.rating > 0 ? testimonial.rating : 5
    return sum + ratingValue
  }, 0)

  const averageRating = (totalRating / testimonials.length).toFixed(1)

  return {
    '@type': 'AggregateRating',
    ratingValue: averageRating,
    reviewCount: testimonials.length.toString(),
    bestRating: '5',
    worstRating: '1'
  }
}

export const metadata: Metadata = {
  title: 'Olgish Cakes - Authentic Ukrainian Honey Cakes in Leeds',
  description: 'Order authentic Ukrainian honey cakes from Leeds. Handmade, small-batch bakes with 5★ reviews, UK-wide delivery by post, and custom designs for celebrations.',
  keywords: ['Ukrainian cakes', 'honey cake', 'Medovik', 'Leeds bakery', 'cake delivery UK'],
  openGraph: {
    title: 'Olgish Cakes - Authentic Ukrainian Honey Cakes',
    description: 'Order authentic Ukrainian honey cakes from Leeds. Handmade, small-batch bakes with 5★ reviews, UK-wide delivery by post, and custom designs for celebrations.',
    url: 'https://olgishcakes.co.uk',
    siteName: 'Olgish Cakes',
    images: [
      {
        url: 'https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png',
        width: 1200,
        height: 630,
        alt: 'Olgish Cakes - Ukrainian Honey Cakes',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Olgish Cakes - Authentic Ukrainian Honey Cakes',
    description: 'Order authentic Ukrainian honey cakes from Leeds. Handmade, small-batch bakes with 5★ reviews, UK-wide delivery by post, and custom designs for celebrations.',
    images: ['https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png'],
  },
  alternates: {
    canonical: 'https://olgishcakes.co.uk',
  },
}

export default async function Home() {
  const testimonials = await getAllTestimonials()
  const reviewSchemas = (testimonials.length > 0
    ? testimonials.slice(0, maxReviewSchemas).map(mapTestimonialReview)
    : DEFAULT_REVIEWS.map(mapDefaultReview))
    .filter((review) => review.reviewBody.trim().length > 0)

  const aggregateRatingSchema = buildAggregateRating(testimonials)
  const reviewsStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    '@id': organizationId,
    aggregateRating: aggregateRatingSchema,
    ...(reviewSchemas.length > 0 ? { review: reviewSchemas } : {})
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsStructuredData) }}
      />
      <div className="min-h-screen bg-base-100 overflow-x-hidden">
        <main className="flex flex-col">
          <HomeHero />
          <div className="w-full flex justify-center bg-base-100">
            <div className="homepage-divider relative h-auto">
              <Image
                src="/design/homepage_divider.png"
                alt="Decorative divider with cupcake and floral elements"
                width={430}
                height={100}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
          <OlgishCakesFounder />
          <Bestsellers />
          <Markets />
          <Reviews testimonials={testimonials} />
          <MobileOccasions />
          <div className="w-full flex justify-center bg-base-100">
            <div className="homepage-divider relative h-auto">
              <Image
                src="/design/homepage_divider_2.png"
                alt="Decorative divider with cupcake and floral elements"
                width={430}
                height={100}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
          <EnquiryForm />
          <div className="w-full flex justify-center bg-base-100">
            <div className="homepage-divider relative h-auto">
              <Image
                src="/design/instagram-section-divider.png"
                alt="Decorative divider with cupcake and floral elements"
                width={430}
                height={100}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          <Instagram />
        </main>
      </div>
    </>
  )
}
