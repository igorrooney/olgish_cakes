'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  fetchOccasionOptions,
  occasionOptionsQueryKey,
  occasionOptionsStaleTimeMs
} from '@/app/services/occasionOptions'

interface UseOrderFormPrefetchOptions {
  prefetchOccasionOptions: boolean
}

type IdleCallbackHandle = number

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: {
      timeout?: number
    }
  ) => IdleCallbackHandle
  cancelIdleCallback?: (handle: IdleCallbackHandle) => void
}

const idlePrefetchTimeoutMs = 2000
const fallbackPrefetchDelayMs = 1200

export function useOrderFormPrefetch({
  prefetchOccasionOptions
}: UseOrderFormPrefetchOptions) {
  const queryClient = useQueryClient()
  const hasPrefetchedRef = useRef(false)
  const idleCallbackHandleRef = useRef<IdleCallbackHandle | null>(null)
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const prefetchOrderForm = useCallback(() => {
    if (hasPrefetchedRef.current) {
      return
    }

    hasPrefetchedRef.current = true

    void import('@/app/components/homepage/ProductOrderInlineForm')

    if (!prefetchOccasionOptions) {
      return
    }

    void queryClient.prefetchQuery({
      queryKey: occasionOptionsQueryKey,
      queryFn: ({ signal }) => fetchOccasionOptions(signal),
      staleTime: occasionOptionsStaleTimeMs
    })
  }, [prefetchOccasionOptions, queryClient])

  useEffect(() => {
    const idleWindow = window as IdleWindow

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleCallbackHandleRef.current = idleWindow.requestIdleCallback(() => {
        idleCallbackHandleRef.current = null
        prefetchOrderForm()
      }, {
        timeout: idlePrefetchTimeoutMs
      })
    } else {
      fallbackTimeoutRef.current = setTimeout(() => {
        fallbackTimeoutRef.current = null
        prefetchOrderForm()
      }, fallbackPrefetchDelayMs)
    }

    return () => {
      if (
        idleCallbackHandleRef.current !== null &&
        typeof idleWindow.cancelIdleCallback === 'function'
      ) {
        idleWindow.cancelIdleCallback(idleCallbackHandleRef.current)
        idleCallbackHandleRef.current = null
      }

      if (fallbackTimeoutRef.current !== null) {
        clearTimeout(fallbackTimeoutRef.current)
        fallbackTimeoutRef.current = null
      }
    }
  }, [prefetchOrderForm])

  return prefetchOrderForm
}
