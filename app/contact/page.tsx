import type { Metadata } from 'next'
import Link from 'next/link'
import { BUSINESS_CONSTANTS, EMAIL_UTILS, PHONE_UTILS } from '@/lib/constants'
import { quickQuestionPrompts } from './contactPageContent'
import { ContactFormScrollLink } from './ContactFormScrollLink'
import { DeferredContactPageForm } from './DeferredContactPageForm'
import styles from './contactPage.module.css'

type StructuredData = Record<string, unknown>

type ContactChannel = {
  title: string
  detail: string
  href: string
  value: string
  external?: boolean
}

const baseUrl = BUSINESS_CONSTANTS.BASE_URL
const pageUrl = `${baseUrl}/contact`
const socialImageUrl = `${baseUrl}/images/olgish-cakes-logo-bakery-brand.png`
const title = 'Contact Olga in Leeds | Cake Quotes, Delivery and Workshop Help'
const description =
  'Get in touch with Olga in Leeds about cakes, delivery, postal bakes or workshops. Share what you need, where it is going and any date you already have in mind.'

const contactChannels: ContactChannel[] = [
  {
    title: 'WhatsApp',
    detail: 'Best for quick checks about delivery, timing or the best place to start.',
    href: PHONE_UTILS.whatsappLink,
    value: 'Message on WhatsApp',
    external: true
  },
  {
    title: 'Email',
    detail: 'Useful if you want to send everything over in one message.',
    href: EMAIL_UTILS.mailtoLink,
    value: BUSINESS_CONSTANTS.EMAIL
  },
  {
    title: 'Phone',
    detail: 'If talking it through is easier, give me a ring.',
    href: PHONE_UTILS.telLink,
    value: PHONE_UTILS.displayPhone
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
        name: 'Contact',
        item: pageUrl
      }
    ]
  }
}

function buildContactPageStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${pageUrl}#webpage`,
    name: 'Contact Olga about cake quotes, delivery, workshops or general questions',
    description,
    url: pageUrl,
    isPartOf: {
      '@id': `${baseUrl}/#website`
    },
    about: {
      '@id': `${baseUrl}/#organization`
    },
    mainEntity: {
      '@id': `${baseUrl}/#organization`
    }
  }
}

function buildLocalBusinessStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    '@id': `${baseUrl}/#organization`,
    name: BUSINESS_CONSTANTS.NAME,
    url: baseUrl,
    telephone: BUSINESS_CONSTANTS.PHONE,
    email: BUSINESS_CONSTANTS.EMAIL,
    image: socialImageUrl,
    description:
      'Handmade cakes from Leeds, with delivery for suitable bakes and workshops for groups, venues and events.',
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
        '@type': 'Country',
        name: 'United Kingdom'
      }
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: BUSINESS_CONSTANTS.PHONE,
        email: BUSINESS_CONSTANTS.EMAIL,
        areaServed: 'GB',
        availableLanguage: 'en-GB'
      }
    ],
    sameAs: [
      BUSINESS_CONSTANTS.SOCIAL.instagram,
      BUSINESS_CONSTANTS.SOCIAL.facebook
    ],
    mainEntityOfPage: pageUrl
  }
}

function ContactBulletList({ items }: { items: string[] }) {
  return (
    <ul className='space-y-3'>
      {items.map((item) => (
        <li key={item} className='flex items-start gap-3'>
          <span
            aria-hidden='true'
            className='mt-[0.58rem] h-2 w-2 shrink-0 rounded-full bg-primary-500'
          />
          <span className='text-sm leading-6 text-base-content/78 tablet:text-[15px] tablet:leading-7'>
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

function DirectContactCard({
  className = '',
  compact = false,
  testId
}: {
  className?: string
  compact?: boolean
  testId?: string
}) {
  return (
    <aside
      data-testid={testId}
      className={`${styles.directContactPanel} ${compact ? styles.compactDirectContactPanel : ''} relative overflow-hidden rounded-[28px] bg-base-100/94 p-3.5 shadow-[0_12px_32px_color-mix(in_srgb,var(--color-primary-500)_8%,transparent)] ring-1 ring-primary-100/70 md:p-5 tablet:rounded-[32px] tablet:p-7 ${className}`.trim()}
    >
      <div
        className={`${compact ? styles.compactDirectContactGlow : ''} absolute -right-8 top-0 h-28 w-28 rounded-full bg-primary-50 blur-2xl`}
      />
      <div className='relative'>
        <p className='font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary-600'>
          Direct contact
        </p>
        <h2 className='mt-2 font-oldenburg text-[1.34rem] leading-[1.04] tracking-[0.02em] text-primary-800 tablet:mt-3 tablet:max-w-[11ch] tablet:text-[2.1rem]'>
          Want to check something first?
        </h2>
        <p className='mt-2 font-body text-sm leading-6 tracking-[0.01em] text-base-content/80 md:hidden'>
          Message or call if you want to check delivery, collection or timing before you fill in
          the form.
        </p>
        <p className='mt-3 hidden font-body text-[15px] leading-7 tracking-[0.01em] text-base-content/80 md:block md:text-base md:leading-8'>
          If you want to check delivery, collection, timing or whether a workshop idea is workable,
          send me a message or give me a ring first and I&apos;ll tell you straight.
        </p>

        <dl className='mt-4 grid gap-0 tablet:mt-6'>
          {contactChannels.map((channel) => (
            <div
              key={channel.title}
              className='border-b border-primary-100/75 py-2.5 first:pt-0 last:border-b-0 last:pb-0 tablet:py-4'
            >
              <dt className='font-sans text-base font-semibold leading-6 text-base-content tablet:text-lg tablet:leading-7'>
                {channel.title}
              </dt>
              <dd className='mt-1.5 tablet:mt-2'>
                <a
                  href={channel.href}
                  className='inline-flex font-sans text-[17px] font-semibold leading-6 text-primary-800 underline decoration-primary-200 underline-offset-4 transition-colors hover:text-primary-600 tablet:font-oldenburg tablet:text-[20px] tablet:font-normal tablet:leading-7'
                  target={channel.external ? '_blank' : undefined}
                  rel={channel.external ? 'noopener noreferrer' : undefined}
                >
                  {channel.value}
                </a>
              </dd>
              <dd className='mt-1.5 text-[13px] leading-5 text-base-content/75 tablet:mt-2 tablet:text-sm tablet:leading-6'>
                {channel.detail}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  )
}

export default function ContactPage() {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildContactPageStructuredData()) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildLocalBusinessStructuredData()) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildBreadcrumbStructuredData()) }}
      />

      <div>
        <section className='overflow-hidden bg-base-100 px-4 pb-5 pt-3 tablet:px-10 tablet:pb-10 tablet:pt-8'>
          <div className={styles.contactPageContainer} data-testid='contact-hero-container'>
            <div
              data-testid='contact-hero-layout'
              className={`${styles.heroLayout} grid gap-3 rounded-[32px] border border-primary-100/80 bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-base-100)_94%,var(--color-primary-50)_6%),color-mix(in_srgb,var(--color-primary-50)_78%,var(--color-accent-50)_22%))] px-3 py-3 shadow-[0_18px_48px_color-mix(in_srgb,var(--color-primary-500)_7%,transparent)] md:gap-5 md:px-6 md:py-6 tablet:gap-8 tablet:px-8 tablet:py-8`}
            >
              <div className={`${styles.heroContent} flex flex-col gap-2 tablet:gap-4`}>
                <div className='inline-flex w-fit items-center rounded-full bg-base-100/85 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700 shadow-sm ring-1 ring-primary-100/70'>
                  Contact Olga
                </div>

                <div className='flex flex-col gap-2 tablet:gap-3'>
                  <h1 className={`${styles.heroTitle} max-w-[11ch] font-oldenburg text-[1.54rem] leading-[1] tracking-[0.02em] text-primary-800 md:text-[1.72rem] tablet:max-w-none tablet:text-[3.15rem]`}>
                    Need a cake, delivery help or workshop details?
                  </h1>
                  <p className='max-w-[560px] font-body text-[14px] leading-6 tracking-[0.01em] text-primary-800 md:text-[15px] tablet:text-[18px] tablet:leading-8'>
                    Tell me what you are planning, where it needs to go and when you need it. If
                    you are asking for a cake price, the quote form is still the quickest way to
                    start.
                  </p>
                </div>

                <div className={`${styles.heroActions} flex w-full flex-col gap-2 tablet:gap-3`}>
                  <ContactFormScrollLink
                    className='btn btn-primary h-11 border-none px-6 text-sm font-semibold normal-case shadow-[0_10px_22px_color-mix(in_srgb,var(--color-primary-500)_22%,transparent)] tablet:h-14 tablet:min-w-[220px] tablet:text-base'
                  >
                    Ask a question
                  </ContactFormScrollLink>
                  <Link
                    href='/get-custom-quote'
                    prefetch={false}
                    className='btn btn-outline h-11 border-primary-300 bg-base-100/92 px-6 text-sm font-semibold normal-case text-primary-700 tablet:h-14 tablet:min-w-[220px] tablet:text-base'
                  >
                    Get a cake quote
                  </Link>
                </div>

                <p className='max-w-[620px] font-body text-[13px] leading-6 tracking-[0.01em] text-base-content/76 md:text-sm tablet:text-[15px] tablet:leading-7'>
                  Already know you need{' '}
                  <Link
                    href='/cakes-by-post'
                    prefetch={false}
                    className='font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4'
                  >
                    cakes by post
                  </Link>{' '}
                  or{' '}
                  <Link
                    href='/learn/workshops'
                    prefetch={false}
                    className='font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4'
                  >
                    workshops
                  </Link>{' '}
                  details? You can skip straight there.
                </p>
              </div>

              <DirectContactCard
                className={styles.desktopDirectContactCard}
                testId='desktop-direct-contact-card'
              />
            </div>
          </div>
        </section>

        <section className={`${styles.mobileDirectContactSection} ${styles.deferredSection} bg-base-100 px-4 pb-6`}>
          <div className={styles.contactPageContainer}>
            <DirectContactCard compact testId='mobile-direct-contact-card' />
          </div>
        </section>

        <section
          id='contact-form-section'
          className={`${styles.deferredFormSection} scroll-mt-24 bg-base-100 px-4 py-6 tablet:px-10 tablet:py-12`}
        >
          <div
            className={`${styles.contactPageContainer} ${styles.formLayout} grid gap-5 rounded-[36px] border border-primary-100/80 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary-50)_32%,var(--color-base-100)_68%),var(--color-base-100))] p-4 shadow-[0_16px_42px_color-mix(in_srgb,var(--color-primary-500)_6%,transparent)] md:gap-7 md:p-6 tablet:gap-8 tablet:p-8`}
            data-testid='contact-form-layout'
          >
            <div className={`${styles.formSidebar} max-w-[400px]`}>
              <p className='font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary-600'>
                General contact form
              </p>
              <h2 className='mt-3 font-oldenburg text-[2rem] leading-[1.02] tracking-[0.02em] text-primary-800 tablet:text-[2.8rem]'>
                Send me a message
              </h2>
              <p className='mt-3 font-body text-[15px] leading-7 tracking-[0.01em] text-base-content/80 tablet:text-base tablet:leading-8'>
                A few basics are enough. I can tell you quickly what makes sense next.
              </p>
              <div className={`${styles.formPromptCard} mt-4 rounded-[28px] border border-primary-100 bg-base-100/85 p-4 shadow-sm md:p-5 tablet:mt-5`}>
                <h3 className='font-sans text-lg font-semibold leading-7 text-base-content'>
                  What helps me answer quickly?
                </h3>
                <p className='mt-2 font-body text-[15px] leading-7 tracking-[0.01em] text-base-content/80'>
                  A short note is fine. These details usually save a follow-up message before I can
                  answer properly.
                </p>
                <div className='mt-4'>
                  <ContactBulletList items={quickQuestionPrompts} />
                </div>
                <Link
                  href='/get-custom-quote'
                  prefetch={false}
                  className='mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4'
                >
                  Need a cake price instead?
                  <span aria-hidden='true'>{'>'}</span>
                </Link>
              </div>
            </div>

            <div
              id='contact-form-card'
              className={`${styles.formCard} scroll-mt-24 mx-auto w-full max-w-[760px] rounded-[32px] border border-primary-100 bg-base-100 px-5 py-6 shadow-[0_14px_36px_color-mix(in_srgb,var(--color-primary-500)_8%,transparent)] md:px-7 md:py-7 tablet:px-8 tablet:py-8`}
            >
              <DeferredContactPageForm />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
