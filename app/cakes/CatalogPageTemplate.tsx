import type { ReactNode } from 'react'
import { CakesTabletCatalog } from './components/CakesTabletCatalog'
import type { CatalogFilterDefaults } from './components/types'
import type { CatalogPageData } from './catalogPageData'

type StructuredData = Record<string, unknown>

interface CatalogPageTemplateProps {
  variant: 'cakes' | 'giftHampers'
  heading: string
  intro: string
  detailsSectionTitle: string
  detailsParagraphs: string[]
  breadcrumbLabel: string
  canonicalPath: '/cakes' | '/gift-hampers'
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

function toJsonLdScript(data: StructuredData) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function buildDefaultLocalBusinessData({
  canonicalPath,
  localBusinessDescription
}: {
  canonicalPath: '/cakes' | '/gift-hampers'
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
  canonicalPath: '/cakes' | '/gift-hampers'
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
  detailsSectionTitle,
  detailsParagraphs,
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

  const detailsSectionTitleClassName =
    'mx-auto max-w-[760px] text-center font-moreSugar text-[24px] font-normal uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] tablet:text-[36px] tablet:leading-[52px] small-laptop:max-w-[1000px]'
  const detailsSectionParagraphClassName =
    'font-oldenburg text-[15px] leading-[32px] tracking-[1.2px] text-base-content tablet:text-base tablet:leading-8 tablet:tracking-normal'

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
        <section className='mx-auto text-center w-full max-w-[952px] px-4 pb-2 pt-8 tablet:px-0 small-laptop:max-w-[1200px] large-laptop:max-w-[1432px]'>
          <h1 className='mt-2 !mb-0 mx-auto font-moreSugar font-normal text-center text-[24px] uppercase tracking-[0.16em] text-primary-700 rotate-[-2.4deg] !leading-[40px] align-middle tablet:!mb-[30px] tablet:text-[48px] tablet:!leading-[56px] tablet:font-normal tablet:align-middle small-laptop:!leading-[64px] small-laptop:max-w-[1000px] large-laptop:max-w-[1200px]'>
            {heading}
          </h1>
          <p className='mt-3 mx-auto max-w-[720px] text-center font-oldenburg text-base font-normal leading-[22px] tracking-[1.92px] text-primary-800 tablet:text-[24px] tablet:leading-[32px] tablet:tracking-[0.12em] tablet:align-middle small-laptop:text-[20px] small-laptop:max-w-[1000px] large-laptop:max-w-[1200px]'>
            {intro}
          </p>
        </section>
        {preCatalogContent}
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
        <section className='mx-auto w-full max-w-[952px] px-4 pb-16 pt-4 tablet:px-0 small-laptop:max-w-[1000px] large-laptop:max-w-[1200px]'>
          <h2 className={detailsSectionTitleClassName}>
            {detailsSectionTitle}
          </h2>
          <div className='mx-auto mt-6 max-w-[860px] space-y-4'>
            {detailsParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className={detailsSectionParagraphClassName}>
                {paragraph}
              </p>
            ))}
          </div>
        </section>
        {postCatalogContent}
      </main>
    </>
  )
}
