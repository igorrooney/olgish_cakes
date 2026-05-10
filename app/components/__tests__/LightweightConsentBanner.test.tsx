/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LightweightConsentBanner } from '../LightweightConsentBanner'

type ConsentTestWindow = Window & typeof globalThis & {
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
    delete consentTestWindow.__olgishGtmLoaded
    delete consentTestWindow.__loadOlgishGtmOnce
  })

  it('shows immediately when no cookie choice has been stored', () => {
    renderBannerWithController()

    expect(screen.getByRole('complementary', { name: 'Cookie preferences' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept optional cookies' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cookie policy' })).toHaveAttribute('href', '/cookies')
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
