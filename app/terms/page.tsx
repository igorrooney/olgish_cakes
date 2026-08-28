import {
  LegalContactDetails,
  LegalLastUpdated,
  LegalPageNavigation,
  LegalPolicyLinks
} from '@/app/components/legal/LegalPageComponents'
import { legalPageStyles } from '@/app/components/legal/legal-page-styles'
import {
  createLegalPageMetadata,
  CURRENT_TERMS_PDF_PATH,
  CURRENT_TERMS_VERSION
} from '@/lib/legal/legal-config'
import { termsSections, termsSummaryItems } from '@/lib/legal/terms-content'

const metaTitle = 'Terms of Service for Olgish Cakes'
const metaDescription = 'Read the Olgish Cakes terms for order requests, contract acceptance, prices, payments, delivery, cancellations, allergens and customer rights in the UK.'

export const metadata = createLegalPageMetadata({
  title: metaTitle,
  description: metaDescription,
  path: '/terms'
})

const navigationItems = termsSections.map(({ id, title }) => ({ id, title }))

export default function TermsOfServicePage() {
  return (
    <div className='legal-document min-h-screen bg-base-100'>
      <section className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-b from-base-200 via-base-100 to-base-100' />
        <div className='absolute -top-20 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-secondary/20 blur-3xl' />

        <div className='relative mx-auto max-w-6xl px-4 pb-12 pt-10 tablet:pb-16'>
          <div className='mt-6 grid gap-8 tablet:grid-cols-[1.1fr_0.9fr] tablet:items-start'>
            <div className='space-y-4'>
              <span className={legalPageStyles.badge}>Terms &amp; ordering rules</span>
              <h1 className={legalPageStyles.heroTitle}>
                Terms of Service for Olgish Cakes
              </h1>
              <p className={legalPageStyles.heroText}>
                These terms explain how an order request becomes a contract, what we each need to do,
                and the rights and remedies that apply to orders from our Leeds bakery.
              </p>
              <LegalLastUpdated />
              <p className='font-sans text-xs uppercase tracking-[0.2em] text-base-content/60'>
                Version: {CURRENT_TERMS_VERSION}
              </p>
            </div>

            <div className={legalPageStyles.card}>
              <div className='p-6'>
                <h2 className='font-oldenburg text-lg text-primary-800'>Quick summary</h2>
                <ul className={legalPageStyles.summaryList}>
                  {termsSummaryItems.map((item) => (
                    <li key={item} className={legalPageStyles.summaryItem}>
                      <span className={legalPageStyles.listBullet} aria-hidden='true' />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className='legal-page-actions no-print mt-6 flex flex-wrap gap-3'>
                  <a href='/contact' className={legalPageStyles.actionButton}>
                    Ask a question
                  </a>
                  <a
                    href={CURRENT_TERMS_PDF_PATH}
                    className={legalPageStyles.outlineButton}
                    download
                  >
                    Download PDF
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

      <section className='mx-auto max-w-6xl px-4 pb-16'>
        <div className='grid gap-10 tablet:grid-cols-[minmax(0,1fr)_280px]'>
          <article className='space-y-10'>
            {termsSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-heading`}
                className='scroll-mt-28 break-inside-avoid-page'
              >
                <h2 id={`${section.id}-heading`} className={legalPageStyles.sectionTitle}>
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className={legalPageStyles.sectionText}>
                    {paragraph}
                  </p>
                ))}
                {section.items?.length ? (
                  <ul className={legalPageStyles.list}>
                    {section.items.map((item) => (
                      <li key={item} className={legalPageStyles.listItem}>
                        <span className={legalPageStyles.listBullet} aria-hidden='true' />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.links?.length ? (
                  <ul className={legalPageStyles.list}>
                    {section.links.map((link) => (
                      <li key={link.href} className={legalPageStyles.listItem}>
                        <span className={legalPageStyles.listBullet} aria-hidden='true' />
                        <a
                          className='link link-primary'
                          href={link.href}
                          rel={link.href.startsWith('https://olgishcakes.co.uk') ? undefined : 'noopener noreferrer'}
                          target={link.href.startsWith('https://olgishcakes.co.uk') ? undefined : '_blank'}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.id === 'complaints-law-and-contact' ? <LegalContactDetails /> : null}
              </section>
            ))}

            <div
              id='frequently-asked-questions'
              aria-labelledby='frequently-asked-questions-heading'
              className={`${legalPageStyles.card} no-print p-6`}
            >
              <h2 id='frequently-asked-questions-heading' className='font-oldenburg text-lg text-primary-800'>
                Practical ordering questions
              </h2>
              <p className='mt-3 font-body text-sm leading-6 text-base-content'>
                For lead times, portions, delivery and design questions, visit our frequently asked questions.
              </p>
              <a className={`${legalPageStyles.outlineButton} mt-4`} href='/faqs'>
                Read our FAQs
              </a>
            </div>
          </article>

          <aside className='space-y-6'>
            <LegalPageNavigation items={navigationItems} variant='desktop' />
            <div className={`${legalPageStyles.card} no-print p-6`}>
              <h2 className='font-oldenburg text-lg text-primary-800'>Other policies</h2>
              <LegalPolicyLinks current='/terms' />
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
