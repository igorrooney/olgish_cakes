import {
  consentChangedEventName,
  consentCookieName,
  consentDialogStateEventName,
  consentMaxAgeSeconds,
  consentOpenEventName,
  consentServices,
  consentVersion,
  deniedConsentChoices,
  legacyConsentCookieNames,
  legacyConsentStorageKeys,
  type ConsentChoices
} from './consent-config'
import {
  createConsentRecord,
  parseConsentRecord,
  serializeConsentRecord,
  type ConsentRecord,
  type ConsentSource
} from './consent-record'

type ConsentRuntimeWindow = Window & typeof globalThis & {
  __olgishAnalyticsConsent?: boolean
  __olgishConsentAwareGtagInstalled?: boolean
  __olgishConsentRecord?: ConsentRecord | null
  __olgishGtmLoaded?: boolean
  __olgishApplyConsentRecord?: (
    record: ConsentRecord,
    eventName: 'olgish_consent_ready' | 'olgish_consent_update'
  ) => void
  clarity?: (...args: unknown[]) => void
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  __olgishConsentPreferencesRequested?: boolean
}

export function isConsentRuntimeEnabled() {
  return getValidatedGtmId(process.env.NEXT_PUBLIC_GTM_ID) !== ''
}

export function getValidatedGtmId(value: string | undefined) {
  return typeof value === 'string' && /^GTM-[A-Z0-9]+$/.test(value)
    ? value
    : ''
}

function getConsentRuntimeWindow() {
  return window as ConsentRuntimeWindow
}

function getCookieValue(cookieName: string) {
  const prefix = `${cookieName}=`
  const entry = document.cookie
    .split(';')
    .map(value => value.trim())
    .find(value => value.startsWith(prefix))

  return entry ? entry.slice(prefix.length) : null
}

function getCookieSecurityAttribute() {
  return window.location.protocol === 'https:' ? '; Secure' : ''
}

export function writeConsentRecord(record: ConsentRecord) {
  document.cookie = `${consentCookieName}=${serializeConsentRecord(record)}; Max-Age=${consentMaxAgeSeconds}; Path=/; SameSite=Lax${getCookieSecurityAttribute()}`
}

export function readCurrentConsentRecord() {
  if (typeof window === 'undefined') {
    return null
  }

  const runtimeWindow = getConsentRuntimeWindow()
  return runtimeWindow.__olgishConsentRecord ??
    parseConsentRecord(getCookieValue(consentCookieName))
}

export function saveConsentChoices(
  choices: ConsentChoices,
  source: ConsentSource
) {
  const record = createConsentRecord(choices, source)
  writeConsentRecord(record)

  const runtimeWindow = getConsentRuntimeWindow()
  runtimeWindow.__olgishConsentRecord = record
  runtimeWindow.__olgishApplyConsentRecord?.(record, 'olgish_consent_update')

  window.dispatchEvent(new CustomEvent(consentChangedEventName, {
    detail: record
  }))

  return record
}

export function requestConsentPreferences() {
  if (typeof window === 'undefined') {
    return
  }

  const runtimeWindow = getConsentRuntimeWindow()
  runtimeWindow.__olgishConsentPreferencesRequested = true
  window.dispatchEvent(new CustomEvent(consentOpenEventName))
}

export function dispatchConsentDialogState(isOpen: boolean) {
  document.body.dataset.consentDialogOpen = isOpen ? 'true' : 'false'
  window.dispatchEvent(new CustomEvent(consentDialogStateEventName, {
    detail: { isOpen }
  }))
}

export function createConsentBootstrapScript(gtmId: string) {
  const validatedGtmId = getValidatedGtmId(gtmId)
  const cookiePatterns = Object.fromEntries(
    consentServices.map(service => [service.key, service.cookiePatterns])
  )

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

  var consentCookieName = ${JSON.stringify(consentCookieName)};
  var consentVersion = ${JSON.stringify(consentVersion)};
  var consentMaxAgeSeconds = ${JSON.stringify(consentMaxAgeSeconds)};
  var legacyCookieNames = ${JSON.stringify(legacyConsentCookieNames)};
  var legacyStorageKeys = ${JSON.stringify(legacyConsentStorageKeys)};
  var cookiePatterns = ${JSON.stringify(cookiePatterns)};
  var gtmId = ${JSON.stringify(validatedGtmId)};
  var deniedChoices = ${JSON.stringify(deniedConsentChoices)};

  function getCookieValue(cookieName) {
    var prefix = cookieName + '=';
    var entries = document.cookie.split(';');
    for (var index = 0; index < entries.length; index += 1) {
      var entry = entries[index].trim();
      if (entry.indexOf(prefix) === 0) {
        return entry.slice(prefix.length);
      }
    }
    return null;
  }

  function getApexDomain() {
    var hostname = window.location.hostname;
    if (!hostname || hostname === 'localhost' || /^\\d{1,3}(\\.\\d{1,3}){3}$/.test(hostname)) {
      return null;
    }

    var parts = hostname.split('.');
    var count = hostname.endsWith('.co.uk') && parts.length >= 3 ? 3 : 2;
    return parts.length >= count ? parts.slice(-count).join('.') : null;
  }

  function expireCookie(cookieName) {
    var secure = window.location.protocol === 'https:' ? '; Secure' : '';
    var domains = ['', window.location.hostname, getApexDomain()];
    var seen = {};

    domains.forEach(function(domain) {
      if (domain === null || seen[domain]) return;
      seen[domain] = true;
      var domainPart = domain ? '; Domain=.' + domain.replace(/^\\./, '') : '';
      document.cookie = cookieName + '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax' + domainPart + secure;
    });
  }

  function clearLegacyConsent() {
    legacyCookieNames.forEach(expireCookie);
    try {
      legacyStorageKeys.forEach(function(storageKey) {
        window.localStorage.removeItem(storageKey);
      });
    } catch (error) {
    }
  }

  function isChoices(value) {
    return value && typeof value === 'object' &&
      typeof value.googleAnalytics === 'boolean' &&
      typeof value.microsoftClarity === 'boolean' &&
      typeof value.googleAds === 'boolean' &&
      Object.keys(value).length === 3;
  }

  function parseCanonical(rawValue) {
    if (!rawValue) return null;

    try {
      var parsed = JSON.parse(decodeURIComponent(rawValue));
      var updatedAt = new Date(parsed.updatedAt);
      var sourceIsValid = parsed.source === 'banner' ||
        parsed.source === 'preferences' ||
        parsed.source === 'migration';
      var age = Date.now() - updatedAt.getTime();

      if (!parsed || typeof parsed !== 'object' ||
        parsed.version !== consentVersion ||
        typeof parsed.updatedAt !== 'string' ||
        !sourceIsValid ||
        !isChoices(parsed.choices) ||
        Object.keys(parsed).length !== 4 ||
        Number.isNaN(updatedAt.getTime()) ||
        age < 0 ||
        age > consentMaxAgeSeconds * 1000) {
        return null;
      }

      return parsed;
    } catch (error) {
      return null;
    }
  }

  function parseKlaro(rawValue) {
    if (!rawValue) return null;
    try {
      var parsed = JSON.parse(decodeURIComponent(rawValue));
      if (!parsed || typeof parsed !== 'object' ||
        typeof parsed['google-analytics'] !== 'boolean' ||
        typeof parsed['microsoft-clarity'] !== 'boolean' ||
        typeof parsed['google-ads'] !== 'boolean') {
        return null;
      }
      return {
        googleAnalytics: parsed['google-analytics'],
        microsoftClarity: parsed['microsoft-clarity'],
        googleAds: parsed['google-ads']
      };
    } catch (error) {
      return null;
    }
  }

  function parseSimpleChoice(value) {
    if (value === 'accepted') {
      return { googleAnalytics: true, microsoftClarity: true, googleAds: true };
    }
    if (value === 'declined') {
      return { googleAnalytics: false, microsoftClarity: false, googleAds: false };
    }
    return null;
  }

  function migrateLegacyConsent() {
    var choices = parseKlaro(getCookieValue('klaro')) ||
      parseSimpleChoice(getCookieValue('olgish_cookie_consent'));

    if (!choices) {
      try {
        choices = parseSimpleChoice(window.localStorage.getItem('olgishCookieConsent')) ||
          parseSimpleChoice(window.localStorage.getItem('cookieConsent'));
      } catch (error) {
      }
    }

    if (!choices) return null;
    return {
      version: consentVersion,
      updatedAt: new Date().toISOString(),
      source: 'migration',
      choices: choices
    };
  }

  function writeRecord(record) {
    var secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = consentCookieName + '=' + encodeURIComponent(JSON.stringify(record)) +
      '; Max-Age=' + consentMaxAgeSeconds + '; Path=/; SameSite=Lax' + secure;
  }

  function hideBanner() {
    banner.hidden = true;
    banner.style.display = 'none';
  }

  function showBanner() {
    banner.hidden = false;
    banner.style.display = '';
  }

  function installConsentDefaults() {
    window.dataLayer = window.dataLayer || [];
    window.__olgishAnalyticsConsent = false;

    if (!window.__olgishConsentAwareGtagInstalled) {
      var existingGtag = window.gtag;
      window.__olgishConsentAwareGtagInstalled = true;
      window.gtag = function() {
        var command = arguments[0];
        if ((command === 'event' || command === 'config') && window.__olgishAnalyticsConsent !== true) {
          return;
        }
        if (typeof existingGtag === 'function') {
          existingGtag.apply(window, arguments);
          return;
        }
        window.dataLayer.push(arguments);
      };
    }

    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('set', 'ads_data_redaction', true);
  }

  function deleteServiceCookies(serviceKey) {
    var patterns = cookiePatterns[serviceKey] || [];
    var cookieNames = document.cookie.split(';').map(function(entry) {
      return entry.trim().split('=')[0];
    });

    cookieNames.forEach(function(cookieName) {
      var matches = patterns.some(function(pattern) {
        return pattern.endsWith('*')
          ? cookieName.indexOf(pattern.slice(0, -1)) === 0
          : cookieName === pattern;
      });
      if (matches) expireCookie(cookieName);
    });
  }

  function loadGtmOnce() {
    if (!gtmId || window.__olgishGtmLoaded || document.getElementById('gtm-consent-script')) {
      return;
    }

    window.__olgishGtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

    var script = document.createElement('script');
    script.id = 'gtm-consent-script';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(gtmId);
    script.addEventListener('error', function() {
      window.__olgishGtmLoaded = false;
      script.remove();
      window.dispatchEvent(new CustomEvent('olgish-gtm-load-error'));
    }, { once: true });
    document.head.appendChild(script);
  }

  function applyClarityConsent(choices) {
    if (typeof window.clarity !== 'function') return;

    window.clarity('consentv2', {
      source: 'olgish-cakes',
      ad_Storage: choices.googleAds ? 'granted' : 'denied',
      analytics_Storage: choices.microsoftClarity ? 'granted' : 'denied'
    });

    if (!choices.microsoftClarity) {
      window.clarity('consent', false);
    }
  }

  function applyRecord(record, eventName) {
    var choices = record.choices;
    window.__olgishConsentRecord = record;
    window.__olgishAnalyticsConsent = choices.googleAnalytics;
    window.gtag('consent', 'update', {
      ad_storage: choices.googleAds ? 'granted' : 'denied',
      analytics_storage: choices.googleAnalytics ? 'granted' : 'denied',
      ad_user_data: choices.googleAds ? 'granted' : 'denied',
      ad_personalization: choices.googleAds ? 'granted' : 'denied'
    });
    window.dataLayer.push({
      event: eventName,
      olgishConsent: {
        googleAnalytics: choices.googleAnalytics,
        microsoftClarity: choices.microsoftClarity,
        googleAds: choices.googleAds
      }
    });

    Object.keys(choices).forEach(function(serviceKey) {
      if (!choices[serviceKey]) deleteServiceCookies(serviceKey);
    });
    applyClarityConsent(choices);

    if (choices.googleAnalytics || choices.microsoftClarity || choices.googleAds) {
      loadGtmOnce();
    }
  }

  window.__olgishApplyConsentRecord = applyRecord;
  installConsentDefaults();

  var canonicalRawValue = getCookieValue(consentCookieName);
  var currentRecord = parseCanonical(canonicalRawValue);

  if (!canonicalRawValue) {
    currentRecord = migrateLegacyConsent();
    if (currentRecord) writeRecord(currentRecord);
  } else if (!currentRecord) {
    expireCookie(consentCookieName);
  }

  clearLegacyConsent();

  if (currentRecord) {
    hideBanner();
    applyRecord(currentRecord, 'olgish_consent_ready');
  } else {
    window.__olgishConsentRecord = null;
    showBanner();
    window.dataLayer.push({
      event: 'olgish_consent_ready',
      olgishConsent: {
        googleAnalytics: false,
        microsoftClarity: false,
        googleAds: false
      }
    });
  }

  banner.querySelectorAll('[data-consent-choice]').forEach(function(button) {
    button.addEventListener('click', function() {
      var choice = button.getAttribute('data-consent-choice');
      var granted = choice === 'accepted';
      if (!granted && choice !== 'declined') return;

      var record = {
        version: consentVersion,
        updatedAt: new Date().toISOString(),
        source: 'banner',
        choices: {
          googleAnalytics: granted,
          microsoftClarity: granted,
          googleAds: granted
        }
      };
      writeRecord(record);
      applyRecord(record, 'olgish_consent_update');
      hideBanner();
      window.dispatchEvent(new CustomEvent(${JSON.stringify(consentChangedEventName)}, {
        detail: record
      }));
    });
  });

  var preferencesButton = banner.querySelector('[data-consent-preferences]');
  if (preferencesButton) {
    preferencesButton.addEventListener('click', function() {
      window.__olgishConsentPreferencesRequested = true;
      window.dispatchEvent(new CustomEvent(${JSON.stringify(consentOpenEventName)}));
    });
  }

  window.addEventListener(${JSON.stringify(consentDialogStateEventName)}, function(event) {
    if (!event.detail) return;
    if (event.detail.isOpen === true) {
      hideBanner();
    } else if (!window.__olgishConsentRecord) {
      showBanner();
    }
  });
})();`
}
