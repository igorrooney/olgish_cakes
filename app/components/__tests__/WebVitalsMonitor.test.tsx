/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react'
import * as webVitals from 'web-vitals'
import { WebVitalsMonitor } from '../WebVitalsMonitor'

jest.mock('web-vitals', () => ({
  onCLS: jest.fn(),
  onINP: jest.fn(),
  onFCP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn()
}))

const mockedWebVitals = webVitals as jest.Mocked<typeof webVitals>
const originalNodeEnv = process.env.NODE_ENV

function setDocumentReadyState(value: DocumentReadyState) {
  Object.defineProperty(document, 'readyState', {
    configurable: true,
    value
  })
}

describe('WebVitalsMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setDocumentReadyState('complete')
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('registers web-vitals callbacks on mount in production without waiting for load', async () => {
    process.env.NODE_ENV = 'production'
    setDocumentReadyState('loading')

    render(<WebVitalsMonitor />)

    await waitFor(() => {
      expect(mockedWebVitals.onCLS).toHaveBeenCalledTimes(1)
      expect(mockedWebVitals.onINP).toHaveBeenCalledTimes(1)
      expect(mockedWebVitals.onFCP).toHaveBeenCalledTimes(1)
      expect(mockedWebVitals.onLCP).toHaveBeenCalledTimes(1)
      expect(mockedWebVitals.onTTFB).toHaveBeenCalledTimes(1)
    })
  })

  it('skips web-vitals registration outside production', () => {
    process.env.NODE_ENV = 'test'

    render(<WebVitalsMonitor />)

    expect(mockedWebVitals.onCLS).not.toHaveBeenCalled()
    expect(mockedWebVitals.onINP).not.toHaveBeenCalled()
    expect(mockedWebVitals.onFCP).not.toHaveBeenCalled()
    expect(mockedWebVitals.onLCP).not.toHaveBeenCalled()
    expect(mockedWebVitals.onTTFB).not.toHaveBeenCalled()
  })
})
