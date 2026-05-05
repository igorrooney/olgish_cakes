/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { DeferredNonCriticalClientFeatures } from '../DeferredNonCriticalClientFeatures'
import {
  createDeferredRuntimeScript,
  nonCriticalRuntimeSrc
} from '@/app/runtime/site/non-critical-script'

function renderFeaturesWithController() {
  const result = render(<DeferredNonCriticalClientFeatures />)
  const script = result.container.querySelector('script')

  if (!script) {
    throw new Error('Expected deferred runtime script tag to render')
  }

  expect(script.textContent).toContain(nonCriticalRuntimeSrc)
  window.eval(createDeferredRuntimeScript())

  return result
}

function evaluateRenderedLoaderScript() {
  const result = render(<DeferredNonCriticalClientFeatures />)
  const script = result.container.querySelector('script')

  if (!script?.textContent) {
    throw new Error('Expected deferred runtime loader script tag to render')
  }

  window.eval(script.textContent)

  return result
}

describe('DeferredNonCriticalClientFeatures', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
    document.getElementById('olgish-site-non-critical-runtime')?.remove()
  })

  it('renders the scroll-to-top control hidden by default without a React client wrapper', () => {
    renderFeaturesWithController()

    const button = screen.getByTestId('fab')

    expect(button).toHaveAttribute('aria-hidden', 'true')
    expect(button).toHaveAttribute('aria-label', 'Scroll to top')
    expect(button).toHaveClass('pointer-events-none')
  })

  it('reveals the scroll-to-top control after the page is scrolled', () => {
    renderFeaturesWithController()

    Object.defineProperty(window, 'pageYOffset', {
      configurable: true,
      value: 360
    })
    fireEvent.scroll(window)

    const button = screen.getByRole('button', {
      name: 'Scroll to top'
    })

    expect(button).toHaveAttribute('aria-hidden', 'false')
    expect(button).toHaveClass('pointer-events-auto')
  })

  it('records the previous pathname before same-origin link navigation', () => {
    renderFeaturesWithController()
    window.history.pushState({}, '', '/cakes')

    const link = document.createElement('a')
    link.href = '/cakes/red-velvet-cake'
    link.textContent = 'Red velvet cake'
    document.body.appendChild(link)

    fireEvent.click(link)

    expect(window.history.state).toMatchObject({
      __olgishPreviousPathname: '/cakes'
    })
  })

  it('does not schedule the deferred public runtime on admin pages', () => {
    window.history.replaceState(null, '', '/admin/orders')
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    const setTimeoutSpy = jest.spyOn(window, 'setTimeout')

    evaluateRenderedLoaderScript()
    fireEvent.pointerDown(window)
    fireEvent.keyDown(window, { key: 'Enter' })

    expect(document.getElementById('olgish-site-non-critical-runtime')).not.toBeInTheDocument()
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('load', expect.any(Function), expect.anything())
    expect(setTimeoutSpy).not.toHaveBeenCalled()

    addEventListenerSpy.mockRestore()
    setTimeoutSpy.mockRestore()
  })

  it('does not attach public runtime handlers on admin pages', () => {
    window.history.replaceState(null, '', '/admin/orders')
    window.history.replaceState({}, '', '/admin/orders')
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
    const windowAddEventListenerSpy = jest.spyOn(window, 'addEventListener')

    window.eval(createDeferredRuntimeScript())

    expect(addEventListenerSpy).not.toHaveBeenCalled()
    expect(windowAddEventListenerSpy).not.toHaveBeenCalled()
    expect(window.history.state).toEqual({})

    addEventListenerSpy.mockRestore()
    windowAddEventListenerSpy.mockRestore()
  })
})
