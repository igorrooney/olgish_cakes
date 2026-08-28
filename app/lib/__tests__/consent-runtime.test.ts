/**
 * @jest-environment jsdom
 */
import { consentOpenEventName } from '../consent-config'
import { createConsentRecord } from '../consent-record'
import {
  getValidatedGtmId,
  requestConsentPreferences,
  writeConsentRecord
} from '../consent-runtime'

describe('first-party consent runtime helpers', () => {
  it('accepts only a safe GTM container identifier', () => {
    expect(getValidatedGtmId('GTM-ABC123')).toBe('GTM-ABC123')
    expect(getValidatedGtmId('G-ABC123')).toBe('')
    expect(getValidatedGtmId('GTM-ABC</script>')).toBe('')
    expect(getValidatedGtmId(undefined)).toBe('')
  })

  it('continues safely when browser cookie storage is blocked', () => {
    const cookieSetter = jest.spyOn(document, 'cookie', 'set').mockImplementation(() => {})
    const record = createConsentRecord({
      googleAnalytics: true,
      microsoftClarity: false,
      googleAds: false
    }, 'preferences')

    expect(() => writeConsentRecord(record)).not.toThrow()
    expect(cookieSetter).toHaveBeenCalledWith(expect.stringContaining('SameSite=Lax'))
    cookieSetter.mockRestore()
  })

  it('marks and dispatches an on-demand preferences request', () => {
    const listener = jest.fn()
    window.addEventListener(consentOpenEventName, listener)

    requestConsentPreferences()

    expect(listener).toHaveBeenCalledTimes(1)
    expect((window as Window & {
      __olgishConsentPreferencesRequested?: boolean
    }).__olgishConsentPreferencesRequested).toBe(true)
    window.removeEventListener(consentOpenEventName, listener)
  })
})
