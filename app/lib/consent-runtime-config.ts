const gtmId = process.env.NEXT_PUBLIC_GTM_ID

export const klaroScriptSrc = '/runtime/klaro/v0.7/klaro-no-css.js'
export const klaroStyleHref = '/runtime/klaro/v0.7/klaro.min.css'
export const klaroOverridesHref = '/styles/klaro-overrides.css'
export const isConsentRuntimeEnabled = Boolean(gtmId)

type ConsentModeValue = 'granted' | 'denied'

type ConsentModeUpdate = {
  ad_storage?: ConsentModeValue
  analytics_storage?: ConsentModeValue
  ad_user_data?: ConsentModeValue
  ad_personalization?: ConsentModeValue
}

type ConsentRuntimeWindow = Window & typeof globalThis & {
  gtag?: (...args: unknown[]) => void
  __loadOlgishGtmOnce?: () => void
}

type KlaroServiceConfig = {
  name: string
  purposes: string[]
  cookies?: string[]
  translations: Record<string, {
    title?: string
    description?: string
  }>
  onAccept?: () => void
  onDecline?: () => void
}

function getConsentRuntimeWindow() {
  return window as ConsentRuntimeWindow
}

function updateGtagConsent(update: ConsentModeUpdate) {
  if (typeof window === 'undefined') {
    return
  }

  getConsentRuntimeWindow().gtag?.('consent', 'update', update)
}

function loadGtmAfterConsent() {
  if (typeof window === 'undefined') {
    return
  }

  getConsentRuntimeWindow().__loadOlgishGtmOnce?.()
}

export const consentDefaultsScript = `
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){dataLayer.push(arguments)}
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  })
  gtag('set', 'ads_data_redaction', true)
`

const loadGtmOnConsentScript = `
  window.__loadOlgishGtmOnce = window.__loadOlgishGtmOnce || function() {
    if (window.__olgishGtmLoaded) return;
    window.__olgishGtmLoaded = true;
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  };
`

const klaroServices = gtmId
  ? [
      {
        name: 'google-analytics',
        purposes: ['analytics'],
        cookies: ['_ga', '_gid', '_gat'],
        translations: {
          zz: {
            title: 'Google Analytics'
          },
          en: {
            description: 'Helps us understand how people use the site.'
          }
        },
        onAccept: () => {
          updateGtagConsent({
            analytics_storage: 'granted'
          })
          loadGtmAfterConsent()
        },
        onDecline: () => {
          updateGtagConsent({
            analytics_storage: 'denied'
          })
        }
      },
      {
        name: 'microsoft-clarity',
        purposes: ['analytics'],
        translations: {
          zz: {
            title: 'Microsoft Clarity'
          },
          en: {
            description: 'Helps us understand how people use the site with session insights.'
          }
        },
        onAccept: loadGtmAfterConsent
      },
      {
        name: 'google-ads',
        purposes: ['marketing'],
        cookies: ['_gcl_au', '_gcl_aw', '_gcl_dc'],
        translations: {
          zz: {
            title: 'Google Ads'
          },
          en: {
            description: 'Shows personalised ads and measures ad performance.'
          }
        },
        onAccept: () => {
          updateGtagConsent({
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted'
          })
          loadGtmAfterConsent()
        },
        onDecline: () => {
          updateGtagConsent({
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          })
        }
      }
    ] satisfies KlaroServiceConfig[]
  : []

const klaroConfig = {
  elementID: 'klaro',
  storageMethod: 'cookie',
  storageName: 'klaro',
  default: false,
  mustConsent: false,
  acceptAll: true,
  hideDeclineAll: false,
  hideLearnMore: false,
  translations: {
    zz: {
      privacyPolicyUrl: '/cookies',
      privacyPolicy: {
        name: 'cookie policy'
      },
      ok: 'Accept optional cookies',
      decline: 'Reject optional cookies',
      acceptAll: 'Accept optional cookies',
      acceptSelected: 'Accept selected cookies'
    },
    en: {
      privacyPolicyUrl: '/cookies',
      privacyPolicy: {
        name: 'cookie policy'
      },
      ok: 'Accept optional cookies',
      decline: 'Reject optional cookies',
      acceptAll: 'Accept optional cookies',
      acceptSelected: 'Accept selected cookies',
      consentNotice: {
        title: 'Cookie preferences',
        description: 'We use cookies to run the site. Optional analytics and marketing only run if you say yes.',
        learnMore: 'Choose'
      },
      consentModal: {
        title: 'Cookie preferences',
        description: 'Choose which cookies you are happy for us to use. You can change your mind anytime.'
      },
      purposes: {
        analytics: {
          title: 'Analytics'
        },
        necessary: {
          title: 'Necessary',
          description: 'Required to store your cookie choices and keep the site secure.'
        },
        marketing: {
          title: 'Marketing'
        }
      }
    },
    'en-GB': {
      privacyPolicyUrl: '/cookies',
      privacyPolicy: {
        name: 'cookie policy'
      },
      ok: 'Accept optional cookies',
      decline: 'Reject optional cookies',
      acceptAll: 'Accept optional cookies',
      acceptSelected: 'Accept selected cookies',
      consentNotice: {
        title: 'Cookie preferences',
        description: 'We use cookies to run the site. Optional analytics and marketing only run if you say yes.',
        learnMore: 'Choose'
      },
      consentModal: {
        title: 'Cookie preferences',
        description: 'Choose which cookies you are happy for us to use. You can change your mind anytime.'
      },
      purposes: {
        analytics: {
          title: 'Analytics'
        },
        necessary: {
          title: 'Necessary',
          description: 'Required to store your cookie choices and keep the site secure.'
        },
        marketing: {
          title: 'Marketing'
        }
      }
    }
  },
  services: klaroServices
}

export const klaroConfigScript = `var klaroConfig = ${JSON.stringify(klaroConfig)}`
export const serializedKlaroConfig = klaroConfig as Record<string, unknown>
export const gtmLoaderScript = gtmId ? loadGtmOnConsentScript : ''
