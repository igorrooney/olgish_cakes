/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import DeliveryPage, { metadata } from '../page'

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

function parseJsonLdScripts(container: HTMLElement) {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
    script => JSON.parse(script.textContent || '{}') as Record<string, unknown>
  )
}

describe('DeliveryPage', () => {
  it('exposes indexable metadata for the live delivery page', () => {
    expect(metadata.title).toBe('Delivery and Returns | Olgish Cakes')
    expect(metadata.description).toBe(
      'Delivery information for Olgish Cakes, including cakes by post across the UK, collection from Leeds, local cake delivery by arrangement, and what to do if there is a problem with the order.'
    )
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/delivery')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/delivery')
    expect(metadata.twitter?.card).toBe('summary_large_image')
    expect(metadata.robots).toEqual({
      index: true,
      follow: true
    })
  })

  it('renders straightforward delivery guidance and contact options', () => {
    render(<DeliveryPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Delivery and returns' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByText(/some cakes post well and some do not/i)).toBeInTheDocument()
    expect(
      screen.getByText(/for post, i usually send slices and other bakes made for travel/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/send me the date, postcode and the cake you want\. i can usually tell you quickly what will work/i)
    ).toBeInTheDocument()

    expect(screen.queryByRole('heading', { level: 2, name: 'By post' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Full cakes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Dates' })).not.toBeInTheDocument()

    expect(screen.getByText(/by post means slices and other bakes made to travel/i)).toBeInTheDocument()
    expect(screen.getByText(/free uk delivery is included for suitable postal cakes/i)).toBeInTheDocument()
    expect(screen.getByText(/standard post is still a delivery window rather than a promise/i)).toBeInTheDocument()
    expect(screen.getByText(/for a guaranteed day, special delivery is usually the safer route/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /see cakes by post/i })).toHaveAttribute(
      'href',
      '/cakes-by-post'
    )

    expect(screen.getByText(/tall celebration cakes, tiered cakes and anything with a polished finish/i)).toBeInTheDocument()
    expect(screen.getByText(/i work in leeds and across yorkshire/i)).toBeInTheDocument()
    expect(screen.getByText(/i will tell you straight if it is workable/i)).toBeInTheDocument()
    expect(screen.getByText(/i regularly deliver around leeds, wakefield, huddersfield, bradford and york/i)).toBeInTheDocument()
    expect(screen.getByText(/save £2\./i)).toBeInTheDocument()

    expect(screen.getByText(/if the date matters, send the date, postcode and the cake you have in mind/i)).toBeInTheDocument()
    expect(screen.getByText(/i will tell you whether it should go by post, stay local, or be collected/i)).toBeInTheDocument()
    expect(screen.getByText(/if it needs to stay local, i will say so before you book/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ask about delivery/i })).toHaveAttribute(
      'href',
      '/get-custom-quote'
    )

    expect(screen.getByText(/if the order arrives damaged or there is a delivery issue, contact me as soon as you can/i)).toBeInTheDocument()
    expect(screen.getByText(/message me directly and i will check it/i)).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /message on whatsapp/i })).toHaveAttribute(
      'href',
      'https://wa.me/447867218194'
    )
    expect(screen.getByRole('link', { name: /hello@olgishcakes\.co\.uk/i })).toHaveAttribute(
      'href',
      'mailto:hello@olgishcakes.co.uk'
    )
    expect(screen.getByRole('link', { name: /\+44 786 721 8194/i })).toHaveAttribute(
      'href',
      'tel:+44 786 721 8194'
    )
  })

  it('outputs breadcrumb and page-level structured data blocks', () => {
    const { container } = render(<DeliveryPage />)
    const blocks = parseJsonLdScripts(container)
    const breadcrumbBlock = blocks.find(block => block['@type'] === 'BreadcrumbList')
    const pageBlock = blocks.find(block => block['@type'] === 'WebPage')
    const bakeryBlock = blocks.find(block => block['@type'] === 'Bakery')

    expect(blocks).toHaveLength(3)
    expect(breadcrumbBlock).toBeDefined()
    expect(pageBlock).toBeDefined()
    expect(bakeryBlock).toBeDefined()
    expect((breadcrumbBlock?.itemListElement as Array<Record<string, unknown>>)[1]?.name).toBe(
      'Delivery and returns'
    )
    expect(pageBlock?.name).toBe('Delivery and Returns | Olgish Cakes')
    expect(bakeryBlock?.telephone).toBe('+44 786 721 8194')
    expect((bakeryBlock?.areaServed as Array<Record<string, unknown>>)[1]?.name).toBe('Yorkshire')
  })
})
