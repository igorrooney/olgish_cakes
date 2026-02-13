/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { CakesProductCard } from '../CakesProductCard'
import { TabletCake } from '../types'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    fill,
    priority,
    ...props
  }: React.ComponentProps<'img'> & { fill?: boolean, priority?: boolean }) => (
    <img alt={alt || ''} {...props} />
  )
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>) => (
    <a href={href} {...props}>{children}</a>
  )
}))

const baseCake: TabletCake = {
  id: 'cake-1',
  slug: 'christmas-honey-cake',
  href: '/cakes/christmas-honey-cake',
  name: 'Christmas Honey Cake',
  description: 'Layered honey sponge with sour cream and festive decoration.',
  price: 27,
  imageUrl: '/images/placeholder-cake.jpg',
  imageAlt: 'Christmas honey cake decorated with festive details',
  isByPost: false,
  isCustom: true,
  isPopular: true,
  collectionIds: ['collection-1'],
  productType: 'cake'
}

function renderCard(cakeOverrides: Partial<TabletCake> = {}) {
  const cake = { ...baseCake, ...cakeOverrides }

  return render(<CakesProductCard cake={cake} />)
}

describe('CakesProductCard', () => {
  it('renders cake name, description and image alt text', () => {
    renderCard()

    expect(screen.getByText('Christmas Honey Cake')).toBeInTheDocument()
    expect(screen.getByText('Layered honey sponge with sour cream and festive decoration.')).toBeInTheDocument()
    expect(screen.getByAltText('Christmas honey cake decorated with festive details')).toBeInTheDocument()
  })

  it('renders regular cake price with the from prefix', () => {
    renderCard()

    expect(screen.getByText(/from.*27/i)).toBeInTheDocument()
  })

  it('renders by-post cake price as fixed amount without from prefix', () => {
    renderCard({ productType: 'giftHamper', isByPost: true, isCustom: false })
    const price = screen.getByText(/27/)

    expect(price).toBeInTheDocument()
    expect(price).not.toHaveTextContent(/from/i)
  })

  it('renders the card as a single clickable link', () => {
    renderCard()

    expect(screen.getByRole('link', { name: 'View details for Christmas Honey Cake' })).toBeInTheDocument()
  })

  it('links CTA to the cake details page', () => {
    renderCard()

    expect(screen.getByRole('link', { name: 'View details for Christmas Honey Cake' })).toHaveAttribute(
      'href',
      '/cakes/christmas-honey-cake'
    )
  })

  it('sets CTA accessible name using the cake name', () => {
    renderCard({ name: 'Kyiv Cake' })

    expect(screen.getByRole('link', { name: 'View details for Kyiv Cake' })).toBeInTheDocument()
  })

  it('keeps card layout classes for equal-height rows and bottom-aligned price', () => {
    const { container } = renderCard()
    const article = container.querySelector('article')
    const cardLink = screen.getByRole('link', { name: 'View details for Christmas Honey Cake' })
    const price = screen.getByText(/from.*27/i)

    expect(article).not.toBeNull()
    expect(article).toHaveClass('flex', 'h-full', 'flex-col')
    expect(cardLink).toHaveClass('block', 'h-full')
    expect(price).toHaveClass('mt-auto')
  })
})
