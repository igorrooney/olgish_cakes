import type { Metadata, ResolvingMetadata } from 'next'
import Image from 'next/image'
import { preload } from 'react-dom'
import { BUSINESS_CONSTANTS } from '@/lib/constants'
import { DEFAULT_AGGREGATE_RATING, DEFAULT_REVIEWS } from '@/lib/structured-data-defaults'
import type { Testimonial } from './types/testimonial'
import { OlgishCakesFounder } from './components/homepage/OlgishCakesFounder'
import { faqItems, HomeFaq } from './components/homepage/HomeFaq'
import { HomeHero } from './components/homepage/HomeHero'
import {
  DeferredBestsellers,
  DeferredHomeEnquirySection,
  DeferredInstagram,
  DeferredMarkets,
  DeferredOccasions,
  DeferredReviews
} from './components/homepage/deferredSections'
import { getAllTestimonials } from './utils/fetchTestimonials'
import { getHomepageCollections } from './utils/fetchCollections'
import { buildOccasionOptionsFromCollections } from './components/homepage/formOptions'
import { getMarketSchedule } from './utils/fetchMarketSchedule'
import { generateEventSEOMetadata } from './utils/generateEventStructuredData'
import { getMerchantReturnPolicy, getPriceValidUntil } from './utils/seo'
import { buildAggregateRating, type ReviewStats } from './utils/review-stats'

const organizationId = 'https://olgishcakes.co.uk/#organization'
const bakeryId = 'https://olgishcakes.co.uk/#bakery'
const productId = 'https://olgishcakes.co.uk/#product'
const maxReviewSchemas = 6
const pageTitle = 'Ukrainian cakes in Leeds | Medovik & custom cakes by post'
const pageDescription = 'Order Ukrainian cakes in Leeds: Medovik honey cake, Napoleon cake, and custom birthday or wedding cakes. Handmade, small-batch, 5-star rated, UK delivery.'
const eventDescriptionBase = 'Order Ukrainian cakes in Leeds: Medovik, Napoleon, and custom birthday or wedding cakes. Handmade, 5-star rated, UK delivery.'
const openGraphImage = {
  url: 'https://olgishcakes.co.uk/images/honey-cake-medovik.jpg',
  width: 1200,
  height: 630,
  alt: 'Medovik honey cake by Olgish Cakes'
}
const baseKeywords = [
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
]
const belowFoldSectionClassName = '[content-visibility:auto] [contain-intrinsic-size:780px]'

type EventSEOMetadata = {
  additionalKeywords?: string[]
  eventDescription?: string
  eventTitle?: string
  nextEventDate?: string
  nextEventLocation?: string
  totalUpcomingEvents?: number
}

type HomePageProps = {
  params?: Promise<Record<string, string | string[] | undefined>>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

type OtherMetadata = Record<string, string | number | (string | number)[]>

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
  itemReviewedId?: string
}): ReviewSchema => ({
  '@type': 'Review',
  itemReviewed: { '@id': data.itemReviewedId ?? organizationId },
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

const calculateReviewStats = (testimonials: Testimonial[]): ReviewStats => {
  const ratings = testimonials
    .map((testimonial) => testimonial.rating)
    .filter((rating): rating is number => Number.isFinite(rating) && rating > 0)

  if (ratings.length === 0) {
    return { count: 0, averageRating: 0 }
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0)
  return {
    count: ratings.length,
    averageRating: total / ratings.length
  }
}

const buildMetaDescription = (eventSEO: EventSEOMetadata) => {
  if (eventSEO.nextEventLocation && eventSEO.nextEventDate) {
    const eventSnippet = `Find us at ${eventSEO.nextEventLocation} on ${eventSEO.nextEventDate}.`
    const combined = `${eventDescriptionBase} ${eventSnippet}`

    if (combined.length <= 160) {
      return combined
    }

    return `${combined.slice(0, 157).trimEnd()}...`
  }

  return pageDescription
}

const buildKeywords = (eventSEO: EventSEOMetadata) => {
  const combined = [
    ...baseKeywords,
    ...(eventSEO.additionalKeywords ?? [])
  ]

  return Array.from(new Set(combined))
}

const buildEventMetadata = (eventSEO: EventSEOMetadata): OtherMetadata => {
  if (!eventSEO.totalUpcomingEvents) {
    return {}
  }

  const metadata: OtherMetadata = {
    'events:count': eventSEO.totalUpcomingEvents
  }

  if (eventSEO.nextEventDate) {
    metadata['events:next_date'] = eventSEO.nextEventDate
  }

  if (eventSEO.nextEventLocation) {
    metadata['events:next_location'] = eventSEO.nextEventLocation
  }

  return metadata
}

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

const mapProductReview = (testimonial: Testimonial): ReviewSchema => {
  const authorName = testimonial.customerName?.trim() ? testimonial.customerName : 'Anonymous'
  const ratingValue = testimonial.rating
  const reviewBody = testimonial.text?.trim() ?? ''
  const datePublished = normalizeReviewDate(testimonial.date) ?? undefined

  return buildReviewSchema({
    authorName,
    reviewBody,
    ratingValue,
    datePublished,
    itemReviewedId: productId
  })
}

export async function generateMetadata(
  _props: HomePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const marketEvents = await getMarketSchedule()
  const eventSEO = generateEventSEOMetadata(marketEvents)
  const description = buildMetaDescription(eventSEO)
  const keywords = buildKeywords(eventSEO)
  const parentMetadata = parent ? await parent : undefined
  const parentOther = (parentMetadata?.other ?? {}) as OtherMetadata
  const other = {
    ...parentOther,
    ...buildEventMetadata(eventSEO)
  }

  return {
    title: pageTitle,
    description,
    keywords,
    openGraph: {
      title: pageTitle,
      description,
      url: 'https://olgishcakes.co.uk',
      siteName: 'Olgish Cakes',
      images: [openGraphImage],
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [openGraphImage.url],
    },
    alternates: {
      canonical: 'https://olgishcakes.co.uk',
    },
    other
  }
}

export default async function Home() {
  preload('/homeHero/home-hero-cake-center.avif', {
    as: 'image',
    fetchPriority: 'high',
    type: 'image/avif'
  })

  const [testimonials, collections] = await Promise.all([
    getAllTestimonials(),
    getHomepageCollections()
  ])
  const eligibleTestimonials = testimonials.filter((testimonial) =>
    hasVisibleReviewText(testimonial) && hasValidReviewRating(testimonial)
  )
  const occasionOptions = buildOccasionOptionsFromCollections(collections)
  const reviewSchemas = eligibleTestimonials.slice(0, maxReviewSchemas).map(mapTestimonialReview)
  const productReviewSchemas = eligibleTestimonials.slice(0, maxReviewSchemas).map(mapProductReview)
  const reviewStats = calculateReviewStats(testimonials)
  const aggregateRating = buildAggregateRating(reviewStats) ?? DEFAULT_AGGREGATE_RATING

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
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productId,
    name: 'Ukrainian Honey Cake',
    description: 'Traditional Ukrainian honey cake (Medovik) handmade with authentic recipes in Leeds, Yorkshire. Perfect for birthdays, celebrations, and special occasions.',
    brand: {
      '@type': 'Brand',
      name: 'Olgish Cakes',
      url: 'https://olgishcakes.co.uk',
      logo: 'https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png'
    },
    manufacturer: {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'Olgish Cakes',
      url: 'https://olgishcakes.co.uk',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Leeds',
        addressRegion: 'West Yorkshire',
        addressCountry: 'GB'
      }
    },
    category: 'Food & Drink > Bakery > Cakes',
    image: ['https://olgishcakes.co.uk/images/honey-cake-medovik.jpg'],
    offers: {
      '@type': 'Offer',
      '@id': 'https://olgishcakes.co.uk/#offer',
      price: 25,
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      priceValidUntil: getPriceValidUntil(30),
      url: 'https://olgishcakes.co.uk/cakes',
      seller: {
        '@type': 'Organization',
        '@id': organizationId,
        name: 'Olgish Cakes',
        url: 'https://olgishcakes.co.uk'
      },
      areaServed: {
        '@type': 'City',
        name: 'Leeds'
      },
      deliveryLeadTime: {
        '@type': 'QuantitativeValue',
        value: 1,
        unitCode: 'DAY'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 15,
          currency: 'GBP'
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'GB',
          addressRegion: ['West Yorkshire', 'North Yorkshire', 'South Yorkshire']
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY'
          }
        }
      },
      hasMerchantReturnPolicy: getMerchantReturnPolicy()
    },
    aggregateRating,
    review: productReviewSchemas.length > 0 ? productReviewSchemas : DEFAULT_REVIEWS
  }
  const bakeryStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    '@id': bakeryId,
    name: 'Olgish Cakes',
    description: 'Authentic Ukrainian honey cake and Kyiv cake in Leeds. Handmade bakes with 5-star reviews, same-day local delivery, and custom designs across West Yorkshire.',
    url: 'https://olgishcakes.co.uk',
    telephone: BUSINESS_CONSTANTS.PHONE,
    email: 'hello@olgishcakes.co.uk',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Allerton Grange',
      addressLocality: 'Leeds',
      addressRegion: 'West Yorkshire',
      postalCode: 'LS17',
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 53.8008,
      longitude: -1.5491
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Leeds'
      },
      {
        '@type': 'City',
        name: 'Bradford'
      },
      {
        '@type': 'City',
        name: 'York'
      },
      {
        '@type': 'City',
        name: 'Wakefield'
      },
      {
        '@type': 'City',
        name: 'Huddersfield'
      }
    ],
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 53.8008,
        longitude: -1.5491
      },
      geoRadius: '25000'
    },
    priceRange: '££',
    servesCuisine: 'Ukrainian'
  }

  return (
    <>
      <div className="min-h-screen bg-base-100 overflow-x-hidden">
        <div className="flex flex-col">
          <HomeHero />
          <div className={`w-full flex justify-center bg-base-100 ${belowFoldSectionClassName}`}>
            <div className="homepage-divider relative h-auto">
              <Image
                src="/design/homepage_divider.png"
                alt=""
                aria-hidden="true"
                width={430}
                height={100}
                sizes="(min-width: 768px) 430px, 100vw"
                loading="eager"
                fetchPriority="low"
                quality={45}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          <div className={belowFoldSectionClassName}>
            <OlgishCakesFounder />
          </div>
          <div className={belowFoldSectionClassName}>
            <DeferredBestsellers />
          </div>
          <div className={belowFoldSectionClassName}>
            <DeferredMarkets />
          </div>
          <div className={belowFoldSectionClassName}>
            <DeferredReviews testimonials={eligibleTestimonials} />
          </div>
          <div className={`homepage-divider relative h-auto ${belowFoldSectionClassName}`}>
            <Image
              src="/design/occasions_divider.png"
              alt=""
              aria-hidden="true"
              width={430}
              height={100}
              sizes="(min-width: 768px) 430px, 100vw"
              loading="lazy"
              fetchPriority="low"
              quality={45}
              className="w-full h-auto object-contain"
            />
          </div>
          <div className={belowFoldSectionClassName}>
            <DeferredOccasions collections={collections} />
          </div>
          <div className={`w-full flex justify-center bg-base-100 ${belowFoldSectionClassName}`}>
            <div className="homepage-divider relative h-auto">
              <Image
                src="/design/homepage_divider_2.png"
                alt=""
                aria-hidden="true"
                width={430}
                height={100}
                sizes="(min-width: 768px) 430px, 100vw"
                loading="lazy"
                fetchPriority="low"
                quality={45}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          <div className={belowFoldSectionClassName}>
            <DeferredHomeEnquirySection occasionOptions={occasionOptions} />
          </div>
          <div className={`w-full flex justify-center bg-base-100 ${belowFoldSectionClassName}`}>
            <div className="homepage-divider relative h-auto">
              <Image
                src="/design/instagram-section-divider.png"
                alt=""
                aria-hidden="true"
                width={430}
                height={100}
                sizes="(min-width: 768px) 430px, 100vw"
                loading="lazy"
                fetchPriority="low"
                quality={45}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          <div className={belowFoldSectionClassName}>
            <DeferredInstagram />
          </div>
          <div className={belowFoldSectionClassName}>
            <HomeFaq />
          </div>
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
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(bakeryStructuredData) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageStructuredData) }}
          />
        </div>
      </div>
    </>
  )
}
