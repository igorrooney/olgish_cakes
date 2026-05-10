/**
 * @jest-environment jsdom
 */
import { act, render } from '@testing-library/react'
import { DeferredRuntimeSetup } from '../DeferredRuntimeSetup'

jest.mock('@/app/lib/consent-runtime', () => ({
  loadConsentRuntime: jest.fn(() => Promise.resolve())
}))

function setDocumentReadyState(value: DocumentReadyState) {
  Object.defineProperty(document, 'readyState', {
    configurable: true,
    value
  })
}

describe('DeferredRuntimeSetup', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalServiceWorker = navigator.serviceWorker

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
    process.env.NODE_ENV = originalNodeEnv
    setDocumentReadyState('complete')

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalServiceWorker
    })
  })

  it('registers the service worker only after load and deferred work in production', () => {
    process.env.NODE_ENV = 'production'

    const register = jest.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register }
    })

    setDocumentReadyState('loading')

    render(<DeferredRuntimeSetup />)

    expect(register).not.toHaveBeenCalled()

    act(() => {
      window.dispatchEvent(new Event('load'))
      jest.advanceTimersByTime(1800)
    })

    expect(register).toHaveBeenCalledWith('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    })
  })

  it('does not load the heavy consent runtime on mount', async () => {
    const { loadConsentRuntime } = await import('@/app/lib/consent-runtime')

    render(<DeferredRuntimeSetup />)

    await act(async () => {
      await Promise.resolve()
    })

    expect(loadConsentRuntime).not.toHaveBeenCalled()
  })

  it('skips service worker registration outside production', () => {
    process.env.NODE_ENV = 'test'

    const register = jest.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register }
    })

    render(<DeferredRuntimeSetup />)

    act(() => {
      jest.advanceTimersByTime(1800)
    })

    expect(register).not.toHaveBeenCalled()
  })
})
