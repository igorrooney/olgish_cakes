/**
 * @jest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react'
import GetCustomQuotePage, { metadata } from '../page'
import { getTestimonialsPage } from '../../utils/fetchTestimonials'
import { getHomepageCollections } from '../../utils/fetchCollections'
import { Reviews } from '../../components/homepage/Reviews'
import type { PaginatedReviewsResponse } from '../../types/testimonial'

jest.mock('../../utils/fetchTestimonials', () => ({
  getTestimonialsPage: jest.fn()
}))

jest.mock('../../utils/fetchCollections', () => ({
  getHomepageCollections: jest.fn()
}))

jest.mock('../../components/homepage/Reviews', () => ({
  Reviews: jest.fn(async ({ initialPage }: { initialPage: PaginatedReviewsResponse }) => (
    initialPage.reviews.length > 0
      ? (
          <section data-testid='quote-reviews'>
            <h2>Our reviews</h2>
          </section>
        )
      : null
  ))
}))

const mockedGetCustomQuoteFormSection = jest.fn(({ occasionOptions }: {
  occasionOptions: Array<{ label: string, value?: string, disabled?: boolean }>
}) => (
  <section id='quote-form' data-testid='quote-form-section'>
    <h2>Tell us what you are planning</h2>
    <div>Mock quote form section</div>
    <div data-testid='occasion-options-count'>{occasionOptions.length}</div>
  </section>
))

jest.mock('../GetCustomQuoteFormSection', () => ({
  GetCustomQuoteFormSection: (props: { occasionOptions: Array<{ label: string, value?: string, disabled?: boolean }> }) =>
    mockedGetCustomQuoteFormSection(props)
}))

const mockedGetTestimonialsPage = getTestimonialsPage as jest.MockedFunction<typeof getTestimonialsPage>
const mockedGetHomepageCollections = getHomepageCollections as jest.MockedFunction<typeof getHomepageCollections>
const mockedReviews = Reviews as jest.MockedFunction<typeof Reviews>

const reviewPage: PaginatedReviewsResponse = {
  reviews: Array.from({ length: 6 }, (_, index) => ({
    _id: `testimonial-${index + 1}`,
    customerName: `Customer ${index + 1}`,
    rating: 5,
    date: `2026-01-${String(6 - index).padStart(2, '0')}`,
    title: 'Beautiful cake',
    text: 'The cake looked beautiful and tasted wonderful.'
  })),
  nextCursor: 'next-page'
}

function parseJsonLdScripts(container: HTMLElement) {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
    .map((script) => JSON.parse(script.textContent || '{}') as Record<string, unknown>)
}

describe('GetCustomQuotePage', () => {
  beforeEach(() => {
    mockedGetTestimonialsPage.mockResolvedValue(reviewPage)
    mockedGetHomepageCollections.mockResolvedValue([
      { _id: 'collection-1', name: 'Wedding Cakes', isFeatured: true },
      { _id: 'collection-2', name: 'Birthday Cakes', isFeatured: false }
    ])
    mockedGetCustomQuoteFormSection.mockClear()
    mockedReviews.mockClear()
  })

  it('exposes canonical metadata for the quote page', () => {
    expect(metadata.title).toBe('Custom Cake Quote in Leeds | Bespoke Celebration Cakes')
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/custom-cakes')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/custom-cakes')
    expect(metadata.openGraph?.images).toEqual(expect.arrayContaining([
      expect.objectContaining({
        alt: 'Celebration cake gift box with a candle card and handwritten note'
      })
    ]))
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
    expect(screen.getAllByRole('link', { name: /start your quote/i })[0]).toHaveAttribute('href', '/custom-cakes#quote-form')
    expect(screen.getByText("Tell us your date, guest numbers and cake ideas. We'll reply with a personalised quote for your celebration.")).toBeInTheDocument()
    const hero = screen.getByRole('heading', {
      level: 1,
      name: 'Get a custom cake quote in Leeds'
    }).closest('section')

    expect(hero).not.toBeNull()
    const quoteHighlights = within(hero as HTMLElement).getByRole('list', { name: 'Quote highlights' })
    expect(within(quoteHighlights).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      '✓Handmade in Leeds',
      '✓Personal reply',
      '✓Local delivery available'
    ])
    expect(screen.queryByText(/If you already have reference images, you can add them too/i)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Get your personalised quote in 3 steps' })).toBeInTheDocument()
    expect(screen.getByText("Tell us a few details. We'll reply with a personalised quote based on your cake ideas.")).toBeInTheDocument()
    expect(screen.getByText('📅')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Tell us about your celebration' })).toBeInTheDocument()
    expect(screen.getByText('Share your event date, guest numbers and occasion.')).toBeInTheDocument()
    expect(screen.getByText('🎂')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Share your cake ideas' })).toBeInTheDocument()
    expect(screen.getByText('Describe your style, flavours and colours. Add inspiration photos if you have them.')).toBeInTheDocument()
    expect(screen.getByText('💬')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Receive your personalised quote' })).toBeInTheDocument()
    expect(screen.getByText("We'll review your enquiry and reply with pricing, availability and the next steps.")).toBeInTheDocument()
    expect(screen.getByText('We\'ll reply as soon as we can.')).toBeInTheDocument()
    const processSection = screen.getByRole('heading', {
      level: 2,
      name: 'Get your personalised quote in 3 steps'
    }).closest('section')
    const processSteps = Array.from(processSection?.querySelectorAll('ol > li') ?? [])

    expect(processSteps).toHaveLength(3)
    expect(processSteps[0]).toHaveTextContent(/1\s*📅\s*Tell us about your celebration/)
    expect(processSteps[1]).toHaveTextContent(/2\s*🎂\s*Share your cake ideas/)
    expect(processSteps[2]).toHaveTextContent(/3\s*💬\s*Receive your personalised quote/)
    expect(screen.getAllByRole('heading', { level: 2, name: 'Looking for cake ideas?' })).toHaveLength(1)
    expect(screen.getByText('Tell us what you are planning')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Need help before requesting your quote?' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Send the essentials and we will take it from there' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Our reviews' })).toBeInTheDocument()
    expect(container.querySelectorAll('#quote-form')).toHaveLength(1)

    const pageSections = Array.from(container.querySelector('.min-h-screen')?.children ?? [])

    expect(pageSections.map((section) => (
      section.getAttribute('data-testid') ??
      section.querySelector('h1, h2')?.textContent
    ))).toEqual([
      'Get a custom cake quote in Leeds',
      'quote-form-section',
      'Get your personalised quote in 3 steps',
      'Looking for cake ideas?',
      'quote-reviews',
      'Need help before requesting your quote?'
    ])
    expect(mockedReviews).toHaveBeenCalledWith({ initialPage: reviewPage })
    expect(reviewPage.reviews).toHaveLength(6)
    expect(container.querySelectorAll('main')).toHaveLength(0)
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

  it('omits the reviews section when no valid testimonials are available', async () => {
    mockedGetTestimonialsPage.mockResolvedValueOnce({
      reviews: [],
      nextCursor: null
    })
    const page = await GetCustomQuotePage()
    render(page)

    expect(screen.queryByTestId('quote-reviews')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Need help before requesting your quote?' })).toBeInTheDocument()
    expect(mockedReviews).toHaveBeenCalledWith({
      initialPage: {
        reviews: [],
        nextCursor: null
      }
    })
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
    expect((breadcrumbBlock?.itemListElement as Array<Record<string, unknown>>)[1]?.name).toBe('Custom cakes')
    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(breadcrumb).toBeInTheDocument()
    expect(breadcrumb).toHaveClass('breadcrumbs')
    expect(breadcrumb).toHaveTextContent('Home')
    expect(breadcrumb).toHaveTextContent('Custom cakes')
    expect(within(breadcrumb).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(bakeryBlock?.aggregateRating).toBeUndefined()
    expect(bakeryBlock?.description).toBe(
      'Handmade bespoke cakes from Leeds with collection, local delivery where suitable, and UK delivery by agreement for birthdays, weddings, anniversaries and celebrations.'
    )
  })

  it('omits reviews gracefully when the initial review request fails', async () => {
    mockedGetTestimonialsPage.mockRejectedValueOnce(new Error('reviews failed'))
    const page = await GetCustomQuotePage()
    const { container } = render(page)
    const blocks = parseJsonLdScripts(container)
    const bakeryBlock = blocks.find((block) => block['@type'] === 'Bakery')

    expect(bakeryBlock?.aggregateRating).toBeUndefined()
    expect(screen.queryByTestId('quote-reviews')).not.toBeInTheDocument()
  })
})
