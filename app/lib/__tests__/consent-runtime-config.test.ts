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
})
