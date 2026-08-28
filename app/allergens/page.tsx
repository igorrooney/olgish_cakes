import type { Metadata } from 'next'
import Link from 'next/link'
import { BUSINESS_CONSTANTS, EMAIL_UTILS, PHONE_UTILS } from '@/lib/constants'
import { ALLERGEN_CROSS_CONTACT_POLICY } from '@/lib/public-policies'

type FaqItem = {
  question: string
  answer: string
}

const baseUrl = BUSINESS_CONSTANTS.BASE_URL
const pageUrl = `${baseUrl}/allergens`
const socialImageUrl = `${baseUrl}/images/olgish-cakes-logo-bakery-brand.png`
const title = 'Allergens'
const socialTitle = 'Allergen information | Olgish Cakes'
const description =
  'Allergen information for Olgish Cakes, including kitchen handling, cross-contact and how we’ll check an exact cake or postal product before ordering.'

const pageContainerClassName = 'mx-auto w-full max-w-4xl'
const sectionClassName = 'px-4 py-8 tablet:px-10 tablet:py-12'
const sectionTitleClassName =
  'font-oldenburg text-3xl leading-tight text-primary-800 tablet:text-4xl'
const articleTitleClassName =
  'font-oldenburg text-2xl leading-tight text-primary-800 tablet:text-3xl'
const bodyCopyClassName =
  'max-w-3xl space-y-4 text-base leading-7 text-base-content/80 tablet:text-lg tablet:leading-8'
const primaryButtonClassName =
  'btn btn-primary min-h-11 rounded-full px-6 font-semibold normal-case'
const secondaryButtonClassName =
  'btn btn-outline min-h-11 rounded-full border-primary-300 px-5 font-semibold normal-case text-primary-800'
const supportingLinkClassName =
  'link link-primary inline-flex min-h-11 items-center py-2 text-sm font-semibold'
const faqClassName =
  'collapse group rounded-none border-b border-base-300 bg-transparent py-1 focus-within:relative focus-within:z-10'

const allergenFaqs: FaqItem[] = [
  {
    question: 'Can you check a specific product before I order?',
    answer:
      'Yes. Send us the exact cake or postal product, the allergen or ingredient you need to avoid, and the date you need it. We’ll check the current recipe and supplier information before you order.'
  },
  {
    question: 'Can any product be guaranteed completely free from cross-contact?',
    answer: `No. ${ALLERGEN_CROSS_CONTACT_POLICY}`
  },
  {
    question: 'Does vegan-friendly or gluten-friendly mean allergen-free?',
    answer:
      'No. These descriptions refer to recipe choices, not an allergen-free kitchen. Products may still be exposed to allergens handled in the kitchen, so please contact us before ordering.'
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
        alt: 'Olgish Cakes logo and bakery branding',
        type: 'image/png'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: socialTitle,
    description,
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: 'Olgish Cakes logo and bakery branding'
      }
    ]
  },
  robots: {
    index: true,
    follow: true
  }
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className='list-disc space-y-3 pl-5 text-base leading-7 text-base-content/80 tablet:text-lg tablet:leading-8'>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function WarningIcon() {
  return (
    <svg
      aria-hidden='true'
      className='mt-0.5 h-5 w-5 shrink-0'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth='2'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.052 3.38c.866-1.5 3.03-1.5 3.896 0l7.355 12.746ZM12 15.75h.008v.008H12v-.008Z'
      />
    </svg>
  )
}

export default function AllergensPage() {
  return (
    <div className='min-h-screen bg-base-100 text-base-content'>
      <section
        aria-labelledby='allergens-page-title'
        className='border-b border-base-200 bg-primary-50/30 px-4 py-8 tablet:px-10 tablet:py-12'
      >
        <div className={pageContainerClassName}>
          <p className='text-xs font-semibold uppercase tracking-widest text-primary-700'>
            Allergen information
          </p>
          <h1
            id='allergens-page-title'
            className='mt-3 max-w-2xl font-oldenburg text-4xl leading-tight text-primary-800 tablet:text-5xl'
          >
            Allergens and kitchen handling
          </h1>
          <div className={`mt-5 ${bodyCopyClassName}`}>
            <p>
              We use ingredients that contain allergens, including milk, eggs and wheat. Other
              allergens vary by recipe and supplier.
            </p>
            <p>
              If you have an allergy, intolerance or coeliac disease, please contact us before
              ordering. We’ll check the exact product, current recipe and supplier information with
              you.
            </p>
          </div>
          <div className='alert alert-warning mt-6 w-full max-w-3xl items-start text-sm tablet:text-base'>
            <WarningIcon />
            <p>{ALLERGEN_CROSS_CONTACT_POLICY}</p>
          </div>
          <div className='mt-6 flex flex-wrap gap-3'>
            <a
              href={PHONE_UTILS.whatsappLink}
              className={primaryButtonClassName}
              target='_blank'
              rel='noreferrer noopener'
            >
              Message us on WhatsApp
            </a>
            <a href={EMAIL_UTILS.mailtoLink} className={secondaryButtonClassName}>
              Email us
            </a>
          </div>
        </div>
      </section>

      <section
        aria-labelledby='check-product-title'
        className={sectionClassName}
      >
        <div className={`${pageContainerClassName} space-y-10`}>
          <div>
            <h2 id='check-product-title' className={sectionTitleClassName}>
              Check the exact product
            </h2>
            <div className={`mt-5 ${bodyCopyClassName}`}>
              <p>
                Allergen information can change when a recipe, filling, decoration or supplier
                ingredient changes. Please check the exact product instead of relying on a category
                name or an earlier order.
              </p>
            </div>
          </div>

          <div className='grid gap-8 tablet:grid-cols-2'>
            <article aria-labelledby='bespoke-cakes-title'>
              <h3 id='bespoke-cakes-title' className={articleTitleClassName}>
                Bespoke cakes
              </h3>
              <div className='mt-4'>
                <BulletList
                  items={[
                    'Tell us the cake design, flavour, filling and decoration you are considering.',
                    'Bespoke details can change which ingredients are used.',
                    'We’ll confirm what we can safely offer before you place the order.'
                  ]}
                />
              </div>
              <Link
                href='/cakes'
                prefetch={false}
                className={`mt-4 ${supportingLinkClassName}`}
              >
                Browse cakes
              </Link>
            </article>

            <article aria-labelledby='cakes-by-post-title'>
              <h3 id='cakes-by-post-title' className={articleTitleClassName}>
                Cakes by post
              </h3>
              <div className='mt-4'>
                <BulletList
                  items={[
                    'Read the Ingredients section on the exact product page.',
                    'Send us the product link and the allergen or ingredient you need to avoid.',
                    'We’ll check the current recipe and any supplier “may contain” information with you.'
                  ]}
                />
              </div>
              <Link
                href='/cakes-by-post'
                prefetch={false}
                className={`mt-4 ${supportingLinkClassName}`}
              >
                Browse cakes by post
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section
        aria-labelledby='what-to-send-title'
        className={`bg-base-200/40 ${sectionClassName}`}
      >
        <div className={pageContainerClassName}>
          <h2 id='what-to-send-title' className={sectionTitleClassName}>
            What to send us
          </h2>
          <div className='mt-5 max-w-3xl'>
            <BulletList
              items={[
                'The exact allergen or ingredient you need to avoid, even if it is not one of the 14 allergens covered by UK labelling rules.',
                'The product link, cake design or flavour you are considering.',
                'Whether you need a bespoke cake or a cake by post.',
                'The date you need it.'
              ]}
            />
          </div>
          <p className='mt-5 max-w-3xl text-base leading-7 text-base-content/80 tablet:text-lg tablet:leading-8'>
            For general information about the allergens covered by UK food labelling rules, read the{' '}
            <a
              href='https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses'
              className={supportingLinkClassName}
            >
              Food Standards Agency’s allergen guidance
            </a>
            .
          </p>
        </div>
      </section>

      <section
        aria-labelledby='allergen-questions-title'
        className={sectionClassName}
      >
        <div className={pageContainerClassName}>
          <h2 id='allergen-questions-title' className={sectionTitleClassName}>
            Common questions
          </h2>
          <div className='mt-6 border-t border-base-300'>
            {allergenFaqs.map((faq, index) => (
              <details key={faq.question} className={faqClassName} open={index === 0}>
                <summary className='collapse-title flex min-h-11 cursor-pointer list-none items-start justify-between gap-4 px-0 py-4 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600 tablet:py-5 [&::-webkit-details-marker]:hidden'>
                  <span className='max-w-2xl text-base font-semibold leading-7 text-base-content tablet:text-lg'>
                    {faq.question}
                  </span>
                  <span
                    aria-hidden='true'
                    className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-300 text-primary-700 transition-transform group-open:rotate-45'
                  >
                    +
                  </span>
                </summary>
                <div className='collapse-content max-w-3xl px-0 pb-4 text-base leading-7 text-base-content/80 tablet:pr-8 tablet:text-lg tablet:leading-8'>
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
