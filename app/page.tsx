import type { Metadata, ResolvingMetadata } from 'next'
import Image from 'next/image'
import { preload } from 'react-dom'
import { BUSINESS_CONSTANTS } from '@/lib/constants'
import type { PaginatedReviewsResponse } from './types/testimonial'
import { serializeJsonLd } from '@/lib/structured-data/serialize-json-ld'
import { OlgishCakesFounder } from './components/homepage/OlgishCakesFounder'
import { HomeFaq } from './components/homepage/HomeFaq'
import { HomeHero } from './components/homepage/HomeHero'
import {
  DeferredBestsellers,
  DeferredHomeEnquirySection,
  DeferredInstagram,
  DeferredMarkets,
  DeferredOccasions,
  DeferredReviews
} from './components/homepage/deferredSections'
import { getTestimonialsPage } from './utils/fetchTestimonials'
import { getHomepageCollections } from './utils/fetchCollections'
import { buildOccasionOptionsFromCollections } from './components/homepage/formOptions'
import { getMarketSchedule } from './utils/fetchMarketSchedule'
import { generateEventSEOMetadata } from './utils/generateEventStructuredData'

const organizationId = 'https://olgishcakes.co.uk/#organization'
const bakeryId = 'https://olgishcakes.co.uk/#bakery'
export const revalidate = 3600
const pageTitle = 'Ukrainian cakes in Leeds | Medovik & custom cakes by post'
const pageDescription = 'Order Ukrainian cakes in Leeds: Medovik honey cake, Napoleon cake, and custom birthday or wedding cakes. Handmade in small batches with UK delivery.'
const eventDescriptionBase = 'Order Ukrainian cakes in Leeds: Medovik, Napoleon, and custom birthday or wedding cakes. Handmade in small batches with UK delivery.'
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

  const [initialReviewsPage, collections] = await Promise.all([
    getTestimonialsPage().catch((): PaginatedReviewsResponse => ({
      reviews: [],
      nextCursor: null
    })),
    getHomepageCollections()
  ])
  const occasionOptions = buildOccasionOptionsFromCollections(collections)
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
  const bakeryStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    '@id': bakeryId,
    name: 'Olgish Cakes',
    description: 'Handmade Ukrainian honey cakes, Kyiv cakes and custom celebration cakes from a Leeds bakery, with local collection and selected UK delivery options.',
    url: 'https://olgishcakes.co.uk',
    telephone: BUSINESS_CONSTANTS.PHONE,
    email: 'hello@olgishcakes.co.uk',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '15 Allerton Grange Avenue',
      addressLocality: 'Leeds',
      addressRegion: 'West Yorkshire',
      postalCode: 'LS17 6PR',
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
                sizes="(min-width: 1024px) 430px, 100vw"
                loading="eager"
                fetchPriority="high"
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
            <DeferredReviews initialPage={initialReviewsPage} />
          </div>
          <div className={`homepage-divider relative h-auto ${belowFoldSectionClassName}`}>
            <Image
              src="/design/occasions_divider.png"
              alt=""
              aria-hidden="true"
              width={430}
              height={100}
              sizes="(min-width: 1024px) 430px, 100vw"
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
                sizes="(min-width: 1024px) 430px, 100vw"
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
                sizes="(min-width: 1024px) 430px, 100vw"
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(bakeryStructuredData) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(webPageStructuredData) }}
          />
        </div>
      </div>
    </>
  )
}
