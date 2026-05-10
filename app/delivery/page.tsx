import type { Metadata } from 'next'
import Link from 'next/link'
import { BUSINESS_CONSTANTS, EMAIL_UTILS, PHONE_UTILS } from '@/lib/constants'

type StructuredData = Record<string, unknown>

const baseUrl = BUSINESS_CONSTANTS.BASE_URL
const pageUrl = `${baseUrl}/delivery`
const socialImageUrl = `${baseUrl}/images/olgish-cakes-logo-bakery-brand.png`
const title = 'Delivery and Returns | Olgish Cakes'
const description =
  'Delivery information for Olgish Cakes, including cakes by post across the UK, collection from Leeds, local cake delivery by arrangement, and what to do if there is a problem with the order.'

const collectionDiscountLabel = '\u00A32'

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
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: 'Olgish Cakes branding for delivery and returns page'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title,
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
    name: title,
    description,
    url: pageUrl,
    isPartOf: {
      '@id': `${baseUrl}/#website`
    },
    about: {
      '@type': 'Thing',
      name: 'Cake delivery, cake collection and returns guidance'
    },
    breadcrumb: {
      '@id': `${pageUrl}#breadcrumb`
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

      <main className='min-h-screen bg-base-100 text-base-content'>
        <section className='border-b border-base-200 px-4 py-8 tablet:px-10 tablet:py-12'>
          <div className='mx-auto max-w-[980px]'>
            <h1 className='font-oldenburg text-[2.2rem] leading-[0.98] tracking-[0.02em] text-primary-800 tablet:text-[3.2rem]'>
              Delivery and returns
            </h1>
            <div className='mt-5 max-w-[70ch] space-y-4 text-[15px] leading-7 text-base-content/80 tablet:text-[17px] tablet:leading-8'>
              <p>
                Some cakes post well and some do not.
              </p>
              <p>
                For post, I usually send slices and other bakes made for travel. Full celebration
                cakes are usually collection or local delivery.
              </p>
            </div>
            <p className='mt-6 max-w-[720px] text-sm leading-7 text-base-content/80 tablet:text-[15px]'>
              Send me the date, postcode and the cake you want. I can usually tell you quickly
              what will work.
            </p>
          </div>
        </section>

        <section className='px-4 py-8 tablet:px-10 tablet:py-10'>
          <div className='mx-auto max-w-[980px]'>
            <div className='mt-4 max-w-[66ch] space-y-4 text-[15px] leading-7 text-base-content/80 tablet:text-[17px] tablet:leading-8'>
              <p>
                By post means slices and other bakes made to travel.
              </p>
              <p>
                Free UK delivery is included for suitable postal cakes. Most postal orders arrive
                on the next working day, but standard post is still a delivery window rather than
                a promise.
              </p>
              <p>
                If the date is fixed, ask first. If the timing is too tight, I will say so. For a
                guaranteed day, Special Delivery is usually the safer route.
              </p>
            </div>
            <Link
              href='/cakes-by-post'
              prefetch={false}
              className='mt-6 inline-flex text-sm font-semibold text-primary-800 underline decoration-primary-200 underline-offset-4'
            >
              See cakes by post
            </Link>
          </div>
        </section>

        <section className='border-y border-base-200 bg-base-200/25 px-4 py-8 tablet:px-10 tablet:py-10'>
          <div className='mx-auto max-w-[980px]'>
            <div className='mt-4 max-w-[66ch] space-y-4 text-[15px] leading-7 text-base-content/80 tablet:text-[17px] tablet:leading-8'>
              <p>
                Not every cake belongs in the post. Tall celebration cakes, tiered cakes and
                anything with a polished finish usually need collection or local delivery instead.
              </p>
              <p>
                I work in Leeds and across Yorkshire. If something is going further afield, I will
                tell you straight if it is workable.
              </p>
              <p>
                Delivery for celebration cakes and larger orders is quoted individually because it
                depends on size, finish and destination. I regularly deliver around Leeds,
                Wakefield, Huddersfield, Bradford and York.
              </p>
              <p>
                I confirm the delivery cost before you book. You can also collect from Leeds and
                save {collectionDiscountLabel}.
              </p>
            </div>
          </div>
        </section>

        <section className='px-4 py-8 tablet:px-10 tablet:py-10'>
          <div className='mx-auto max-w-[980px]'>
            <div className='mt-4 max-w-[66ch] space-y-4 text-[15px] leading-7 text-base-content/80 tablet:text-[17px] tablet:leading-8'>
              <p>
                If the date matters, send the date, postcode and the cake you have in mind.
              </p>
              <p>
                I will tell you whether it should go by post, stay local, or be collected. If it
                needs to stay local, I will say so before you book.
              </p>
            </div>
            <div className='mt-6 max-w-[66ch] space-y-3 text-sm leading-6 text-base-content/80'>
              <a
                href={PHONE_UTILS.whatsappLink}
                className='block text-primary-800 underline decoration-primary-200 underline-offset-4'
                target='_blank'
                rel='noreferrer noopener'
              >
                Message on WhatsApp
              </a>
              <a
                href={EMAIL_UTILS.mailtoLink}
                className='block text-primary-800 underline decoration-primary-200 underline-offset-4'
              >
                {BUSINESS_CONSTANTS.EMAIL}
              </a>
              <a
                href={PHONE_UTILS.telLink}
                className='block text-primary-800 underline decoration-primary-200 underline-offset-4'
              >
                {PHONE_UTILS.displayPhone}
              </a>
            </div>
            <Link
              href='/get-custom-quote'
              prefetch={false}
              className='mt-6 inline-flex text-sm font-semibold text-primary-800 underline decoration-primary-200 underline-offset-4'
            >
              Ask about delivery
            </Link>
          </div>
        </section>

        <section className='border-t border-base-200 px-4 py-8 tablet:px-10 tablet:py-10'>
          <div className='mx-auto max-w-[980px]'>
            <div className='mt-4 max-w-[70ch] space-y-4 text-[15px] leading-7 text-base-content/80 tablet:text-[17px] tablet:leading-8'>
              <p>
                If the order arrives damaged or there is a delivery issue, contact me as soon as
                you can with your order details and photos.
              </p>
              <p>
                Cakes are made to order and food cannot be resold, so returns do not work in the
                same way as ordinary retail parcels. Message me directly and I will check it.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
