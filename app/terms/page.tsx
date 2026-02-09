import type { Metadata } from 'next'
import Link from 'next/link'

const lastUpdated = '6 February 2026'
const lastUpdatedIso = '2026-02-06'
const lastUpdatedDateTime = `${lastUpdatedIso}T00:00:00.000Z`

const metaTitle = 'Terms of Service for Leeds and West Yorkshire'
const metaDescription = 'Read the terms of service for Olgish Cakes in Leeds, covering orders, payments, delivery by agreement, cancellations, refunds, and customer responsibilities.'

const summaryItems = [
  'Terms for ordering, payments, delivery, and cancellations.',
  'Custom cake details are agreed before we start baking.',
  'Refunds are available before we begin working on your order.',
  'Please share allergy and dietary info before ordering.',
  'We aim for clear communication and fair resolutions.',
  'Contact us any time if you need clarification.'
]

type DetailItem = {
  title: string
  description: string
}

const orderingItems: DetailItem[] = [
  {
    title: 'Order confirmation',
    description: 'Orders are confirmed by email or phone. A deposit may be required for certain orders.'
  },
  {
    title: 'Custom orders',
    description: 'Custom cakes require a consultation and agreement on design, ingredients, and delivery.'
  },
  {
    title: 'Order changes',
    description: 'Please request changes at least 48 hours before delivery or collection.'
  }
]

const paymentItems = [
  'Bank transfer',
  'Credit/debit card',
  'Cash on collection'
]

const refundItems: DetailItem[] = [
  {
    title: 'Before work starts',
    description: 'If we have not started work on your order, we can refund your payment.'
  },
  {
    title: 'After work starts',
    description: 'Once we begin preparation or baking, deposits become non-refundable.'
  },
  {
    title: 'Gift hampers',
    description: 'Gift hamper orders can be refunded any time before delivery.'
  }
]

const deliveryItems: DetailItem[] = [
  {
    title: 'Delivery',
    description: 'Delivery charges depend on location. We deliver at a time agreed with you.'
  },
  {
    title: 'Collection',
    description: 'Collection is available from our Leeds location during agreed hours.'
  }
]

const faqItems = [
  {
    question: 'How far in advance should I order?',
    answer: 'We recommend booking as early as possible, especially for weekends and wedding dates. Last-minute orders are sometimes possible, so please ask.'
  },
  {
    question: 'Can I update my design after booking?',
    answer: 'Yes, small changes are usually fine if you let us know at least 48 hours before delivery or collection.'
  },
  {
    question: 'What happens if I am not home for delivery?',
    answer: 'We will contact you to arrange a safe handover. If we cannot reach you, delivery may need to be rescheduled.'
  }
]

const heroTitleClassName = 'mt-4 font-moreSugar text-[26px] uppercase tracking-[0.14em] text-primary-700 -rotate-2 leading-[40px] text-center tablet:text-left tablet:text-[46px] tablet:leading-[56px]'
const heroTextClassName = 'font-body text-sm tablet:text-base text-base-content leading-7'
const badgeClassName = 'inline-flex items-center rounded-full bg-base-100/80 px-3 py-1 text-xs font-sans uppercase tracking-[0.28em] text-base-content/70 shadow-sm'
const cardClassName = 'rounded-3xl border border-base-200 bg-base-100 shadow-lg'
const sectionTitleClassName = 'font-oldenburg text-[20px] tablet:text-[24px] text-primary-800 leading-[28px]'
const sectionTextClassName = 'mt-3 font-body text-sm tablet:text-base text-base-content leading-7'
const listClassName = 'mt-4 space-y-3'
const listItemClassName = 'flex gap-3 font-body text-sm tablet:text-base text-base-content leading-7'
const listBulletClassName = 'mt-2 h-2 w-2 rounded-full bg-primary-500 flex-shrink-0'
const summaryListClassName = 'mt-4 space-y-3'
const summaryItemClassName = 'flex gap-3 font-body text-sm text-base-content leading-6'
const actionButtonClassName = 'btn btn-primary rounded-btn font-oldenburg text-sm tablet:text-base'
const outlineButtonClassName = 'btn btn-outline rounded-btn font-oldenburg text-sm tablet:text-base'

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: 'https://olgishcakes.co.uk/terms',
    siteName: 'Olgish Cakes',
    images: [
      {
        url: 'https://olgishcakes.co.uk/images/og-legal.jpg',
        width: 1200,
        height: 630,
        alt: 'Olgish Cakes bakery owner in Leeds'
      }
    ],
    locale: 'en_GB',
    type: 'article',
    publishedTime: lastUpdatedDateTime,
    modifiedTime: lastUpdatedDateTime
  },
  twitter: {
    card: 'summary_large_image',
    title: metaTitle,
    description: metaDescription,
    images: ['https://olgishcakes.co.uk/images/og-legal.jpg']
  },
  alternates: {
    canonical: 'https://olgishcakes.co.uk/terms'
  },
  keywords: [
    'terms of service Olgish Cakes',
    'Ukrainian bakery terms',
    'cake order terms',
    'delivery terms conditions',
    'cake service policies',
    'Ukrainian cake terms',
    'bakery legal agreement',
    'cake order policies',
    'delivery conditions Leeds',
    'cake service terms',
    'Ukrainian dessert terms',
    'cake order agreement',
    'bakery terms conditions',
    'cake delivery policies',
    'Ukrainian cake service terms',
    'bakery legal terms'
  ],
  authors: [{ name: 'Olgish Cakes', url: 'https://olgishcakes.co.uk' }],
  creator: 'Olgish Cakes',
  publisher: 'Olgish Cakes',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  metadataBase: new URL('https://olgishcakes.co.uk'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'ggHjlSwV1aM_lVT4IcRSlUIk6Vn98ZbJ_FGCepoVi64'
  },
  other: {
    'geo.region': 'GB-ENG',
    'geo.placename': 'Leeds'
  }
}

export default function TermsOfServicePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service - Olgish Cakes',
    description: metaDescription,
    url: 'https://olgishcakes.co.uk/terms',
    publisher: {
      '@type': 'Organization',
      name: 'Olgish Cakes',
      logo: {
        '@type': 'ImageObject',
        url: 'https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png'
      }
    },
    mainEntity: {
      '@type': 'Article',
      headline: 'Terms of Service for Olgish Cakes in Leeds and West Yorkshire',
      description: 'Review the terms and conditions for ordering, delivery, and service policies.',
      author: {
        '@type': 'Organization',
        name: 'Olgish Cakes'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Olgish Cakes'
      },
      datePublished: lastUpdatedDateTime,
      dateModified: lastUpdatedDateTime
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-base-100">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-base-200 via-base-100 to-base-100" />
          <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 tablet:pb-16">
            <div className="mt-6 grid gap-8 tablet:grid-cols-[1.1fr_0.9fr] tablet:items-start">
              <div className="space-y-4">
                <span className={badgeClassName}>Terms & ordering rules</span>
                <h1 className={heroTitleClassName}>
                  Terms of Service for Olgish Cakes in Leeds and West Yorkshire
                </h1>
                <p className={heroTextClassName}>
                  These terms explain how we handle orders, delivery, payments, and customer responsibilities. They
                  help protect both you and our bakery so every order is clear and stress-free.
                </p>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-base-content/60">
                  Last updated: {lastUpdated}
                </p>
              </div>

              <div className={cardClassName}>
                <div className="p-6">
                  <h2 className="font-oldenburg text-lg text-primary-800">Quick summary</h2>
                  <ul className={summaryListClassName}>
                    {summaryItems.map(item => (
                      <li key={item} className={summaryItemClassName}>
                        <span className={listBulletClassName} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/contact" className={actionButtonClassName}>
                      Ask a question
                    </Link>
                    <Link href="/privacy" className={outlineButtonClassName}>
                      Privacy policy
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid gap-10 tablet:grid-cols-[minmax(0,1fr)_280px]">
            <article className="space-y-10">
              <section>
                <h2 className={sectionTitleClassName}>1. Acceptance of terms</h2>
                <p className={sectionTextClassName}>
                  By using our website or placing an order, you agree to these terms. If anything is unclear, please
                  contact us before ordering.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>2. Ordering process</h2>
                <p className={sectionTextClassName}>
                  When placing an order with Olgish Cakes, the following points apply:
                </p>
                <ul className={listClassName}>
                  {orderingItems.map(item => (
                    <li key={item.title} className={listItemClassName}>
                      <span className={listBulletClassName} aria-hidden="true" />
                      <span>
                        <strong className="font-sans font-semibold text-base-content">{item.title}:</strong>{' '}
                        {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>3. Payment terms</h2>
                <p className={sectionTextClassName}>
                  Prices are in GBP and include VAT where applicable. A deposit may be required for custom orders.
                  We currently accept:
                </p>
                <ul className={listClassName}>
                  {paymentItems.map(item => (
                    <li key={item} className={listItemClassName}>
                      <span className={listBulletClassName} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>4. Delivery and collection</h2>
                <p className={sectionTextClassName}>
                  We offer both delivery and collection options:
                </p>
                <ul className={listClassName}>
                  {deliveryItems.map(item => (
                    <li key={item.title} className={listItemClassName}>
                      <span className={listBulletClassName} aria-hidden="true" />
                      <span>
                        <strong className="font-sans font-semibold text-base-content">{item.title}:</strong>{' '}
                        {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>5. Cancellations and refunds</h2>
                <p className={sectionTextClassName}>
                  Our products are made to order and are perishable. We can only offer refunds when we have not
                  started work on your order. Please contact us as early as possible if you need to cancel.
                </p>
                <ul className={listClassName}>
                  {refundItems.map(item => (
                    <li key={item.title} className={listItemClassName}>
                      <span className={listBulletClassName} aria-hidden="true" />
                      <span>
                        <strong className="font-sans font-semibold text-base-content">{item.title}:</strong>{' '}
                        {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>6. Allergies and dietary requirements</h2>
                <p className={sectionTextClassName}>
                  Please tell us about any allergies or dietary requirements before placing an order. We can share
                  ingredient and allergen information in advance so you can decide if a product is suitable.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>7. Intellectual property</h2>
                <p className={sectionTextClassName}>
                  All content on our website, including images, designs, and recipes, is the property of Olgish Cakes
                  and protected by intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>8. Limitation of liability</h2>
                <p className={sectionTextClassName}>
                  We take care in preparing our products, but customers are responsible for informing us of allergies
                  or dietary requirements. We cannot be held liable for reactions where information was not provided
                  in advance.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>9. Changes to terms</h2>
                <p className={sectionTextClassName}>
                  We may update these terms from time to time. Continued use of our services after changes means you
                  accept the updated terms.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>10. Statutory rights</h2>
                <p className={sectionTextClassName}>
                  Nothing in these terms affects your legal rights as a consumer under UK law.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>11. FAQs</h2>
                <p className={sectionTextClassName}>
                  A few quick answers to common questions about orders and changes.
                </p>
                <ul className={listClassName}>
                  {faqItems.map(item => (
                    <li key={item.question} className={listItemClassName}>
                      <span className={listBulletClassName} aria-hidden="true" />
                      <span>
                        <strong className="font-sans font-semibold text-base-content">{item.question}</strong>{' '}
                        {item.answer}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>12. Contact us</h2>
                <p className={sectionTextClassName}>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="mt-4 space-y-2 font-body text-sm tablet:text-base text-base-content">
                  <p>Email: hello@olgishcakes.co.uk</p>
                  <p>Phone: +44 786 721 8194</p>
                  <p>Address: Based in Allerton Grange, Leeds LS17</p>
                </div>
              </section>
            </article>

            <aside className="space-y-6">
              <div className={`${cardClassName} p-6`}>
                <h3 className="font-oldenburg text-lg text-primary-800">Need an order update?</h3>
                <p className="mt-3 font-body text-sm text-base-content leading-6">
                  If you need to change an order or ask about delivery, send us a message and we will help quickly.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link href="/contact" className={actionButtonClassName}>
                    Contact us
                  </Link>
                  <Link href="/" className={outlineButtonClassName}>
                    Back to home
                  </Link>
                </div>
              </div>

              <div className={`${cardClassName} p-6`}>
                <h3 className="font-oldenburg text-lg text-primary-800">Looking for policies?</h3>
                <p className="mt-3 font-body text-sm text-base-content leading-6">
                  You might also want to review our privacy and cookie policies for data and consent details.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link href="/privacy" className={outlineButtonClassName}>
                    Privacy policy
                  </Link>
                  <Link href="/cookies" className={outlineButtonClassName}>
                    Cookie policy
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  )
}
