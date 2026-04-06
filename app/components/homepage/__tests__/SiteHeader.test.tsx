/**
 * @jest-environment jsdom
 */
import React, { act } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { SiteHeader } from '../SiteHeader'

type MockLinkProps = {
  children: React.ReactNode
  href: string
  prefetch?: boolean | null
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, prefetch, ...props }: MockLinkProps) => {
    void prefetch

    return <a href={href} {...props}>{children}</a>
  }
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

describe('SiteHeader', () => {
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
  let mockPathname = '/'

  const getCustomCakesButton = () => screen.getByRole('button', { name: /custom cakes/i })
  const getLearnButton = () => screen.getByRole('button', { name: /^learn$/i })

  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname = '/'
    mockUsePathname.mockImplementation(() => mockPathname)
  })

  it('renders logo and menu button', () => {
    render(<SiteHeader />)

    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument()
    expect(screen.getByAltText(/olgish cakes logo/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /olgish cakes logo/i })).toHaveAttribute('href', '/')
  })

  it('hydrates the canonical desktop header without changing the quote link or sticky classes', () => {
    class TestMessagePort {
      counterpart: TestMessagePort | null = null
      onmessage: ((event: { data: undefined }) => void) | null = null

      postMessage() {
        queueMicrotask(() => {
          this.counterpart?.onmessage?.({ data: undefined })
        })
      }

      start() {}
      close() {}
      addEventListener() {}
      removeEventListener() {}
    }

    class TestMessageChannel {
      port1 = new TestMessagePort()
      port2 = new TestMessagePort()

      constructor() {
        this.port1.counterpart = this.port2
        this.port2.counterpart = this.port1
      }
    }

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const originalMessageChannel = global.MessageChannel
    global.MessageChannel = TestMessageChannel as typeof MessageChannel
    const { hydrateRoot } = require('react-dom/client')
    const { renderToString } = require('react-dom/server')
    const container = document.createElement('div')
    document.body.appendChild(container)
    container.innerHTML = renderToString(<SiteHeader />)
    let root: { unmount: () => void } | undefined

    try {
      act(() => {
        root = hydrateRoot(container, <SiteHeader />)
      })

      const header = container.querySelector('header')

      act(() => {
        fireEvent.click(within(container).getByRole('button', { name: /custom cakes/i }))
      })

      const quoteLink = Array.from(container.querySelectorAll('a')).find(
        (link) => link.textContent?.trim() === 'Get a quote'
      )

      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(header?.className).toContain('tablet:sticky')
      expect(header?.className).not.toContain('sticky top-0 z-[9999] relative')
      expect(quoteLink?.getAttribute('href')).toBe('/get-custom-quote#quote-form')
    } finally {
      act(() => {
        root?.unmount()
      })
      container.remove()
      global.MessageChannel = originalMessageChannel
      consoleErrorSpy.mockRestore()
    }
  })

  it('uses tablet-only sticky classes so mobile header is not sticky', () => {
    render(<SiteHeader />)

    const header = screen.getByRole('banner')

    expect(header).toHaveClass('relative')
    expect(header).toHaveClass('z-[9999]')
    expect(header).toHaveClass('tablet:sticky')
    expect(header).toHaveClass('tablet:top-0')
    expect(header).not.toHaveClass('sticky')
    expect(header).not.toHaveClass('top-0')
  })

  it('opens and closes the mobile menu on button click', () => {
    render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)

    fireEvent.click(button)

    expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument()
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.click(button)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes the mobile menu when clicking outside or pressing escape', () => {
    render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)
    fireEvent.click(button)

    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('has proper mobile ARIA attributes and closes the menu when clicking a link', () => {
    render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-controls', 'mobile-menu')
    expect(button).toHaveAttribute('aria-haspopup', 'true')

    fireEvent.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByRole('menuitem', { name: /cakes by post/i }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('orders desktop navigation with cakes by post first and custom cakes second', () => {
    render(<SiteHeader />)

    const mainNav = screen.getByRole('navigation', { name: /main navigation/i })
    const topLevelList = mainNav.querySelector('ul.menu-horizontal')

    if (!topLevelList) {
      throw new Error('Desktop top-level navigation list not found')
    }

    const topLevelLabels = Array.from(topLevelList.children).map((item) => {
      const firstChild = item.firstElementChild

      if (!firstChild) {
        return ''
      }

      return firstChild.textContent?.trim() ?? ''
    })

    expect(topLevelLabels[0]).toBe('Cakes by post')
    expect(topLevelLabels[1]).toContain('Custom cakes')
  })

  it('renders desktop dropdown buttons and toggles them by click', () => {
    render(<SiteHeader />)

    const customCakesButton = getCustomCakesButton()
    const learnButton = getLearnButton()

    expect(customCakesButton).toHaveAttribute('aria-expanded', 'false')
    expect(learnButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(customCakesButton)
    expect(customCakesButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: /all cakes/i })).toBeInTheDocument()

    fireEvent.click(learnButton)
    expect(customCakesButton).toHaveAttribute('aria-expanded', 'false')
    expect(learnButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: /^articles$/i })).toBeInTheDocument()
  })

  it('closes the desktop dropdown when clicking outside or tapping the overlay', () => {
    render(<SiteHeader />)

    const customCakesButton = getCustomCakesButton()
    fireEvent.click(customCakesButton)

    expect(customCakesButton).toHaveAttribute('aria-expanded', 'true')

    fireEvent.mouseDown(document.body)
    expect(customCakesButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(customCakesButton)

    const overlay = document.querySelector('[data-nav-overlay]')

    if (!overlay) {
      throw new Error('Dropdown overlay not found')
    }

    fireEvent.pointerDown(overlay)
    expect(customCakesButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('supports desktop keyboard toggles and escape close', () => {
    render(<SiteHeader />)

    const customCakesButton = getCustomCakesButton()

    fireEvent.keyDown(customCakesButton, { key: 'Enter' })
    expect(customCakesButton).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(customCakesButton, { key: ' ' })
    expect(customCakesButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.keyDown(customCakesButton, { key: 'ArrowDown' })
    expect(customCakesButton).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(customCakesButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps the desktop custom cakes dropdown order and quote link canonical', () => {
    render(<SiteHeader />)

    fireEvent.click(getCustomCakesButton())

    const links = screen.getAllByRole('link')
      .filter((link) => link.closest('#custom-cakes-desktop-panel'))
      .map((link) => ({
        href: link.getAttribute('href'),
        label: link.textContent?.trim() ?? ''
      }))

    expect(links[0]?.label).toBe('All cakes')
    expect(links[links.length - 1]?.label).toBe('Get a quote')
    expect(screen.getByRole('link', { name: /all cakes/i })).toHaveAttribute('href', '/cakes')
    expect(screen.getByRole('link', { name: /get a quote/i })).toHaveAttribute(
      'href',
      '/get-custom-quote#quote-form'
    )
  })

  it('points category links to the canonical custom cake pages', () => {
    render(<SiteHeader />)

    fireEvent.click(getCustomCakesButton())

    expect(screen.getByRole('link', { name: /wedding cakes/i })).toHaveAttribute(
      'href',
      '/wedding-cakes'
    )
    expect(screen.getByRole('link', { name: /birthday cakes/i })).toHaveAttribute(
      'href',
      '/birthday-cakes'
    )
    expect(screen.getByRole('link', { name: /anniversary cakes/i })).toHaveAttribute(
      'href',
      '/anniversary-cakes-leeds'
    )
    expect(screen.getByRole('link', { name: /baby shower cakes/i })).toHaveAttribute(
      'href',
      '/baby-shower-cakes'
    )
  })

  it('points articles navigation to the canonical blog archive and removes old learn placeholders', () => {
    render(<SiteHeader />)

    fireEvent.click(getLearnButton())

    expect(screen.getByRole('link', { name: /^articles$/i })).toHaveAttribute('href', '/blog')
    expect(screen.queryByRole('link', { name: /^guides$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /customer stories/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /find us at farmers markets/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText(/open menu/i))

    expect(screen.getByRole('menuitem', { name: /^articles$/i })).toHaveAttribute('href', '/blog')
    expect(screen.queryByRole('menuitem', { name: /^guides$/i })).not.toBeInTheDocument()
  })

  it('removes all cakes from the mobile menu and keeps cakes by post canonical', () => {
    render(<SiteHeader />)

    fireEvent.click(screen.getByLabelText(/open menu/i))

    expect(screen.getByRole('menuitem', { name: /custom cakes/i })).toHaveAttribute('href', '/cakes')
    expect(screen.getByRole('menuitem', { name: /cakes by post/i })).toHaveAttribute('href', '/cakes-by-post')
    expect(screen.queryByRole('menuitem', { name: /all cakes/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /order form/i })).not.toBeInTheDocument()
  })

  it('closes the desktop dropdown when clicking a dropdown link on the current pathname', () => {
    render(<SiteHeader />)

    fireEvent.click(getCustomCakesButton())
    expect(getCustomCakesButton()).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByRole('link', { name: /wedding cakes/i }))
    expect(getCustomCakesButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the desktop dropdown and mobile menu when pathname changes', () => {
    const { rerender } = render(<SiteHeader />)

    fireEvent.click(getCustomCakesButton())
    fireEvent.click(screen.getByLabelText(/open menu/i))

    expect(getCustomCakesButton()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu')).toBeInTheDocument()

    mockPathname = '/contact'
    rerender(<SiteHeader />)

    expect(getCustomCakesButton()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('does not close the desktop dropdown on rerender when pathname is unchanged', () => {
    const { rerender } = render(<SiteHeader />)

    fireEvent.click(getCustomCakesButton())
    expect(getCustomCakesButton()).toHaveAttribute('aria-expanded', 'true')

    rerender(<SiteHeader />)

    expect(getCustomCakesButton()).toHaveAttribute('aria-expanded', 'true')
  })
})
