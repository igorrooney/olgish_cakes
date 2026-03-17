import type { Metadata } from 'next'
import { BUSINESS_CONSTANTS } from '@/lib/constants'
import { getAllTestimonialsStats } from '../utils/fetchTestimonials'
import { buildAggregateRating } from '../utils/review-stats'
import { getHomepageCollections } from '../utils/fetchCollections'
import { buildOccasionOptionsFromCollections } from '../components/homepage/formOptions'
import { GetCustomQuoteFaq } from './GetCustomQuoteFaq'
import { GetCustomQuoteFormSection } from './GetCustomQuoteFormSection'
import { GetCustomQuoteHero } from './GetCustomQuoteHero'
import { GetCustomQuoteInspiration } from './GetCustomQuoteInspiration'
import { GetCustomQuoteProcess } from './GetCustomQuoteProcess'

const baseUrl = 'https://olgishcakes.co.uk'
const pageUrl = `${baseUrl}/get-custom-quote`
const title = 'Custom Cake Quote in Leeds | Bespoke Celebration Cakes'
const description =
  'Request a custom cake quote in Leeds from Olgish Cakes. Share your date, servings and design idea for a bespoke birthday, wedding, anniversary or celebration cake with collection, local delivery where suitable, or UK delivery by agreement.'

type StructuredData = Record<string, unknown>

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title,
    description,
    url: pageUrl,
    siteName: BUSINESS_CONSTANTS.NAME,
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/homeHero/home-hero-cake-center.png`,
        width: 1200,
        height: 630,
        alt: 'Bespoke celebration cake by Olgish Cakes in Leeds'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [`${baseUrl}/homeHero/home-hero-cake-center.png`]
  },
  robots: {
    index: true,
    follow: true
  }
}

const toJsonLdScript = (value: StructuredData) => JSON.stringify(value).replace(/</g, '\\u003c')

function buildBreadcrumbStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Custom cake quote in Leeds',
        item: pageUrl
      }
    ]
  }
}

function buildLocalBusinessStructuredData(aggregateRating?: StructuredData | null): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    '@id': `${baseUrl}/#organization`,
    name: BUSINESS_CONSTANTS.NAME,
    url: baseUrl,
    telephone: BUSINESS_CONSTANTS.PHONE,
    email: BUSINESS_CONSTANTS.EMAIL,
    image: `${baseUrl}/images/olgish-cakes-logo-bakery-brand.png`,
    description:
      'Handmade bespoke cakes from Leeds with collection, local delivery where suitable, and UK delivery by agreement for birthdays, weddings, anniversaries and celebrations.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Leeds',
      addressCountry: 'GB'
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Leeds'
      },
      {
        '@type': 'AdministrativeArea',
        name: 'West Yorkshire'
      }
    ],
    sameAs: [
      BUSINESS_CONSTANTS.SOCIAL.instagram,
      BUSINESS_CONSTANTS.SOCIAL.facebook
    ],
    ...(aggregateRating ? { aggregateRating } : {}),
    mainEntityOfPage: pageUrl
  }
}

export default async function GetCustomQuotePage() {
  const [reviewStats, collections] = await Promise.all([
    getAllTestimonialsStats().catch(() => ({
      count: 0,
      averageRating: 5
    })),
    getHomepageCollections()
  ])
  const occasionOptions = buildOccasionOptionsFromCollections(collections)
  const aggregateRating = buildAggregateRating(reviewStats)

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildLocalBusinessStructuredData(aggregateRating)) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildBreadcrumbStructuredData()) }}
      />

      <main className='min-h-screen bg-base-100'>
        <GetCustomQuoteHero />
        <GetCustomQuoteProcess />
        <div data-testid='quote-content-flow' className='flex flex-col'>
          <div className='order-2 tablet:order-1'>
            <GetCustomQuoteInspiration />
          </div>
          <div className='order-1 tablet:order-2'>
            <GetCustomQuoteFormSection occasionOptions={occasionOptions} />
          </div>
        </div>
        <GetCustomQuoteFaq />
      </main>
    </>
  )
}



