/**
 * @jest-environment jsdom
 */
type WindowWithConsent = Window & {
  klaro?: {
    show: (...args: unknown[]) => void
  }
  klaroConfig?: unknown
}

describe('consent-runtime', () => {
  beforeEach(() => {
    jest.resetModules()
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    delete process.env.NEXT_PUBLIC_GTM_ID
    const windowWithConsent = window as WindowWithConsent
    windowWithConsent.klaro = undefined
    windowWithConsent.klaroConfig = undefined
  })

  it('does nothing when GTM is not configured', async () => {
    const { isConsentRuntimeEnabled, loadConsentRuntime } = await import('../consent-runtime')

    expect(isConsentRuntimeEnabled()).toBe(false)

    await loadConsentRuntime()

    expect(document.querySelector('link[data-klaro-style]')).toBeNull()
    expect(document.getElementById('klaro-script')).toBeNull()
  })

  it('injects the deferred consent runtime assets when GTM is configured', async () => {
    process.env.NEXT_PUBLIC_GTM_ID = 'GTM-TEST123'

    const { isConsentRuntimeEnabled, loadConsentRuntime } = await import('../consent-runtime')
    const runtimePromise = loadConsentRuntime()

    expect(isConsentRuntimeEnabled()).toBe(true)
    expect(document.querySelector('link[data-klaro-style]')).toBeTruthy()
    expect(document.getElementById('gtag-consent-default')).toBeTruthy()
    expect(document.getElementById('klaro-config')).toBeTruthy()
    expect(document.getElementById('google-tag-manager-template')).toHaveAttribute('type', 'text/plain')

    const klaroScript = document.getElementById('klaro-script') as HTMLScriptElement | null
    expect(klaroScript).toBeTruthy()
    expect(klaroScript?.src).toContain('cdn.kiprotect.com/klaro/v0.7/klaro.js')

    klaroScript?.dispatchEvent(new Event('load'))
    await runtimePromise

    const windowWithConsent = window as WindowWithConsent
    expect(windowWithConsent.klaroConfig).toBeTruthy()
  })

  it('opens the Klaro modal after the runtime has loaded when requested', async () => {
    process.env.NEXT_PUBLIC_GTM_ID = 'GTM-TEST123'

    const { loadConsentRuntime } = await import('../consent-runtime')
    const show = jest.fn()
    const windowWithConsent = window as WindowWithConsent
    windowWithConsent.klaro = {
      show
    }

    const runtimePromise = loadConsentRuntime({ openModal: true })
    const klaroScript = document.getElementById('klaro-script') as HTMLScriptElement | null

    klaroScript?.dispatchEvent(new Event('load'))
    await runtimePromise

    expect(show).toHaveBeenCalledWith(undefined, true)
  })

  it('retries with a fresh Klaro script after a load failure', async () => {
    process.env.NEXT_PUBLIC_GTM_ID = 'GTM-TEST123'

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const { loadConsentRuntime } = await import('../consent-runtime')

    const firstRuntimePromise = loadConsentRuntime()
    const firstKlaroScript = document.getElementById('klaro-script') as HTMLScriptElement | null

    expect(firstKlaroScript).toBeTruthy()

    firstKlaroScript?.dispatchEvent(new Event('error'))
    await firstRuntimePromise

    expect(document.getElementById('klaro-script')).toBeNull()

    const secondRuntimePromise = loadConsentRuntime()
    const secondKlaroScript = document.getElementById('klaro-script') as HTMLScriptElement | null

    expect(secondKlaroScript).toBeTruthy()
    expect(secondKlaroScript).not.toBe(firstKlaroScript)

    secondKlaroScript?.dispatchEvent(new Event('load'))
    await secondRuntimePromise

    expect(secondKlaroScript?.dataset.loaded).toBe('true')

    warnSpy.mockRestore()
  })
})
