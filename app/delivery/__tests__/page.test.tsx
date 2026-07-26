/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import DeliveryPage, { metadata } from '../page'
import {
  REFUND_AFTER_WORK_POLICY,
  REFUND_BEFORE_WORK_POLICY,
  STATUTORY_RIGHTS_POLICY
} from '@/lib/public-policies'

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
  it('exposes correctly composed metadata for the delivery page', () => {
    expect(metadata.title).toBe('Delivery and Returns')
    expect(metadata.description).toContain('free UK delivery for suitable postal cakes')
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/delivery')
    expect(metadata.openGraph?.title).toBe('Delivery and Returns | Olgish Cakes')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/delivery')
    expect(metadata.openGraph?.images).toEqual([
      {
        url: 'https://olgishcakes.co.uk/images/delivery/delivery-social-card.png',
        width: 1200,
        height: 630,
        alt: 'Olgish Cakes delivery and returns information'
      }
    ])
    expect(metadata.twitter?.card).toBe('summary_large_image')
    expect(metadata.robots).toEqual({
      index: true,
      follow: true
    })
  })

  it('renders a semantic, scannable policy page without a nested main landmark', () => {
    const { container } = render(<DeliveryPage />)

    expect(container.querySelector('main')).toBeNull()
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Delivery and returns' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 2, name: 'Quick summary' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Cakes by post across the UK' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Local delivery and Leeds collection' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Arrange delivery or collection' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Damaged orders, cancellations and returns'
      })
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(5)

    expect(container.textContent).not.toMatch(
      /\b(?:i|me|my|mine|myself)\b|\bi['’](?:d|ll|m|ve)\b/i
    )
  })

  it('states delivery timing and costs without making a universal arrival promise', () => {
    render(<DeliveryPage />)

    expect(
      screen.getByText(/free standard uk delivery is included for suitable postal products/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/we'll confirm the preparation time, dispatch timing and expected delivery window/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/be delivered locally or be collected/i)).toBeInTheDocument()
    expect(
      screen.getByText(/standard delivery is an estimate rather than a guaranteed arrival date/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/tell you about any extra charge/i)).toBeInTheDocument()
    expect(screen.queryByText(/next working day/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/2(?:-|–| to )3 working days/i)).not.toBeInTheDocument()
  })

  it('renders large DaisyUI actions for every delivery and policy route', () => {
    const { container } = render(<DeliveryPage />)
    const actionLinks = Array.from(container.querySelectorAll('a.btn'))

    expect(actionLinks).toHaveLength(6)
    actionLinks.forEach(link => {
      expect(link).toHaveClass('btn')
      expect(link).toHaveClass('min-h-11')
    })

    expect(screen.getByRole('link', { name: 'See cakes by post' })).toHaveAttribute(
      'href',
      '/cakes-by-post'
    )
    expect(screen.getByRole('link', { name: 'Ask about delivery' })).toHaveAttribute(
      'href',
      '/get-custom-quote'
    )
    expect(screen.getByRole('link', { name: 'Message on WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/447867218194'
    )
    expect(screen.getByRole('link', { name: 'Email us' })).toHaveAttribute(
      'href',
      'mailto:hello@olgishcakes.co.uk'
    )
    expect(screen.getByRole('link', { name: /call \+44 786 721 8194/i })).toHaveAttribute(
      'href',
      'tel:+44 786 721 8194'
    )
    expect(screen.getByRole('link', { name: 'Read our terms' })).toHaveAttribute(
      'href',
      '/terms'
    )
  })

  it('uses the shared cancellation and statutory-rights policies', () => {
    render(<DeliveryPage />)

    expect(screen.getByText(new RegExp(REFUND_BEFORE_WORK_POLICY, 'i'))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(REFUND_AFTER_WORK_POLICY, 'i'))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(STATUTORY_RIGHTS_POLICY, 'i'))).toBeInTheDocument()
    expect(
      screen.getByText(/the remedy required by law, which may include a replacement or refund/i)
    ).toBeInTheDocument()
  })

  it('outputs connected breadcrumb, webpage and bakery structured data', () => {
    const { container } = render(<DeliveryPage />)
    const blocks = parseJsonLdScripts(container)
    const breadcrumbBlock = blocks.find(block => block['@type'] === 'BreadcrumbList')
    const pageBlock = blocks.find(block => block['@type'] === 'WebPage')
    const bakeryBlock = blocks.find(block => block['@type'] === 'Bakery')
    const breadcrumbReference = pageBlock?.breadcrumb as Record<string, unknown>

    expect(blocks).toHaveLength(3)
    expect(breadcrumbBlock?.['@id']).toBe('https://olgishcakes.co.uk/delivery#breadcrumb')
    expect(breadcrumbReference['@id']).toBe(breadcrumbBlock?.['@id'])
    expect((breadcrumbBlock?.itemListElement as Array<Record<string, unknown>>)[1]?.name).toBe(
      'Delivery and returns'
    )
    expect(pageBlock?.name).toBe('Delivery and Returns')
    expect(bakeryBlock?.telephone).toBe('+44 786 721 8194')
    expect((bakeryBlock?.areaServed as Array<Record<string, unknown>>)[1]?.name).toBe('Yorkshire')
  })
})
