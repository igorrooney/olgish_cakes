export const consentCookieName = 'olgish_cookie_preferences'
export const consentVersion = 1 as const
export const consentMaxAgeSeconds = 60 * 60 * 24 * 365

export const legacyConsentCookieNames = [
  'klaro',
  'olgish_cookie_consent'
] as const

export const legacyConsentStorageKeys = [
  'olgishCookieConsent',
  'cookieConsent'
] as const

export const consentOpenEventName = 'olgish-consent-open'
export const consentChangedEventName = 'olgish-consent-changed'
export const consentDialogStateEventName = 'olgish-consent-dialog-state'

export type ConsentServiceKey =
  | 'googleAnalytics'
  | 'microsoftClarity'
  | 'googleAds'

export type ConsentChoices = Record<ConsentServiceKey, boolean>

export type ConsentService = {
  key: ConsentServiceKey
  name: string
  description: string
  purpose: string
  cookiePatterns: readonly string[]
  cookies: readonly {
    name: string
    duration: string
    purpose: string
    type: 'First-party cookie' | 'Third-party cookie'
  }[]
}

export const deniedConsentChoices: ConsentChoices = {
  googleAnalytics: false,
  microsoftClarity: false,
  googleAds: false
}

export const grantedConsentChoices: ConsentChoices = {
  googleAnalytics: true,
  microsoftClarity: true,
  googleAds: true
}

export const consentServices: readonly ConsentService[] = [
  {
    key: 'googleAnalytics',
    name: 'Google Analytics',
    description: 'Page and journey analytics.',
    purpose: 'Analytics',
    cookiePatterns: ['_ga', '_ga_*', '_gid', '_gat', '_gat_*'],
    cookies: [
      {
        name: '_ga',
        duration: 'Up to 2 years',
        purpose: 'Distinguishes visitors and helps measure website use.',
        type: 'First-party cookie'
      },
      {
        name: '_ga_*',
        duration: 'Up to 2 years',
        purpose: 'Stores and counts page views for a Google Analytics property.',
        type: 'First-party cookie'
      },
      {
        name: '_gid',
        duration: 'Up to 24 hours',
        purpose: 'Distinguishes visitors for short-term analytics reporting.',
        type: 'First-party cookie'
      },
      {
        name: '_gat / _gat_*',
        duration: 'Up to 1 minute',
        purpose: 'Limits the rate at which analytics requests are sent.',
        type: 'First-party cookie'
      }
    ]
  },
  {
    key: 'microsoftClarity',
    name: 'Microsoft Clarity',
    description: 'Heatmaps and session recordings.',
    purpose: 'Session insights',
    cookiePatterns: ['_clck', '_clsk'],
    cookies: [
      {
        name: '_clck',
        duration: 'Up to 1 year',
        purpose: 'Keeps a Clarity visitor identifier and preferences.',
        type: 'First-party cookie'
      },
      {
        name: '_clsk',
        duration: 'Up to 1 day',
        purpose: 'Connects page views into a single Clarity session.',
        type: 'First-party cookie'
      },
      {
        name: 'CLID',
        duration: 'Up to 1 year',
        purpose: 'Identifies when Clarity first saw a visitor.',
        type: 'Third-party cookie'
      },
      {
        name: 'ANONCHK',
        duration: 'Up to 10 minutes',
        purpose: 'Records whether a Microsoft Advertising identifier is passed to Clarity.',
        type: 'Third-party cookie'
      },
      {
        name: 'MR',
        duration: 'Up to 7 days',
        purpose: 'Records whether a Microsoft Advertising identifier should be refreshed.',
        type: 'Third-party cookie'
      },
      {
        name: 'MUID',
        duration: 'Up to 13 months',
        purpose: 'Recognises visitors across Microsoft domains.',
        type: 'Third-party cookie'
      },
      {
        name: 'SM',
        duration: 'Browser session',
        purpose: 'Synchronises a Microsoft Advertising identifier across domains.',
        type: 'Third-party cookie'
      }
    ]
  },
  {
    key: 'googleAds',
    name: 'Google Ads',
    description: 'Advertising measurement and personalisation.',
    purpose: 'Marketing',
    cookiePatterns: ['_gcl_*'],
    cookies: [
      {
        name: '_gcl_*',
        duration: 'Up to 90 days',
        purpose: 'Measures advertising conversions and campaign performance.',
        type: 'First-party cookie'
      }
    ]
  }
] as const

export const consentBannerDescription =
  `We use necessary cookies to run the site. With your permission, we also use ${consentServices[0].name}, ` +
  `${consentServices[1].name} and ${consentServices[2].name} for analytics, session recordings, advertising ` +
  'measurement and personalisation.'
