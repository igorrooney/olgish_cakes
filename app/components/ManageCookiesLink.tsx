'use client'

import { useCallback } from 'react'
import { requestConsentPreferences } from '@/app/lib/consent-runtime'

type ManageCookiesLinkProps = {
  className?: string
}

export function ManageCookiesLink({ className }: ManageCookiesLinkProps) {
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
