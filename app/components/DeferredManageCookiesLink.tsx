'use client'

import { useCallback } from 'react'
import { requestConsentPreferences } from '@/app/lib/consent-runtime'

type DeferredManageCookiesLinkProps = {
  className?: string
}

export function DeferredManageCookiesLink({ className }: DeferredManageCookiesLinkProps) {
  const handleClick = useCallback(() => {
    requestConsentPreferences()
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
