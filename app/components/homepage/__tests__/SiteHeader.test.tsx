/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SiteHeader } from '../SiteHeader'
import React, { act } from 'react'

describe('SiteHeader', () => {
  it('renders logo and menu button', () => {
    render(<SiteHeader />)

    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument()
    expect(screen.getByAltText(/olgish cakes logo/i)).toBeInTheDocument()
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

  it('provides direct navigation to /cakes', () => {
    render(<SiteHeader />)

    const desktopAllCakesLinks = screen.getAllByRole('link', { name: /all cakes/i })
    expect(desktopAllCakesLinks.some((link) => link.getAttribute('href') === '/cakes')).toBe(true)

    const button = screen.getByLabelText(/open menu/i)
    fireEvent.click(button)

    const mobileAllCakesLink = screen.getByRole('menuitem', { name: /all cakes/i })
    expect(mobileAllCakesLink).toHaveAttribute('href', '/cakes')
  })

  it('orders mobile menu with all cakes before cakes by post', () => {
    render(<SiteHeader />)

    const button = screen.getByLabelText(/open menu/i)
    fireEvent.click(button)

    const mobileMenuItems = screen.getAllByRole('menuitem')
    const allCakesIndex = mobileMenuItems.findIndex((item) => /all cakes/i.test(item.textContent ?? ''))
    const byPostIndex = mobileMenuItems.findIndex((item) => /cakes by post/i.test(item.textContent ?? ''))

    expect(allCakesIndex).toBeGreaterThanOrEqual(0)
    expect(byPostIndex).toBeGreaterThanOrEqual(0)
    expect(allCakesIndex).toBeLessThan(byPostIndex)
  })

  it('keeps cakes by post navigation pointed to /gift-hampers', () => {
    render(<SiteHeader />)

    const desktopByPostLinks = screen.getAllByRole('link', { name: /cakes by post/i })
    expect(desktopByPostLinks.some((link) => link.getAttribute('href') === '/gift-hampers')).toBe(true)

    const button = screen.getByLabelText(/open menu/i)
    fireEvent.click(button)

    const mobileByPostLink = screen.getByRole('menuitem', { name: /cakes by post/i })
    expect(mobileByPostLink).toHaveAttribute('href', '/gift-hampers')
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
    expect(screen.getByText(/order form/i)).toBeInTheDocument()
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

  it('keeps desktop dropdown open when clicking inside dropdown content', () => {
    render(<SiteHeader />)

    const customSummaryText = screen.getByText(/custom cakes/i)
    const customSummary = customSummaryText.closest('summary')

    if (!customSummary) {
      throw new Error('Custom cakes summary not found')
    }

    const customDetails = customSummary.closest('details') as HTMLDetailsElement

    fireEvent.click(customSummary)

    expect(customDetails.open).toBe(true)

    const orderFormLink = screen.getByRole('link', { name: /order form/i })
    fireEvent.click(orderFormLink)

    expect(customDetails.open).toBe(true)
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
})
