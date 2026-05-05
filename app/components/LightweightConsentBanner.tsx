import {
  isConsentRuntimeEnabled
} from '@/app/lib/consent-runtime-config'

const consentStorageKey = 'olgishCookieConsent'
const legacyConsentStorageKey = 'cookieConsent'
const consentCookieName = 'olgish_cookie_consent'
const klaroConsentCookieName = 'klaro'
const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? ''
const consentPreferencesRuntimeSrc = '/runtime/consent/preferences.js'

function createConsentBannerScript() {
  return `(function() {
  if (window.location.pathname === '/admin' || window.location.pathname.indexOf('/admin/') === 0) {
    var adminBanner = document.getElementById('olgish-consent-banner');
    if (adminBanner) {
      adminBanner.hidden = true;
      adminBanner.style.display = 'none';
    }
    return;
  }

  var banner = document.getElementById('olgish-consent-banner');
  if (!banner) return;

  var consentStorageKey = ${JSON.stringify(consentStorageKey)};
  var legacyConsentStorageKey = ${JSON.stringify(legacyConsentStorageKey)};
  var consentCookieName = ${JSON.stringify(consentCookieName)};
  var klaroConsentCookieName = ${JSON.stringify(klaroConsentCookieName)};
  var gtmId = ${JSON.stringify(gtmId)};
  var isConsentRuntimeEnabled = ${JSON.stringify(isConsentRuntimeEnabled)};
  var consentPreferencesRuntimeSrc = ${JSON.stringify(consentPreferencesRuntimeSrc)};

  function getCookieValue(cookieName) {
    var cookieChoice = document.cookie
      .split(';')
      .map(function(entry) { return entry.trim(); })
      .find(function(entry) { return entry.indexOf(cookieName + '=') === 0; });

    return cookieChoice ? cookieChoice.slice(cookieName.length + 1) : null;
  }

  function getKlaroConsentModeUpdate(klaroChoice) {
    var analyticsGranted = klaroChoice['google-analytics'] === true ||
      klaroChoice['microsoft-clarity'] === true;
    var adsGranted = klaroChoice['google-ads'] === true;

    return {
      ad_storage: adsGranted ? 'granted' : 'denied',
      analytics_storage: analyticsGranted ? 'granted' : 'denied',
      ad_user_data: adsGranted ? 'granted' : 'denied',
      ad_personalization: adsGranted ? 'granted' : 'denied'
    };
  }

  function getKlaroConsentChoice() {
    var rawKlaroChoice = getCookieValue(klaroConsentCookieName);

    if (!rawKlaroChoice) {
      return null;
    }

    try {
      var klaroChoice = JSON.parse(decodeURIComponent(rawKlaroChoice));

      if (!klaroChoice || typeof klaroChoice !== 'object') {
        return null;
      }

      var serviceNames = Object.keys(klaroChoice);
      if (serviceNames.length === 0) {
        return null;
      }

      var shouldLoadGtm = serviceNames.some(function(serviceName) {
        return klaroChoice[serviceName] === true;
      });

      return {
        consentUpdate: getKlaroConsentModeUpdate(klaroChoice),
        shouldLoadGtm: shouldLoadGtm
      };
    } catch (error) {
      return null;
    }
  }

  function getStoredConsentChoice() {
    try {
      var storedChoice = window.localStorage.getItem(consentStorageKey) ||
        window.localStorage.getItem(legacyConsentStorageKey);

      if (storedChoice === 'accepted' || storedChoice === 'declined') {
        return storedChoice;
      }
    } catch (error) {
      return null;
    }

    var cookieChoice = getCookieValue(consentCookieName);
    if (cookieChoice === 'accepted' || cookieChoice === 'declined') {
      return cookieChoice;
    }

    return getKlaroConsentChoice();
  }

  function storeConsentChoice(choice) {
    try {
      window.localStorage.setItem(consentStorageKey, choice);
      window.localStorage.setItem(legacyConsentStorageKey, choice);
    } catch (error) {
    }

    document.cookie = consentCookieName + '=' + choice + '; Max-Age=31536000; Path=/; SameSite=Lax';
  }

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

    if (choiceOrUpdate && typeof choiceOrUpdate === 'object' && choiceOrUpdate.consentUpdate) {
      window.gtag('consent', 'update', choiceOrUpdate.consentUpdate);
      return;
    }

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

    if (window.__loadOlgishGtmOnce) {
      window.__loadOlgishGtmOnce();
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

  function dispatchConsentChoice(choice) {
    window.dispatchEvent(new CustomEvent('cookie-consent', {
      detail: {
        status: choice
      }
    }));
  }

  function hideBanner() {
    banner.hidden = true;
    banner.style.display = 'none';
  }

  function scheduleAcceptedConsentLoad() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadGtmAfterConsent, { timeout: 3000 });
      return;
    }

    window.setTimeout(loadGtmAfterConsent, 1500);
  }

  function loadPreferencesRuntime() {
    if (window.__olgishOpenConsentPreferences) {
      return Promise.resolve();
    }

    var id = 'olgish-consent-preferences-runtime';
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
          reject(new Error('Failed to load ' + consentPreferencesRuntimeSrc));
        }, { once: true });
      });
    }

    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.id = id;
      script.src = consentPreferencesRuntimeSrc;
      script.async = true;

      script.addEventListener('load', function() {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', function() {
        script.remove();
        reject(new Error('Failed to load ' + consentPreferencesRuntimeSrc));
      }, { once: true });
      document.body.appendChild(script);
    });
  }

  function openConsentRuntime() {
    if (!isConsentRuntimeEnabled) {
      hideBanner();
      return Promise.resolve();
    }

    return loadPreferencesRuntime().then(function() {
      if (!window.__olgishOpenConsentPreferences) {
        throw new Error('Consent preferences runtime did not initialize');
      }

      return window.__olgishOpenConsentPreferences();
    }).then(function() {
      hideBanner();
    }).catch(function(error) {
      console.warn('Failed to load consent runtime:', error);
    });
  }

  ensureConsentDefaults();

  var storedChoice = getStoredConsentChoice();
  if (storedChoice) {
    hideBanner();
    updateConsent(storedChoice);

    if (storedChoice === 'accepted' || storedChoice.shouldLoadGtm === true) {
      scheduleAcceptedConsentLoad();
    }
  }

  banner.querySelectorAll('[data-consent-choice]').forEach(function(button) {
    button.addEventListener('click', function() {
      var choice = button.getAttribute('data-consent-choice');

      if (choice !== 'accepted' && choice !== 'declined') {
        return;
      }

      storeConsentChoice(choice);
      updateConsent(choice);
      dispatchConsentChoice(choice);
      hideBanner();

      if (choice === 'accepted') {
        loadGtmAfterConsent();
      }
    });
  });

  var preferencesButton = banner.querySelector('[data-consent-preferences]');
  if (preferencesButton) {
    preferencesButton.addEventListener('click', function() {
      preferencesButton.disabled = true;
      preferencesButton.setAttribute('aria-busy', 'true');

      openConsentRuntime().finally(function() {
        preferencesButton.disabled = false;
        preferencesButton.removeAttribute('aria-busy');
      });
    });
  }
})();`
}

export function LightweightConsentBanner() {
  return (
    <>
      <aside
        id='olgish-consent-banner'
        aria-label='Cookie preferences'
        className='fixed bottom-4 left-4 right-4 z-[9999] w-auto max-w-[20rem] rounded-box border border-base-300 bg-base-100 p-4 font-sans text-base-content shadow-[0_18px_40px_color-mix(in_srgb,var(--color-primary-800)_18%,transparent)] tablet:left-1/2 tablet:right-auto tablet:w-[calc(100vw-2rem)] tablet:max-w-[44rem] tablet:-translate-x-1/2'
      >
        <div className='grid gap-3'>
          <div className='min-w-0'>
            <h2 className='font-moreSugar text-base font-normal leading-6 tracking-[0.02em] text-primary-800'>
              Cookie preferences
            </h2>
            <p className='mt-2 text-[0.95rem] leading-[1.6] text-base-content'>
              We use necessary cookies to run the site. Optional analytics and marketing only run if you say yes.
              {' '}
              <a href='/cookies' className='link text-primary-500 underline-offset-[0.22em]'>
                Cookie policy
              </a>
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <button
              type='button'
              data-consent-preferences
              className='basis-full border-0 bg-transparent p-0 text-left text-sm font-semibold text-primary-500 underline underline-offset-[0.22em] transition-colors hover:text-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-60'
            >
              Choose
            </button>
            <button
              type='button'
              data-consent-choice='declined'
              className='min-h-11 rounded-field border border-primary-500 bg-base-100 px-4 py-[0.6rem] text-sm font-semibold text-primary-800 transition-colors hover:border-primary-800 hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-60'
            >
              Reject optional cookies
            </button>
            <button
              type='button'
              data-consent-choice='accepted'
              className='min-h-11 rounded-field border border-primary-500 bg-base-100 px-4 py-[0.6rem] text-sm font-semibold text-primary-800 transition-colors hover:border-primary-800 hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'
            >
              Accept optional cookies
            </button>
          </div>
        </div>
      </aside>
      <script
        dangerouslySetInnerHTML={{ __html: createConsentBannerScript() }}
      />
    </>
  )
}
