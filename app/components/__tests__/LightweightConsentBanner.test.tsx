/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LightweightConsentBanner } from '../LightweightConsentBanner'

type ConsentTestWindow = Window & typeof globalThis & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  __olgishAnalyticsConsent?: boolean
  __olgishConsentAwareGtagInstalled?: boolean
  __loadOlgishGtmOnce?: () => void
  __olgishGtmLoaded?: boolean
}

function renderBannerWithController() {
  const result = render(<LightweightConsentBanner />)
  const script = result.container.querySelector('script')

  if (!script?.textContent) {
    throw new Error('Expected consent controller script to render')
  }

  window.eval(script.textContent)

  return result
}

function getDataLayerCommands() {
  return (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>))
}

describe('LightweightConsentBanner', () => {
  const consentTestWindow = window as ConsentTestWindow

  beforeEach(() => {
    window.history.replaceState(null, '', '/')
    window.localStorage.clear()
    document.cookie = 'olgish_cookie_consent=; Max-Age=0; Path=/'
    document.cookie = 'klaro=; Max-Age=0; Path=/'
    document.querySelectorAll('#gtm-consent-script, #olgish-consent-preferences-runtime').forEach((element) => {
      element.remove()
    })
    Reflect.deleteProperty(consentTestWindow, 'dataLayer')
    Reflect.deleteProperty(consentTestWindow, 'gtag')
    Reflect.deleteProperty(consentTestWindow, '__olgishAnalyticsConsent')
    Reflect.deleteProperty(consentTestWindow, '__olgishConsentAwareGtagInstalled')
    delete consentTestWindow.__olgishGtmLoaded
    delete consentTestWindow.__loadOlgishGtmOnce
  })

  it('shows immediately when no cookie choice has been stored', () => {
    renderBannerWithController()

    expect(screen.getByRole('complementary', { name: 'Cookie preferences' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept optional cookies' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cookie policy' })).toHaveAttribute('href', '/cookies')
  })

  it('does not render direct GA or placeholder GTM tags in initial HTML', () => {
    const { container } = render(<LightweightConsentBanner />)

    expect(container.querySelector('script[src*="googletagmanager"]')).not.toBeInTheDocument()
    expect(container.querySelector('iframe[src*="googletagmanager"]')).not.toBeInTheDocument()
    expect(container.innerHTML).not.toContain('gtag/js?id=')
    expect(container.innerHTML).not.toContain('GTM-XXXXXXX')
    expect(container.innerHTML).not.toContain('G-QGQC58H2LD')
  })

  it('drops analytics events before consent and allows them after acceptance', () => {
    renderBannerWithController()

    window.gtag('event', 'pre_consent_event')

    expect(getDataLayerCommands()).toEqual([
      ['consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      }],
      ['set', 'ads_data_redaction', true]
    ])

    fireEvent.click(screen.getByRole('button', { name: 'Accept optional cookies' }))
    window.gtag('event', 'post_consent_event')

    expect(getDataLayerCommands()).toEqual(expect.arrayContaining([
      ['event', 'post_consent_event']
    ]))
    expect(window.__olgishAnalyticsConsent).toBe(true)
  })

  it('stores a declined choice without loading the heavy preferences runtime', () => {
    const consentListener = jest.fn()
    window.addEventListener('cookie-consent', consentListener)

    renderBannerWithController()
    fireEvent.click(screen.getByRole('button', { name: 'Reject optional cookies' }))

    expect(window.localStorage.getItem('olgishCookieConsent')).toBe('declined')
    expect(window.localStorage.getItem('cookieConsent')).toBe('declined')
    expect(document.getElementById('klaro-script')).not.toBeInTheDocument()
    expect(consentListener).toHaveBeenCalledWith(expect.objectContaining({
      detail: {
        status: 'declined'
      }
    }))
    expect(screen.queryByRole('complementary', { name: 'Cookie preferences' })).not.toBeInTheDocument()

    window.removeEventListener('cookie-consent', consentListener)
  })

  it('defers detailed preferences until the user asks to choose', async () => {
    renderBannerWithController()
    fireEvent.click(screen.getByRole('button', { name: 'Choose' }))

    await waitFor(() => {
      expect(screen.queryByRole('complementary', { name: 'Cookie preferences' })).not.toBeInTheDocument()
    })
  })

  it('hides after a stored choice exists', async () => {
    window.localStorage.setItem('olgishCookieConsent', 'accepted')

    renderBannerWithController()

    await waitFor(() => {
      expect(screen.queryByRole('complementary', { name: 'Cookie preferences' })).not.toBeInTheDocument()
    })
  })

  it('hides after detailed Klaro preferences have been saved', async () => {
    const gtagMock = jest.fn()
    window.gtag = gtagMock
    document.cookie = `klaro=${encodeURIComponent(JSON.stringify({
      'google-analytics': true,
      'google-ads': false
    }))}; Path=/`

    renderBannerWithController()

    await waitFor(() => {
      expect(screen.queryByRole('complementary', { name: 'Cookie preferences' })).not.toBeInTheDocument()
    })
    expect(gtagMock).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'denied',
      analytics_storage: 'granted',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    })
  })

  it('does not grant Google Analytics consent when only Microsoft Clarity is saved', async () => {
    const gtagMock = jest.fn()
    window.gtag = gtagMock
    document.cookie = `klaro=${encodeURIComponent(JSON.stringify({
      'google-analytics': false,
      'microsoft-clarity': true,
      'google-ads': false
    }))}; Path=/`

    renderBannerWithController()

    await waitFor(() => {
      expect(screen.queryByRole('complementary', { name: 'Cookie preferences' })).not.toBeInTheDocument()
    })
    expect(gtagMock).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    })
  })

  it('does not run consent side effects on admin pages', () => {
    const gtagMock = jest.fn()
    window.history.replaceState(null, '', '/admin/orders')
    window.localStorage.setItem('olgishCookieConsent', 'accepted')
    window.gtag = gtagMock

    renderBannerWithController()

    const banner = document.getElementById('olgish-consent-banner')
    expect(banner).not.toBeVisible()
    expect(gtagMock).not.toHaveBeenCalled()
    expect(document.getElementById('gtm-consent-script')).not.toBeInTheDocument()
  })
})
