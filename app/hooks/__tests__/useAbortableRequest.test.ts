/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react'
import { useAbortableRequest } from '../useAbortableRequest'

describe('useAbortableRequest', () => {
  it('aborts the previous request before starting another one', () => {
    const { result } = renderHook(() => useAbortableRequest())

    let firstSignal: AbortSignal | undefined
    let secondSignal: AbortSignal | undefined

    act(() => {
      firstSignal = result.current.start()
      secondSignal = result.current.start()
    })

    expect(firstSignal?.aborted).toBe(true)
    expect(secondSignal?.aborted).toBe(false)
  })

  it('supports explicit cancellation and aborts on unmount', () => {
    const { result, unmount } = renderHook(() => useAbortableRequest())

    let explicitlyCancelledSignal: AbortSignal | undefined
    let unmountedSignal: AbortSignal | undefined

    act(() => {
      explicitlyCancelledSignal = result.current.start()
      result.current.abort()
      unmountedSignal = result.current.start()
    })

    expect(explicitlyCancelledSignal?.aborted).toBe(true)
    expect(unmountedSignal?.aborted).toBe(false)

    unmount()

    expect(unmountedSignal?.aborted).toBe(true)
  })
})
