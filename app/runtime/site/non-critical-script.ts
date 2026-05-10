export const nonCriticalRuntimeSrc = '/runtime/site/non-critical.js'
export const previousPathnameStateKey = '__olgishPreviousPathname'
export const scrollToTopButtonId = 'olgish-scroll-to-top'
export const hiddenScrollToTopClasses = 'pointer-events-none translate-y-3 opacity-0'
export const visibleScrollToTopClasses = 'pointer-events-auto translate-y-0 opacity-100'

export function createDeferredRuntimeScript() {
  return `(function() {
  if (window.location.pathname === '/admin' || window.location.pathname.indexOf('/admin/') === 0) {
    return;
  }

  var previousPathnameStateKey = ${JSON.stringify(previousPathnameStateKey)};
  var scrollToTopButtonId = ${JSON.stringify(scrollToTopButtonId)};
  var hiddenScrollToTopClasses = ${JSON.stringify(hiddenScrollToTopClasses)}.split(' ');
  var visibleScrollToTopClasses = ${JSON.stringify(visibleScrollToTopClasses)}.split(' ');
  var scrollButton = document.getElementById(scrollToTopButtonId);

  function scheduleDeferredWork(callback) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout: 4000 });
      return;
    }

    window.setTimeout(callback, 1800);
  }

  function normalizePathname(pathname) {
    if (pathname === '/') {
      return pathname;
    }

    var normalizedPathname = pathname.replace(/\\/+$/, '');
    return normalizedPathname.length > 0 ? normalizedPathname : '/';
  }

  function writePreviousPathnameToHistoryState(previousPathname) {
    try {
      var currentState = window.history.state;
      var nextState = currentState && typeof currentState === 'object'
        ? Object.assign({}, currentState)
        : {};

      nextState[previousPathnameStateKey] = typeof previousPathname === 'string'
        ? normalizePathname(previousPathname)
        : null;

      window.history.replaceState(nextState, '', window.location.href);
    } catch (error) {
    }
  }

  function isPlainPrimaryClick(event) {
    return event.button === 0 &&
      !event.defaultPrevented &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;
  }

  function trackInternalLinkNavigation(event) {
    if (!isPlainPrimaryClick(event)) {
      return;
    }

    var link = event.target instanceof Element
      ? event.target.closest('a[href]')
      : null;

    if (!link) {
      return;
    }

    var target = link.getAttribute('target');
    var href = link.getAttribute('href');

    if (!href || target && target !== '_self' || href.charAt(0) === '#') {
      return;
    }

    try {
      var nextUrl = new URL(href, window.location.href);

      if (nextUrl.origin !== window.location.origin ||
        normalizePathname(nextUrl.pathname) === normalizePathname(window.location.pathname)) {
        return;
      }

      writePreviousPathnameToHistoryState(window.location.pathname);
    } catch (error) {
    }
  }

  function toggleScrollButton() {
    if (!scrollButton) {
      return;
    }

    var isVisible = window.pageYOffset > 300 && document.body.dataset.klaroOpen !== 'true';
    var classesToRemove = isVisible ? hiddenScrollToTopClasses : visibleScrollToTopClasses;
    var classesToAdd = isVisible ? visibleScrollToTopClasses : hiddenScrollToTopClasses;

    scrollButton.classList.remove.apply(scrollButton.classList, classesToRemove);
    scrollButton.classList.add.apply(scrollButton.classList, classesToAdd);
    scrollButton.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
    scrollButton.tabIndex = isVisible ? 0 : -1;
  }

  function suppressExpectedExtensionErrors() {
    var originalConsoleError = console.error;

    console.error = function() {
      var message = Array.prototype.join.call(arguments, ' ');

      if (message.indexOf('MetaMask') >= 0 || message.indexOf('Failed to connect to MetaMask') >= 0) {
        return;
      }

      originalConsoleError.apply(console, arguments);
    };

    window.addEventListener('unhandledrejection', function(event) {
      var reason = event.reason && typeof event.reason === 'object'
        ? String(event.reason)
        : '';

      if (reason.indexOf('MetaMask') >= 0 || reason.indexOf('extension not found') >= 0) {
        event.preventDefault();
      }
    });
  }

  function registerServiceWorker() {
    if (${JSON.stringify(process.env.NODE_ENV)} !== 'production' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    }).catch(function() {});
  }

  writePreviousPathnameToHistoryState(null);
  document.addEventListener('click', trackInternalLinkNavigation, true);
  suppressExpectedExtensionErrors();

  if (scrollButton) {
    scrollButton.addEventListener('click', function() {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        window.scrollTo(0, 0);
      }
    });
    window.addEventListener('scroll', toggleScrollButton, { passive: true });
    window.addEventListener('klaro-visibility-change', toggleScrollButton);
    toggleScrollButton();
  }

  var queueRuntimeSetup = function() {
    scheduleDeferredWork(registerServiceWorker);
  };

  if (document.readyState === 'complete') {
    queueRuntimeSetup();
  } else {
    window.addEventListener('load', queueRuntimeSetup, { once: true });
  }
})();`
}
