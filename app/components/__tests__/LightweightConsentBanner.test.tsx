/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import {
  consentBannerDescription,
  consentCookieName,
  consentDialogStateEventName,
  consentOpenEventName,
  type ConsentChoices
} from '@/app/lib/consent-config'
import {
  createConsentRecord,
  serializeConsentRecord
} from '@/app/lib/consent-record'
import { saveConsentChoices } from '@/app/lib/consent-runtime'
import { LightweightConsentBanner } from '../LightweightConsentBanner'

type ConsentTestWindow = Window & typeof globalThis & {
  __olgishAnalyticsConsent?: boolean
  __olgishApplyConsentRecord?: unknown
  __olgishConsentAwareGtagInstalled?: boolean
  __olgishConsentPreferencesRequested?: boolean
  __olgishConsentRecord?: unknown
  __olgishGtmLoaded?: boolean
  clarity?: jest.Mock
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

const originalGtmId = process.env.NEXT_PUBLIC_GTM_ID

function clearCookies() {
  document.cookie.split(';').forEach(entry => {
    const cookieName = entry.trim().split('=')[0]
    if (cookieName) {
      document.cookie = `${cookieName}=; Max-Age=0; Path=/`
    }
  })
}

function resetRuntime(clearStoredConsent = true) {
  const runtimeWindow = window as ConsentTestWindow
  document.querySelectorAll('#gtm-consent-script').forEach(element => element.remove())
  if (clearStoredConsent) {
    clearCookies()
    window.localStorage.clear()
  }
  Reflect.deleteProperty(runtimeWindow, 'dataLayer')
  Reflect.deleteProperty(runtimeWindow, 'gtag')
  Reflect.deleteProperty(runtimeWindow, 'clarity')
  Reflect.deleteProperty(runtimeWindow, '__olgishAnalyticsConsent')
  Reflect.deleteProperty(runtimeWindow, '__olgishApplyConsentRecord')
  Reflect.deleteProperty(runtimeWindow, '__olgishConsentAwareGtagInstalled')
  Reflect.deleteProperty(runtimeWindow, '__olgishConsentPreferencesRequested')
  Reflect.deleteProperty(runtimeWindow, '__olgishConsentRecord')
  Reflect.deleteProperty(runtimeWindow, '__olgishGtmLoaded')
}

function renderWithBootstrap() {
  const result = render(<LightweightConsentBanner />)
  const script = result.container.querySelector('script')

  if (!script?.textContent) {
    throw new Error('Expected the consent bootstrap script')
  }

  window.eval(script.textContent)
  return result
}

function getGtagCalls() {
  return ((window as ConsentTestWindow).dataLayer ?? [])
    .filter(entry => Object.prototype.toString.call(entry) === '[object Arguments]')
    .map(entry => Array.from(entry as ArrayLike<unknown>))
}

function writeCanonicalChoice(choices: ConsentChoices) {
  const record = createConsentRecord(choices, 'preferences')
  document.cookie = `${consentCookieName}=${serializeConsentRecord(record)}; Path=/`
}

describe('LightweightConsentBanner', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_GTM_ID = 'GTM-TEST123'
  })

  beforeEach(() => {
    window.history.replaceState(null, '', '/')
    resetRuntime()
  })

  afterAll(() => {
    if (originalGtmId) {
      process.env.NEXT_PUBLIC_GTM_ID = originalGtmId
    } else {
      delete process.env.NEXT_PUBLIC_GTM_ID
    }
  })

  it('shows the server-rendered first layer immediately with the approved copy and actions', () => {
    renderWithBootstrap()

    const banner = screen.getByRole('complementary', { name: 'Cookie preferences' })
    const policyLink = screen.getByRole('link', { name: 'Cookie policy' })

    expect(banner).toBeVisible()
    expect(banner).toHaveAttribute('aria-labelledby', 'cookie-banner-title')
    expect(banner).toHaveAttribute('aria-describedby', 'cookie-banner-description')
    expect(screen.getByText(consentBannerDescription)).toBeInTheDocument()
    expect(policyLink).toHaveClass('min-h-11', 'min-w-11')
    expect(screen.getByRole('button', { name: 'Choose preferences' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject optional cookies' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept optional cookies' })).toBeInTheDocument()
  })

  it('uses an in-flow responsive notice instead of a fixed overlay', () => {
    renderWithBootstrap()

    const banner = screen.getByRole('complementary', { name: 'Cookie preferences' })
    const layout = banner.firstElementChild
    const actions = screen.getByRole('button', { name: 'Choose preferences' }).parentElement

    expect(banner).toHaveClass('w-full')
    expect(banner).not.toHaveClass('fixed', 'bottom-4', 'left-4', 'right-4')
    expect(layout).toHaveClass(
      'homepage-container',
      'tablet:grid-cols-[minmax(0,1fr)_minmax(0,32rem)]'
    )
    expect(actions).toHaveClass('grid-cols-2', 'tablet:grid-cols-3')
  })

  it('sets all Google Consent Mode v2 defaults before loading any vendor', () => {
    renderWithBootstrap()

    expect(getGtagCalls()[0]).toEqual([
      'consent',
      'default',
      {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      }
    ])
    expect(document.getElementById('gtm-consent-script')).not.toBeInTheDocument()
  })

  it('does not render the consent runtime for a missing or unsafe GTM configuration', () => {
    process.env.NEXT_PUBLIC_GTM_ID = 'GTM-TEST</script>'
    const { container } = render(<LightweightConsentBanner />)

    expect(container).toBeEmptyDOMElement()
    process.env.NEXT_PUBLIC_GTM_ID = 'GTM-TEST123'
  })

  it('stores one canonical all-denied record and no local-storage duplicate', () => {
    renderWithBootstrap()
    fireEvent.click(screen.getByRole('button', { name: 'Reject optional cookies' }))

    expect(document.cookie).toContain(`${consentCookieName}=`)
    expect(window.localStorage).toHaveLength(0)
    expect(document.getElementById('gtm-consent-script')).not.toBeInTheDocument()
    expect(document.getElementById('olgish-consent-banner')).not.toBeVisible()
  })

  it('requests the lazy dialog and hides the first layer while it is open', () => {
    const openListener = jest.fn()
    window.addEventListener(consentOpenEventName, openListener)
    renderWithBootstrap()

    fireEvent.click(screen.getByRole('button', { name: 'Choose preferences' }))
    window.dispatchEvent(new CustomEvent(consentDialogStateEventName, {
      detail: { isOpen: true }
    }))

    expect(openListener).toHaveBeenCalledTimes(1)
    expect(document.getElementById('olgish-consent-banner')).not.toBeVisible()

    window.dispatchEvent(new CustomEvent(consentDialogStateEventName, {
      detail: { isOpen: false }
    }))
    expect(screen.getByRole('complementary', { name: 'Cookie preferences' })).toBeVisible()
    window.removeEventListener(consentOpenEventName, openListener)
  })

  it('migrates granular Klaro first and removes every legacy source', () => {
    document.cookie = `klaro=${encodeURIComponent(JSON.stringify({
      'google-analytics': false,
      'microsoft-clarity': true,
      'google-ads': false
    }))}; Path=/`
    document.cookie = 'olgish_cookie_consent=accepted; Path=/'
    window.localStorage.setItem('olgishCookieConsent', 'accepted')
    window.localStorage.setItem('cookieConsent', 'accepted')

    renderWithBootstrap()

    expect(document.cookie).toContain(`${consentCookieName}=`)
    expect(document.cookie).not.toContain('klaro=')
    expect(document.cookie).not.toContain('olgish_cookie_consent=')
    expect(window.localStorage).toHaveLength(0)
    expect(getGtagCalls()).toContainEqual([
      'consent',
      'update',
      {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      }
    ])
    expect(document.getElementById('gtm-consent-script')).toBeInTheDocument()
  })

  it('does not let stale legacy acceptance override a malformed canonical record', () => {
    document.cookie = `${consentCookieName}=malformed; Path=/`
    window.localStorage.setItem('olgishCookieConsent', 'accepted')

    renderWithBootstrap()

    expect(screen.getByRole('complementary', { name: 'Cookie preferences' })).toBeVisible()
    expect(document.cookie).not.toContain(`${consentCookieName}=`)
    expect(window.localStorage).toHaveLength(0)
    expect(document.getElementById('gtm-consent-script')).not.toBeInTheDocument()
  })

  it.each([
    { googleAnalytics: false, microsoftClarity: false, googleAds: false },
    { googleAnalytics: true, microsoftClarity: false, googleAds: false },
    { googleAnalytics: false, microsoftClarity: true, googleAds: false },
    { googleAnalytics: false, microsoftClarity: false, googleAds: true },
    { googleAnalytics: true, microsoftClarity: true, googleAds: false },
    { googleAnalytics: true, microsoftClarity: false, googleAds: true },
    { googleAnalytics: false, microsoftClarity: true, googleAds: true },
    { googleAnalytics: true, microsoftClarity: true, googleAds: true }
  ])('enforces the service combination %# without reloading', choices => {
    writeCanonicalChoice(choices)
    renderWithBootstrap()

    expect(getGtagCalls()).toContainEqual([
      'consent',
      'update',
      {
        ad_storage: choices.googleAds ? 'granted' : 'denied',
        analytics_storage: choices.googleAnalytics ? 'granted' : 'denied',
        ad_user_data: choices.googleAds ? 'granted' : 'denied',
        ad_personalization: choices.googleAds ? 'granted' : 'denied'
      }
    ])
    expect(Boolean(document.getElementById('gtm-consent-script'))).toBe(
      choices.googleAnalytics || choices.microsoftClarity || choices.googleAds
    )
  })

  it('revokes Clarity and deletes accessible vendor cookies immediately', () => {
    writeCanonicalChoice({
      googleAnalytics: true,
      microsoftClarity: true,
      googleAds: true
    })
    const clarity = jest.fn()
    ;(window as ConsentTestWindow).clarity = clarity
    renderWithBootstrap()
    document.cookie = '_ga=analytics; Path=/'
    document.cookie = '_ga_TEST=analytics; Path=/'
    document.cookie = '_gid=analytics; Path=/'
    document.cookie = '_gcl_aw=ads; Path=/'
    document.cookie = '_clck=clarity; Path=/'
    document.cookie = '_clsk=clarity; Path=/'

    saveConsentChoices({
      googleAnalytics: false,
      microsoftClarity: false,
      googleAds: false
    }, 'preferences')

    expect(document.cookie).not.toMatch(/_ga|_gid|_gcl_|_clck|_clsk/)
    expect(clarity).toHaveBeenCalledWith('consentv2', {
      source: 'olgish-cakes',
      ad_Storage: 'denied',
      analytics_Storage: 'denied'
    })
    expect(clarity).toHaveBeenCalledWith('consent', false)
  })

  it('keeps the latest choice authoritative across accept, reject and reload', () => {
    const firstRender = renderWithBootstrap()
    fireEvent.click(screen.getByRole('button', { name: 'Accept optional cookies' }))
    saveConsentChoices({
      googleAnalytics: false,
      microsoftClarity: false,
      googleAds: false
    }, 'preferences')
    firstRender.unmount()
    resetRuntime(false)

    renderWithBootstrap()

    expect(document.getElementById('gtm-consent-script')).not.toBeInTheDocument()
    expect((window as ConsentTestWindow).__olgishAnalyticsConsent).toBe(false)
  })

  it('recovers from a GTM runtime load failure without granting new consent', () => {
    renderWithBootstrap()
    fireEvent.click(screen.getByRole('button', { name: 'Accept optional cookies' }))
    const failedScript = document.getElementById('gtm-consent-script')

    failedScript?.dispatchEvent(new Event('error'))
    expect(document.getElementById('gtm-consent-script')).not.toBeInTheDocument()

    saveConsentChoices({
      googleAnalytics: true,
      microsoftClarity: true,
      googleAds: true
    }, 'preferences')
    expect(document.getElementById('gtm-consent-script')).toBeInTheDocument()
  })

  it('does not run consent side effects on admin pages', () => {
    window.history.replaceState(null, '', '/admin/orders')
    renderWithBootstrap()

    expect(document.getElementById('olgish-consent-banner')).not.toBeVisible()
    expect((window as ConsentTestWindow).dataLayer).toBeUndefined()
  })
})
