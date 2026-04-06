/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react'
import { NonCriticalClientFeatures } from '../NonCriticalClientFeatures'

jest.mock('../DeferredRuntimeSetup', () => ({
  DeferredRuntimeSetup: () => <div data-testid='deferred-runtime-setup' />
}))

jest.mock('../KlaroA11yBridge', () => ({
  KlaroA11yBridge: () => <div data-testid='klaro-bridge' />
}))

jest.mock('../RouteScrollReset', () => ({
  RouteScrollReset: () => <div data-testid='route-scroll-reset' />
}))

jest.mock('../ScrollToTop', () => ({
  ScrollToTop: () => <div data-testid='scroll-to-top' />
}))

function setDocumentReadyState(value: DocumentReadyState) {
  Object.defineProperty(document, 'readyState', {
    configurable: true,
    value
  })
}

describe('NonCriticalClientFeatures', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    delete (window as Window & {
      requestIdleCallback?: Window['requestIdleCallback']
      cancelIdleCallback?: Window['cancelIdleCallback']
    }).requestIdleCallback
    delete (window as Window & {
      requestIdleCallback?: Window['requestIdleCallback']
      cancelIdleCallback?: Window['cancelIdleCallback']
    }).cancelIdleCallback
    setDocumentReadyState('complete')
  })

  it('loads after the window load event when idle callbacks are unavailable', async () => {
    setDocumentReadyState('loading')

    render(<NonCriticalClientFeatures />)

    expect(screen.getByTestId('route-scroll-reset')).toBeInTheDocument()
    expect(screen.queryByTestId('klaro-bridge')).not.toBeInTheDocument()
    expect(screen.queryByTestId('deferred-runtime-setup')).not.toBeInTheDocument()
    expect(screen.queryByTestId('scroll-to-top')).not.toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event('load'))
      jest.advanceTimersByTime(1200)
    })

    expect(await screen.findByTestId('klaro-bridge')).toBeInTheDocument()
    expect(screen.getByTestId('deferred-runtime-setup')).toBeInTheDocument()
    expect(screen.getByTestId('route-scroll-reset')).toBeInTheDocument()
    expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument()
  })

  it('uses requestIdleCallback immediately when the page is already loaded', async () => {
    const requestIdleCallback = jest.fn((callback: IdleRequestCallback) => {
      window.setTimeout(() => {
        callback({
          didTimeout: false,
          timeRemaining: () => 50
        } as IdleDeadline)
      }, 0)

      return 1
    })

    const cancelIdleCallback = jest.fn()

    Object.assign(window, {
      requestIdleCallback,
      cancelIdleCallback
    })

    setDocumentReadyState('complete')

    render(<NonCriticalClientFeatures />)

    expect(screen.getByTestId('route-scroll-reset')).toBeInTheDocument()
    expect(screen.queryByTestId('klaro-bridge')).not.toBeInTheDocument()

    act(() => {
      jest.runAllTimers()
    })

    expect(requestIdleCallback).toHaveBeenCalledTimes(1)
    expect(await screen.findByTestId('klaro-bridge')).toBeInTheDocument()
    expect(screen.getByTestId('deferred-runtime-setup')).toBeInTheDocument()
    expect(screen.getByTestId('route-scroll-reset')).toBeInTheDocument()
    expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument()
  })
})
