import {
  LegalContactDetails,
  LegalLastUpdated,
  LegalPageNavigation,
  LegalPolicyLinks
} from '@/app/components/legal/LegalPageComponents'
import { legalPageStyles } from '@/app/components/legal/legal-page-styles'
import {
  consentCookieName,
  consentServices,
  type ConsentServiceKey
} from '@/app/lib/consent-config'
import { createLegalPageMetadata } from '@/lib/legal/legal-config'

const metaTitle = 'Cookie Policy for Leeds and West Yorkshire'
const metaDescription = 'Learn how Olgish Cakes in Leeds uses essential, analytics and marketing cookies from Google Analytics, Microsoft Clarity and Google Ads, and how to manage choices easily.'

type CookieRow = {
  name: string
  purpose: string
  type: 'First-party cookie' | 'Third-party cookie'
  duration: string
}

const summaryItems = [
  'We use essential cookies to keep the site secure and working properly.',
  'Analytics and marketing cookies only run after you opt in.',
  'You can choose Google Analytics, Microsoft Clarity and Google Ads independently.',
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
    title: 'Consent preference storage',
    description: 'Remembers your three optional-service choices in one first-party cookie.'
  }
]

const essentialCookies: CookieRow[] = [
  {
    name: consentCookieName,
    purpose: 'Remembers your Google Analytics, Microsoft Clarity and Google Ads choices.',
    type: 'First-party cookie',
    duration: '12 months.'
  },
  {
    name: 'csrf-token',
    purpose: 'Protects forms by preventing malicious or automated submissions.',
    type: 'First-party cookie',
    duration: '1 hour.'
  }
]

function getServiceCookies(serviceKey: ConsentServiceKey): CookieRow[] {
  const service = consentServices.find(item => item.key === serviceKey)
  return (service?.cookies ?? []).map(cookie => ({ ...cookie }))
}

const analyticsCookies = getServiceCookies('googleAnalytics')
const clarityCookies = getServiceCookies('microsoftClarity')
const marketingCookies = getServiceCookies('googleAds')

const {
  actionButton: actionButtonClassName,
  badge: badgeClassName,
  card: cardClassName,
  heroText: heroTextClassName,
  heroTitle: heroTitleClassName,
  list: listClassName,
  listBullet: listBulletClassName,
  listItem: listItemClassName,
  outlineButton: outlineButtonClassName,
  sectionText: sectionTextClassName,
  sectionTitle: sectionTitleClassName,
  summaryItem: summaryItemClassName,
  summaryList: summaryListClassName
} = legalPageStyles

export const metadata = createLegalPageMetadata({
  title: metaTitle,
  description: metaDescription,
  path: '/cookies'
})

const navigationItems = [
  { id: 'what-are-cookies', title: '1. What are cookies?' },
  { id: 'cookie-types', title: '2. Types of cookies we use' },
  { id: 'essential-cookies', title: '3. Essential cookies' },
  { id: 'analytics-cookies', title: '4. Analytics cookies' },
  { id: 'clarity-cookies', title: '5. Microsoft Clarity cookies' },
  { id: 'marketing-cookies', title: '6. Marketing cookies' },
  { id: 'third-party-services', title: '7. Third-party services' },
  { id: 'preferences', title: '8. Managing your preferences' },
  { id: 'updates', title: '9. Updates to this policy' },
  { id: 'contact', title: '10. Contact us' }
] as const

export default function CookiePolicyPage() {
  const renderCookieTable = (items: CookieRow[]) => (
    <div className='mt-4 overflow-hidden rounded-2xl border border-base-200 bg-base-100'>
      <table className='table table-sm w-full'>
        <thead className='hidden bg-base-200/60 font-sans text-xs uppercase tracking-[0.2em] text-base-content/70 tablet:table-header-group'>
          <tr>
            <th scope='col'>Cookie</th>
            <th scope='col'>Purpose</th>
            <th scope='col'>Type</th>
            <th scope='col'>Duration</th>
          </tr>
        </thead>
        <tbody className='block divide-y divide-base-200 tablet:table-row-group'>
        {items.map(item => (
          <tr
            key={item.name}
            className='block space-y-3 px-4 py-4 text-sm text-base-content tablet:table-row tablet:space-y-0 tablet:px-0 tablet:py-0'
          >
            <th scope='row' className='block p-0 text-left tablet:table-cell tablet:w-[180px] tablet:p-4'>
              <span className='mb-1 block font-sans text-[10px] uppercase tracking-[0.18em] text-base-content/60 tablet:hidden'>
                Cookie
              </span>
              <span className='font-sans font-semibold text-primary-800'>{item.name}</span>
            </th>
            <td className='block p-0 font-body leading-6 tablet:table-cell tablet:p-4'>
              <span className='mb-1 block font-sans text-[10px] uppercase tracking-[0.18em] text-base-content/60 tablet:hidden'>
                Purpose
              </span>
              {item.purpose}
            </td>
            <td className='block p-0 font-body text-base-content/80 tablet:table-cell tablet:w-[160px] tablet:p-4'>
              <span className='mb-1 block font-sans text-[10px] uppercase tracking-[0.18em] text-base-content/60 tablet:hidden'>
                Type
              </span>
              {item.type}
            </td>
            <td className='block p-0 font-body text-base-content/80 tablet:table-cell tablet:w-[160px] tablet:p-4'>
              <span className='mb-1 block font-sans text-[10px] uppercase tracking-[0.18em] text-base-content/60 tablet:hidden'>
                Duration
              </span>
              {item.duration}
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className='legal-document min-h-screen bg-base-100'>
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
                <LegalLastUpdated />
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
                    <a href="/privacy" className={outlineButtonClassName}>
                      Privacy policy
                    </a>
                    <a href="/contact" className={actionButtonClassName}>
                      Ask a question
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mx-auto max-w-6xl px-4 pb-6 tablet:hidden'>
          <LegalPageNavigation items={navigationItems} variant='mobile' />
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid gap-10 tablet:grid-cols-[minmax(0,1fr)_280px]">
            <article className="space-y-10">
              <section id='what-are-cookies' aria-labelledby='what-are-cookies-heading' className='scroll-mt-28'>
                <h2 id='what-are-cookies-heading' className={sectionTitleClassName}>1. What are cookies?</h2>
                <p className={sectionTextClassName}>
                  Cookies are small text files stored on your device when you visit a website. They help the site
                  remember actions such as accepting cookies, sending a form, or moving between pages. Some cookies
                  are essential, while others are optional and only used with your consent.
                </p>
              </section>

              <section id='cookie-types' aria-labelledby='cookie-types-heading' className='scroll-mt-28'>
                <h2 id='cookie-types-heading' className={sectionTitleClassName}>2. Types of cookies we use</h2>
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

              <section id='essential-cookies' aria-labelledby='essential-cookies-heading' className='scroll-mt-28'>
                <h2 id='essential-cookies-heading' className={sectionTitleClassName}>3. Essential cookies</h2>
                <p className={sectionTextClassName}>
                  These cookies are needed for the website to operate securely and remember your choices. They cannot
                  be switched off through our preference tool and do not track you for marketing.
                </p>
                {renderCookieTable(essentialCookies)}
              </section>

              <section id='analytics-cookies' aria-labelledby='analytics-cookies-heading' className='scroll-mt-28'>
                <h2 id='analytics-cookies-heading' className={sectionTitleClassName}>4. Analytics cookies</h2>
                <p className={sectionTextClassName}>
                  If you enable {consentServices[0].name}, we use it for {consentServices[0].description.toLowerCase()}
                  {' '}This choice is separate from Microsoft Clarity and Google Ads.
                </p>
                {renderCookieTable(analyticsCookies)}
              </section>

              <section id='clarity-cookies' aria-labelledby='clarity-cookies-heading' className='scroll-mt-28'>
                <h2 id='clarity-cookies-heading' className={sectionTitleClassName}>5. Microsoft Clarity cookies</h2>
                <p className={sectionTextClassName}>
                  If you enable {consentServices[1].name}, we use it for {consentServices[1].description.toLowerCase()}
                  {' '}This can include page views, clicks, scrolls, heatmaps and session recordings.
                </p>
                {renderCookieTable(clarityCookies)}
              </section>

              <section id='marketing-cookies' aria-labelledby='marketing-cookies-heading' className='scroll-mt-28'>
                <h2 id='marketing-cookies-heading' className={sectionTitleClassName}>6. Marketing cookies</h2>
                <p className={sectionTextClassName}>
                  If you enable {consentServices[2].name}, we use it for {consentServices[2].description.toLowerCase()}
                  {' '}This choice is separate from Google Analytics and Microsoft Clarity.
                </p>
                {renderCookieTable(marketingCookies)}
              </section>

              <section id='third-party-services' aria-labelledby='third-party-services-heading' className='scroll-mt-28'>
                <h2 id='third-party-services-heading' className={sectionTitleClassName}>7. Third-party services</h2>
                <p className={sectionTextClassName}>
                  Some cookies are placed by third-party services that appear on our pages, including Google and
                  Microsoft. These providers may process data outside the UK and apply their own cookie policies. We
                  require consent before any optional cookies are set.
                </p>
                <p className={sectionTextClassName}>
                  Read the current{' '}
                  <a
                    className='link link-primary'
                    href='https://support.google.com/analytics/answer/11397207?hl=en-GB'
                    rel='noreferrer'
                  >
                    Google Analytics cookie information
                  </a>
                  {' '}and{' '}
                  <a
                    className='link link-primary'
                    href='https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-cookies'
                    rel='noreferrer'
                  >
                    Microsoft Clarity cookie information
                  </a>
                  .
                </p>
              </section>

              <section id='preferences' aria-labelledby='preferences-heading' className='scroll-mt-28'>
                <h2 id='preferences-heading' className={sectionTitleClassName}>8. Managing your preferences</h2>
                <p className={sectionTextClassName}>
                  You can manage cookies at any time using the Manage cookies link in the footer. You can also clear
                  cookies in your browser settings. If you decline analytics or marketing cookies, the website will
                  still work, but we will not be able to measure usage or improve the site with those tools.
                </p>
              </section>

              <section id='updates' aria-labelledby='updates-heading' className='scroll-mt-28'>
                <h2 id='updates-heading' className={sectionTitleClassName}>9. Updates to this policy</h2>
                <p className={sectionTextClassName}>
                  We review this policy regularly and will update the cookie list if we add new tools or providers.
                  The date at the top of this page shows when the policy was last updated.
                </p>
                <p className={sectionTextClassName}>
                  {observedExpiryNote} We check the deployed site from a clean browser when providers or tag-manager
                  settings change and update this list if the observed technologies differ.
                </p>
              </section>

              <section id='contact' aria-labelledby='contact-heading' className='scroll-mt-28'>
                <h2 id='contact-heading' className={sectionTitleClassName}>10. Contact us</h2>
                <p className={sectionTextClassName}>
                  If you have any questions about cookies or privacy, please contact us:
                </p>
                <LegalContactDetails />
              </section>
            </article>

            <aside className="space-y-6">
              <LegalPageNavigation items={navigationItems} variant='desktop' />

              <div className={`${cardClassName} p-6`}>
                <h3 className="font-oldenburg text-lg text-primary-800">Need to change settings?</h3>
                <p className="mt-3 font-body text-sm text-base-content leading-6">
                  Cookie choices can be updated at any time using the Manage cookies link in the footer.
                </p>
                <div className="mt-4">
                  <a href="/privacy" className={outlineButtonClassName}>
                    Read privacy policy
                  </a>
                </div>
              </div>

              <div className={`${cardClassName} p-6`}>
                <h3 className="font-oldenburg text-lg text-primary-800">Cookie detail notes</h3>
                <p className="mt-3 font-body text-sm text-base-content leading-6">
                  Expiry times for analytics and marketing cookies are set by their providers and can change. You
                  can always see the current expiry in your browser cookie settings.
                </p>
                <div className="mt-4">
                  <a href="/contact" className={actionButtonClassName}>
                    Ask about cookies
                  </a>
                </div>
              </div>

              <div className={`${cardClassName} no-print p-6`}>
                <h2 className='font-oldenburg text-lg text-primary-800'>Other policies</h2>
                <LegalPolicyLinks current='/cookies' />
              </div>
            </aside>
          </div>
        </section>
    </div>
  )
}
