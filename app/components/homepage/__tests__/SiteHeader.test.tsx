/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
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

describe('SiteHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders logo and menu button', () => {
    render(<SiteHeader />)

    expect(screen.getByRole('button', { name: /^menu$/i })).toBeInTheDocument()
    expect(screen.getByAltText(/olgish cakes logo/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /olgish cakes logo/i })).toHaveAttribute('href', '/')
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

  it('opens mobile navigation and keeps canonical mobile links', () => {
    render(<SiteHeader />)

    const menuButton = screen.getByRole('button', { name: /^menu$/i })
    const menuDetails = menuButton.closest('details')

    expect(menuDetails).not.toHaveAttribute('open')

    fireEvent.click(menuButton)

    expect(menuDetails).toHaveAttribute('open')
    const mobileNavigation = screen.getByRole('navigation', { name: /mobile navigation/i })

    expect(mobileNavigation).toBeInTheDocument()
    expect(within(mobileNavigation).getByRole('link', { name: /custom cakes/i })).toHaveAttribute('href', '/custom-cakes')
    expect(within(mobileNavigation).getByRole('link', { name: /get a quote/i })).toHaveAttribute(
      'href',
      '/custom-cakes#quote-form'
    )
    expect(within(mobileNavigation).getByRole('link', { name: /cakes by post/i })).toHaveAttribute('href', '/cakes-by-post')
    expect(within(mobileNavigation).getByRole('link', { name: /^articles$/i })).toHaveAttribute('href', '/blog')
    expect(within(mobileNavigation).queryByRole('link', { name: /all cakes/i })).not.toBeInTheDocument()
    expect(menuButton).not.toHaveAttribute('aria-haspopup')
  })

  it('closes mobile navigation with Escape and restores focus to the trigger', () => {
    render(<SiteHeader />)

    const menuButton = screen.getByRole('button', { name: /^menu$/i })
    const menuDetails = menuButton.closest('details')

    fireEvent.click(menuButton)

    const mobileNavigation = screen.getByRole('navigation', { name: /mobile navigation/i })
    const contactLink = within(mobileNavigation).getByRole('link', { name: /^contact$/i })
    contactLink.focus()
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(menuDetails).not.toHaveAttribute('open')
    expect(menuButton).toHaveFocus()
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles desktop custom cakes dropdown and keeps category links canonical', () => {
    render(<SiteHeader />)

    const customCakesButton = screen.getByRole('button', { name: /custom cakes/i })
    const customCakesDetails = customCakesButton.closest('details')

    expect(customCakesDetails).not.toHaveAttribute('open')

    fireEvent.click(customCakesButton)

    expect(customCakesDetails).toHaveAttribute('open')
    const customCakesDropdown = within(customCakesDetails as HTMLElement)

    expect(customCakesDropdown.getByRole('link', { name: /all cakes/i })).toHaveAttribute('href', '/cakes')
    expect(customCakesDropdown.getByRole('link', { name: /get a quote/i })).toHaveAttribute(
      'href',
      '/custom-cakes#quote-form'
    )
    expect(customCakesDropdown.getByRole('link', { name: /wedding cakes/i })).toHaveAttribute('href', '/wedding-cakes')
    expect(customCakesDropdown.getByRole('link', { name: /birthday cakes/i })).toHaveAttribute('href', '/birthday-cakes')
    expect(customCakesDropdown.getByRole('link', { name: /anniversary cakes/i })).toHaveAttribute('href', '/anniversary-cakes-leeds')
    expect(customCakesDropdown.getByRole('link', { name: /baby shower cakes/i })).toHaveAttribute('href', '/baby-shower-cakes')
  })

  it('closes desktop dropdown when clicking outside', () => {
    render(<SiteHeader />)

    const customCakesButton = screen.getByRole('button', { name: /custom cakes/i })
    const customCakesDetails = customCakesButton.closest('details')

    fireEvent.click(customCakesButton)

    expect(customCakesDetails).toHaveAttribute('open')

    fireEvent.pointerDown(document.body)

    expect(customCakesDetails).not.toHaveAttribute('open')
  })

  it('closes desktop dropdown with Escape and restores focus to its trigger', () => {
    render(<SiteHeader />)

    const learnButton = screen.getByRole('button', { name: /^learn$/i })
    const learnDetails = learnButton.closest('details')

    fireEvent.click(learnButton)

    expect(learnDetails).toHaveAttribute('open')

    const workshopsLink = within(learnDetails as HTMLElement).getByRole('link', { name: /^workshops$/i })
    workshopsLink.focus()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(learnDetails).not.toHaveAttribute('open')
    expect(learnButton).toHaveFocus()
  })

  it('keeps learn navigation canonical and removes old placeholders', () => {
    render(<SiteHeader />)

    const learnButton = screen.getByRole('button', { name: /^learn$/i })
    const learnDetails = learnButton.closest('details')

    fireEvent.click(learnButton)

    const learnDropdown = within(learnDetails as HTMLElement)

    expect(learnDropdown.getByRole('link', { name: /^articles$/i })).toHaveAttribute('href', '/blog')
    expect(learnDropdown.getByRole('link', { name: /^workshops$/i })).toHaveAttribute('href', '/learn/workshops')
    expect(learnDropdown.queryByRole('link', { name: /^guides$/i })).not.toBeInTheDocument()
    expect(learnDropdown.queryByRole('link', { name: /customer stories/i })).not.toBeInTheDocument()
  })
})
