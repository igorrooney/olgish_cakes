'use client'

import { useCallback } from 'react'
import { loadConsentRuntime } from '@/app/lib/consent-runtime'

type KlaroManager = {
  show: (config?: unknown, modal?: boolean) => void
}

type ManageCookiesLinkProps = {
  className?: string
}

export function ManageCookiesLink({ className }: ManageCookiesLinkProps) {
  const handleClick = useCallback(() => {
    if (typeof window === 'undefined') return

    const klaro = (window as Window & { klaro?: KlaroManager }).klaro
    if (klaro?.show) {
      klaro.show(undefined, true)
      return
    }

    void loadConsentRuntime({ openModal: true })
  }, [])

  return (
    <button
      type='button'
      onClick={handleClick}
      className={className}
      aria-label='Manage cookies'
    >
      Manage cookies
    </button>
  )
}
