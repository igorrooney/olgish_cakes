/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { GetCustomQuoteInspiration } from '../GetCustomQuoteInspiration'

describe('GetCustomQuoteInspiration', () => {
  it('renders curated internal links for browsing cake directions', () => {
    render(<GetCustomQuoteInspiration />)

    expect(screen.getByRole('link', { name: /birthday cakes/i })).toHaveAttribute('href', '/birthday-cakes')
    expect(screen.getByRole('link', { name: /wedding cakes/i })).toHaveAttribute('href', '/wedding-cakes')
    expect(screen.getByRole('link', { name: /anniversary cakes/i })).toHaveAttribute('href', '/anniversary-cakes-leeds')
  })
})
