'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  fetchOccasionOptions
} from '@/app/services/occasionOptions'

interface UseOrderFormPrefetchOptions {
  prefetchOccasionOptions: boolean
}

export function useOrderFormPrefetch({
  prefetchOccasionOptions
}: UseOrderFormPrefetchOptions) {
  const hasPrefetchedRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const prefetchOrderForm = useCallback(() => {
    if (hasPrefetchedRef.current) {
      return
    }

    hasPrefetchedRef.current = true

    void import('@/app/components/homepage/ProductOrderInlineFormWithProviders')

    if (!prefetchOccasionOptions) {
      return
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    void fetchOccasionOptions(abortController.signal).catch(() => {
      // The real form owns validation and retry; this is only an intent warm-up.
    })
  }, [prefetchOccasionOptions])

  return prefetchOrderForm
}
