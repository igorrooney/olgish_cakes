'use client'

import { useCallback } from 'react'

type KlaroManager = {
  show: (config?: unknown, modal?: boolean) => void
}

type DeferredManageCookiesLinkProps = {
  className?: string
}

export function DeferredManageCookiesLink({ className }: DeferredManageCookiesLinkProps) {
  const handleClick = useCallback(async () => {
    if (typeof window === 'undefined') {
      return
    }

    const klaro = (window as Window & { klaro?: KlaroManager }).klaro

    if (klaro?.show) {
      klaro.show(undefined, true)
      return
    }

    const { loadConsentRuntime } = await import('@/app/lib/consent-runtime')
    await loadConsentRuntime({ openModal: true })
  }, [])

  return (
    <button
      type='button'
      onClick={() => {
        void handleClick()
      }}
      className={className}
      aria-label='Manage cookies'
    >
      Manage cookies
    </button>
  )
}
