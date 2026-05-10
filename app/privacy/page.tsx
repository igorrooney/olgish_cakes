import type { Metadata } from 'next'
import Link from 'next/link'

const lastUpdated = '6 February 2026'
const lastUpdatedIso = '2026-02-06'
const lastUpdatedDateTime = `${lastUpdatedIso}T00:00:00.000Z`

const metaTitle = 'Privacy Policy for Leeds and West Yorkshire'
const metaDescription = 'Read how Olgish Cakes in Leeds handles personal data, marketing consent, and analytics like Google Analytics and Microsoft Clarity, plus your UK privacy rights.'

const summaryItems = [
  'We only collect the details needed to bake, deliver, and improve your experience.',
  'Analytics tools run only after you accept analytics cookies.',
  'We never sell your data and only share it with trusted services.',
  'You can change cookie choices or withdraw consent anytime.',
  'You can ask us to access, correct, or delete your data.'
]

const informationItems = [
  {
    title: 'Contact details',
    description: 'Name, email address, phone number, and delivery address.'
  },
  {
    title: 'Order details',
    description: 'Cake choices, sizes, dietary requirements, and gift messages.'
  },
  {
    title: 'Messages and enquiries',
    description: 'Notes you send through forms, email, or social media.'
  },
  {
    title: 'Website usage data',
    description: 'IP address, device and browser details, pages viewed, and approximate location.'
  },
  {
    title: 'Marketing preferences',
    description: 'Your choices about email offers or updates.'
  },
  {
    title: 'Reviews or photos you share',
    description: 'Only if you send them to us or approve a review for use.'
  }
]

const useItems = [
  'Prepare, confirm, and deliver your cake orders.',
  'Respond to enquiries, quotes, and customer support messages.',
  'Improve our recipes, content, and website experience.',
  'Keep records for tax, accounting, and business administration.',
  'Protect our website against misuse and keep it running smoothly.',
  'Send marketing messages only when you have opted in.'
]

const lawfulBasisItems = [
  {
    title: 'Contract',
    description: 'To fulfil orders and provide the services you request.'
  },
  {
    title: 'Consent',
    description: 'For marketing messages and analytics cookies you opt into.'
  },
  {
    title: 'Legal obligation',
    description: 'For accounting, tax, and regulatory requirements.'
  },
  {
    title: 'Legitimate interests',
    description: 'To improve our products, keep the website secure, and understand demand.'
  }
]

const shareItems = [
  'Website hosting and security providers who keep the site online.',
  'Analytics and performance tools used only with consent.',
  'Delivery partners when we need to send your order.',
  'Payment or invoicing providers if required for your order.'
]

const rightsItems = [
  'Access the personal data we hold about you.',
  'Request correction of inaccurate or incomplete data.',
  'Ask us to delete data that we no longer need.',
  'Restrict or object to certain types of processing.',
  'Request a copy of your data in a portable format.',
  'Withdraw consent for marketing or analytics at any time.',
  'Raise a complaint with the UK Information Commissioner’s Office (ICO).'
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
    url: 'https://olgishcakes.co.uk/privacy',
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
    canonical: 'https://olgishcakes.co.uk/privacy'
  },
  keywords: [
    'privacy policy Olgish Cakes',
    'Ukrainian bakery privacy',
    'data protection cake shop',
    'personal data handling',
    'Ukrainian cake privacy',
    'bakery data protection',
    'cake order privacy',
    'delivery data privacy',
    'Ukrainian dessert privacy',
    'bakery privacy policy',
    'cake service privacy',
    'Ukrainian cake data',
    'bakery personal data',
    'cake order data protection',
    'Ukrainian cake privacy policy',
    'bakery data handling',
    'Microsoft Clarity privacy'
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

export default function PrivacyPolicyPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy - Olgish Cakes',
    description: metaDescription,
    url: 'https://olgishcakes.co.uk/privacy',
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
      headline: 'Privacy Policy for Olgish Cakes in Leeds and West Yorkshire',
      description: 'Learn how Olgish Cakes protects your privacy and handles personal data.',
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
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 left-0 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 tablet:pb-16">
            <div className="mt-6 grid gap-8 tablet:grid-cols-[1.1fr_0.9fr] tablet:items-start">
              <div className="space-y-4">
                <span className={badgeClassName}>Privacy & data care</span>
                <h1 className={heroTitleClassName}>
                  Privacy Policy for Olgish Cakes in Leeds and West Yorkshire
                </h1>
                <p className={heroTextClassName}>
                  We are a small Ukrainian bakery based in Leeds, and we treat your personal data with care.
                  This page explains what we collect, why we collect it, and the choices you have under UK law.
                </p>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-base-content/60">
                  Last updated: {lastUpdated}
                </p>
              </div>

              <div className={cardClassName}>
                <div className="p-6">
                  <h2 className="font-oldenburg text-lg text-primary-800">In short</h2>
                  <ul className={summaryListClassName}>
                    {summaryItems.map(item => (
                      <li key={item} className={summaryItemClassName}>
                        <span className={listBulletClassName} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/cookies" className={outlineButtonClassName}>
                      Cookie policy
                    </Link>
                    <Link href="/contact" className={actionButtonClassName}>
                      Contact us
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
                <h2 className={sectionTitleClassName}>1. Introduction</h2>
                <p className={sectionTextClassName}>
                  Olgish Cakes is the data controller for this website. We only ask for the information needed to
                  bake, deliver, and improve our cakes, and we keep it as simple as possible. If anything here is
                  unclear, please get in touch and we will explain in plain English.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>2. Information we collect</h2>
                <p className={sectionTextClassName}>
                  The information we collect depends on how you use the site. Typical examples include:
                </p>
                <ul className={listClassName}>
                  {informationItems.map(item => (
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
                <h2 className={sectionTitleClassName}>3. How we use your information</h2>
                <p className={sectionTextClassName}>We use your information to:</p>
                <ul className={listClassName}>
                  {useItems.map(item => (
                    <li key={item} className={listItemClassName}>
                      <span className={listBulletClassName} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>4. Lawful bases for processing</h2>
                <p className={sectionTextClassName}>
                  Under UK GDPR, we must have a lawful basis for processing your data. The ones we rely on are:
                </p>
                <ul className={listClassName}>
                  {lawfulBasisItems.map(item => (
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
                <h2 className={sectionTitleClassName}>5. Analytics and session insights</h2>
                <p className={sectionTextClassName}>
                  When you accept analytics cookies, we use Google Analytics and Microsoft Clarity via Google Tag
                  Manager. These tools help us understand how visitors use the site, such as pages viewed, clicks,
                  scrolls, device and browser details, and general location. We use these insights to improve
                  navigation, content, and the overall cake-ordering experience. You can withdraw consent at any
                  time using the “Manage cookies” control in the site footer.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>6. Sharing your data</h2>
                <p className={sectionTextClassName}>
                  We do not sell your personal data. We only share it when necessary to run the business and fulfil
                  your orders, for example with:
                </p>
                <ul className={listClassName}>
                  {shareItems.map(item => (
                    <li key={item} className={listItemClassName}>
                      <span className={listBulletClassName} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>7. Data retention</h2>
                <p className={sectionTextClassName}>
                  We keep personal data only for as long as needed for the purposes above, including legal and
                  accounting obligations. Marketing preferences are stored until you unsubscribe. Analytics data is
                  used in aggregated form where possible and deleted when it is no longer useful.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>8. Your rights</h2>
                <p className={sectionTextClassName}>
                  You have rights under UK data protection law. These include the right to:
                </p>
                <ul className={listClassName}>
                  {rightsItems.map(item => (
                    <li key={item} className={listItemClassName}>
                      <span className={listBulletClassName} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className={sectionTextClassName}>
                  If you want to exercise any of these rights, just email us. We may ask for verification to protect
                  your privacy.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>9. International transfers</h2>
                <p className={sectionTextClassName}>
                  Some service providers may process data outside the UK. When this happens, we use safeguards such
                  as standard contractual clauses or equivalent protections required by UK law.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>10. Cookies and preference controls</h2>
                <p className={sectionTextClassName}>
                  For detailed cookie information, please read our cookie policy. You can update your preferences at
                  any time via the “Manage cookies” link in the footer.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>11. Changes to this policy</h2>
                <p className={sectionTextClassName}>
                  We may update this policy from time to time to reflect changes in the law or our services. When we
                  do, we will update the date at the top of this page.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>12. Contact us</h2>
                <p className={sectionTextClassName}>
                  If you have any questions about this Privacy Policy or how we handle personal data, please reach
                  out:
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
                <h3 className="font-oldenburg text-lg text-primary-800">Need help quickly?</h3>
                <p className="mt-3 font-body text-sm text-base-content leading-6">
                  If you want to ask a privacy question or change your details, send us a message and we will respond
                  as soon as we can.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <Link href="/contact" className={actionButtonClassName}>
                    Send a message
                  </Link>
                  <Link href="/" className={outlineButtonClassName}>
                    Back to home
                  </Link>
                </div>
              </div>

              <div className={`${cardClassName} p-6`}>
                <h3 className="font-oldenburg text-lg text-primary-800">Cookie choices</h3>
                <p className="mt-3 font-body text-sm text-base-content leading-6">
                  Analytics cookies are always optional. You are in control, and you can change your choice anytime.
                </p>
                <div className="mt-4">
                  <Link href="/cookies" className={outlineButtonClassName}>
                    View cookie policy
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
