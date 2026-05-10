'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { writePreviousPathnameToHistoryState } from '@/app/utils/history-state'

function scrollWindowToTop() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  } catch {
    window.scrollTo(0, 0)
  }
}

export function RouteScrollReset() {
  const pathname = usePathname()
  const previousPathnameRef = useRef<string | null>(null)
  const isHistoryTraversalRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handlePopState = () => {
      const currentWindowPathname = window.location.pathname

      if (
        previousPathnameRef.current !== null &&
        previousPathnameRef.current === currentWindowPathname
      ) {
        return
      }

      isHistoryTraversalRef.current = true
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    if (previousPathnameRef.current === null) {
      previousPathnameRef.current = pathname
      writePreviousPathnameToHistoryState(null)
      return
    }

    if (previousPathnameRef.current === pathname) {
      if (isHistoryTraversalRef.current) {
        isHistoryTraversalRef.current = false
      }

      return
    }

    const isHistoryTraversal = isHistoryTraversalRef.current
    const previousPathname = previousPathnameRef.current
    isHistoryTraversalRef.current = false

    previousPathnameRef.current = pathname

    if (isHistoryTraversal) {
      return
    }

    writePreviousPathnameToHistoryState(previousPathname)

    if (typeof window === 'undefined' || window.location.hash.length > 0) {
      return
    }

    scrollWindowToTop()
  }, [pathname])

  return null
}
