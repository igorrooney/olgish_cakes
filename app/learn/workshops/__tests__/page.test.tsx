/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import WorkshopsPage, { metadata } from '../page'

jest.mock('../WorkshopEnquiryFormSection', () => ({
  WorkshopEnquiryFormSection: () => (
    <section id='workshop-enquiry-form'>
      <h2>Tell us about the event</h2>
      <div>Mock workshop form section</div>
    </section>
  ),
}))

function parseJsonLdScripts(container: HTMLElement) {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
    script => JSON.parse(script.textContent || '{}') as Record<string, unknown>
  )
}

describe('WorkshopsPage', () => {
  it('exposes indexed canonical metadata for the workshops page', () => {
    expect(metadata.title).toEqual({
      absolute: 'Mobile Cake Decorating Workshops Across the UK',
    })
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/learn/workshops')
    expect(metadata.robots?.index).toBe(true)
    expect(metadata.description).toBe(
      'Mobile cake decorating workshops for groups of four or more across the UK. From £25 per person, with cakes, tools, boxes and live teaching included. All ages are welcome, with vegan-friendly and gluten-friendly options available by agreement.'
    )
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        url: 'https://olgishcakes.co.uk/images/workshops/workshops-social-card.png',
        width: 1200,
        height: 630,
        alt: 'Olgish Cakes mobile cake decorating workshops across the UK',
      }),
    ])
    expect(metadata.twitter?.images).toEqual([
      expect.objectContaining({
        url: 'https://olgishcakes.co.uk/images/workshops/workshops-social-card.png',
        width: 1200,
        height: 630,
        alt: 'Olgish Cakes mobile cake decorating workshops across the UK',
      }),
    ])
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
    expect(screen.getByText('Across the UK')).toBeInTheDocument()
    expect(
      screen.getByText(
        'We travel around the UK, with availability and any additional travel costs quoted case by case.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('4 or more')).toBeInTheDocument()
    expect(
      screen.getByText(/we get asked for these workshops by office teams, birthdays and hen parties/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/we prep the cakes before we arrive, so each guest sits down to one ready to decorate/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /how we run the workshop/i,
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
        name: /when we say no/i,
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
        name: /we quote from the real venue details/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /we bring the cakes ready to decorate/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /we set up, teach, and box everything before people leave/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /practical workshop details/i,
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /group size/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /ages and supervision/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /dietary and allergen information/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/groups of four or more participants/i)).toBeInTheDocument()
    expect(screen.getByText(/children must be supervised/i)).toBeInTheDocument()
    expect(screen.getByText(/cannot guarantee any product is free from cross-contamination/i))
      .toBeInTheDocument()
    expect(screen.getByRole('link', { name: /read our allergen information/i })).toHaveAttribute(
      'href',
      '/allergens'
    )
    expect(screen.getByText(/confirm any deposit and final-payment schedule/i))
      .toBeInTheDocument()
    expect(screen.getByText(/one week away/i)).toBeInTheDocument()

    const mainPortfolioImage = screen.getByRole('img', {
      name: /red birthday cake with a gold crown topper/i,
    })
    const secondaryPortfolioImage = screen.getByRole('img', {
      name: /white buttercream cake with piped swirls and black ribbon bows/i,
    })
    const thirdPortfolioImage = screen.getByRole('img', {
      name: /blue birthday cake with gold accents and printed photo toppers/i,
    })

    expect(mainPortfolioImage).not.toHaveAttribute('loading', 'lazy')
    expect(mainPortfolioImage).toHaveAttribute('fetchpriority', 'high')
    expect(secondaryPortfolioImage).toHaveAttribute('loading', 'lazy')
    expect(thirdPortfolioImage).toHaveAttribute('loading', 'lazy')
    expect(
      screen.getByText(/portfolio cake examples — your workshop design will be agreed with your quote/i)
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
