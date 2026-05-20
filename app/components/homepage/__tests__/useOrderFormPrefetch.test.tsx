/**
 * @jest-environment jsdom
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useOrderFormPrefetch } from '../useOrderFormPrefetch'
import {
  fetchOccasionOptions
} from '@/app/services/occasionOptions'

jest.mock('@/app/components/homepage/ProductOrderInlineFormWithProviders', () => ({
  ProductOrderInlineFormWithProviders: () => null
}))

jest.mock('@/app/services/occasionOptions', () => ({
  fetchOccasionOptions: jest.fn()
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
const mockedFetchOccasionOptions = fetchOccasionOptions as jest.MockedFunction<typeof fetchOccasionOptions>

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
    mockedFetchOccasionOptions.mockReset()
    mockedFetchOccasionOptions.mockResolvedValue([])
    idleWindow.requestIdleCallback = originalRequestIdleCallback
    idleWindow.cancelIdleCallback = originalCancelIdleCallback
  })

  afterEach(() => {
    jest.useRealTimers()
    idleWindow.requestIdleCallback = originalRequestIdleCallback
    idleWindow.cancelIdleCallback = originalCancelIdleCallback
  })

  it('prefetches occasion options on order intent when enabled', async () => {
    idleWindow.requestIdleCallback = jest.fn()

    render(<HookHarness prefetchOccasionOptions={true} />)

    expect(idleWindow.requestIdleCallback).not.toHaveBeenCalled()
    expect(mockedFetchOccasionOptions).not.toHaveBeenCalled()

    await act(async () => {
      fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger order intent' }))
    })

    expect(mockedFetchOccasionOptions).toHaveBeenCalledTimes(1)
    expect(mockedFetchOccasionOptions.mock.calls[0]?.[0]).toBeInstanceOf(AbortSignal)
  })

  it('does not schedule fallback timers before order intent', () => {
    jest.useFakeTimers()
    idleWindow.requestIdleCallback = undefined
    idleWindow.cancelIdleCallback = undefined

    render(<HookHarness prefetchOccasionOptions={true} />)

    expect(jest.getTimerCount()).toBe(0)
    expect(mockedFetchOccasionOptions).not.toHaveBeenCalled()
  })

  it('prefetches only once across repeated order intents', () => {
    render(<HookHarness prefetchOccasionOptions={true} />)

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger order intent' }))
    expect(mockedFetchOccasionOptions).toHaveBeenCalledTimes(1)

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger order intent' }))
    expect(mockedFetchOccasionOptions).toHaveBeenCalledTimes(1)
  })

  it('skips occasion options prefetch when disabled', () => {
    render(<HookHarness prefetchOccasionOptions={false} />)

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger order intent' }))

    expect(mockedFetchOccasionOptions).not.toHaveBeenCalled()
  })
})
