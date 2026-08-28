import {
  LegalContactDetails,
  LegalLastUpdated,
  LegalPageNavigation,
  LegalPolicyLinks
} from '@/app/components/legal/LegalPageComponents'
import { legalPageStyles } from '@/app/components/legal/legal-page-styles'
import {
  createLegalPageMetadata,
  CURRENT_PRIVACY_DATE,
  CURRENT_PRIVACY_DATE_ISO
} from '@/lib/legal/legal-config'

const metaTitle = 'Privacy Policy for Leeds and West Yorkshire'
const metaDescription = 'Read how Olgish Cakes in Leeds handles personal data, marketing consent, and analytics like Google Analytics and Microsoft Clarity, plus your UK privacy rights.'

const summaryItems = [
  'We only collect the details needed to bake, deliver, and improve your experience.',
  'Analytics tools run only after you accept analytics cookies.',
  'We never sell your data and identify the services that receive it below.',
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
    description: 'Cake choices, sizes, ordinary dietary preferences, and gift messages.'
  },
  {
    title: 'Protected dietary health information',
    description: 'Allergy, intolerance or health-related dietary details entered in the separate optional field, together with the explicit-consent version and time.'
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
    title: 'Cookie preferences',
    description: 'Your choices about analytics and advertising measurement.'
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
  'Protect our website against misuse and keep it running smoothly.'
]

const lawfulBasisItems = [
  {
    title: 'Contract',
    description: 'To fulfil orders and provide the services you request.'
  },
  {
    title: 'Consent',
    description: 'Article 6(1)(a) consent for optional analytics or advertising measurement and Article 6(1)(a) consent together with Article 9(2)(a) explicit consent for health-related allergy or dietary information that you choose to provide.'
  },
  {
    title: 'Legal obligation',
    description: 'For accounting, tax, and regulatory requirements.'
  },
  {
    title: 'Legitimate interests',
    description: 'To answer genuine enquiries, improve our products, keep the website secure, prevent misuse and understand non-sensitive business demand, where those interests are not overridden by your rights.'
  }
]

const shareItems = [
  'Vercel, for website hosting, performance and security services.',
  'Supabase, for storing enquiries, orders, messages and uploaded reference files.',
  'Resend, for sending enquiry and order emails.',
  'Telegram, for restricted notifications to the business owner about new enquiries or orders; protected dietary health information is not included in those notifications.',
  'Sanity, for website content and product images; customer order records are not intentionally stored there.',
  'Google Analytics, Google Ads and Microsoft Clarity, only for the optional purposes you accept.',
  'Delivery, payment or invoicing providers, but only where needed for your order.',
  'Professional advisers, regulators, courts or law-enforcement bodies where disclosure is legally required or necessary to establish or defend legal rights.'
]

const retentionItems = [
  'Enquiries that do not become orders: normally 24 months after our last contact.',
  'Protected dietary health information: when an enquiry record is closed or an order is verified as completed, delivered or cancelled, we schedule the health content for permanent erasure 30 days later. A specific legal hold pauses scheduled erasure while it remains necessary. After scheduled erasure, we retain only the original consent version and time, the retention deadline and the server-recorded erasure time as non-health accountability evidence. If you withdraw consent first, we erase the health content immediately and retain only the original consent version and time plus the withdrawal time.',
  'Orders, contracts, invoices, payment records and associated correspondence: normally six years after the end of the relevant financial year, to meet tax, accounting and legal-claim requirements.',
  'Reference images and other uploaded files: normally deleted within 24 months after the enquiry closes or the order is completed, unless they form necessary evidence for an ongoing complaint or legal claim.',
  'Optional analytics information: according to our configured provider setting, normally no longer than 14 months, after which it is deleted or aggregated.',
  'Cookie choices stored on your device: until the relevant cookie expires or you clear or replace the choice.',
  'Security and abuse-prevention records: normally up to 90 days, or longer only while a specific incident or legal claim is investigated.',
  'Reviews or photographs approved for publication: until permission is withdrawn or the material is no longer used; we review retained permissions at least annually.'
]

const rightsItems = [
  'Access the personal data we hold about you.',
  'Request correction of inaccurate or incomplete data.',
  'Ask us to delete data where there is no legal reason for us to keep it.',
  'Restrict or object to certain types of processing.',
  'Request a portable copy of eligible data you provided to us.',
  'Withdraw consent for allergy information, analytics or advertising measurement at any time.',
  'Raise a complaint with the UK Information Commissioner’s Office (ICO).'
]

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
  path: '/privacy'
})

const navigationItems = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'information-we-collect', title: '2. Information we collect' },
  { id: 'how-we-use-information', title: '3. How we use your information' },
  { id: 'lawful-bases', title: '4. Lawful bases for processing' },
  { id: 'analytics', title: '5. Analytics and session insights' },
  { id: 'sharing', title: '6. Sharing your data' },
  { id: 'retention', title: '7. Data retention' },
  { id: 'rights', title: '8. Your rights' },
  { id: 'international-transfers', title: '9. International transfers' },
  { id: 'cookies', title: '10. Cookies and preference controls' },
  { id: 'changes', title: '11. Changes to this policy' },
  { id: 'contact', title: '12. Contact us' }
] as const

export default function PrivacyPolicyPage() {
  return (
    <div className='legal-document min-h-screen bg-base-100'>
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
                <LegalLastUpdated
                  date={CURRENT_PRIVACY_DATE}
                  dateTime={CURRENT_PRIVACY_DATE_ISO}
                />
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
                    <a href="/cookies" className={outlineButtonClassName}>
                      Cookie policy
                    </a>
                    <a href="/contact" className={actionButtonClassName}>
                      Contact us
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
              <section id='introduction' aria-labelledby='introduction-heading' className='scroll-mt-28'>
                <h2 id='introduction-heading' className={sectionTitleClassName}>1. Introduction</h2>
                <p className={sectionTextClassName}>
                  Olgish Cakes, operated by Olga Ieromenko as a sole trader, is the data controller for this website.
                  We only ask for the information needed to bake, deliver, and improve our cakes, and we keep it as
                  simple as possible. If anything here is unclear, please get in touch and we will explain in plain
                  English.
                </p>
              </section>

              <section id='information-we-collect' aria-labelledby='information-we-collect-heading' className='scroll-mt-28'>
                <h2 id='information-we-collect-heading' className={sectionTitleClassName}>2. Information we collect</h2>
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
                <p className={sectionTextClassName}>
                  We normally receive this information directly from you. If someone orders a gift for you, we may
                  receive your name, delivery address, telephone number and gift message from that customer. Website
                  usage information comes from your browser, device and our service providers.
                </p>
                <p className={sectionTextClassName}>
                  Contact, order, delivery and payment details are needed when we enter into or fulfil a contract.
                  If you do not provide the required information, we may be unable to quote, accept or deliver the
                  order. Inspiration images, reviews and most dietary notes are optional. We do not use personal data
                  to make solely automated decisions that have legal or similarly significant effects.
                </p>
              </section>

              <section id='how-we-use-information' aria-labelledby='how-we-use-information-heading' className='scroll-mt-28'>
                <h2 id='how-we-use-information-heading' className={sectionTitleClassName}>3. How we use your information</h2>
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

              <section id='lawful-bases' aria-labelledby='lawful-bases-heading' className='scroll-mt-28'>
                <h2 id='lawful-bases-heading' className={sectionTitleClassName}>4. Lawful bases for processing</h2>
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
                <p className={sectionTextClassName}>
                  Allergy, intolerance or other health-related dietary information may be special-category data.
                  We collect it only through the separate optional field and record the consent wording version and
                  server time with the information. Where you choose to give it to us, we rely on consent under
                  Article 6(1)(a) UK GDPR and explicit consent under Article 9(2)(a) UK GDPR to assess whether we can
                  supply safely and to fulfil the request. You may withdraw that consent by emailing
                  hello@olgishcakes.co.uk. We will then permanently erase the health content and retain only the
                  consent version and time and the withdrawal time as non-health accountability evidence. We may
                  then be unable to supply the affected product or service safely.
                </p>
                <p className={sectionTextClassName}>
                  Separately from withdrawal, we minimise this information after its operational purpose ends. A
                  genuine enquiry closure or verified order completion, delivery or cancellation starts a
                  server-controlled 30-day period. At the end of that period we permanently erase the health content
                  and retain only the consent version and time, the retention deadline and the erasure time. A
                  specific legal hold pauses that scheduled erasure only while the narrower legal-claims rule below
                  applies.
                </p>
                <p className={sectionTextClassName}>
                  We rely on Article 6(1)(f) and Article 9(2)(f) only where processing is strictly necessary and
                  proportionate to establish, exercise or defend an actual or reasonably anticipated legal claim.
                  We do not use those provisions as a general reason to keep health information after consent is
                  withdrawn.
                </p>
              </section>

              <section id='analytics' aria-labelledby='analytics-heading' className='scroll-mt-28'>
                <h2 id='analytics-heading' className={sectionTitleClassName}>5. Analytics and session insights</h2>
                <p className={sectionTextClassName}>
                  You can choose Google Analytics for page and journey analytics, Microsoft Clarity for heatmaps and
                  session recordings, and Google Ads for advertising measurement and personalisation. We load only
                  the services you select through Google Tag Manager. You can withdraw any choice at any time using
                  the “Manage cookies” control in the site footer.
                </p>
              </section>

              <section id='sharing' aria-labelledby='sharing-heading' className='scroll-mt-28'>
                <h2 id='sharing-heading' className={sectionTitleClassName}>6. Sharing your data</h2>
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
                <p className={sectionTextClassName}>
                  Each provider may only use the information for the service it supplies to us or as otherwise
                  required by law. We review access and share only the information reasonably needed for that
                  purpose. Protected dietary health information is stored in our restricted Supabase enquiry or
                  order record. It is not included in Telegram previews or customer confirmation emails; operational
                  emails tell authorised staff only that protected information was supplied and direct them to the
                  authenticated admin record.
                </p>
              </section>

              <section id='retention' aria-labelledby='retention-heading' className='scroll-mt-28'>
                <h2 id='retention-heading' className={sectionTitleClassName}>7. Data retention</h2>
                <p className={sectionTextClassName}>
                  We review retained personal data at least annually. Our normal periods are:
                </p>
                <ul className={listClassName}>
                  {retentionItems.map(item => (
                    <li key={item} className={listItemClassName}>
                      <span className={listBulletClassName} aria-hidden='true' />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className={sectionTextClassName}>
                  We may keep non-health records longer where the law requires it, a complaint or legal claim is
                  active, or a court or regulator requires preservation. Health information is handled under the
                  narrower legal-claims rule described in section 4. When the reason ends, we delete or anonymise
                  the data.
                </p>
              </section>

              <section id='rights' aria-labelledby='rights-heading' className='scroll-mt-28'>
                <h2 id='rights-heading' className={sectionTitleClassName}>8. Your rights</h2>
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
                  your privacy. Rights can depend on the circumstances and lawful basis. We normally respond within
                  one month.
                </p>
                <div className='alert alert-info mt-5 items-start text-sm'>
                  <div>
                    <p className='font-semibold'>Your right to object</p>
                    <p className='mt-1 leading-6'>
                      You may object at any time to processing based on our legitimate interests. Tell us what you
                      object to and why. We will stop unless we can demonstrate compelling legitimate grounds or
                      need the information to establish, exercise or defend legal claims.
                    </p>
                  </div>
                </div>
                <p className={sectionTextClassName}>
                  You may complain to the ICO at{' '}
                  <a className='link link-primary' href='https://ico.org.uk/make-a-complaint/' rel='noreferrer'>
                    ico.org.uk/make-a-complaint
                  </a>
                  , or call 0303 123 1113. We would appreciate the opportunity to address your concern first.
                </p>
              </section>

              <section id='international-transfers' aria-labelledby='international-transfers-heading' className='scroll-mt-28'>
                <h2 id='international-transfers-heading' className={sectionTitleClassName}>9. International transfers</h2>
                <p className={sectionTextClassName}>
                  Some providers listed above may process information outside the UK. Before making a restricted
                  transfer, we use an applicable UK adequacy regulation or an approved safeguard such as the UK
                  International Data Transfer Agreement or the UK Addendum to the EU Standard Contractual Clauses.
                  Where required, we also complete a transfer risk assessment and apply additional security
                  measures. Contact us if you would like more information or a copy of the relevant safeguard;
                  commercially confidential wording may be redacted.
                </p>
              </section>

              <section id='cookies' aria-labelledby='cookies-heading' className='scroll-mt-28'>
                <h2 id='cookies-heading' className={sectionTitleClassName}>10. Cookies and preference controls</h2>
                <p className={sectionTextClassName}>
                  For detailed cookie information, please read our cookie policy. You can update your preferences at
                  any time via the “Manage cookies” link in the footer.
                </p>
              </section>

              <section id='changes' aria-labelledby='changes-heading' className='scroll-mt-28'>
                <h2 id='changes-heading' className={sectionTitleClassName}>11. Changes to this policy</h2>
                <p className={sectionTextClassName}>
                  We may update this policy from time to time to reflect changes in the law or our services. When we
                  do, we will update the date at the top of this page.
                </p>
              </section>

              <section id='contact' aria-labelledby='contact-heading' className='scroll-mt-28'>
                <h2 id='contact-heading' className={sectionTitleClassName}>12. Contact us</h2>
                <p className={sectionTextClassName}>
                  If you have any questions about this Privacy Policy or how we handle personal data, please reach
                  out:
                </p>
                <LegalContactDetails />
              </section>
            </article>

            <aside className="space-y-6">
              <LegalPageNavigation items={navigationItems} variant='desktop' />

              <div className={`${cardClassName} p-6`}>
                <h3 className="font-oldenburg text-lg text-primary-800">Need help quickly?</h3>
                <p className="mt-3 font-body text-sm text-base-content leading-6">
                  If you want to ask a privacy question or change your details, send us a message and we will respond
                  as soon as we can.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <a href="/contact" className={actionButtonClassName}>
                    Send a message
                  </a>
                  <a href="/" className={outlineButtonClassName}>
                    Back to home
                  </a>
                </div>
              </div>

              <div className={`${cardClassName} p-6`}>
                <h3 className="font-oldenburg text-lg text-primary-800">Cookie choices</h3>
                <p className="mt-3 font-body text-sm text-base-content leading-6">
                  Analytics cookies are always optional. You are in control, and you can change your choice anytime.
                </p>
                <div className="mt-4">
                  <a href="/cookies" className={outlineButtonClassName}>
                    View cookie policy
                  </a>
                </div>
              </div>

              <div className={`${cardClassName} no-print p-6`}>
                <h2 className='font-oldenburg text-lg text-primary-800'>Other policies</h2>
                <LegalPolicyLinks current='/privacy' />
              </div>
            </aside>
          </div>
        </section>
    </div>
  )
}
