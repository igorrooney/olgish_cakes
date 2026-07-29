/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import CookiePolicyPage, { metadata as cookieMetadata } from '@/app/cookies/page'
import PrivacyPolicyPage, { metadata as privacyMetadata } from '@/app/privacy/page'
import TermsOfServicePage, { metadata as termsMetadata } from '../page'
import {
  CURRENT_LEGAL_DATE_ISO,
  CURRENT_TERMS_PDF_PATH,
  CURRENT_TERMS_VERSION
} from '@/lib/legal/legal-config'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode
    href: string
  }) => <a href={href} {...props}>{children}</a>
}))

afterEach(() => {
  cleanup()
})

describe('legal pages', () => {
  it('renders complete, actionable and versioned terms without adding a nested main landmark', () => {
    const { container } = render(<TermsOfServicePage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Terms of Service for Olgish Cakes' })).toBeInTheDocument()
    expect(screen.getByText(`Version: ${CURRENT_TERMS_VERSION}`)).toBeInTheDocument()
    expect(container.querySelector(`time[datetime="${CURRENT_LEGAL_DATE_ISO}"]`)).toBeInTheDocument()
    expect(container.querySelector('main')).not.toBeInTheDocument()
    expect(container.querySelectorAll('article > section[id]')).toHaveLength(14)
    expect(screen.getByRole('heading', { level: 2, name: '6. Cancellations and refunds' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '9. Allergens and dietary requirements' })).toBeInTheDocument()
    expect(screen.getByText(/we do not exclude or limit liability for death or personal injury/i)).toBeInTheDocument()
    expect(screen.getByText(/we are not VAT registered/i)).toBeInTheDocument()
    expect(screen.getByText(/optional cancellation form/i)).toBeInTheDocument()
    expect(screen.getByText(/contract starts only when you accept our final offer/i)).toBeInTheDocument()
    expect(screen.getByText(/workshop, catering service or another leisure service/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /download pdf/i })).toHaveAttribute('href', CURRENT_TERMS_PDF_PATH)
    expect(screen.getAllByRole('link', { name: 'hello@olgishcakes.co.uk' })[0]).toHaveAttribute(
      'href',
      'mailto:hello@olgishcakes.co.uk'
    )
    expect(screen.getAllByRole('link', { name: '+44 786 721 8194' })[0]).toHaveAttribute(
      'href',
      'tel:+44 786 721 8194'
    )
  })

  it.each([
    ['terms', termsMetadata, 'https://olgishcakes.co.uk/terms'],
    ['privacy', privacyMetadata, 'https://olgishcakes.co.uk/privacy'],
    ['cookies', cookieMetadata, 'https://olgishcakes.co.uk/cookies']
  ])('uses clean website metadata for %s', (_name, metadata, canonical) => {
    expect(metadata.openGraph).toMatchObject({
      type: 'website'
    })
    expect(metadata.alternates).toMatchObject({
      canonical
    })
    expect(metadata).not.toHaveProperty('keywords')
    expect(metadata).not.toHaveProperty('verification')
    expect(metadata).not.toHaveProperty('other')
  })

  it.each([
    ['privacy', <PrivacyPolicyPage />, 12],
    ['cookies', <CookiePolicyPage />, 10]
  ])('adds section navigation, current dates and full contacts to %s', (_name, page, sectionCount) => {
    const { container } = render(page)

    expect(container.querySelector('main')).not.toBeInTheDocument()
    expect(container.querySelector(`time[datetime="${CURRENT_LEGAL_DATE_ISO}"]`)).toBeInTheDocument()
    expect(container.querySelectorAll('article > section[id]')).toHaveLength(sectionCount)
    expect(screen.getAllByRole('navigation', { name: 'Page sections' })).toHaveLength(2)
    expect(screen.getByText(/15 Allerton Grange Avenue/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'hello@olgishcakes.co.uk' })).toHaveAttribute(
      'href',
      'mailto:hello@olgishcakes.co.uk'
    )
  })

  it('identifies processors, retention periods and the separate right to object', () => {
    render(<PrivacyPolicyPage />)

    expect(screen.getByText(/supabase, for storing enquiries/i)).toBeInTheDocument()
    expect(screen.getByText(/normally six years/i)).toBeInTheDocument()
    expect(screen.getByText('Your right to object')).toBeInTheDocument()
    expect(screen.getByText(/International Data Transfer Agreement/i)).toBeInTheDocument()
  })

  it('discloses the consent cookie and local-storage entry used by the runtime', () => {
    render(<CookiePolicyPage />)

    expect(screen.getByText('olgish_cookie_consent')).toBeInTheDocument()
    expect(screen.getByText('olgishCookieConsent')).toBeInTheDocument()
    expect(screen.getByText('Local storage')).toBeInTheDocument()
  })
})
