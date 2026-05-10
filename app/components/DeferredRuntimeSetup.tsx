'use client'

import { useEffect } from 'react'

const deferredWorkDelayMs = 1800

function scheduleDeferredWork(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  if ('requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(callback, { timeout: 4000 })

    return () => {
      if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(handle)
      }
    }
  }

  const timeoutHandle = setTimeout(callback, deferredWorkDelayMs)

  return () => {
    clearTimeout(timeoutHandle)
  }
}

export function DeferredRuntimeSetup() {
  useEffect(() => {
    let restoreConsoleError: (() => void) | null = null
    let cancelDeferredWork = () => {}

    const suppressExpectedExtensionErrors = () => {
      const originalConsoleError = console.error

      console.error = (...args) => {
        const message = args.join(' ')

        if (
          message.includes('MetaMask') ||
          message.includes('Failed to connect to MetaMask')
        ) {
          return
        }

        originalConsoleError(...args)
      }

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        if (event.reason && typeof event.reason === 'object') {
          const reason = event.reason.toString()

          if (
            reason.includes('MetaMask') ||
            reason.includes('extension not found')
          ) {
            event.preventDefault()
          }
        }
      }

      window.addEventListener('unhandledrejection', handleUnhandledRejection)

      restoreConsoleError = () => {
        console.error = originalConsoleError
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      }
    }

    const registerServiceWorker = () => {
      if (
        process.env.NODE_ENV !== 'production' ||
        !('serviceWorker' in navigator)
      ) {
        return
      }

      void navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
    }

    const initializeDeferredRuntimeSetup = () => {
      registerServiceWorker()
    }

    const queueRuntimeSetup = () => {
      cancelDeferredWork = scheduleDeferredWork(initializeDeferredRuntimeSetup)
    }

    suppressExpectedExtensionErrors()

    if (document.readyState === 'complete') {
      queueRuntimeSetup()
    } else {
      window.addEventListener('load', queueRuntimeSetup, { once: true })
    }

    return () => {
      cancelDeferredWork()
      window.removeEventListener('load', queueRuntimeSetup)
      restoreConsoleError?.()
    }
  }, [])

  return null
}
