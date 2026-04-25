import type { Metadata } from 'next'
import Link from 'next/link'
import { BUSINESS_CONSTANTS, EMAIL_UTILS, PHONE_UTILS } from '@/lib/constants'
import { getAllergensPageData } from '@/lib/allergens-page-data'

type StructuredData = Record<string, unknown>

type FaqItem = {
  question: string
  answer: string
}

const baseUrl = BUSINESS_CONSTANTS.BASE_URL
const pageUrl = `${baseUrl}/allergens`
const socialImageUrl = `${baseUrl}/images/olgish-cakes-logo-bakery-brand.png`
const title = 'Allergens | Olgish Cakes'
const description =
  'Allergen information for Olgish Cakes, including kitchen handling, cross-contact, common ingredients and what to send before ordering.'

const allergenFaqs: FaqItem[] = [
  {
    question: 'Can you check a specific product before I order?',
    answer: 'Yes. Send the exact cake or postal product you are considering and the allergen you need to avoid, and it can be checked before you place the order.'
  },
  {
    question: 'Can any product be guaranteed completely free from cross-contact?',
    answer: 'No. Products are made in a kitchen that handles allergens, so no item can be guaranteed completely free from cross-contact.'
  },
  {
    question: 'Is a posted cake easier to check than a bespoke cake?',
    answer: 'Usually yes. The cakes-by-post range is narrower and more consistent than bespoke celebration cakes, so it is often easier to check.'
  }
]

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
        alt: 'Olgish Cakes logo and bakery branding'
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
        name: 'Allergens',
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
      name: 'Allergen information and cross-contact guidance'
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
    areaServed: {
      '@type': 'Country',
      name: 'United Kingdom'
    }
  }
}

function buildFaqStructuredData(faqs: FaqItem[]): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className='space-y-3'>
      {items.map((item) => (
        <li key={item} className='flex items-start gap-3'>
          <span aria-hidden='true' className='mt-[0.65rem] h-px w-5 shrink-0 bg-primary-500' />
          <span className='text-sm leading-6 text-base-content/80 tablet:text-[15px] tablet:leading-7'>
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default async function AllergensPage() {
  const allergenData = await getAllergensPageData()
  const nutExamples = allergenData.nutOrPeanutCakeNames.slice(0, 5)
  const advisoryExamples = allergenData.advisoryAllergens

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
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildFaqStructuredData(allergenFaqs)) }}
      />

      <main className='min-h-screen bg-base-100 text-base-content'>
        <section className='border-b border-base-200 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary-50)_24%,var(--color-base-100)_76%),var(--color-base-100))] px-4 py-8 tablet:px-10 tablet:py-12'>
          <div className='homepage-container'>
            <div className='mx-auto max-w-[900px]'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary-700'>
                Allergen information
              </p>
              <h1 className='mt-3 max-w-[11ch] font-oldenburg text-[2.1rem] leading-[0.98] tracking-[0.02em] text-primary-800 tablet:max-w-none tablet:text-[3.2rem]'>
                Allergens and kitchen handling
              </h1>
              <div className='mt-5 max-w-[68ch] space-y-4 text-[15px] leading-7 text-base-content/82 tablet:text-[17px] tablet:leading-8'>
                <p>
                  Milk, eggs and wheat are common across both celebration cakes and cakes by post.
                </p>
                <p>
                  Products are made in a kitchen that handles allergens, so no item can be
                  guaranteed completely free from cross-contact.
                </p>
                <p>
                  If you have an allergy, intolerance or coeliac disease, please ask before
                  ordering.
                </p>
              </div>
              <div className='mt-6 flex flex-wrap gap-3'>
                <a
                  href={PHONE_UTILS.whatsappLink}
                  className='inline-flex rounded-full border border-primary-500 bg-primary-500 px-6 py-3 text-sm font-semibold text-primary-content shadow-[0_10px_22px_color-mix(in_srgb,var(--color-primary-500)_22%,transparent)]'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  Message on WhatsApp
                </a>
                <a
                  href={EMAIL_UTILS.mailtoLink}
                  className='inline-flex rounded-full border border-primary-200 bg-base-100/90 px-4 py-3 text-sm font-semibold text-primary-800 underline decoration-primary-200 underline-offset-4'
                >
                  {BUSINESS_CONSTANTS.EMAIL}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className='px-4 py-8 tablet:px-10 tablet:py-12'>
          <div className='homepage-container'>
            <div className='mx-auto max-w-[900px] space-y-10'>
              <section>
                <h2 className='font-oldenburg text-[1.7rem] leading-[1.04] tracking-[0.02em] text-primary-800 tablet:text-[2.4rem]'>
                  Common allergens in the current range
                </h2>
                <div className='mt-5 max-w-[68ch] space-y-4 text-[15px] leading-7 text-base-content/80 tablet:text-base tablet:leading-8'>
                  <p>
                    Most products in the range contain milk, eggs and wheat.
                  </p>
                  <p>
                    That does not mean every product is the same. Ingredient details still need to
                    be checked against the exact item you want to order.
                  </p>
                </div>
              </section>

              <section className='grid gap-8 tablet:grid-cols-2'>
                <article>
                  <h3 className='font-oldenburg text-[1.45rem] leading-[1.08] text-primary-800 tablet:text-[1.8rem]'>
                    Cakes
                  </h3>
                  <div className='mt-4 max-w-[34ch] space-y-4 text-[15px] leading-7 text-base-content/80 tablet:text-base tablet:leading-8'>
                    <p>
                      Most celebration cakes contain milk, eggs and wheat.
                    </p>
                    <p>
                      That is useful as a general guide, but it is still important to check the
                      exact cake you want.
                    </p>
                  </div>
                  <div className='mt-4'>
                    <BulletList
                      items={[
                        nutExamples.length > 0
                          ? `Some current cakes also contain nuts or peanuts, including ${nutExamples.join(', ')}.`
                          : 'Please ask directly if nut or peanut exposure is a concern.',
                        'Bespoke cakes can change with the filling, decoration and brief.',
                        'The exact cake matters more than the category name.'
                      ]}
                    />
                  </div>
                  <Link
                    href='/cakes'
                    prefetch={false}
                    className='mt-5 inline-flex text-sm font-semibold text-primary-800 underline decoration-primary-200 underline-offset-4'
                  >
                    Browse cakes
                  </Link>
                </article>

                <article>
                  <h3 className='font-oldenburg text-[1.45rem] leading-[1.08] text-primary-800 tablet:text-[1.8rem]'>
                    Cakes by post
                  </h3>
                  <div className='mt-4 max-w-[34ch] space-y-4 text-[15px] leading-7 text-base-content/80 tablet:text-base tablet:leading-8'>
                    <p>
                      Posted products usually contain milk, eggs and wheat as well.
                    </p>
                    <p>
                      It is often easier to check than a bespoke cake because the product mix is
                      narrower and changes less.
                    </p>
                  </div>
                  <div className='mt-4'>
                    <BulletList
                      items={[
                        advisoryExamples.length > 0
                          ? `Some products also carry advisory "may contain" notes for ${advisoryExamples.join(', ')}.`
                          : 'If trace exposure is a concern, please ask before ordering.',
                        'Some posted products may still carry trace-allergen warnings.'
                      ]}
                    />
                  </div>
                  <Link
                    href='/cakes-by-post'
                    prefetch={false}
                    className='mt-5 inline-flex text-sm font-semibold text-primary-800 underline decoration-primary-200 underline-offset-4'
                  >
                    Browse cakes by post
                  </Link>
                </article>
              </section>

              <section>
                <h2 className='font-oldenburg text-[1.7rem] leading-[1.04] tracking-[0.02em] text-primary-800 tablet:text-[2.4rem]'>
                  Before you ask
                </h2>
                <div className='mt-5'>
                  <BulletList
                    items={[
                      'The allergen you need to avoid.',
                      'The exact product you are considering.',
                      'Whether you are asking about cakes by post or a bespoke cake.',
                      'The date you need it.'
                    ]}
                  />
                </div>
                <p className='mt-5 max-w-[68ch] text-[15px] leading-7 text-base-content/80 tablet:text-base tablet:leading-8'>
                  Once that is clear, the ingredients can be checked and you can be told whether
                  that product is suitable.
                </p>
              </section>

              <section>
                <h2 className='font-oldenburg text-[1.7rem] leading-[1.04] tracking-[0.02em] text-primary-800 tablet:text-[2.4rem]'>
                  Common questions
                </h2>
                <div className='mt-6 border-t border-base-300'>
                  {allergenFaqs.map((faq, index) => (
                    <details
                      key={faq.question}
                      className='group border-b border-base-300 py-1'
                      open={index === 0}
                    >
                      <summary className='flex cursor-pointer list-none items-start justify-between gap-4 py-4 marker:hidden tablet:py-5'>
                        <span className='max-w-[42rem] text-[16px] font-semibold leading-7 text-base-content tablet:text-[17px]'>
                          {faq.question}
                        </span>
                        <span
                          aria-hidden='true'
                          className='mt-[0.15rem] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition-transform group-open:rotate-45'
                        >
                          +
                        </span>
                      </summary>
                      <div className='max-w-[760px] pb-4 text-[15px] leading-7 text-base-content/80 tablet:pr-8 tablet:text-base tablet:leading-8'>
                        <p>{faq.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
