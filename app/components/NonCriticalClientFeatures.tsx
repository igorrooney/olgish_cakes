'use client'

import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'
import { DeferredRuntimeSetup } from './DeferredRuntimeSetup'
import { RouteScrollReset } from './RouteScrollReset'
import { WebVitalsMonitor } from './WebVitalsMonitor'

type LoadedFeatures = {
  KlaroA11yBridge: ComponentType
  ScrollToTop: ComponentType
}

function scheduleDeferredLoad(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  if ('requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(callback, { timeout: 2500 })

    return () => {
      if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(handle)
      }
    }
  }

  const timeoutHandle = setTimeout(callback, 1200)

  return () => {
    clearTimeout(timeoutHandle)
  }
}

export function NonCriticalClientFeatures() {
  const [loadedFeatures, setLoadedFeatures] = useState<LoadedFeatures | null>(null)

  useEffect(() => {
    let isCancelled = false
    let cancelDeferredLoad = () => {}

    const loadFeatures = async () => {
      const [
        { KlaroA11yBridge },
        { ScrollToTop }
      ] = await Promise.all([
        import('./KlaroA11yBridge'),
        import('./ScrollToTop')
      ])

      if (isCancelled) {
        return
      }

      setLoadedFeatures({
        KlaroA11yBridge,
        ScrollToTop
      })
    }

    const queueFeatureLoad = () => {
      cancelDeferredLoad = scheduleDeferredLoad(() => {
        void loadFeatures()
      })
    }

    if (document.readyState === 'complete') {
      queueFeatureLoad()
    } else {
      window.addEventListener('load', queueFeatureLoad, { once: true })
    }

    return () => {
      isCancelled = true
      cancelDeferredLoad()
      window.removeEventListener('load', queueFeatureLoad)
    }
  }, [])

  return (
    <>
      <RouteScrollReset />
      <DeferredRuntimeSetup />
      <WebVitalsMonitor />
      {loadedFeatures ? (
        <>
          <loadedFeatures.KlaroA11yBridge />
          <loadedFeatures.ScrollToTop />
        </>
      ) : null}
    </>
  )
}
