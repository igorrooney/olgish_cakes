import type { Metadata } from 'next'
import Image from 'next/image'
import type { Testimonial } from './types/testimonial'
import {
  OlgishCakesFounder,
  Bestsellers,
  EnquiryForm,
  faqItems,
  HomeFaq,
  HomeHero,
  Instagram,
  Markets,
  Occasions,
  Reviews,
} from './components/homepage'
import { getAllTestimonials } from './utils/fetchTestimonials'

const organizationId = 'https://olgishcakes.co.uk/#organization'
const maxReviewSchemas = 6
const pageTitle = 'Ukrainian cakes in Leeds | Medovik & custom cakes by post'
const pageDescription = 'Order Ukrainian cakes in Leeds: Medovik honey cake, Napoleon cake, and custom birthday or wedding cakes. Handmade, small-batch, 5-star rated, UK delivery.'

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
  datePublished?: string
}

const buildReviewSchema = (data: {
  authorName: string
  reviewBody: string
  ratingValue: number | string
  datePublished?: string
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
  ...(data.datePublished ? { datePublished: data.datePublished } : {})
})

const normalizeReviewDate = (dateValue?: string | null) => {
  if (!dateValue) {
    return null
  }

  const parsedDate = new Date(dateValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate.toISOString()
}

const hasVisibleReviewText = (testimonial: Testimonial) =>
  Boolean(testimonial.text && testimonial.text.trim().length > 0)

const hasValidReviewRating = (testimonial: Testimonial) =>
  Number.isFinite(testimonial.rating) && testimonial.rating > 0

const mapTestimonialReview = (testimonial: Testimonial): ReviewSchema => {
  const authorName = testimonial.customerName?.trim() ? testimonial.customerName : 'Anonymous'
  const ratingValue = testimonial.rating
  const reviewBody = testimonial.text?.trim() ?? ''
  const datePublished = normalizeReviewDate(testimonial.date) ?? undefined

  return buildReviewSchema({
    authorName,
    reviewBody,
    ratingValue,
    datePublished
  })
}

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    'Olgish Cakes',
    'Ukrainian bakery',
    'Ukrainian cakes',
    'honey cake',
    'Medovik',
    'Napoleon cake',
    'Leeds bakery',
    'cake delivery UK',
    'bakery delivery',
    'cakes near me',
    'bakery near me',
    'patisserie near me',
    'cake shop near me',
    'custom cakes',
    'birthday cakes',
    'wedding cakes',
    'gluten free cake',
    'family owned bakery',
    'dessert near me',
    'dessert takeaway'
  ],
  openGraph: {
    title: pageTitle,
    description: pageDescription,
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
    title: pageTitle,
    description: pageDescription,
    images: ['https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png'],
  },
  alternates: {
    canonical: 'https://olgishcakes.co.uk',
  },
}

export default async function Home() {
  const testimonials = await getAllTestimonials()
  const hasTestimonials = testimonials.length > 0
  const reviewSchemas = hasTestimonials
    ? testimonials
        .filter((testimonial) => hasVisibleReviewText(testimonial) && hasValidReviewRating(testimonial))
        .slice(0, maxReviewSchemas)
        .map(mapTestimonialReview)
    : []

  const reviewsStructuredData = reviewSchemas.length > 0
    ? {
        '@context': 'https://schema.org',
        '@graph': reviewSchemas
      }
    : null
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }
  const hasFaqStructuredData = faqItems.length > 0
  const webPageStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://olgishcakes.co.uk/#homepage',
    url: 'https://olgishcakes.co.uk',
    name: pageTitle,
    description: pageDescription,
    inLanguage: 'en-GB',
    isPartOf: {
      '@id': 'https://olgishcakes.co.uk/#website'
    },
    about: {
      '@id': organizationId
    }
  }

  return (
    <>
      {reviewsStructuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsStructuredData) }}
        />
      ) : null}
      {hasFaqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageStructuredData) }}
      />
      <div className="min-h-screen bg-base-100 overflow-x-hidden">
        <div className="flex flex-col">
          <HomeHero />
          <div className="w-full flex justify-center bg-base-100">
            <div className="homepage-divider relative h-auto">
              <Image
                src="/design/homepage_divider.png"
                alt=""
                aria-hidden="true"
                width={430}
                height={100}
                sizes="(min-width: 768px) 430px, 100vw"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          <OlgishCakesFounder />
          <Bestsellers />
          <Markets />
          <Reviews testimonials={testimonials} />
          <div className="homepage-divider relative h-auto">
            <Image
              src="/design/occasions_divider.png"
              alt=""
              aria-hidden="true"
              width={430}
              height={100}
              sizes="(min-width: 768px) 430px, 100vw"
              className="w-full h-auto object-contain"
            />
          </div>
          <Occasions />
          <div className="w-full flex justify-center bg-base-100">
            <div className="homepage-divider relative h-auto">
              <Image
                src="/design/homepage_divider_2.png"
                alt=""
                aria-hidden="true"
                width={430}
                height={100}
                sizes="(min-width: 768px) 430px, 100vw"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          <EnquiryForm />
          <div className="w-full flex justify-center bg-base-100">
            <div className="homepage-divider relative h-auto">
              <Image
                src="/design/instagram-section-divider.png"
                alt=""
                aria-hidden="true"
                width={430}
                height={100}
                sizes="(min-width: 768px) 430px, 100vw"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          <Instagram />
          <HomeFaq />
        </div>
      </div>
    </>
  )
}
