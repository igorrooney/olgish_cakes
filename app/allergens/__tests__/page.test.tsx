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

jest.mock('@/lib/allergens-page-data', () => ({
  getAllergensPageData: jest.fn(async () => ({
    totalCakeCount: 13,
    totalGiftHamperCount: 27,
    totalProductCount: 40,
    cakeCommonAllergens: [
      { label: 'Milk', count: 12 },
      { label: 'Eggs', count: 12 },
      { label: 'Gluten (wheat)', count: 9 }
    ],
    giftHamperCommonAllergens: [
      { label: 'Milk', count: 27 },
      { label: 'Eggs', count: 27 },
      { label: 'Gluten (wheat)', count: 27 }
    ],
    overallCommonAllergens: [
      { label: 'Milk', count: 39 },
      { label: 'Eggs', count: 39 },
      { label: 'Gluten (wheat)', count: 36 }
    ],
    nutOrPeanutCakeNames: ['Kyiv Cake', 'Sacher Torte', 'Snickers Cake'],
    advisoryAllergens: ['Nuts', 'Peanuts', 'Soya', 'Sulphur dioxide'],
    referencedCakeCount: 3,
    referencedGiftHamperCount: 2
  }))
}))

function parseJsonLdScripts(container: HTMLElement) {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
    (script) => JSON.parse(script.textContent || '{}') as Record<string, unknown>
  )
}

describe('AllergensPage', () => {
  it('exposes indexable metadata for the live allergens page', () => {
    expect(metadata.title).toBe('Allergens | Olgish Cakes')
    expect(metadata.description).toBe(
      'Allergen information for Olgish Cakes, including kitchen handling, cross-contact, common ingredients and what to send before ordering.'
    )
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/allergens')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/allergens')
    expect(metadata.twitter?.card).toBe('summary_large_image')
    expect(metadata.robots).toEqual({
      index: true,
      follow: true
    })
  })

  it('renders a simplified trust-first allergen help page', async () => {
    render(await AllergensPage())

    expect(
      screen.getByRole('heading', { level: 1, name: 'Allergens and kitchen handling' })
    ).toBeInTheDocument()
    expect(screen.getByText(/milk, eggs and wheat are common across both celebration cakes and cakes by post/i)).toBeInTheDocument()
    expect(screen.getAllByText(/products are made in a kitchen that handles allergens/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/no item can be guaranteed completely free from cross-contact/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/if you have an allergy, intolerance or coeliac disease, please ask before ordering/i)).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 2, name: 'Common allergens in the current range' })).toBeInTheDocument()
    expect(screen.getByText(/most products in the range contain milk, eggs and wheat/i)).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 3, name: 'Cakes' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Cakes by post' })).toBeInTheDocument()
    expect(screen.getByText(/most celebration cakes contain milk, eggs and wheat/i)).toBeInTheDocument()
    expect(screen.getByText(/posted products usually contain milk, eggs and wheat as well/i)).toBeInTheDocument()
    expect(screen.getByText(/some current cakes also contain nuts or peanuts, including kyiv cake, sacher torte, snickers cake/i)).toBeInTheDocument()
    expect(screen.getByText(/it is often easier to check than a bespoke cake because the product mix is narrower and changes less/i)).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 2, name: 'Before you ask' })).toBeInTheDocument()
    expect(screen.getByText(/the allergen you need to avoid\./i)).toBeInTheDocument()
    expect(screen.getByText(/the exact product you are considering\./i)).toBeInTheDocument()
    expect(screen.getByText(/whether you are asking about cakes by post or a bespoke cake\./i)).toBeInTheDocument()
    expect(screen.getByText(/whether that product is suitable/i)).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 2, name: 'Common questions' })).toBeInTheDocument()
    expect(screen.getByText(/can you check a specific product before i order/i)).toBeInTheDocument()
    expect(screen.getByText(/can any product be guaranteed completely free from cross-contact/i)).toBeInTheDocument()
    expect(screen.getByText(/is a posted cake easier to check than a bespoke cake/i)).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /message on whatsapp/i })).toHaveAttribute(
      'href',
      'https://wa.me/447867218194'
    )
    expect(screen.getByRole('link', { name: /hello@olgishcakes\.co\.uk/i })).toHaveAttribute(
      'href',
      'mailto:hello@olgishcakes.co.uk'
    )
    expect(screen.getByRole('link', { name: /browse cakes$/i })).toHaveAttribute('href', '/cakes')
    expect(screen.getByRole('link', { name: /browse cakes by post/i })).toHaveAttribute('href', '/cakes-by-post')
  })

  it('outputs breadcrumb, page, bakery and faq structured data blocks', async () => {
    const { container } = render(await AllergensPage())
    const blocks = parseJsonLdScripts(container)
    const breadcrumbBlock = blocks.find((block) => block['@type'] === 'BreadcrumbList')
    const pageBlock = blocks.find((block) => block['@type'] === 'WebPage')
    const bakeryBlock = blocks.find((block) => block['@type'] === 'Bakery')
    const faqBlock = blocks.find((block) => block['@type'] === 'FAQPage')

    expect(blocks).toHaveLength(4)
    expect(breadcrumbBlock).toBeDefined()
    expect(pageBlock).toBeDefined()
    expect(bakeryBlock).toBeDefined()
    expect(faqBlock).toBeDefined()
    expect((breadcrumbBlock?.itemListElement as Array<Record<string, unknown>>)[1]?.name).toBe(
      'Allergens'
    )
    expect(pageBlock?.name).toBe('Allergens | Olgish Cakes')
    expect(bakeryBlock?.telephone).toBe('+44 786 721 8194')
    expect((faqBlock?.mainEntity as Array<Record<string, unknown>>)).toHaveLength(3)
  })
})
