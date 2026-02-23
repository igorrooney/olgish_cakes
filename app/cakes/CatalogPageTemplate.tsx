import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { CakesTabletCatalog } from './components/CakesTabletCatalog'
import type { CatalogFilterDefaults } from './components/types'
import type { CatalogPageData } from './catalogPageData'

type StructuredData = Record<string, unknown>
type CatalogCanonicalPath = '/cakes' | '/cakes-by-post'

interface CatalogPageTemplateProps {
  variant: 'cakes' | 'giftHampers'
  heading: string
  intro: string
  breadcrumbLabel: string
  canonicalPath: CatalogCanonicalPath
  localBusinessDescription: string
  catalogData: CatalogPageData
  initialFilterDefaults: CatalogFilterDefaults
  lazyCustomCakesEndpoint?: string
  lazyCustomCakesPriceCeilingHint?: number
  lazyByPostCakesEndpoint?: string
  lazyByPostCakesPriceCeilingHint?: number
  preCatalogContent?: ReactNode
  postCatalogContent?: ReactNode
  additionalStructuredData?: StructuredData[]
  localBusinessData?: StructuredData
}

const baseUrl = 'https://olgishcakes.co.uk'

function CatalogCatalogSkeletonFallback() {
  return (
    <section
      aria-busy='true'
      aria-live='polite'
      aria-label='Loading catalog products'
      className='mx-auto w-full max-w-[952px] px-4 pb-16 pt-8 tablet:px-0 small-laptop:max-w-[1200px] large-laptop:max-w-[1432px]'
    >
      <div className='mt-10 flex flex-col gap-5 tablet:gap-6 tablet:flex-row tablet:items-start'>
        <div className='tablet:w-60 tablet:flex-none'>
          <div className='rounded-box border border-base-300 bg-base-100 p-4'>
            <div className='mb-4 h-6 w-24 animate-pulse rounded bg-base-200' />
            <div className='space-y-3'>
              <div className='h-5 w-full animate-pulse rounded bg-base-200' />
              <div className='h-5 w-full animate-pulse rounded bg-base-200' />
              <div className='h-5 w-4/5 animate-pulse rounded bg-base-200' />
              <div className='h-5 w-3/5 animate-pulse rounded bg-base-200' />
            </div>
          </div>
        </div>
        <div className='min-w-0 tablet:flex-1'>
          <div className='h-10 w-52 animate-pulse rounded-box bg-base-200' />
          <div className='mt-4 grid grid-cols-1 gap-4 tablet:auto-rows-fr tablet:grid-cols-2 small-laptop:grid-cols-3'>
            {[...Array(6).keys()].map((index) => (
              <div
                key={`catalog-loading-card-${index + 1}`}
                className='h-[420px] animate-pulse rounded-box bg-base-200'
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function toJsonLdScript(data: StructuredData) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function buildDefaultLocalBusinessData({
  canonicalPath,
  localBusinessDescription
}: {
  canonicalPath: CatalogCanonicalPath
  localBusinessDescription: string
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: 'Olgish Cakes',
    description: localBusinessDescription,
    image: `${baseUrl}/images/olgish-cakes-logo-bakery-brand.png`,
    url: baseUrl,
    telephone: '+44 786 721 8194',
    email: 'hello@olgishcakes.co.uk',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Allerton Grange',
      addressLocality: 'Leeds',
      postalCode: 'LS17',
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '53.8008',
      longitude: '-1.5491'
    },
    openingHours: 'Mo-Su 00:00-23:59',
    priceRange: '\u00A3\u00A3',
    servesCuisine: 'Ukrainian',
    hasMenu: `${baseUrl}${canonicalPath}`,
    mainEntityOfPage: {
      '@id': `${baseUrl}/#organization`
    }
  }
}

function buildBreadcrumbData({
  breadcrumbLabel,
  canonicalPath
}: {
  breadcrumbLabel: string
  canonicalPath: CatalogCanonicalPath
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: breadcrumbLabel,
        item: `${baseUrl}${canonicalPath}`
      }
    ]
  }
}

export function CatalogPageTemplate({
  variant,
  heading,
  intro,
  breadcrumbLabel,
  canonicalPath,
  localBusinessDescription,
  catalogData,
  initialFilterDefaults,
  lazyCustomCakesEndpoint,
  lazyCustomCakesPriceCeilingHint,
  lazyByPostCakesEndpoint,
  lazyByPostCakesPriceCeilingHint,
  preCatalogContent,
  postCatalogContent,
  additionalStructuredData = [],
  localBusinessData
}: CatalogPageTemplateProps) {
  const resolvedLocalBusinessData = localBusinessData ?? buildDefaultLocalBusinessData({
    canonicalPath,
    localBusinessDescription
  })
  const breadcrumbData = buildBreadcrumbData({
    breadcrumbLabel,
    canonicalPath
  })

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(resolvedLocalBusinessData) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(breadcrumbData) }}
      />
      {additionalStructuredData.map((structuredData, index) => (
        <script
          key={`${variant}-structured-data-${index + 1}`}
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(structuredData) }}
        />
      ))}
      <main
        data-catalog-variant={variant}
        className='min-h-screen bg-base-100 [font-family:var(--font-inter)]'
      >
        <section className='mx-auto text-center w-full max-w-[952px] px-4 pb-0 pt-0 tablet:pb-2 tablet:pt-8 tablet:px-0 small-laptop:max-w-[1200px] large-laptop:max-w-[1432px]'>
          <h1 className='sr-only tablet:not-sr-only mt-2 !mb-0 mx-auto font-moreSugar font-normal text-center text-[24px] uppercase tracking-[0.16em] text-primary-700 rotate-[-2.4deg] !leading-[40px] align-middle tablet:!mt-2 tablet:!mx-auto tablet:!mb-[30px] tablet:text-[48px] tablet:!leading-[56px] tablet:font-normal tablet:align-middle small-laptop:!leading-[64px] small-laptop:max-w-[1000px] large-laptop:max-w-[1200px]'>
            {heading}
          </h1>
          <p className='sr-only tablet:not-sr-only mt-3 mx-auto max-w-[720px] text-center font-oldenburg text-base font-normal leading-[22px] tracking-[1.92px] text-primary-800 tablet:!mt-3 tablet:!mx-auto tablet:text-[24px] tablet:leading-[32px] tablet:tracking-[0.12em] tablet:align-middle small-laptop:text-[20px] small-laptop:max-w-[1000px] large-laptop:max-w-[1200px]'>
            {intro}
          </p>
        </section>
        {preCatalogContent}
        <Suspense fallback={<CatalogCatalogSkeletonFallback />}>
          <CakesTabletCatalog
            cakes={catalogData.cakesForUi}
            featuredOffer={catalogData.featuredOffer}
            collectionOptions={catalogData.collectionOptions}
            initialFilterDefaults={initialFilterDefaults}
            lazyCustomCakesEndpoint={lazyCustomCakesEndpoint}
            lazyCustomCakesPriceCeilingHint={lazyCustomCakesPriceCeilingHint}
            lazyByPostCakesEndpoint={lazyByPostCakesEndpoint}
            lazyByPostCakesPriceCeilingHint={lazyByPostCakesPriceCeilingHint}
          />
        </Suspense>
        {postCatalogContent}
      </main>
    </>
  )
}
