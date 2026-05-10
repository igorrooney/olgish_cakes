/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import WorkshopsPage, { metadata } from '../page'

jest.mock('../WorkshopEnquiryFormSection', () => ({
  WorkshopEnquiryFormSection: () => (
    <section id='workshop-enquiry-form'>
      <h2>Tell me about the event</h2>
      <div>Mock workshop form section</div>
    </section>
  ),
}))

jest.mock('../DeferredViewportImage', () => ({
  DeferredViewportImage: ({
    alt
  }: {
    alt: string
  }) => <img alt={alt} src='/images/deferred-workshop-image.jpg' />
}))

function parseJsonLdScripts(container: HTMLElement) {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
    script => JSON.parse(script.textContent || '{}') as Record<string, unknown>
  )
}

describe('WorkshopsPage', () => {
  it('exposes indexed canonical metadata for the workshops page', () => {
    expect(metadata.title).toBe('Mobile Cake Decorating Workshops in London and Across the UK')
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/learn/workshops')
    expect(metadata.robots?.index).toBe(true)
    expect(metadata.description).toContain('Mobile cake decorating workshops')
    expect(metadata.description).toContain('office teams, birthdays and hen parties')
    expect(metadata.description).toContain('ready to decorate')
    expect(metadata.description).toContain('25 per person')
    expect(metadata.description).toContain('around 1.5 hours')
  })

  it('renders the refreshed landing page without a nested main landmark', () => {
    const { container } = render(<WorkshopsPage />)

    expect(container.querySelector('main')).toBeNull()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Cake decorating workshops at your venue',
      })
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByText(/25 per person/i)).toBeInTheDocument()
    expect(screen.getByText('Around 1.5 hours')).toBeInTheDocument()
    expect(screen.getByText('London and the UK')).toBeInTheDocument()
    expect(
      screen.getByText(/i get asked for these workshops by office teams, birthdays and hen parties/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/i prep the cakes before i arrive, so each guest sits down to one ready to decorate/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /how i run the workshop/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /before you book/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /best fit/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /when i say no/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /what the room needs/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /i quote from the real venue details/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /i bring the cakes ready to decorate/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /i set up, teach, and box everything before people leave/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /tell me about the event/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: /red birthday cake with a gold crown topper/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: /white buttercream cake with piped swirls and black ribbon bows/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: /blue birthday cake with gold accents and printed photo toppers/i,
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ask about your date/i })).toHaveAttribute(
      'href',
      '#workshop-enquiry-form'
    )
    expect(screen.getByRole('link', { name: /contact olga/i })).toHaveAttribute('href', '/contact')
    expect(container.querySelectorAll('#workshop-enquiry-form')).toHaveLength(1)
    expect(
      screen.queryByRole('heading', {
        level: 2,
        name: /illustrative example brief/i,
      })
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/temporary cake photos from my portfolio/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/workshop photography is being prepared/i)).not.toBeInTheDocument()
    expect(
      screen.queryByText(/not a testimonial or a claimed past booking/i)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/i bring the cakes ready to decorate, plus the tools, boards and boxes/i)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        level: 2,
        name: /how the workshop runs on the day/i,
      })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        level: 2,
        name: /what helps the session run well/i,
      })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /the groups this suits best/i,
      })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /when i'd say no/i,
      })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /send the venue, timing and access notes early/i,
      })
    ).not.toBeInTheDocument()
    expect(screen.getByText(/some briefs are an easy yes\. some are not\./i)).toBeInTheDocument()
    expect(screen.queryByText(/stacked and coated/i)).not.toBeInTheDocument()
  })

  it('renders breadcrumb json-ld only for structured data', () => {
    const { container } = render(<WorkshopsPage />)
    const blocks = parseJsonLdScripts(container)
    const breadcrumbBlock = blocks.find(block => block['@type'] === 'BreadcrumbList')

    expect(blocks).toHaveLength(1)
    expect(breadcrumbBlock).toBeDefined()
    expect(blocks.find(block => block['@type'] === 'Event')).toBeUndefined()
    expect(blocks.find(block => block['@type'] === 'Course')).toBeUndefined()
    expect(blocks.find(block => block['@type'] === 'FAQPage')).toBeUndefined()
    const breadcrumbItems = breadcrumbBlock?.itemListElement as Array<Record<string, unknown>>

    expect(breadcrumbItems).toHaveLength(2)
    expect(breadcrumbItems[1]?.name).toBe('Workshops')
    expect(breadcrumbItems.some(item => item.item === 'https://olgishcakes.co.uk/learn')).toBe(
      false
    )
  })
})
