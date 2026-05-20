import {
  hiddenScrollToTopClasses,
  nonCriticalRuntimeSrc,
  scrollToTopButtonId
} from '@/app/runtime/site/non-critical-script'

const delayedRuntimeLoadMs = 6000

function createNonCriticalRuntimeLoaderScript() {
  return `(function() {
  if (window.location.pathname === '/admin' || window.location.pathname.indexOf('/admin/') === 0) {
    return;
  }

  var runtimeSrc = ${JSON.stringify(nonCriticalRuntimeSrc)};
  var runtimeScriptId = 'olgish-site-non-critical-runtime';
  var hasQueuedLoad = false;

  function removeInteractionListeners() {
    window.removeEventListener('scroll', loadRuntime);
    window.removeEventListener('pointerdown', loadRuntime);
    window.removeEventListener('keydown', loadRuntime);
  }

  function loadRuntime() {
    if (hasQueuedLoad || document.getElementById(runtimeScriptId)) {
      removeInteractionListeners();
      return;
    }

    hasQueuedLoad = true;
    removeInteractionListeners();

    var script = document.createElement('script');
    script.id = runtimeScriptId;
    script.src = runtimeSrc;
    script.async = true;
    document.body.appendChild(script);
  }

  function scheduleRuntimeLoad() {
    window.setTimeout(loadRuntime, ${delayedRuntimeLoadMs});
    window.addEventListener('scroll', loadRuntime, { once: true, passive: true });
    window.addEventListener('pointerdown', loadRuntime, { once: true, passive: true });
    window.addEventListener('keydown', loadRuntime, { once: true });
  }

  if (document.readyState === 'complete') {
    scheduleRuntimeLoad();
  } else {
    window.addEventListener('load', scheduleRuntimeLoad, { once: true });
  }
})();`
}

export function DeferredNonCriticalClientFeatures() {
  return (
    <>
      <button
        id={scrollToTopButtonId}
        data-testid='fab'
        data-size='medium'
        type='button'
        tabIndex={-1}
        aria-hidden='true'
        aria-label='Scroll to top'
        title='Scroll to top'
        className={`btn btn-circle btn-ghost fixed bottom-6 right-6 z-[1000] h-12 min-h-12 w-12 border border-white/20 bg-[linear-gradient(135deg,rgba(46,49,146,0.15)_0%,rgba(30,36,112,0.25)_100%)] p-0 text-white/90 shadow-[0_8px_32px_rgba(46,49,146,0.1),0_4px_16px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.1)] backdrop-blur-[20px] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:border-white/30 hover:bg-[linear-gradient(135deg,rgba(46,49,146,0.25)_0%,rgba(30,36,112,0.35)_100%)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 active:scale-[0.98] ${hiddenScrollToTopClasses}`}
      >
        <svg
          aria-hidden='true'
          viewBox='0 0 24 24'
          className='h-5 w-5'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M12 5l-7 7m7-7 7 7m-7-7v14'
            stroke='currentColor'
            strokeWidth='2.2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </button>
      <script
        dangerouslySetInnerHTML={{ __html: createNonCriticalRuntimeLoaderScript() }}
      />
    </>
  )
}
