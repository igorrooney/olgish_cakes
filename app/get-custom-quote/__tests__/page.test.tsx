/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import GetCustomQuotePage, { metadata } from '../page'
import { getAllTestimonialsStats } from '../../utils/fetchTestimonials'
import { getHomepageCollections } from '../../utils/fetchCollections'

jest.mock('../../utils/fetchTestimonials', () => ({
  getAllTestimonialsStats: jest.fn()
}))

jest.mock('../../utils/fetchCollections', () => ({
  getHomepageCollections: jest.fn()
}))

const mockedGetCustomQuoteFormSection = jest.fn(({ occasionOptions }: {
  occasionOptions: Array<{ label: string, value?: string, disabled?: boolean }>
}) => (
  <section id='quote-form'>
    <h2>Tell me what you are planning</h2>
    <div>Mock quote form section</div>
    <div data-testid='occasion-options-count'>{occasionOptions.length}</div>
  </section>
))

jest.mock('../GetCustomQuoteFormSection', () => ({
  GetCustomQuoteFormSection: (props: { occasionOptions: Array<{ label: string, value?: string, disabled?: boolean }> }) =>
    mockedGetCustomQuoteFormSection(props)
}))

const mockedGetAllTestimonialsStats = getAllTestimonialsStats as jest.MockedFunction<typeof getAllTestimonialsStats>
const mockedGetHomepageCollections = getHomepageCollections as jest.MockedFunction<typeof getHomepageCollections>

function parseJsonLdScripts(container: HTMLElement) {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
    .map((script) => JSON.parse(script.textContent || '{}') as Record<string, unknown>)
}

describe('GetCustomQuotePage', () => {
  beforeEach(() => {
    mockedGetAllTestimonialsStats.mockResolvedValue({
      count: 127,
      averageRating: 5
    })
    mockedGetHomepageCollections.mockResolvedValue([
      { _id: 'collection-1', name: 'Wedding Cakes', isFeatured: true },
      { _id: 'collection-2', name: 'Birthday Cakes', isFeatured: false }
    ])
    mockedGetCustomQuoteFormSection.mockClear()
  })

  it('exposes canonical metadata for the quote page', () => {
    expect(metadata.title).toBe('Custom Cake Quote in Leeds | Bespoke Celebration Cakes')
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/get-custom-quote')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/get-custom-quote')
    expect(metadata.description).toContain('Request a custom cake quote in Leeds from Olgish Cakes')
    expect(metadata.description).toContain('UK delivery by agreement')
  })

  it('renders the refreshed quote landing sections in order', async () => {
    const page = await GetCustomQuotePage()
    const { container } = render(page)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Get a custom cake quote in Leeds'
      })
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: /start your quote/i })[0]).toHaveAttribute('href', '/get-custom-quote#quote-form')
    expect(screen.getByRole('heading', { level: 2, name: 'A clear process from the start' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2, name: 'Browse a few good places to start' })).toHaveLength(1)
    expect(screen.getByText('Tell me what you are planning')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'A few practical answers' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Send the essentials and I will take it from there' })).not.toBeInTheDocument()
    expect(screen.getByText(/collection from leeds, local delivery where suitable, and uk delivery by agreement/i)).toBeInTheDocument()
    expect(screen.queryByText('Review score')).not.toBeInTheDocument()
    expect(screen.queryByText(/reviews from customers ordering handmade cakes/i)).not.toBeInTheDocument()
    expect(screen.getByTestId('quote-content-flow')).toBeInTheDocument()
    expect(container.querySelectorAll('#quote-form')).toHaveLength(1)
  })

  it('passes collection-derived occasion options into the quote form section', async () => {
    const page = await GetCustomQuotePage()
    render(page)

    expect(mockedGetCustomQuoteFormSection).toHaveBeenCalledWith(
      expect.objectContaining({
        occasionOptions: [
          { label: 'Select from list', value: '', disabled: true },
          { label: 'Wedding Cakes', value: 'Wedding Cakes' },
          { label: 'Birthday Cakes', value: 'Birthday Cakes' },
          { label: 'Other', value: 'other' }
        ]
      })
    )
    expect(screen.getAllByTestId('occasion-options-count')).toHaveLength(1)
    expect(screen.getAllByTestId('occasion-options-count')[0]).toHaveTextContent('4')
  })

  it('renders breadcrumb and local business structured data', async () => {
    const page = await GetCustomQuotePage()
    const { container } = render(page)
    const blocks = parseJsonLdScripts(container)
    const breadcrumbBlock = blocks.find((block) => block['@type'] === 'BreadcrumbList')
    const bakeryBlock = blocks.find((block) => block['@type'] === 'Bakery')

    expect(breadcrumbBlock).toBeDefined()
    expect(bakeryBlock).toBeDefined()
    expect(blocks.find((block) => block['@type'] === 'FAQPage')).toBeUndefined()
    expect((breadcrumbBlock?.itemListElement as Array<Record<string, unknown>>)[1]?.name).toBe('Custom cake quote in Leeds')
    expect((bakeryBlock?.aggregateRating as Record<string, unknown>).reviewCount).toBe('127')
    expect(bakeryBlock?.description).toBe(
      'Handmade bespoke cakes from Leeds with collection, local delivery where suitable, and UK delivery by agreement for birthdays, weddings, anniversaries and celebrations.'
    )
  })

  it('omits review claims when testimonial stats fail', async () => {
    mockedGetAllTestimonialsStats.mockRejectedValueOnce(new Error('stats failed'))
    const page = await GetCustomQuotePage()
    const { container } = render(page)
    const blocks = parseJsonLdScripts(container)
    const bakeryBlock = blocks.find((block) => block['@type'] === 'Bakery')

    expect(bakeryBlock?.aggregateRating).toBeUndefined()
    expect(screen.queryByText(/127 reviews/i)).not.toBeInTheDocument()
  })
})
