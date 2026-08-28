'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { getQueryClient } from '@/app/providers'
import {
  fetchOccasionOptions,
  occasionOptionsQueryKey,
  occasionOptionsStaleTimeMs
} from '@/app/services/occasionOptions'

interface UseOrderFormPrefetchOptions {
  prefetchOccasionOptions: boolean
}

export function useOrderFormPrefetch({
  prefetchOccasionOptions
}: UseOrderFormPrefetchOptions) {
  const hasPrefetchedRef = useRef(false)
  const queryClientRef = useRef<QueryClient | null>(null)

  useEffect(() => {
    return () => {
      if (queryClientRef.current) {
        void queryClientRef.current.cancelQueries({
          queryKey: occasionOptionsQueryKey,
          exact: true
        })
      }
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

    const queryClient = getQueryClient()
    queryClientRef.current = queryClient

    void queryClient.prefetchQuery({
      queryKey: occasionOptionsQueryKey,
      queryFn: ({ signal }) => fetchOccasionOptions(signal),
      staleTime: occasionOptionsStaleTimeMs
    }).catch(() => {
      // The real form owns validation and retry; this is only an intent warm-up.
    })
  }, [prefetchOccasionOptions])

  return prefetchOrderForm
}
