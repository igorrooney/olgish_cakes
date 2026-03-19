/**
 * @jest-environment jsdom
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useQueryClient } from '@tanstack/react-query'
import { useOrderFormPrefetch } from '../useOrderFormPrefetch'
import {
  fetchOccasionOptions,
  occasionOptionsQueryKey,
  occasionOptionsStaleTimeMs
} from '@/app/services/occasionOptions'

jest.mock('@/app/components/homepage/ProductOrderInlineForm', () => ({
  ProductOrderInlineForm: () => null
}))

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual<typeof import('@tanstack/react-query')>('@tanstack/react-query')

  return {
    ...actual,
    useQueryClient: jest.fn()
  }
})

jest.mock('@/app/services/occasionOptions', () => ({
  fetchOccasionOptions: jest.fn(),
  occasionOptionsQueryKey: ['occasion-options'] as const,
  occasionOptionsStaleTimeMs: 1000 * 60 * 30
}))

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: {
      timeout?: number
    }
  ) => number
  cancelIdleCallback?: (handle: number) => void
}

const idleWindow = window as IdleWindow
const originalRequestIdleCallback = idleWindow.requestIdleCallback
const originalCancelIdleCallback = idleWindow.cancelIdleCallback
const mockedUseQueryClient = useQueryClient as jest.MockedFunction<typeof useQueryClient>
const mockedFetchOccasionOptions = fetchOccasionOptions as jest.MockedFunction<typeof fetchOccasionOptions>
const prefetchQueryMock = jest.fn<Promise<unknown>, [unknown]>()

function HookHarness({ prefetchOccasionOptions }: { prefetchOccasionOptions: boolean }) {
  const handleOrderIntent = useOrderFormPrefetch({ prefetchOccasionOptions })

  return (
    <button type='button' onMouseEnter={handleOrderIntent}>
      Trigger order intent
    </button>
  )
}

describe('useOrderFormPrefetch', () => {
  beforeEach(() => {
    prefetchQueryMock.mockReset()
    prefetchQueryMock.mockResolvedValue(undefined)
    mockedFetchOccasionOptions.mockReset()
    mockedFetchOccasionOptions.mockResolvedValue([])
    mockedUseQueryClient.mockReset()
    mockedUseQueryClient.mockReturnValue({
      prefetchQuery: prefetchQueryMock
    } as unknown as ReturnType<typeof useQueryClient>)
    idleWindow.requestIdleCallback = originalRequestIdleCallback
    idleWindow.cancelIdleCallback = originalCancelIdleCallback
  })

  afterEach(() => {
    jest.useRealTimers()
    idleWindow.requestIdleCallback = originalRequestIdleCallback
    idleWindow.cancelIdleCallback = originalCancelIdleCallback
  })

  it('schedules idle prefetch and prefetches occasion options when enabled', async () => {
    let scheduledIdleCallback: (() => void) | null = null

    idleWindow.requestIdleCallback = jest.fn((callback: () => void) => {
      scheduledIdleCallback = callback
      return 101
    })
    idleWindow.cancelIdleCallback = jest.fn()

    render(<HookHarness prefetchOccasionOptions={true} />)

    expect(idleWindow.requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), {
      timeout: 2000
    })
    expect(prefetchQueryMock).not.toHaveBeenCalled()

    if (scheduledIdleCallback === null) {
      throw new Error('Expected idle callback to be scheduled')
    }

    await act(async () => {
      scheduledIdleCallback?.()
    })

    expect(prefetchQueryMock).toHaveBeenCalledTimes(1)

    const prefetchConfig = prefetchQueryMock.mock.calls[0]?.[0] as {
      queryKey?: readonly string[]
      staleTime?: number
      queryFn?: ({ signal }: { signal: AbortSignal }) => Promise<unknown>
    }

    expect(prefetchConfig.queryKey).toEqual(occasionOptionsQueryKey)
    expect(prefetchConfig.staleTime).toBe(occasionOptionsStaleTimeMs)

    if (typeof prefetchConfig.queryFn !== 'function') {
      throw new Error('Expected prefetch queryFn to be defined')
    }

    const signal = new AbortController().signal
    await prefetchConfig.queryFn({ signal })

    expect(mockedFetchOccasionOptions).toHaveBeenCalledWith(signal)
  })

  it('falls back to timeout scheduling when requestIdleCallback is unavailable', () => {
    jest.useFakeTimers()
    idleWindow.requestIdleCallback = undefined
    idleWindow.cancelIdleCallback = undefined

    render(<HookHarness prefetchOccasionOptions={true} />)

    act(() => {
      jest.advanceTimersByTime(1199)
    })
    expect(prefetchQueryMock).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(prefetchQueryMock).toHaveBeenCalledTimes(1)
  })

  it('prefetches only once when both intent and idle callback run', () => {
    let scheduledIdleCallback: (() => void) | null = null

    idleWindow.requestIdleCallback = jest.fn((callback: () => void) => {
      scheduledIdleCallback = callback
      return 9
    })
    idleWindow.cancelIdleCallback = jest.fn()

    render(<HookHarness prefetchOccasionOptions={true} />)

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger order intent' }))
    expect(prefetchQueryMock).toHaveBeenCalledTimes(1)

    if (scheduledIdleCallback === null) {
      throw new Error('Expected idle callback to be scheduled')
    }

    act(() => {
      scheduledIdleCallback?.()
    })
    expect(prefetchQueryMock).toHaveBeenCalledTimes(1)
  })

  it('skips occasion options prefetch when disabled', () => {
    let scheduledIdleCallback: (() => void) | null = null

    idleWindow.requestIdleCallback = jest.fn((callback: () => void) => {
      scheduledIdleCallback = callback
      return 44
    })
    idleWindow.cancelIdleCallback = jest.fn()

    render(<HookHarness prefetchOccasionOptions={false} />)

    if (scheduledIdleCallback === null) {
      throw new Error('Expected idle callback to be scheduled')
    }

    act(() => {
      scheduledIdleCallback?.()
    })
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger order intent' }))

    expect(prefetchQueryMock).not.toHaveBeenCalled()
  })

  it('cancels idle callback on unmount', () => {
    idleWindow.requestIdleCallback = jest.fn(() => 72)
    idleWindow.cancelIdleCallback = jest.fn()

    const { unmount } = render(<HookHarness prefetchOccasionOptions={true} />)

    unmount()

    expect(idleWindow.cancelIdleCallback).toHaveBeenCalledWith(72)
  })

  it('clears timeout fallback on unmount', () => {
    jest.useFakeTimers()
    idleWindow.requestIdleCallback = undefined
    idleWindow.cancelIdleCallback = undefined

    const { unmount } = render(<HookHarness prefetchOccasionOptions={true} />)

    expect(jest.getTimerCount()).toBeGreaterThan(0)

    unmount()

    expect(jest.getTimerCount()).toBe(0)
    expect(prefetchQueryMock).not.toHaveBeenCalled()
  })
})
