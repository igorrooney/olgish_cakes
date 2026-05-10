import {
  isConsentRuntimeEnabled,
  klaroOverridesHref,
  klaroScriptSrc,
  klaroStyleHref
} from '@/app/lib/consent-runtime-config'

interface ConsentRuntimeAsset {
  content: string
  contentType: string
}

const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? ''
const publicCacheControl = 'public, max-age=3600, stale-while-revalidate=86400'

function createKlaroServicesScript() {
  if (!isConsentRuntimeEnabled) {
    return '[]'
  }

  return `[
      {
        name: 'google-analytics',
        purposes: ['analytics'],
        cookies: ['_ga', '_gid', '_gat'],
        translations: {
          zz: { title: 'Google Analytics' },
          en: { description: 'Helps us understand how people use the site.' }
        },
        onAccept: function() {
          updateConsent({
            analytics_storage: 'granted'
          });
          loadGtmAfterConsent();
        },
        onDecline: function() {
          updateConsent({
            analytics_storage: 'denied'
          });
        }
      },
      {
        name: 'microsoft-clarity',
        purposes: ['analytics'],
        translations: {
          zz: { title: 'Microsoft Clarity' },
          en: { description: 'Helps us understand how people use the site with session insights.' }
        },
        onAccept: loadGtmAfterConsent
      },
      {
        name: 'google-ads',
        purposes: ['marketing'],
        cookies: ['_gcl_au', '_gcl_aw', '_gcl_dc'],
        translations: {
          zz: { title: 'Google Ads' },
          en: { description: 'Shows personalised ads and measures ad performance.' }
        },
        onAccept: function() {
          updateConsent({
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted'
          });
          loadGtmAfterConsent();
        },
        onDecline: function() {
          updateConsent({
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
        }
      }
    ]`
}

function createPreferencesRuntimeScript() {
  return `(function() {
  if (window.location.pathname === '/admin' || window.location.pathname.indexOf('/admin/') === 0) {
    return;
  }

  if (window.__olgishOpenConsentPreferences) {
    return;
  }

  var gtmId = ${JSON.stringify(gtmId)};
  var isConsentRuntimeEnabled = ${JSON.stringify(isConsentRuntimeEnabled)};
  var klaroScriptSrc = ${JSON.stringify(klaroScriptSrc)};
  var klaroStyleHref = ${JSON.stringify(klaroStyleHref)};
  var klaroOverridesHref = ${JSON.stringify(klaroOverridesHref)};

  function ensureConsentDefaults() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() {
      window.dataLayer.push(arguments);
    };

    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('set', 'ads_data_redaction', true);
  }

  function updateConsent(choiceOrUpdate) {
    ensureConsentDefaults();

    if (typeof choiceOrUpdate === 'string') {
      window.gtag('consent', 'update', {
        ad_storage: choiceOrUpdate === 'accepted' ? 'granted' : 'denied',
        analytics_storage: choiceOrUpdate === 'accepted' ? 'granted' : 'denied',
        ad_user_data: choiceOrUpdate === 'accepted' ? 'granted' : 'denied',
        ad_personalization: choiceOrUpdate === 'accepted' ? 'granted' : 'denied'
      });
      return;
    }

    window.gtag('consent', 'update', choiceOrUpdate);
  }

  function loadGtmAfterConsent() {
    if (!gtmId || !isConsentRuntimeEnabled) {
      return;
    }

    if (window.__olgishGtmLoaded || document.getElementById('gtm-consent-script')) {
      return;
    }

    window.__olgishGtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': Date.now(),
      event: 'gtm.js'
    });

    var script = document.createElement('script');
    script.id = 'gtm-consent-script';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(gtmId);
    document.head.appendChild(script);
  }

  function appendStylesheetIfMissing(href, dataAttribute) {
    if (!href || document.querySelector('link[' + dataAttribute + ']')) {
      return;
    }

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(dataAttribute, 'true');
    document.head.appendChild(link);
  }

  function setUpKlaroConfig() {
    if (window.klaroConfig) {
      return;
    }

    window.klaroConfig = {
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
          privacyPolicy: { name: 'cookie policy' },
          ok: 'Accept optional cookies',
          decline: 'Reject optional cookies',
          acceptAll: 'Accept optional cookies',
          acceptSelected: 'Accept selected cookies'
        },
        en: {
          privacyPolicyUrl: '/cookies',
          privacyPolicy: { name: 'cookie policy' },
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
            analytics: { title: 'Analytics' },
            necessary: {
              title: 'Necessary',
              description: 'Required to store your cookie choices and keep the site secure.'
            },
            marketing: { title: 'Marketing' }
          }
        },
        'en-GB': {
          privacyPolicyUrl: '/cookies',
          privacyPolicy: { name: 'cookie policy' },
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
            analytics: { title: 'Analytics' },
            necessary: {
              title: 'Necessary',
              description: 'Required to store your cookie choices and keep the site secure.'
            },
            marketing: { title: 'Marketing' }
          }
        }
      },
      services: ${createKlaroServicesScript()}
    };
  }

  function loadExternalScript(id, src, attributes) {
    var existingScript = document.getElementById(id);

    if (existingScript) {
      return new Promise(function(resolve, reject) {
        if (existingScript.dataset.loaded === 'true') {
          resolve();
          return;
        }

        existingScript.addEventListener('load', function() { resolve(); }, { once: true });
        existingScript.addEventListener('error', function() {
          existingScript.remove();
          reject(new Error('Failed to load ' + src));
        }, { once: true });
      });
    }

    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.id = id;
      script.src = src;

      Object.keys(attributes).forEach(function(key) {
        script.setAttribute(key, attributes[key]);
      });

      script.addEventListener('load', function() {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', function() {
        script.remove();
        reject(new Error('Failed to load ' + src));
      }, { once: true });
      document.body.appendChild(script);
    });
  }

  function waitForKlaroManager() {
    return new Promise(function(resolve) {
      var attempts = 0;
      var timer = window.setInterval(function() {
        attempts += 1;

        if (window.klaro && window.klaro.show) {
          window.clearInterval(timer);
          resolve(window.klaro);
          return;
        }

        if (attempts >= 30) {
          window.clearInterval(timer);
          resolve(null);
        }
      }, 100);
    });
  }

  window.__olgishOpenConsentPreferences = function() {
    if (!isConsentRuntimeEnabled) {
      return Promise.resolve();
    }

    appendStylesheetIfMissing(klaroStyleHref, 'data-klaro-style');
    appendStylesheetIfMissing(klaroOverridesHref, 'data-klaro-overrides-style');
    ensureConsentDefaults();
    setUpKlaroConfig();

    return loadExternalScript('klaro-script', klaroScriptSrc, {
      'data-config': 'klaroConfig'
    }).then(function() {
      return waitForKlaroManager();
    }).then(function(klaro) {
      if (klaro && klaro.show) {
        klaro.show(undefined, true);
      }
    });
  };
})();`
}

const consentRuntimeAssets: Record<string, ConsentRuntimeAsset> = {
  'preferences.js': {
    content: createPreferencesRuntimeScript(),
    contentType: 'application/javascript; charset=utf-8'
  }
}

export const dynamic = 'force-static'
export const dynamicParams = false
export const revalidate = false

export function generateStaticParams() {
  return Object.keys(consentRuntimeAssets).map((asset) => ({ asset }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset: string }> }
) {
  const { asset } = await params
  const runtimeAsset = consentRuntimeAssets[asset]

  if (!runtimeAsset) {
    return new Response('Not found', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  }

  return new Response(runtimeAsset.content, {
    headers: {
      'Cache-Control': publicCacheControl,
      'Content-Length': Buffer.byteLength(runtimeAsset.content).toString(),
      'Content-Type': runtimeAsset.contentType,
      'X-Content-Type-Options': 'nosniff'
    }
  })
}
