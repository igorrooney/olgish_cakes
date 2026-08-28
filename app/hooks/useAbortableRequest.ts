'use client'

import { useCallback, useEffect, useRef } from 'react'

export function useAbortableRequest() {
  const controllerRef = useRef<AbortController | null>(null)

  const abort = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
  }, [])

  const start = useCallback(() => {
    abort()

    const controller = new AbortController()
    controllerRef.current = controller

    return controller.signal
  }, [abort])

  useEffect(() => abort, [abort])

  return {
    abort,
    start
  }
}
