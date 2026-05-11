/**
 * @jest-environment jsdom
 */
type KlaroService = {
  name: string
  onAccept?: () => void
  onDecline?: () => void
}

type ConsentRuntimeWindow = Window & typeof globalThis & {
  __olgishAnalyticsConsent?: boolean
  __olgishConsentAwareGtagInstalled?: boolean
  __olgishGtmLoaded?: boolean
  __olgishOpenConsentPreferences?: () => Promise<void>
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  klaro?: {
    show: (...args: unknown[]) => void
  }
  klaroConfig?: {
    services?: KlaroService[]
  }
}

const request = new Request('http://localhost/runtime/consent/preferences.js')

class TestResponse {
  readonly headers: ResponseInit['headers']
  readonly status: number
  private readonly bodyText: string

  constructor(body: BodyInit | null = null, init: ResponseInit = {}) {
    this.bodyText = typeof body === 'string' ? body : ''
    this.headers = init.headers
    this.status = init.status ?? 200
  }

  async text() {
    return this.bodyText
  }
}

function getConsentWindow() {
  return window as ConsentRuntimeWindow
}

function isArrayLikeCommand(entry: unknown): entry is ArrayLike<unknown> {
  return typeof entry === 'object' && entry !== null && 'length' in entry
}

function getDataLayerCommands() {
  return (getConsentWindow().dataLayer ?? [])
    .filter(isArrayLikeCommand)
    .map((entry) => Array.from(entry))
}

describe('/runtime/consent/[asset]', () => {
  const originalGtmId = process.env.NEXT_PUBLIC_GTM_ID
  const originalResponse = globalThis.Response

  beforeEach(() => {
    jest.resetModules()
    globalThis.Response = TestResponse as unknown as typeof Response
    process.env.NEXT_PUBLIC_GTM_ID = 'GTM-TEST123'
    document.head.innerHTML = ''
    document.body.innerHTML = ''

    const consentWindow = getConsentWindow()
    Reflect.deleteProperty(consentWindow, '__olgishAnalyticsConsent')
    Reflect.deleteProperty(consentWindow, '__olgishConsentAwareGtagInstalled')
    Reflect.deleteProperty(consentWindow, '__olgishGtmLoaded')
    Reflect.deleteProperty(consentWindow, '__olgishOpenConsentPreferences')
    Reflect.deleteProperty(consentWindow, 'dataLayer')
    Reflect.deleteProperty(consentWindow, 'gtag')
    Reflect.deleteProperty(consentWindow, 'klaro')
    Reflect.deleteProperty(consentWindow, 'klaroConfig')
  })

  afterEach(() => {
    globalThis.Response = originalResponse

    if (originalGtmId === undefined) {
      delete process.env.NEXT_PUBLIC_GTM_ID
    } else {
      process.env.NEXT_PUBLIC_GTM_ID = originalGtmId
    }
  })

  it('preserves analytics consent when Google Ads sends an ad-only update', async () => {
    const { GET } = await import('../route')
    const response = await GET(request, {
      params: Promise.resolve({ asset: 'preferences.js' })
    })
    const runtimeScript = await response.text()
    const executeRuntime = new Function(runtimeScript) as () => void
    const consentWindow = getConsentWindow()

    consentWindow.klaro = {
      show: jest.fn()
    }
    executeRuntime()

    const openPreferencesPromise = consentWindow.__olgishOpenConsentPreferences?.()
    const klaroScript = document.getElementById('klaro-script') as HTMLScriptElement | null

    expect(openPreferencesPromise).toBeInstanceOf(Promise)
    expect(klaroScript).toBeTruthy()

    klaroScript?.dispatchEvent(new Event('load'))
    await openPreferencesPromise

    const googleAnalytics = consentWindow.klaroConfig?.services?.find((service) => (
      service.name === 'google-analytics'
    ))
    const googleAds = consentWindow.klaroConfig?.services?.find((service) => (
      service.name === 'google-ads'
    ))

    if (!googleAnalytics?.onAccept || !googleAds?.onAccept || !consentWindow.gtag) {
      throw new Error('Expected consent services and gtag to be initialized')
    }

    googleAnalytics.onAccept()
    expect(consentWindow.__olgishAnalyticsConsent).toBe(true)

    googleAds.onAccept()
    expect(consentWindow.__olgishAnalyticsConsent).toBe(true)

    consentWindow.gtag('event', 'post_preferences_event')

    expect(getDataLayerCommands()).toEqual(expect.arrayContaining([
      ['event', 'post_preferences_event']
    ]))
  })
})
