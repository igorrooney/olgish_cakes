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
    expect(metadata.title).toBe('Cake ordering FAQs')
    expect(metadata.description).toBe(
      'Answers about custom cake orders, Leeds collection, local delivery, allergens, payments and cakes by post across the UK.'
    )
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/faqs')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/faqs')
    expect(metadata.twitter?.card).toBe('summary_large_image')
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        url: 'https://olgishcakes.co.uk/images/faqs/faqs-social-card.png',
        width: 1200,
        height: 630,
        alt: 'Olgish Cakes cake ordering FAQs'
      })
    ])
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
    expect(h1).toHaveTextContent(/^cake ordering faqs$/i)
    expect(screen.getByRole('link', { name: /ask for a quote/i })).toHaveAttribute('href', '/get-custom-quote')
    expect(screen.getByRole('heading', { level: 2, name: /what to send/i })).toBeInTheDocument()
    expect(screen.getByText(/if it is a posted cake, say that first/i)).toBeInTheDocument()
    expect(screen.getByText(/after that, just send the basics/i)).toBeInTheDocument()
    expect(screen.getByText(/the date you need the cake/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /questions we’re asked a lot/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /cakes by post/i })[0]).toHaveAttribute('href', '/cakes-by-post')
    expect(screen.getByRole('link', { name: /contact page/i })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('link', { name: /custom quote form/i })).toHaveAttribute('href', '/get-custom-quote')
    expect(screen.getAllByRole('link', { name: /allergen information/i })[0]).toHaveAttribute('href', '/allergens')
    expect(screen.getByText('Do you deliver cakes across the UK?')).toBeInTheDocument()
    expect(screen.getByText('Can I order a custom cake?')).toBeInTheDocument()
    expect(screen.getByText('Yes, selected bakes can go by post across the UK.')).toBeInTheDocument()
    expect(screen.getByText('Medovik travels well')).toBeInTheDocument()
    expect(screen.getByText('Tall buttercream cakes are usually collection or local delivery only')).toBeInTheDocument()
    expect(details).toHaveLength(2)
    expect(details[0]).toHaveAttribute('open')
    expect(details[0]).toHaveClass('collapse')
    expect(details[0]?.querySelector('summary')).toHaveClass('collapse-title')
    expect(details[0]?.querySelector('.collapse-content')).not.toBeNull()
    expect(container.querySelector('main')).toBeNull()
  })

  it('outputs only breadcrumb structured data when FAQs exist', async () => {
    mockGetFaqs.mockResolvedValue(mockFaqs)

    const page = await FaqPage()
    const { container } = render(page)
    const blocks = parseJsonLdScripts(container)
    const breadcrumbBlock = blocks.find(block => block['@type'] === 'BreadcrumbList')
    expect(blocks).toHaveLength(1)
    expect(breadcrumbBlock).toBeDefined()
    expect((breadcrumbBlock?.itemListElement as Array<Record<string, unknown>>)[1]?.name).toBe(
      'FAQs'
    )
    expect(blocks.some(block => block['@type'] === 'FAQPage')).toBe(false)
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
    expect(screen.getByText(/send us a message or ask for a quote and we’ll reply directly/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^send a question$/i })).toHaveAttribute('href', '/contact')
    expect(screen.getAllByRole('link', { name: /ask for a quote/i })[0]).toHaveAttribute('href', '/get-custom-quote')
    expect(blocks).toHaveLength(1)
    expect(blocks[0]['@type']).toBe('BreadcrumbList')
    expect(blocks.find(block => block['@type'] === 'FAQPage')).toBeUndefined()
  })

  it('renders a generic assistance state when Sanity is unavailable', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockGetFaqs.mockRejectedValue(new Error('Private Sanity failure'))

    const page = await FaqPage()
    render(page)

    expect(screen.getByRole('alert')).toHaveTextContent(/we couldn’t load the faqs/i)
    expect(screen.getByText(/please try again shortly/i)).toBeInTheDocument()
    expect(screen.queryByText(/private sanity failure/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^send a question$/i })).toHaveAttribute('href', '/contact')

    consoleSpy.mockRestore()
  })
})
