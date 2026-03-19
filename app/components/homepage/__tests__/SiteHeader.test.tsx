/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SiteHeader } from '../SiteHeader'
import React, { act } from 'react'
import { usePathname } from 'next/navigation'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

describe('SiteHeader', () => {
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
  let mockPathname = '/'

  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname = '/'
    mockUsePathname.mockImplementation(() => mockPathname)
  })
  it('renders logo and menu button', () => {
    render(<SiteHeader />)

    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument()
    expect(screen.getByAltText(/olgish cakes logo/i)).toBeInTheDocument()
  })

  it('hydrates the canonical desktop header without changing the quote link or sticky classes', () => {
    const { MessageChannel } = require('worker_threads')
    const originalMessageChannel = global.MessageChannel
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    global.MessageChannel = MessageChannel
    const { hydrateRoot } = require('react-dom/client')
    const { renderToString } = require('react-dom/server')
    const container = document.createElement('div')
    container.innerHTML = renderToString(<SiteHeader />)

    act(() => {
      hydrateRoot(container, <SiteHeader />)
    })

    const header = container.querySelector('header')
    const quoteLink = Array.from(container.querySelectorAll('a')).find((link) => link.textContent?.trim() === 'Get a quote')

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    expect(header?.className).toContain('tablet:sticky')
    expect(header?.className).not.toContain('sticky top-0 z-[9999] relative')
    expect(quoteLink?.getAttribute('href')).toBe('/get-custom-quote#quote-form')

    global.MessageChannel = originalMessageChannel
    consoleErrorSpy.mockRestore()
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

  it('opens and closes menu on button click', () => {
    render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)

    fireEvent.click(button)

    expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument()
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.click(button)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes menu when clicking outside', () => {
    render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)
    fireEvent.click(button)

    const menu = screen.getByRole('menu')
    expect(menu).toBeInTheDocument()

    fireEvent.mouseDown(document.body)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes menu on Escape key', () => {
    render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)
    fireEvent.click(button)

    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('has proper ARIA attributes', () => {
    render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-controls', 'mobile-menu')
    expect(button).toHaveAttribute('aria-haspopup', 'true')
  })

  it('updates aria-expanded when menu opens', () => {
    render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)

    fireEvent.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes menu when clicking on a link', () => {
    render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)
    fireEvent.click(button)

    const link = screen.getByRole('menuitem', { name: /cakes by post/i })
    fireEvent.click(link)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('orders desktop navigation with cakes by post first', () => {
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

      if (firstChild.tagName === 'A') {
        return firstChild.textContent?.trim() ?? ''
      }

      if (firstChild.tagName === 'DETAILS') {
        const summaryLabel = firstChild.querySelector('summary span')
        return summaryLabel?.textContent?.trim() ?? ''
      }

      return ''
    })

    expect(topLevelLabels[0]).toBe('Cakes by post')
    expect(topLevelLabels[1]).toBe('Custom cakes')
  })

  it('orders custom cakes dropdown with all cakes first and get a quote last', () => {
    render(<SiteHeader />)

    const customSummaryText = screen.getByText(/custom cakes/i)
    const customSummary = customSummaryText.closest('summary')

    if (!customSummary) {
      throw new Error('Custom cakes summary not found')
    }

    const customDetails = customSummary.closest('details')

    if (!customDetails) {
      throw new Error('Custom cakes details not found')
    }

    const dropdownLinks = Array.from(customDetails.querySelectorAll('.dropdown-content a'))
      .map((link) => link.textContent?.trim() ?? '')

    expect(dropdownLinks[0]).toBe('All cakes')
    expect(dropdownLinks[dropdownLinks.length - 1]).toBe('Get a quote')
    expect(screen.getByRole('link', { name: /all cakes/i })).toHaveAttribute('href', '/cakes')
    expect(screen.getByRole('link', { name: /get a quote/i })).toHaveAttribute('href', '/get-custom-quote#quote-form')
  })

  it('points the desktop get a quote link to the canonical quote page on non-home routes', () => {
    mockPathname = '/birthday-cakes'

    render(<SiteHeader />)

    expect(screen.getByRole('link', { name: /get a quote/i })).toHaveAttribute('href', '/get-custom-quote#quote-form')
  })

  it('points wedding cakes navigation to the canonical category page', () => {
    render(<SiteHeader />)

    const weddingCakesLink = screen.getByRole('link', { name: /wedding cakes/i })

    expect(weddingCakesLink).toHaveAttribute('href', '/wedding-cakes')
  })

  it('points birthday, anniversary and baby shower navigation to canonical category page links', () => {
    render(<SiteHeader />)

    expect(screen.getByRole('link', { name: /birthday cakes/i })).toHaveAttribute('href', '/birthday-cakes')
    expect(screen.getByRole('link', { name: /anniversary cakes/i })).toHaveAttribute('href', '/anniversary-cakes-leeds')
    expect(screen.getByRole('link', { name: /baby shower cakes/i })).toHaveAttribute('href', '/baby-shower-cakes')
  })

  it('removes all cakes from mobile menu and points custom cakes to /cakes', () => {
    render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)
    fireEvent.click(button)

    const mobileCustomCakesLink = screen.getByRole('menuitem', { name: /custom cakes/i })

    expect(mobileCustomCakesLink).toHaveAttribute('href', '/cakes')
    expect(screen.queryByRole('menuitem', { name: /all cakes/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /order form/i })).not.toBeInTheDocument()
  })

  it('keeps cakes by post navigation pointed to /cakes-by-post', () => {
    render(<SiteHeader />)

    const desktopByPostLinks = screen.getAllByRole('link', { name: /cakes by post/i })
    expect(desktopByPostLinks.some((link) => link.getAttribute('href') === '/cakes-by-post')).toBe(true)

    const button = screen.getByLabelText(/open menu/i)
    fireEvent.click(button)

    const mobileByPostLink = screen.getByRole('menuitem', { name: /cakes by post/i })
    expect(mobileByPostLink).toHaveAttribute('href', '/cakes-by-post')
  })

  it('moves farmers markets into Learn & visit links', () => {
    render(<SiteHeader />)

    expect(screen.queryByRole('link', { name: /^farmers markets$/i })).not.toBeInTheDocument()

    const learnSummaryText = screen.getByText(/learn\s*&\s*visit/i)
    const learnSummary = learnSummaryText.closest('summary')

    if (!learnSummary) {
      throw new Error('Learn & visit summary not found')
    }

    fireEvent.click(learnSummary)

    const desktopFarmersLink = screen.getByRole('link', { name: /find us at farmers markets/i })
    expect(desktopFarmersLink).toHaveAttribute('href', '/farmers-markets')

    const button = screen.getByLabelText(/open menu/i)
    fireEvent.click(button)

    const mobileFarmersLink = screen.getByRole('menuitem', { name: /find us at farmers markets/i })
    expect(mobileFarmersLink).toHaveAttribute('href', '/farmers-markets')
  })

  it('menu items have proper role', () => {
    render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)
    fireEvent.click(button)

    const menuItems = screen.getAllByRole('menuitem')
    expect(menuItems.length).toBeGreaterThan(0)
  })

  it('renders tablet navigation dropdowns', () => {
    render(<SiteHeader />)

    expect(screen.getByText(/custom cakes/i)).toBeInTheDocument()
    expect(screen.getByText(/learn\s*&\s*visit/i)).toBeInTheDocument()
    expect(screen.getByText(/get a quote/i)).toBeInTheDocument()
  })

  it('toggles desktop dropdowns and closes when clicking outside', () => {
    render(<SiteHeader />)

    const customSummaryText = screen.getByText(/custom cakes/i)
    const learnSummaryText = screen.getByText(/learn\s*&\s*visit/i)

    const customSummary = customSummaryText.closest('summary')
    const learnSummary = learnSummaryText.closest('summary')

    if (!customSummary || !learnSummary) {
      throw new Error('Dropdown summaries not found')
    }

    const customDetails = customSummary.closest('details') as HTMLDetailsElement
    const learnDetails = learnSummary.closest('details') as HTMLDetailsElement

    fireEvent.click(customSummary)

    expect(customDetails.open).toBe(true)
    expect(learnDetails.open).toBe(false)

    fireEvent.click(learnSummary)

    expect(customDetails.open).toBe(false)
    expect(learnDetails.open).toBe(true)

    fireEvent.click(document.body)

    expect(learnDetails.open).toBe(false)
  })

  it('toggles dropdown on touch pointerdown without double toggling', async () => {
    render(<SiteHeader />)

    const customSummaryText = screen.getByText(/custom cakes/i)
    const customSummary = customSummaryText.closest('summary')

    if (!customSummary) {
      throw new Error('Custom cakes summary not found')
    }

    const customDetails = customSummary.closest('details') as HTMLDetailsElement

    act(() => {
      const pointerEvent = new Event('pointerdown', { bubbles: true, cancelable: true })
      Object.defineProperty(pointerEvent, 'pointerType', { value: 'touch' })
      customSummary.dispatchEvent(pointerEvent)
    })

    await waitFor(() => {
      expect(customDetails.open).toBe(true)
    })

    act(() => {
      fireEvent.click(customSummary)
    })

    expect(customDetails.open).toBe(true)
  })

  it('closes dropdown when tapping the overlay', () => {
    render(<SiteHeader />)

    const customSummaryText = screen.getByText(/custom cakes/i)
    const customSummary = customSummaryText.closest('summary')

    if (!customSummary) {
      throw new Error('Custom cakes summary not found')
    }

    const customDetails = customSummary.closest('details') as HTMLDetailsElement

    fireEvent.click(customSummary)

    expect(customDetails.open).toBe(true)

    const overlay = document.querySelector('[data-nav-overlay]')

    if (!overlay) {
      throw new Error('Dropdown overlay not found')
    }

    fireEvent.pointerDown(overlay)

    expect(customDetails.open).toBe(false)
  })

  it('syncs dropdown state with native toggle events', () => {
    render(<SiteHeader />)

    const customSummaryText = screen.getByText(/custom cakes/i)
    const learnSummaryText = screen.getByText(/learn\s*&\s*visit/i)

    const customSummary = customSummaryText.closest('summary')
    const learnSummary = learnSummaryText.closest('summary')

    if (!customSummary || !learnSummary) {
      throw new Error('Dropdown summaries not found')
    }

    const customDetails = customSummary.closest('details') as HTMLDetailsElement
    const learnDetails = learnSummary.closest('details') as HTMLDetailsElement

    customDetails.open = true
    fireEvent(customDetails, new Event('toggle'))

    expect(customSummary).toHaveAttribute('aria-expanded', 'true')

    learnDetails.open = true
    fireEvent(learnDetails, new Event('toggle'))

    expect(learnSummary).toHaveAttribute('aria-expanded', 'true')
    expect(customSummary).toHaveAttribute('aria-expanded', 'false')

    customDetails.open = false
    fireEvent(customDetails, new Event('toggle'))

    expect(learnSummary).toHaveAttribute('aria-expanded', 'true')

    learnDetails.open = false
    fireEvent(learnDetails, new Event('toggle'))

    expect(learnSummary).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes desktop dropdown when clicking a custom cakes category link on the same pathname', () => {
    render(<SiteHeader />)

    const customSummaryText = screen.getByText(/custom cakes/i)
    const customSummary = customSummaryText.closest('summary')

    if (!customSummary) {
      throw new Error('Custom cakes summary not found')
    }

    const customDetails = customSummary.closest('details') as HTMLDetailsElement

    fireEvent.click(customSummary)

    expect(customDetails.open).toBe(true)

    const weddingCakesLink = screen.getByRole('link', { name: /wedding cakes/i })
    fireEvent.click(weddingCakesLink)

    expect(customDetails.open).toBe(false)
  })

  it('closes desktop dropdown when clicking another cakes category while already on /cakes', () => {
    mockPathname = '/cakes'
    render(<SiteHeader />)

    const customSummaryText = screen.getByText(/custom cakes/i)
    const customSummary = customSummaryText.closest('summary')

    if (!customSummary) {
      throw new Error('Custom cakes summary not found')
    }

    const customDetails = customSummary.closest('details') as HTMLDetailsElement

    fireEvent.click(customSummary)

    expect(customDetails.open).toBe(true)

    const birthdayCakesLink = screen.getByRole('link', { name: /birthday cakes/i })
    fireEvent.click(birthdayCakesLink)

    expect(customDetails.open).toBe(false)
  })

  it('toggles desktop dropdowns with keyboard', () => {
    render(<SiteHeader />)

    const customSummaryText = screen.getByText(/custom cakes/i)
    const customSummary = customSummaryText.closest('summary')

    if (!customSummary) {
      throw new Error('Custom cakes summary not found')
    }

    const customDetails = customSummary.closest('details') as HTMLDetailsElement

    fireEvent.keyDown(customSummary, { key: 'Enter' })
    expect(customDetails.open).toBe(true)

    fireEvent.keyDown(customSummary, { key: ' ' })
    expect(customDetails.open).toBe(false)

    fireEvent.keyDown(customSummary, { key: 'ArrowDown' })
    expect(customDetails.open).toBe(false)
  })

  it('closes desktop dropdown when pathname changes', () => {
    const { rerender } = render(<SiteHeader />)

    const customSummaryText = screen.getByText(/custom cakes/i)
    const customSummary = customSummaryText.closest('summary')

    if (!customSummary) {
      throw new Error('Custom cakes summary not found')
    }

    const customDetails = customSummary.closest('details') as HTMLDetailsElement

    fireEvent.click(customSummary)
    expect(customDetails.open).toBe(true)

    mockPathname = '/cakes'
    rerender(<SiteHeader />)

    const updatedCustomDetails = screen
      .getByText(/custom cakes/i)
      .closest('summary')
      ?.closest('details') as HTMLDetailsElement

    expect(updatedCustomDetails.open).toBe(false)
  })

  it('closes mobile menu when pathname changes', () => {
    const { rerender } = render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)
    fireEvent.click(button)

    expect(screen.getByRole('menu')).toBeInTheDocument()

    mockPathname = '/contact'
    rerender(<SiteHeader />)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('does not close desktop dropdown on rerender when pathname is unchanged', () => {
    const { rerender } = render(<SiteHeader />)

    const customSummaryText = screen.getByText(/custom cakes/i)
    const customSummary = customSummaryText.closest('summary')

    if (!customSummary) {
      throw new Error('Custom cakes summary not found')
    }

    const customDetails = customSummary.closest('details') as HTMLDetailsElement

    fireEvent.click(customSummary)
    expect(customDetails.open).toBe(true)

    rerender(<SiteHeader />)

    const updatedCustomDetails = screen
      .getByText(/custom cakes/i)
      .closest('summary')
      ?.closest('details') as HTMLDetailsElement

    expect(updatedCustomDetails.open).toBe(true)
  })
})




