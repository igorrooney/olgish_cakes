/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { HomeHero } from '../HomeHero'

describe('HomeHero', () => {
  it('links cakes by post CTA to /cakes-by-post', () => {
    render(<HomeHero />)

    const byPostLink = screen.getByRole('link', { name: /shop cakes by post/i })
    expect(byPostLink).toHaveAttribute('href', '/cakes-by-post')
  })

  it('renders secondary browse CTA to /cakes', () => {
    render(<HomeHero />)

    const allCakesLink = screen.getByRole('link', { name: /browse all cakes/i })
    expect(allCakesLink).toHaveAttribute('href', '/cakes')
  })

  it('does not show custom cake enquiry CTA in the hero', () => {
    render(<HomeHero />)

    expect(screen.queryByText(/custom cake enquiry form/i)).not.toBeInTheDocument()
  })
})
