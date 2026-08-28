import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { BUSINESS_CONSTANTS, EMAIL_UTILS, PHONE_UTILS } from '@/lib/constants'
import {
  REFUND_AFTER_WORK_POLICY,
  REFUND_BEFORE_WORK_POLICY,
  STATUTORY_RIGHTS_POLICY
} from '@/lib/public-policies'

type StructuredData = Record<string, unknown>

type PageSectionProps = {
  children: ReactNode
  id: string
  muted?: boolean
  title: string
}

const baseUrl = BUSINESS_CONSTANTS.BASE_URL
const pageUrl = `${baseUrl}/delivery`
const breadcrumbId = `${pageUrl}#breadcrumb`
const socialImageUrl = `${baseUrl}/images/delivery/delivery-social-card.png`
const pageTitle = 'Delivery and Returns'
const socialTitle = `${pageTitle} | Olgish Cakes`
const description =
  'Delivery and returns information for Olgish Cakes, including free UK delivery for suitable postal cakes, collection from Leeds, local delivery by arrangement, cancellations, and damaged orders.'

const collectionDiscountLabel = '\u00A32'
const containerClassName = 'mx-auto w-full max-w-5xl'
const contentClassName = 'max-w-3xl space-y-4 text-base leading-7 text-base-content/80 tablet:text-lg tablet:leading-8'
const sectionClassName = 'px-4 py-8 tablet:px-10 tablet:py-12'
const sectionTitleClassName = 'font-oldenburg text-2xl leading-tight text-primary-800 tablet:text-3xl'
const primaryButtonClassName = 'btn btn-primary min-h-11 px-5 font-semibold normal-case'
const secondaryButtonClassName = 'btn btn-outline min-h-11 border-primary-300 px-5 font-semibold normal-case text-primary-800'

export const metadata: Metadata = {
  title: pageTitle,
  description,
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: socialTitle,
    description,
    url: pageUrl,
    siteName: BUSINESS_CONSTANTS.NAME,
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: 'Olgish Cakes delivery and returns information'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: socialTitle,
    description,
    images: [socialImageUrl]
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
    '@id': breadcrumbId,
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
        name: 'Delivery and returns',
        item: pageUrl
      }
    ]
  }
}

function buildWebPageStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    name: pageTitle,
    description,
    url: pageUrl,
    isPartOf: {
      '@id': `${baseUrl}/#website`
    },
    about: {
      '@type': 'Thing',
      name: 'Cake delivery, cake collection, cancellations and returns guidance'
    },
    breadcrumb: {
      '@id': breadcrumbId
    }
  }
}

function buildOrganizationStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    '@id': `${baseUrl}/#organization`,
    name: BUSINESS_CONSTANTS.NAME,
    url: baseUrl,
    telephone: BUSINESS_CONSTANTS.PHONE,
    email: BUSINESS_CONSTANTS.EMAIL,
    image: socialImageUrl,
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
        name: 'Yorkshire'
      },
      {
        '@type': 'Country',
        name: 'United Kingdom'
      }
    ]
  }
}

function PageSection({ children, id, muted = false, title }: PageSectionProps) {
  const backgroundClassName = muted
    ? 'border-y border-base-200 bg-base-200/30'
    : ''

  return (
    <section aria-labelledby={id} className={`${backgroundClassName} ${sectionClassName}`.trim()}>
      <div className={containerClassName}>
        <h2 id={id} className={sectionTitleClassName}>
          {title}
        </h2>
        <div className={`mt-5 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </section>
  )
}

export default function DeliveryPage() {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildBreadcrumbStructuredData()) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildWebPageStructuredData()) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildOrganizationStructuredData()) }}
      />

      <div className='min-h-screen bg-base-100 text-base-content'>
        <section aria-labelledby='delivery-page-title' className={`border-b border-base-200 ${sectionClassName}`}>
          <div className={containerClassName}>
            <h1
              id='delivery-page-title'
              className='font-oldenburg text-4xl leading-tight text-primary-800 tablet:text-5xl'
            >
              Delivery and returns
            </h1>
            <div className={`mt-5 ${contentClassName}`}>
              <p>
                Some cakes are made to travel across the UK. Tall celebration cakes and detailed
                finishes are usually better for collection or local delivery.
              </p>
              <p>
                Send us the date, postcode and cake you have in mind. We&apos;ll confirm the safest
                delivery method, timing and any extra cost before you book.
              </p>
            </div>

            <div className='card mt-8 max-w-3xl border border-base-300 bg-base-200/40 shadow-sm'>
              <div className='card-body gap-3 p-5 tablet:p-6'>
                <h2 className='card-title font-oldenburg text-xl text-primary-800'>
                  Quick summary
                </h2>
                <ul className='list-disc space-y-2 pl-5 text-sm leading-6 text-base-content/80 tablet:text-base'>
                  <li>Selected postal cakes include free standard UK delivery.</li>
                  <li>Celebration cakes can be collected in Leeds or delivered locally by arrangement.</li>
                  <li>We confirm preparation, dispatch, delivery timing and charges before purchase.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <PageSection id='postal-delivery' title='Cakes by post across the UK'>
          <p>
            Our cakes-by-post range includes slices and other bakes chosen and packed to travel
            safely. Free standard UK delivery is included for suitable postal products.
          </p>
          <p>
            Before you buy, we&apos;ll confirm the preparation time, dispatch timing and expected
            delivery window for your chosen product and requested date. Standard delivery is an
            estimate rather than a guaranteed arrival date.
          </p>
          <p>
            If you need a fixed date, ask before ordering. We&apos;ll confirm whether a suitable
            guaranteed service is available and tell you about any extra charge.
          </p>
          <div className='pt-2'>
            <Link href='/cakes-by-post' prefetch={false} className={secondaryButtonClassName}>
              See cakes by post
            </Link>
          </div>
        </PageSection>

        <PageSection id='local-delivery-collection' title='Local delivery and Leeds collection' muted>
          <p>
            Tall celebration cakes, tiered cakes and cakes with detailed finishes usually need
            collection or local delivery rather than a parcel service.
          </p>
          <p>
            We work in Leeds and across Yorkshire, with regular deliveries around Leeds, Wakefield,
            Huddersfield, Bradford and York. We&apos;ll tell you honestly if a longer journey is not
            suitable for the cake.
          </p>
          <p>
            Local delivery is quoted individually because the cost depends on the cake, finish and
            destination. We confirm the price before you book. You can also collect from Leeds and
            save {collectionDiscountLabel}.
          </p>
        </PageSection>

        <PageSection id='arranging-delivery' title='Arrange delivery or collection'>
          <p>
            Send us the date, postcode and cake you have in mind. We&apos;ll confirm whether it
            should go by post, be delivered locally or be collected, together with the timing and
            cost.
          </p>
          <div className='flex flex-col gap-3 pt-2 tablet:flex-row tablet:flex-wrap'>
            <Link href='/custom-cakes' prefetch={false} className={primaryButtonClassName}>
              Ask about delivery
            </Link>
            <a
              href={PHONE_UTILS.whatsappLink}
              className={secondaryButtonClassName}
              target='_blank'
              rel='noreferrer noopener'
            >
              Message on WhatsApp
            </a>
            <a href={EMAIL_UTILS.mailtoLink} className={secondaryButtonClassName}>
              Email us
            </a>
            <a href={PHONE_UTILS.telLink} className={secondaryButtonClassName}>
              Call {PHONE_UTILS.displayPhone}
            </a>
          </div>
        </PageSection>

        <PageSection id='damaged-orders-returns' title='Damaged orders, cancellations and returns' muted>
          <p>
            If an order arrives damaged or there is a delivery problem, contact us as soon as you
            reasonably can with your order details and photos. We&apos;ll investigate the issue and
            explain the next step.
          </p>
          <p>
            {REFUND_BEFORE_WORK_POLICY} {REFUND_AFTER_WORK_POLICY}
          </p>
          <p>
            {STATUTORY_RIGHTS_POLICY}{' '}
            We&apos;ll provide the remedy required by law, which may include a replacement or refund.
          </p>
          <div className='pt-2'>
            <Link href='/terms' prefetch={false} className={secondaryButtonClassName}>
              Read our terms
            </Link>
          </div>
        </PageSection>
      </div>
    </>
  )
}
