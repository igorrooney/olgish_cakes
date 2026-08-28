import {
  createSensitiveDataConsentEvidence,
  sensitiveDataConsentRequiredMessage,
  SENSITIVE_DATA_CONSENT_VERSION
} from '../sensitive-data-consent'

describe('createSensitiveDataConsentEvidence', () => {
  it.each([
    ['', false],
    ['   ', true],
    [undefined, false]
  ] as const)('records no consent evidence when health information is absent', (information, consent) => {
    expect(createSensitiveDataConsentEvidence(information, consent)).toEqual({
      dietaryHealthInformation: null,
      dietaryHealthConsent: false,
      dietaryHealthConsentVersion: null,
      dietaryHealthConsentedAt: null
    })
  })

  it('records server-authoritative evidence only when explicit consent was validated', () => {
    const before = Date.now()
    const evidence = createSensitiveDataConsentEvidence('  allergy sentinel  ', true)
    const after = Date.now()

    expect(evidence).toMatchObject({
      dietaryHealthInformation: 'allergy sentinel',
      dietaryHealthConsent: true,
      dietaryHealthConsentVersion: SENSITIVE_DATA_CONSENT_VERSION
    })
    expect(Date.parse(evidence.dietaryHealthConsentedAt as string)).toBeGreaterThanOrEqual(before)
    expect(Date.parse(evidence.dietaryHealthConsentedAt as string)).toBeLessThanOrEqual(after)
  })

  it('refuses to fabricate consent evidence from health information alone', () => {
    expect(() => createSensitiveDataConsentEvidence('allergy sentinel', false))
      .toThrow(sensitiveDataConsentRequiredMessage)
  })
})
