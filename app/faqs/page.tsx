import type { Metadata } from 'next'
import Link from 'next/link'
import { BUSINESS_CONSTANTS } from '@/lib/constants'
import { getFaqs, type FAQ } from '../utils/fetchFaqs'

type StructuredData = Record<string, unknown>

type HelpLink = {
  href: string
  label: string
}

const baseUrl = BUSINESS_CONSTANTS.BASE_URL
const pageUrl = `${baseUrl}/faqs`
const socialImageUrl = `${baseUrl}/images/olgish-cakes-logo-bakery-brand.png`
const title = 'FAQ | Cakes, delivery and posted bakes'
const description =
  'FAQ for cake orders, Leeds collection, local delivery and posted bakes across the UK.'

const helpLinks: HelpLink[] = [
  {
    href: '/cakes-by-post',
    label: 'cakes by post'
  },
  {
    href: '/get-custom-quote',
    label: 'custom quote form'
  },
  {
    href: '/contact',
    label: 'contact page'
  }
]

const enquiryPromptItems = [
  'The date you need the cake',
  'Whether you need collection, local delivery or a posted cake',
  'How many people it needs to feed',
  'The style, flavour or bake you have in mind',
  'Any photos, colours or wording you already know you want'
]

const primaryButtonClassName =
  'btn btn-primary rounded-full border-none px-6 normal-case shadow-[0_10px_22px_color-mix(in_srgb,var(--color-primary-500)_22%,transparent)]'

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
        name: 'FAQs',
        item: pageUrl
      }
    ]
  }
}

function buildFaqStructuredData(faqs: FAQ[]): StructuredData {
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

function PromptList() {
  return (
    <div className='rounded-[2rem] border border-base-300 bg-base-200/45 p-5 tablet:p-6'>
      <h2 className='font-oldenburg text-[1.55rem] leading-[1.05] tracking-[0.02em] text-primary-800 tablet:text-[2rem]'>
        What to send
      </h2>
      <p className='mt-4 text-sm leading-6 text-base-content/78 tablet:text-[15px] tablet:leading-7'>
        If it is a posted cake, say that first.
      </p>
      <div className='mt-3 space-y-3 text-sm leading-6 text-base-content/78 tablet:text-[15px] tablet:leading-7'>
        <p>
          After that, just send the basics.
        </p>
      </div>
      <ul className='mt-4 space-y-3'>
        {enquiryPromptItems.map((item) => (
          <li key={item} className='flex items-start gap-3 text-sm leading-6 text-base-content/78'>
            <span
              aria-hidden='true'
              className='mt-[0.7rem] h-px w-5 shrink-0 bg-primary-500'
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FaqAnswer({ answer }: { answer: string }) {
  const sections = answer
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter((section) => section !== '')

  return (
    <div className='max-w-[760px] space-y-4 pb-2 text-[15px] leading-7 text-base-content/80 tablet:pr-8 tablet:text-base tablet:leading-8'>
      {sections.map((section) => {
        const lines = section
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line !== '')
        const isList = lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line))

        if (isList) {
          return (
            <ul key={section} className='space-y-2 pl-5'>
              {lines.map((line) => (
                <li key={line}>{line.replace(/^[-*]\s+/, '')}</li>
              ))}
            </ul>
          )
        }

        return <p key={section}>{section}</p>
      })}
    </div>
  )
}

export default async function FaqPage() {
  const faqs = await getFaqs()
  const hasFaqs = faqs.length > 0

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildBreadcrumbStructuredData()) }}
      />
      {hasFaqs ? (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildFaqStructuredData(faqs)) }}
        />
      ) : null}

      <main className='min-h-screen bg-base-100 text-base-content'>
        <section className='border-b border-base-200 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary-50)_32%,var(--color-base-100)_68%),var(--color-base-100))] px-4 py-6 tablet:px-10 tablet:py-10'>
          <div className='homepage-container'>
            <div className='mx-auto max-w-[980px] tablet:grid tablet:grid-cols-[minmax(0,1.2fr)_minmax(19rem,24rem)] tablet:items-start tablet:gap-8'>
              <div className='max-w-[700px]'>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary-700'>
                  FAQs
                </p>
                <h1 className='mt-3 max-w-[12ch] font-oldenburg text-[2.05rem] leading-[0.98] tracking-[0.02em] text-primary-800 tablet:max-w-none tablet:text-[3.4rem]'>
                  Before you order
                </h1>
                <div className='mt-6 flex flex-wrap items-center gap-3'>
                  <Link
                    href='/get-custom-quote'
                    prefetch={false}
                    className={primaryButtonClassName}
                  >
                    Ask for a quote
                  </Link>
                  <Link
                    href='/cakes-by-post'
                    prefetch={false}
                    className='inline-flex rounded-full border border-primary-200 bg-base-100/80 px-4 py-2 text-sm leading-6 text-primary-800 underline decoration-primary-200 underline-offset-4'
                  >
                    Browse cakes by post
                  </Link>
                </div>
              </div>

              <div className='mt-8 max-w-[720px] tablet:mt-1 tablet:max-w-none'>
                <PromptList />
              </div>
            </div>
          </div>
        </section>

        <section className='bg-base-100 px-4 py-8 tablet:px-10 tablet:py-12' aria-labelledby='faq-page-title'>
          <div className='homepage-container'>
            <div className='mx-auto max-w-[820px]'>
              <div className='max-w-[760px]'>
                <h2
                  id='faq-page-title'
                  className='font-oldenburg text-[1.75rem] leading-[1.03] tracking-[0.02em] text-primary-800 tablet:text-[2.8rem]'
                >
                  People ask this a lot
                </h2>
              </div>

              {hasFaqs ? (
                <div className='mt-8 border-t border-base-300'>
                  {faqs.map((faq, index) => (
                    <details
                      key={faq._id}
                      className='group border-b border-base-300 py-1'
                      open={index === 0}
                    >
                      <summary className='flex cursor-pointer list-none items-start justify-between gap-4 py-4 marker:hidden tablet:py-5'>
                        <span className='max-w-[42rem] font-body text-[16px] font-semibold leading-7 text-base-content tablet:text-[17px]'>
                          {faq.question}
                        </span>
                        <span
                          aria-hidden='true'
                          className='mt-[0.15rem] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition-transform group-open:rotate-45'
                        >
                          +
                        </span>
                      </summary>
                      <FaqAnswer answer={faq.answer} />
                    </details>
                  ))}
                </div>
              ) : (
                <div className='mt-8 rounded-[2rem] border border-primary-200 bg-primary-50/45 p-5 tablet:p-6'>
                  <h3 className='font-oldenburg text-[1.9rem] leading-[1.06] tracking-[0.02em] text-primary-800'>
                    This page is still growing
                  </h3>
                  <p className='mt-4 max-w-[58ch] text-[15px] leading-7 text-base-content/80 tablet:text-base tablet:leading-8'>
                    If you need an answer now, send a message or ask for a quote and I will reply
                    directly rather than leave you waiting for this page to catch up.
                  </p>
                  <div className='mt-6 flex flex-wrap gap-3'>
                    <Link
                      href='/contact'
                      prefetch={false}
                      className={primaryButtonClassName}
                    >
                      Send a question
                    </Link>
                    <Link
                      href='/get-custom-quote'
                      prefetch={false}
                      className='inline-flex rounded-full border border-primary-200 bg-base-100 px-4 py-2 text-sm leading-6 text-primary-800 underline decoration-primary-200 underline-offset-4'
                    >
                      Ask for a quote
                    </Link>
                  </div>
                </div>
              )}

              <div className='mt-10 max-w-[760px] border-t border-base-300 pt-6 text-sm leading-7 text-base-content/76 tablet:text-[15px]'>
                <p>
                  Already know what you need? Go straight to{' '}
                  {helpLinks.map((item, index) => (
                    <span key={item.href}>
                      <Link
                        href={item.href}
                        prefetch={false}
                        className='text-primary-700 underline decoration-primary-200 underline-offset-4'
                      >
                        {item.label}
                      </Link>
                      {index === helpLinks.length - 2 ? ' or ' : index < helpLinks.length - 2 ? ', ' : '.'}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
