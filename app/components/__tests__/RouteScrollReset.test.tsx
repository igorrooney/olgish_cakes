/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { RouteScrollReset } from '../RouteScrollReset'
import { PREVIOUS_PATHNAME_STATE_KEY } from '@/app/utils/history-state'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

describe('RouteScrollReset', () => {
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
  let mockPathname = '/cakes'

  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname = '/cakes'
    window.history.replaceState({}, '', '/cakes')
    window.scrollTo = jest.fn()
    mockUsePathname.mockImplementation(() => mockPathname)
  })

  it('writes a null previous pathname marker on initial render', () => {
    window.history.replaceState({ existing: true }, '', '/cakes')

    render(<RouteScrollReset />)

    expect(window.history.state.existing).toBe(true)
    expect(window.history.state[PREVIOUS_PATHNAME_STATE_KEY]).toBeNull()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('writes previous pathname marker when pathname changes', () => {
    const { rerender } = render(<RouteScrollReset />)

    mockPathname = '/cakes/honey-cake'
    window.history.replaceState(window.history.state, '', '/cakes/honey-cake')
    rerender(<RouteScrollReset />)

    expect(window.history.state[PREVIOUS_PATHNAME_STATE_KEY]).toBe('/cakes')
    expect(window.scrollTo).toHaveBeenCalledTimes(1)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })

  it('does not overwrite marker during popstate pathname traversal', () => {
    const { rerender } = render(<RouteScrollReset />)

    mockPathname = '/cakes/honey-cake'
    window.history.replaceState(
      { [PREVIOUS_PATHNAME_STATE_KEY]: '/cakes-by-post' },
      '',
      '/cakes/honey-cake'
    )
    window.dispatchEvent(new PopStateEvent('popstate'))
    rerender(<RouteScrollReset />)

    expect(window.history.state[PREVIOUS_PATHNAME_STATE_KEY]).toBe('/cakes-by-post')
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('preserves native scroll restoration for back and forward navigation', () => {
    const { rerender } = render(<RouteScrollReset />)

    mockPathname = '/cakes/honey-cake'
    window.history.replaceState({}, '', '/cakes/honey-cake')
    window.dispatchEvent(new PopStateEvent('popstate'))
    rerender(<RouteScrollReset />)

    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('scrolls on the next pathname change after query-only history traversal', () => {
    const { rerender } = render(<RouteScrollReset />)

    window.history.replaceState({}, '', '/cakes?page=2')
    window.dispatchEvent(new PopStateEvent('popstate'))
    rerender(<RouteScrollReset />)

    mockPathname = '/cakes/honey-cake'
    window.history.replaceState(window.history.state, '', '/cakes/honey-cake')
    rerender(<RouteScrollReset />)

    expect(window.scrollTo).toHaveBeenCalledTimes(1)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })

  it('does not scroll when pathname is unchanged', () => {
    const { rerender } = render(<RouteScrollReset />)

    rerender(<RouteScrollReset />)

    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('does not scroll when hash is present', () => {
    const { rerender } = render(<RouteScrollReset />)

    mockPathname = '/'
    window.history.replaceState(window.history.state, '', '/#bestsellers')
    rerender(<RouteScrollReset />)

    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('falls back to numeric scrollTo call when object signature fails', () => {
    const scrollToMock = jest.fn((...args: unknown[]) => {
      if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
        throw new Error('object-scroll-not-supported')
      }
    })
    window.scrollTo = scrollToMock as typeof window.scrollTo

    const { rerender } = render(<RouteScrollReset />)

    mockPathname = '/cakes/napoleon-cake'
    window.history.replaceState(window.history.state, '', '/cakes/napoleon-cake')
    rerender(<RouteScrollReset />)

    expect(scrollToMock).toHaveBeenNthCalledWith(1, { top: 0, left: 0, behavior: 'auto' })
    expect(scrollToMock).toHaveBeenNthCalledWith(2, 0, 0)
    expect(scrollToMock).toHaveBeenCalledTimes(2)
  })
})
