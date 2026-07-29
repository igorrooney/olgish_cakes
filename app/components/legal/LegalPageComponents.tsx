import {
  CURRENT_LEGAL_DATE,
  CURRENT_LEGAL_DATE_ISO,
  LEGAL_BUSINESS_DETAILS
} from '@/lib/legal/legal-config'
import { EMAIL_UTILS, PHONE_UTILS } from '@/lib/constants'
import { legalPageStyles } from './legal-page-styles'

export type LegalNavigationItem = {
  id: string
  title: string
}

type LegalPageNavigationProps = {
  items: readonly LegalNavigationItem[]
  variant: 'mobile' | 'desktop'
}

export function LegalPageNavigation({
  items,
  variant
}: LegalPageNavigationProps) {
  const navigationLinks = (
    <ol className='space-y-2'>
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className='link link-hover block rounded-lg px-2 py-1 font-body text-sm leading-5 text-base-content/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          >
            {item.title}
          </a>
        </li>
      ))}
    </ol>
  )

  if (variant === 'mobile') {
    return (
      <details className={`legal-page-navigation no-print collapse collapse-arrow ${legalPageStyles.card} tablet:hidden`}>
        <summary className='collapse-title min-h-0 px-5 py-4 font-oldenburg text-base text-primary-800'>
          On this page
        </summary>
        <nav aria-label='Page sections' className='collapse-content px-5 pb-5'>
          {navigationLinks}
        </nav>
      </details>
    )
  }

  return (
    <nav
      aria-label='Page sections'
      className={`legal-page-navigation no-print sticky top-24 hidden p-6 tablet:block ${legalPageStyles.card}`}
    >
      <h2 className='font-oldenburg text-lg text-primary-800'>On this page</h2>
      <div className='mt-4'>{navigationLinks}</div>
    </nav>
  )
}

export function LegalLastUpdated() {
  return (
    <p className='font-sans text-xs uppercase tracking-[0.2em] text-base-content/60'>
      Last updated:{' '}
      <time dateTime={CURRENT_LEGAL_DATE_ISO}>{CURRENT_LEGAL_DATE}</time>
    </p>
  )
}

export function LegalContactDetails() {
  const { address, email, phone, proprietor, tradingName } = LEGAL_BUSINESS_DETAILS

  return (
    <address className='mt-4 space-y-2 font-body text-sm not-italic text-base-content tablet:text-base'>
      <p>
        {tradingName}, operated by {proprietor}
      </p>
      <p>
        <a className='link link-primary' href={EMAIL_UTILS.mailtoLink}>
          {email}
        </a>
      </p>
      <p>
        <a className='link link-primary' href={PHONE_UTILS.telLink}>
          {phone}
        </a>
      </p>
      <p>
        {address.street}, {address.city}, {address.postcode}, {address.country}
      </p>
    </address>
  )
}

type LegalPolicyLinksProps = {
  current: '/terms' | '/privacy' | '/cookies'
}

const policyLinks = [
  { href: '/terms', label: 'Terms of service' },
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/cookies', label: 'Cookie policy' }
] as const

export function LegalPolicyLinks({ current }: LegalPolicyLinksProps) {
  return (
    <ul className='mt-4 space-y-2'>
      {policyLinks
        .filter((link) => link.href !== current)
        .map((link) => (
          <li key={link.href}>
            <a className='link link-primary font-body text-sm' href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
    </ul>
  )
}
