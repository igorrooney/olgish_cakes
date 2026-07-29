'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { consentOpenEventName } from '@/app/lib/consent-config'

const ConsentPreferencesDialog = dynamic(
  () => import('./ConsentPreferencesDialog').then(module => module.ConsentPreferencesDialog),
  {
    loading: () => null,
    ssr: false
  }
)

type ConsentRequestWindow = Window & typeof globalThis & {
  __olgishConsentPreferencesRequested?: boolean
}

export function ConsentPreferencesController() {
  const [isOpen, setIsOpen] = useState(false)
  const restoreFocusTo = useRef<HTMLElement | null>(null)

  const openDialog = useCallback(() => {
    restoreFocusTo.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    ;(window as ConsentRequestWindow).__olgishConsentPreferencesRequested = false
    setIsOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsOpen(false)
    window.setTimeout(() => {
      restoreFocusTo.current?.focus()
    }, 0)
  }, [])

  useEffect(() => {
    window.addEventListener(consentOpenEventName, openDialog)

    if ((window as ConsentRequestWindow).__olgishConsentPreferencesRequested) {
      openDialog()
    }

    return () => {
      window.removeEventListener(consentOpenEventName, openDialog)
    }
  }, [openDialog])

  return isOpen
    ? <ConsentPreferencesDialog isOpen onRequestClose={closeDialog} />
    : null
}

