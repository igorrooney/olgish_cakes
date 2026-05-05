/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
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
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /custom cakes/i })).toHaveAttribute('href', '/cakes')
    expect(screen.getByRole('menuitem', { name: /cakes by post/i })).toHaveAttribute('href', '/cakes-by-post')
    expect(screen.getByRole('menuitem', { name: /^articles$/i })).toHaveAttribute('href', '/blog')
    expect(screen.queryByRole('menuitem', { name: /all cakes/i })).not.toBeInTheDocument()
  })

  it('toggles desktop custom cakes dropdown and keeps category links canonical', () => {
    render(<SiteHeader />)

    const customCakesButton = screen.getByRole('button', { name: /custom cakes/i })
    const customCakesDetails = customCakesButton.closest('details')

    expect(customCakesDetails).not.toHaveAttribute('open')

    fireEvent.click(customCakesButton)

    expect(customCakesDetails).toHaveAttribute('open')
    expect(screen.getByRole('link', { name: /all cakes/i })).toHaveAttribute('href', '/cakes')
    expect(screen.getByRole('link', { name: /get a quote/i })).toHaveAttribute(
      'href',
      '/get-custom-quote#quote-form'
    )
    expect(screen.getByRole('link', { name: /wedding cakes/i })).toHaveAttribute('href', '/wedding-cakes')
    expect(screen.getByRole('link', { name: /birthday cakes/i })).toHaveAttribute('href', '/birthday-cakes')
    expect(screen.getByRole('link', { name: /anniversary cakes/i })).toHaveAttribute('href', '/anniversary-cakes-leeds')
    expect(screen.getByRole('link', { name: /baby shower cakes/i })).toHaveAttribute('href', '/baby-shower-cakes')
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

  it('closes desktop dropdown with Escape', () => {
    render(<SiteHeader />)

    const learnButton = screen.getByRole('button', { name: /^learn$/i })
    const learnDetails = learnButton.closest('details')

    fireEvent.click(learnButton)

    expect(learnDetails).toHaveAttribute('open')

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(learnDetails).not.toHaveAttribute('open')
  })

  it('keeps learn navigation canonical and removes old placeholders', () => {
    render(<SiteHeader />)

    fireEvent.click(screen.getByRole('button', { name: /^learn$/i }))

    expect(screen.getByRole('link', { name: /^articles$/i })).toHaveAttribute('href', '/blog')
    expect(screen.getByRole('link', { name: /^workshops$/i })).toHaveAttribute('href', '/learn/workshops')
    expect(screen.queryByRole('link', { name: /^guides$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /customer stories/i })).not.toBeInTheDocument()
  })
})
