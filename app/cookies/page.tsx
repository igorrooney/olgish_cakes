import type { Metadata } from 'next'
import Link from 'next/link'

const lastUpdated = '6 February 2026'
const lastUpdatedIso = '2026-02-06'
const lastUpdatedDateTime = `${lastUpdatedIso}T00:00:00.000Z`

const metaTitle = 'Cookie Policy for Leeds and West Yorkshire'
const metaDescription = 'Learn how Olgish Cakes in Leeds uses essential, analytics and marketing cookies (Google Analytics and Microsoft Clarity) and how to manage choices easily.'

type CookieRow = {
  name: string
  purpose: string
  type: 'First-party' | 'Third-party'
  duration: string
}

const summaryItems = [
  'We use essential cookies to keep the site secure and working properly.',
  'Analytics and marketing cookies only run after you opt in.',
  'We use Google Analytics and Microsoft Clarity for site insights.',
  'You can change your preferences anytime using Manage cookies.',
  'We never sell cookie data and keep it only as long as needed.'
]

const observedExpiryNote = 'Durations below are based on our current configuration and can change if providers update their settings. Your browser shows the exact expiry.'

const cookieTypes = [
  {
    title: 'Essential cookies',
    description: 'Required for the website to function, keep forms secure, and remember consent choices.'
  },
  {
    title: 'Analytics cookies',
    description: 'Help us understand how the website is used so we can improve navigation and content.'
  },
  {
    title: 'Marketing cookies',
    description: 'Used for advertising measurement when you allow marketing cookies.'
  },
  {
    title: 'Preference cookies',
    description: 'Remember choices you make, such as layout or region settings, when available.'
  }
]

const essentialCookies: CookieRow[] = [
  {
    name: 'klaro',
    purpose: 'Stores your cookie consent choices so we can respect them.',
    type: 'First-party',
    duration: 'About 4 months.'
  },
  {
    name: 'csrf-token',
    purpose: 'Protects forms by preventing malicious or automated submissions.',
    type: 'First-party',
    duration: '1 hour.'
  }
]

const analyticsCookies: CookieRow[] = [
  {
    name: '_ga / _ga_*',
    purpose: 'Distinguishes users for aggregated Google Analytics reporting.',
    type: 'First-party',
    duration: 'About 13 months.'
  },
  {
    name: '_gid',
    purpose: 'Groups page views for analytics reporting.',
    type: 'First-party',
    duration: 'Varies by Google Analytics settings.'
  },
  {
    name: '_gat',
    purpose: 'Limits the rate of analytics requests.',
    type: 'First-party',
    duration: 'Varies by Google Analytics settings.'
  }
]

const clarityCookies: CookieRow[] = [
  {
    name: '_clck',
    purpose: 'Keeps the Clarity user ID and site preferences for this browser.',
    type: 'First-party',
    duration: 'About 12 months.'
  },
  {
    name: '_clsk',
    purpose: 'Connects multiple page views into a single Clarity session.',
    type: 'First-party',
    duration: 'About 24 hours.'
  },
  {
    name: 'CLID',
    purpose: 'Identifies the first time Clarity saw this user on a site.',
    type: 'Third-party',
    duration: 'Varies by Microsoft Clarity settings.'
  },
  {
    name: 'ANONCHK',
    purpose: 'Indicates whether the Microsoft Advertising cookie is passed to Clarity.',
    type: 'Third-party',
    duration: 'Varies by Microsoft Clarity settings.'
  },
  {
    name: 'MR',
    purpose: 'Signals whether to refresh the Microsoft Advertising ID.',
    type: 'Third-party',
    duration: 'Varies by Microsoft Clarity settings.'
  },
  {
    name: 'MUID',
    purpose: 'Recognises unique users across Microsoft domains.',
    type: 'Third-party',
    duration: 'Varies by Microsoft Clarity settings.'
  },
  {
    name: 'SM',
    purpose: 'Synchronises the Microsoft Advertising ID across domains.',
    type: 'Third-party',
    duration: 'Varies by Microsoft Clarity settings.'
  }
]

const marketingCookies: CookieRow[] = [
  {
    name: '_gcl_au',
    purpose: 'Stores conversion data to measure Google Ads performance.',
    type: 'First-party',
    duration: 'Varies by Google Ads settings.'
  },
  {
    name: '_gcl_aw',
    purpose: 'Stores ad click data for conversion attribution.',
    type: 'First-party',
    duration: 'Varies by Google Ads settings.'
  },
  {
    name: '_gcl_dc',
    purpose: 'Supports cross-channel conversion measurement for Google Ads.',
    type: 'First-party',
    duration: 'Varies by Google Ads settings.'
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
    url: 'https://olgishcakes.co.uk/cookies',
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
    canonical: 'https://olgishcakes.co.uk/cookies'
  },
  keywords: [
    'cookie policy Olgish Cakes',
    'Ukrainian bakery cookies',
    'website cookie usage',
    'cake shop cookies',
    'Ukrainian cake cookies',
    'bakery website cookies',
    'cake order cookies',
    'Ukrainian dessert cookies',
    'bakery cookie policy',
    'cake service cookies',
    'Ukrainian cake website',
    'bakery cookie usage',
    'cake order website',
    'Ukrainian cake policy',
    'bakery cookie management',
    'cake shop cookie policy',
    'Microsoft Clarity cookies',
    'Google Analytics cookies'
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

export default function CookiePolicyPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Cookie Policy - Olgish Cakes',
    description: metaDescription,
    url: 'https://olgishcakes.co.uk/cookies',
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
      headline: 'Cookie Policy for Olgish Cakes in Leeds and West Yorkshire',
      description: 'Learn how Olgish Cakes uses cookies and how you can manage your preferences.',
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

  const renderCookieTable = (items: CookieRow[]) => (
    <div className="mt-4 overflow-hidden rounded-2xl border border-base-200">
      <div className="grid grid-cols-1 gap-4 bg-base-200/60 px-4 py-3 text-xs font-sans uppercase tracking-[0.2em] text-base-content/70 tablet:grid-cols-[180px_1fr_160px_160px]">
        <span>Cookie</span>
        <span>Purpose</span>
        <span>Type</span>
        <span>Duration</span>
      </div>
      <div className="divide-y divide-base-200 bg-base-100">
        {items.map(item => (
          <div
            key={item.name}
            className="grid grid-cols-1 gap-3 px-4 py-4 text-sm text-base-content tablet:grid-cols-[180px_1fr_160px_160px]"
          >
            <span className="font-sans font-semibold text-primary-800">{item.name}</span>
            <span className="font-body leading-6">{item.purpose}</span>
            <span className="font-body text-base-content/80">{item.type}</span>
            <span className="font-body text-base-content/80">{item.duration}</span>
          </div>
        ))}
      </div>
    </div>
  )

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
                <span className={badgeClassName}>Cookie & consent guide</span>
                <h1 className={heroTitleClassName}>
                  Cookie Policy for Olgish Cakes in Leeds and West Yorkshire
                </h1>
                <p className={heroTextClassName}>
                  Cookies help us keep the website running, protect your forms, and understand which pages help you
                  find the right cake. You stay in control. We only use analytics or marketing cookies after you opt
                  in, and you can update choices any time via the footer.
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
                    <Link href="/privacy" className={outlineButtonClassName}>
                      Privacy policy
                    </Link>
                    <Link href="/contact" className={actionButtonClassName}>
                      Ask a question
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
                <h2 className={sectionTitleClassName}>1. What are cookies?</h2>
                <p className={sectionTextClassName}>
                  Cookies are small text files stored on your device when you visit a website. They help the site
                  remember actions such as accepting cookies, sending a form, or moving between pages. Some cookies
                  are essential, while others are optional and only used with your consent.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>2. Types of cookies we use</h2>
                <p className={sectionTextClassName}>
                  We categorise cookies so you can choose what is right for you. The categories we use are:
                </p>
                <ul className={listClassName}>
                  {cookieTypes.map(item => (
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
                <h2 className={sectionTitleClassName}>3. Essential cookies</h2>
                <p className={sectionTextClassName}>
                  These cookies are needed for the website to operate and cannot be switched off. They do not track
                  you for marketing.
                </p>
                {renderCookieTable(essentialCookies)}
              </section>

              <section>
                <h2 className={sectionTitleClassName}>4. Analytics cookies</h2>
                <p className={sectionTextClassName}>
                  When you opt into analytics, we use Google Analytics and Microsoft Clarity through Google Tag
                  Manager. These tools help us understand which pages are most helpful and where the website can be
                  improved.
                </p>
                {renderCookieTable(analyticsCookies)}
              </section>

              <section>
                <h2 className={sectionTitleClassName}>5. Microsoft Clarity cookies</h2>
                <p className={sectionTextClassName}>
                  Microsoft Clarity provides session insights such as page views, clicks, and scroll depth. These
                  cookies are only set after analytics consent.
                </p>
                {renderCookieTable(clarityCookies)}
              </section>

              <section>
                <h2 className={sectionTitleClassName}>6. Marketing cookies</h2>
                <p className={sectionTextClassName}>
                  Marketing cookies are used only if you allow marketing preferences. They help measure advertising
                  performance and improve relevant messaging.
                </p>
                {renderCookieTable(marketingCookies)}
              </section>

              <section>
                <h2 className={sectionTitleClassName}>7. Third-party services</h2>
                <p className={sectionTextClassName}>
                  Some cookies are placed by third-party services that appear on our pages, including Google and
                  Microsoft. These providers may process data outside the UK and apply their own cookie policies. We
                  require consent before any optional cookies are set.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>8. Managing your preferences</h2>
                <p className={sectionTextClassName}>
                  You can manage cookies at any time using the Manage cookies link in the footer. You can also clear
                  cookies in your browser settings. If you decline analytics or marketing cookies, the website will
                  still work, but we will not be able to measure usage or improve the site with those tools.
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>9. Updates to this policy</h2>
                <p className={sectionTextClassName}>
                  We review this policy regularly and will update the cookie list if we add new tools or providers.
                  The date at the top of this page shows when the policy was last updated.
                </p>
                <p className={sectionTextClassName}>
                  {observedExpiryNote}
                </p>
              </section>

              <section>
                <h2 className={sectionTitleClassName}>10. Contact us</h2>
                <p className={sectionTextClassName}>
                  If you have any questions about cookies or privacy, please contact us:
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
                <h3 className="font-oldenburg text-lg text-primary-800">Need to change settings?</h3>
                <p className="mt-3 font-body text-sm text-base-content leading-6">
                  Cookie choices can be updated at any time using the Manage cookies link in the footer.
                </p>
                <div className="mt-4">
                  <Link href="/privacy" className={outlineButtonClassName}>
                    Read privacy policy
                  </Link>
                </div>
              </div>

              <div className={`${cardClassName} p-6`}>
                <h3 className="font-oldenburg text-lg text-primary-800">Cookie detail notes</h3>
                <p className="mt-3 font-body text-sm text-base-content leading-6">
                  Expiry times for analytics and marketing cookies are set by their providers and can change. You
                  can always see the current expiry in your browser cookie settings.
                </p>
                <div className="mt-4">
                  <Link href="/contact" className={actionButtonClassName}>
                    Ask about cookies
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
