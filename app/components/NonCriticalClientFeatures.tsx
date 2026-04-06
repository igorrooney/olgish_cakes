'use client'

import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'
import { RouteScrollReset } from './RouteScrollReset'

type LoadedFeatures = {
  DeferredRuntimeSetup: ComponentType
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
        { DeferredRuntimeSetup },
        { KlaroA11yBridge },
        { ScrollToTop }
      ] = await Promise.all([
        import('./DeferredRuntimeSetup'),
        import('./KlaroA11yBridge'),
        import('./ScrollToTop')
      ])

      if (isCancelled) {
        return
      }

      setLoadedFeatures({
        DeferredRuntimeSetup,
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
      {loadedFeatures ? (
        <>
          <loadedFeatures.DeferredRuntimeSetup />
          <loadedFeatures.KlaroA11yBridge />
          <loadedFeatures.ScrollToTop />
        </>
      ) : null}
    </>
  )
}
