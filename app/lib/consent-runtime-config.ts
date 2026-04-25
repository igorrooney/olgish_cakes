const gtmId = process.env.NEXT_PUBLIC_GTM_ID

export const klaroScriptSrc = 'https://cdn.kiprotect.com/klaro/v0.7/klaro.js'
export const klaroStyleHref = 'https://cdn.kiprotect.com/klaro/v0.7/klaro.min.css'
export const klaroOverridesHref = '/styles/klaro-overrides.css'
export const isConsentRuntimeEnabled = Boolean(gtmId)

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

const loadGtmConsentSnippet = `
  if (window.__loadOlgishGtmOnce) {
    window.__loadOlgishGtmOnce()
  }
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
        onAccept: `
          gtag('consent', 'update', {
            'analytics_storage': 'granted'
          })
          ${loadGtmConsentSnippet}
        `,
        onDecline: `
          gtag('consent', 'update', {
            'analytics_storage': 'denied'
          })
        `
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
        onAccept: loadGtmConsentSnippet
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
        onAccept: `
          gtag('consent', 'update', {
            'ad_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted'
          })
          ${loadGtmConsentSnippet}
        `,
        onDecline: `
          gtag('consent', 'update', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
          })
        `
      }
    ]
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
