/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react'
import { DeferredViewportImage } from '../DeferredViewportImage'

type IntersectionObserverCallbackType = (
  entries: Array<Partial<IntersectionObserverEntry>>
) => void

let intersectionObserverCallback: IntersectionObserverCallbackType | null = null

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallbackType) {
    intersectionObserverCallback = callback
  }

  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <img
      alt={typeof props.alt === 'string' ? props.alt : ''}
      data-testid='deferred-viewport-image'
      data-loading={props.loading}
    />
  )
}))

describe('DeferredViewportImage', () => {
  beforeEach(() => {
    intersectionObserverCallback = null
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    })
  })

  it('renders a placeholder until the image approaches the viewport', async () => {
    render(
      <div className='relative h-40 w-40'>
        <DeferredViewportImage
          src='/images/test-image.png'
          alt='Deferred image'
          fill
          sizes='160px'
        />
      </div>
    )

    expect(screen.getByTestId('deferred-viewport-image-placeholder')).toBeInTheDocument()

    await act(async () => {
      intersectionObserverCallback?.([{ isIntersecting: true }])
      await Promise.resolve()
    })

    expect(await screen.findByTestId('deferred-viewport-image')).toBeInTheDocument()
    expect(screen.getByTestId('deferred-viewport-image')).toHaveAttribute('data-loading', 'eager')
  })

  it('loads immediately when IntersectionObserver is unavailable', async () => {
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: undefined,
    })

    render(
      <div className='relative h-40 w-40'>
        <DeferredViewportImage
          src='/images/test-image.png'
          alt='Deferred image'
          fill
          sizes='160px'
        />
      </div>
    )

    expect(await screen.findByTestId('deferred-viewport-image')).toBeInTheDocument()
  })
})
