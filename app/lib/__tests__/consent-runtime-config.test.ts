import { serializedKlaroConfig } from '../consent-runtime-config'

type ConsentNoticeTranslations = {
  description?: string
  learnMore?: string
}

type PrivacyPolicyTranslations = {
  name?: string
}

type LocaleTranslations = {
  acceptAll?: string
  acceptSelected?: string
  consentNotice?: ConsentNoticeTranslations
  decline?: string
  ok?: string
  privacyPolicy?: PrivacyPolicyTranslations
  privacyPolicyUrl?: string
}

type KlaroConfigTranslations = {
  translations?: Record<string, LocaleTranslations>
}

type KlaroConfigServices = {
  services?: Array<{
    onAccept?: unknown
    onDecline?: unknown
  }>
}

describe('consent-runtime-config', () => {
  function getLocaleTranslations(locale: string) {
    return (serializedKlaroConfig as KlaroConfigTranslations).translations?.[locale]
  }

  it('points consent policy links to the cookies page for fallback and English locales', () => {
    expect(getLocaleTranslations('zz')?.privacyPolicyUrl).toBe('/cookies')
    expect(getLocaleTranslations('en')?.privacyPolicyUrl).toBe('/cookies')
    expect(getLocaleTranslations('en-GB')?.privacyPolicyUrl).toBe('/cookies')
  })

  it('uses explicit first-layer cookie notice copy in English locales', () => {
    expect(getLocaleTranslations('en')?.consentNotice?.description).toBe(
      'We use cookies to run the site. Optional analytics and marketing only run if you say yes.'
    )
    expect(getLocaleTranslations('en')?.consentNotice?.learnMore).toBe('Choose')
    expect(getLocaleTranslations('en-GB')?.consentNotice?.description).toBe(
      'We use cookies to run the site. Optional analytics and marketing only run if you say yes.'
    )
    expect(getLocaleTranslations('en-GB')?.consentNotice?.learnMore).toBe('Choose')
  })

  it('uses explicit accept and reject wording for optional cookies', () => {
    expect(getLocaleTranslations('en')?.ok).toBe('Accept optional cookies')
    expect(getLocaleTranslations('en')?.decline).toBe('Reject optional cookies')
    expect(getLocaleTranslations('en')?.acceptAll).toBe('Accept optional cookies')
    expect(getLocaleTranslations('en')?.acceptSelected).toBe('Accept selected cookies')
    expect(getLocaleTranslations('en')?.privacyPolicy?.name).toBe('cookie policy')
  })

  it('uses function consent callbacks so Klaro does not need unsafe-eval', async () => {
    const originalGtmId = process.env.NEXT_PUBLIC_GTM_ID

    jest.resetModules()
    process.env.NEXT_PUBLIC_GTM_ID = 'GTM-TEST123'

    const { serializedKlaroConfig: gtmKlaroConfig } = await import('../consent-runtime-config')
    const services = (gtmKlaroConfig as KlaroConfigServices).services ?? []

    expect(services).toHaveLength(3)
    expect(services.every((service) => typeof service.onAccept === 'function')).toBe(true)
    expect(services.filter((service) => service.onDecline).every(
      (service) => typeof service.onDecline === 'function'
    )).toBe(true)

    if (originalGtmId === undefined) {
      delete process.env.NEXT_PUBLIC_GTM_ID
    } else {
      process.env.NEXT_PUBLIC_GTM_ID = originalGtmId
    }
  })
})
