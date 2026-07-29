import {
  createConsentRecord,
  migrateLegacyConsent,
  parseConsentRecord,
  serializeConsentRecord
} from '../consent-record'

const now = new Date('2026-07-29T12:00:00.000Z')

describe('consent record', () => {
  it('serializes and parses every validated field', () => {
    const record = createConsentRecord({
      googleAnalytics: true,
      microsoftClarity: false,
      googleAds: true
    }, 'preferences', now.toISOString())

    expect(parseConsentRecord(serializeConsentRecord(record), now)).toEqual(record)
  })

  it.each([
    ['malformed encoding', '%E0%A4%A'],
    ['invalid JSON', encodeURIComponent('{bad')],
    ['unsupported version', encodeURIComponent(JSON.stringify({
      version: 2,
      updatedAt: now.toISOString(),
      source: 'banner',
      choices: {
        googleAnalytics: false,
        microsoftClarity: false,
        googleAds: false
      }
    }))],
    ['missing choice', encodeURIComponent(JSON.stringify({
      version: 1,
      updatedAt: now.toISOString(),
      source: 'banner',
      choices: {
        googleAnalytics: false,
        googleAds: false
      }
    }))],
    ['invalid source', encodeURIComponent(JSON.stringify({
      version: 1,
      updatedAt: now.toISOString(),
      source: 'unknown',
      choices: {
        googleAnalytics: false,
        microsoftClarity: false,
        googleAds: false
      }
    }))]
  ])('rejects %s', (_label, value) => {
    expect(parseConsentRecord(value, now)).toBeNull()
  })

  it('rejects expired and future-dated records', () => {
    const expired = createConsentRecord({
      googleAnalytics: false,
      microsoftClarity: false,
      googleAds: false
    }, 'banner', '2025-07-28T11:59:59.000Z')
    const future = createConsentRecord({
      googleAnalytics: false,
      microsoftClarity: false,
      googleAds: false
    }, 'banner', '2026-07-29T12:00:01.000Z')

    expect(parseConsentRecord(serializeConsentRecord(expired), now)).toBeNull()
    expect(parseConsentRecord(serializeConsentRecord(future), now)).toBeNull()
  })

  it('migrates valid granular Klaro choices before every simple legacy source', () => {
    const migrated = migrateLegacyConsent({
      klaroCookie: encodeURIComponent(JSON.stringify({
        'google-analytics': false,
        'microsoft-clarity': true,
        'google-ads': false
      })),
      simpleCookie: 'accepted',
      localStorageChoices: {
        olgishCookieConsent: 'accepted',
        cookieConsent: 'accepted'
      }
    }, now.toISOString())

    expect(migrated).toEqual({
      version: 1,
      updatedAt: now.toISOString(),
      source: 'migration',
      choices: {
        googleAnalytics: false,
        microsoftClarity: true,
        googleAds: false
      }
    })
  })

  it.each([
    ['simple cookie', null, 'declined', null, null, false],
    ['current local storage', null, null, 'accepted', 'declined', true],
    ['old local storage', null, null, null, 'declined', false]
  ])('migrates the %s fallback', (
    _label,
    klaroCookie,
    simpleCookie,
    currentStorage,
    oldStorage,
    granted
  ) => {
    const migrated = migrateLegacyConsent({
      klaroCookie,
      simpleCookie,
      localStorageChoices: {
        olgishCookieConsent: currentStorage,
        cookieConsent: oldStorage
      }
    }, now.toISOString())

    expect(migrated?.choices).toEqual({
      googleAnalytics: granted,
      microsoftClarity: granted,
      googleAds: granted
    })
  })

  it('does not migrate incomplete granular or unknown simple values', () => {
    expect(migrateLegacyConsent({
      klaroCookie: encodeURIComponent(JSON.stringify({
        'google-analytics': true
      })),
      simpleCookie: 'maybe',
      localStorageChoices: {
        olgishCookieConsent: null,
        cookieConsent: null
      }
    }, now.toISOString())).toBeNull()
  })
})

