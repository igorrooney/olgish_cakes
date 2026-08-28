/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { GetCustomQuoteInspiration } from '../GetCustomQuoteInspiration'

describe('GetCustomQuoteInspiration', () => {
  it('renders curated internal links for browsing cake directions', () => {
    render(<GetCustomQuoteInspiration />)

    expect(screen.getByRole('heading', { level: 2, name: 'Looking for cake ideas?' })).toBeInTheDocument()
    expect(screen.getByText('Browse our most popular cake galleries before requesting your quote.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /birthday cakes/i })).toHaveAttribute('href', '/birthday-cakes')
    expect(screen.getByText('Browse recent birthday cake designs.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /wedding cakes/i })).toHaveAttribute('href', '/wedding-cakes')
    expect(screen.getByText('See elegant wedding cakes in different sizes and styles.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /anniversary cakes/i })).toHaveAttribute('href', '/anniversary-cakes-leeds')
    expect(screen.getByText('Explore personalised anniversary cake ideas.')).toBeInTheDocument()
    expect(screen.getAllByText('View gallery')).toHaveLength(3)
    expect(screen.queryByText('View ideas')).not.toBeInTheDocument()
  })
})
