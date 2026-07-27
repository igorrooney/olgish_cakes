/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import AllergensPage, { metadata } from '../page'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    prefetch,
    ...props
  }: {
    children: ReactNode
    href: string
    prefetch?: boolean
  }) => <a href={href} {...props}>{children}</a>
}))

describe('AllergensPage', () => {
  it('exposes indexable metadata without duplicating the site-name template', () => {
    expect(metadata.title).toBe('Allergens')
    expect(metadata.description).toBe(
      'Allergen information for Olgish Cakes, including kitchen handling, cross-contact and how we’ll check an exact cake or postal product before ordering.'
    )
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/allergens')
    expect(metadata.openGraph?.title).toBe('Allergen information | Olgish Cakes')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/allergens')
    expect(metadata.twitter?.title).toBe('Allergen information | Olgish Cakes')
    expect(metadata.twitter?.card).toBe('summary_large_image')
    expect(metadata.twitter?.images).toEqual([
      expect.objectContaining({
        url: 'https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png',
        alt: 'Olgish Cakes logo and bakery branding'
      })
    ])
    expect(metadata.robots).toEqual({
      index: true,
      follow: true
    })
  })

  it('renders durable safety guidance and direct checking routes', () => {
    render(<AllergensPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Allergens and kitchen handling' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Check the exact product' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'What to send us' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Common questions' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Bespoke cakes' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Cakes by post' })).toBeInTheDocument()

    expect(
      screen.getByText(/we use ingredients that contain allergens, including milk, eggs and wheat/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/we’ll check the exact product, current recipe and supplier information/i)
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(/no item can be guaranteed completely free from cross-contact/i).length
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByText(/does vegan-friendly or gluten-friendly mean allergen-free/i)
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /message us on whatsapp/i })).toHaveAttribute(
      'href',
      'https://wa.me/447867218194'
    )
    expect(screen.getByRole('link', { name: /email us/i })).toHaveAttribute(
      'href',
      'mailto:hello@olgishcakes.co.uk'
    )
    expect(screen.getByRole('link', { name: /browse cakes$/i })).toHaveAttribute('href', '/cakes')
    expect(screen.getByRole('link', { name: /browse cakes by post/i })).toHaveAttribute(
      'href',
      '/cakes-by-post'
    )
    expect(
      screen.getByRole('link', { name: /food standards agency’s allergen guidance/i })
    ).toHaveAttribute(
      'href',
      'https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses'
    )
  })

  it('uses accessible DaisyUI controls with project touch targets', () => {
    render(<AllergensPage />)

    const whatsappLink = screen.getByRole('link', { name: /message us on whatsapp/i })
    const emailLink = screen.getByRole('link', { name: /email us/i })
    const browseCakesLink = screen.getByRole('link', { name: /browse cakes$/i })
    const firstQuestion = screen.getByText('Can you check a specific product before I order?')
      .closest('summary')

    expect(whatsappLink).toHaveClass('btn', 'btn-primary', 'min-h-11')
    expect(emailLink).toHaveClass('btn', 'btn-outline', 'min-h-11')
    expect(browseCakesLink).toHaveClass('link', 'link-primary', 'min-h-11')
    expect(firstQuestion).toHaveClass('collapse-title', 'min-h-11')
    expect(firstQuestion?.closest('details')).toHaveClass('collapse')
  })

  it('leaves the global layout as the only main landmark and emits no page schema', () => {
    const { container } = render(<AllergensPage />)

    expect(container.querySelector('main')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-label*="breadcrumb" i]')).not.toBeInTheDocument()
    expect(container.querySelector('script[type="application/ld+json"]')).not.toBeInTheDocument()
    expect(screen.queryByText(/kyiv cake|sacher torte|snickers cake/i)).not.toBeInTheDocument()
  })
})
