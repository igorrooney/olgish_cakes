/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import FaqPage, { metadata } from '../page'
import type { FAQ } from '../../utils/fetchFaqs'
import { getFaqs } from '../../utils/fetchFaqs'

jest.mock('../../utils/fetchFaqs', () => ({
  getFaqs: jest.fn()
}))

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

const mockGetFaqs = getFaqs as jest.MockedFunction<typeof getFaqs>

const mockFaqs: FAQ[] = [
  {
    _id: 'faq-1',
    question: 'Do you deliver cakes across the UK?',
    answer: 'Yes, selected bakes can go by post across the UK.\n\n- Medovik travels well\n- Tall buttercream cakes are usually collection or local delivery only',
    order: 1
  },
  {
    _id: 'faq-2',
    question: 'Can I order a custom cake?',
    answer: 'Yes, send your date, servings and a short design brief.',
    order: 2
  }
]

function parseJsonLdScripts(container: HTMLElement) {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
    script => JSON.parse(script.textContent || '{}') as Record<string, unknown>
  )
}

describe('FaqPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('exposes indexable metadata for the live faq page', () => {
    expect(metadata.title).toBe('FAQ | Cakes, delivery and posted bakes')
    expect(metadata.description).toBe(
      'FAQ for cake orders, Leeds collection, local delivery and posted bakes across the UK.'
    )
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/faqs')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/faqs')
    expect(metadata.twitter?.card).toBe('summary_large_image')
    expect(metadata.robots).toEqual({
      index: true,
      follow: true
    })
  })

  it('renders the faq hero, ctas and CMS faq content', async () => {
    mockGetFaqs.mockResolvedValue(mockFaqs)

    const page = await FaqPage()
    const { container } = render(page)
    const h1 = screen.getByRole('heading', { level: 1 })
    const details = container.querySelectorAll('details')

    expect(h1).toBeInTheDocument()
    expect(h1).toHaveTextContent(/^before you order$/i)
    expect(screen.getByRole('link', { name: /ask for a quote/i })).toHaveAttribute('href', '/get-custom-quote')
    expect(screen.getByRole('heading', { level: 2, name: /what to send/i })).toBeInTheDocument()
    expect(screen.getByText(/if it is a posted cake, say that first/i)).toBeInTheDocument()
    expect(screen.getByText(/after that, just send the basics/i)).toBeInTheDocument()
    expect(screen.getByText(/the date you need the cake/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /people ask this a lot/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /cakes by post/i })[0]).toHaveAttribute('href', '/cakes-by-post')
    expect(screen.getByRole('link', { name: /contact page/i })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('link', { name: /custom quote form/i })).toHaveAttribute('href', '/get-custom-quote')
    expect(screen.getByText('Do you deliver cakes across the UK?')).toBeInTheDocument()
    expect(screen.getByText('Can I order a custom cake?')).toBeInTheDocument()
    expect(screen.getByText('Yes, selected bakes can go by post across the UK.')).toBeInTheDocument()
    expect(screen.getByText('Medovik travels well')).toBeInTheDocument()
    expect(screen.getByText('Tall buttercream cakes are usually collection or local delivery only')).toBeInTheDocument()
    expect(details).toHaveLength(2)
    expect(details[0]).toHaveAttribute('open')
  })

  it('outputs breadcrumb and FAQ structured data when FAQs exist', async () => {
    mockGetFaqs.mockResolvedValue(mockFaqs)

    const page = await FaqPage()
    const { container } = render(page)
    const blocks = parseJsonLdScripts(container)
    const breadcrumbBlock = blocks.find(block => block['@type'] === 'BreadcrumbList')
    const faqBlock = blocks.find(block => block['@type'] === 'FAQPage')

    expect(blocks).toHaveLength(2)
    expect(breadcrumbBlock).toBeDefined()
    expect(faqBlock).toBeDefined()
    expect((breadcrumbBlock?.itemListElement as Array<Record<string, unknown>>)[1]?.name).toBe(
      'FAQs'
    )
    expect((faqBlock?.mainEntity as Array<Record<string, unknown>>)).toHaveLength(2)
    expect((faqBlock?.mainEntity as Array<Record<string, unknown>>)[0]?.name).toBe(
      'Do you deliver cakes across the UK?'
    )
  })

  it('renders a graceful empty state and omits FAQPage structured data when there are no FAQs', async () => {
    mockGetFaqs.mockResolvedValue([])

    const page = await FaqPage()
    const { container } = render(page)
    const blocks = parseJsonLdScripts(container)

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /this page is still growing/i
      })
    ).toBeInTheDocument()
    expect(screen.getByText(/send a message or ask for a quote and i will reply directly rather than leave you waiting/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^send a question$/i })).toHaveAttribute('href', '/contact')
    expect(screen.getAllByRole('link', { name: /ask for a quote/i })[0]).toHaveAttribute('href', '/get-custom-quote')
    expect(blocks).toHaveLength(1)
    expect(blocks[0]['@type']).toBe('BreadcrumbList')
    expect(blocks.find(block => block['@type'] === 'FAQPage')).toBeUndefined()
  })
})
