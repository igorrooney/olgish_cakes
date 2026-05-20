/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen, within } from '@testing-library/react'
import ContactPage, { metadata } from '../page'
import styles from '../contactPage.module.css'

jest.mock('../DeferredContactPageForm', () => ({
  DeferredContactPageForm: () => <div data-testid='contact-page-form'>Contact page form</div>,
}))

jest.mock('../ContactFormScrollLink', () => ({
  ContactFormScrollLink: ({
    children,
    className = '',
  }: {
    children: ReactNode
    className?: string
  }) => (
    <a href='#contact-form-card' className={className}>
      {children}
    </a>
  ),
}))

function parseJsonLdScripts(container: HTMLElement) {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
    script => JSON.parse(script.textContent || '{}') as Record<string, unknown>
  )
}

describe('ContactPage', () => {
  it('exposes cleaned metadata for the refreshed contact page', () => {
    expect(metadata.title).toBe('Contact Olga in Leeds | Cake Quotes, Delivery and Workshop Help')
    expect(metadata.description).toBe(
      'Get in touch with Olga in Leeds about cakes, delivery, postal bakes or workshops. Share what you need, where it is going and any date you already have in mind.'
    )
    expect(metadata.alternates?.canonical).toBe('https://olgishcakes.co.uk/contact')
    expect(metadata.openGraph?.url).toBe('https://olgishcakes.co.uk/contact')
    expect(metadata.twitter?.card).toBe('summary_large_image')
    expect(metadata.keywords).toBeUndefined()
  })

  it('renders the simplified contact page and route-scoped form section', () => {
    const { container } = render(<ContactPage />)
    const heroContainer = screen.getByTestId('contact-hero-container')
    const heroLayout = screen.getByTestId('contact-hero-layout')
    const formLayout = screen.getByTestId('contact-form-layout')
    const desktopContactCard = screen.getByTestId('desktop-direct-contact-card')
    const mobileContactCard = screen.getByTestId('mobile-direct-contact-card')
    const formSection = container.querySelector('#contact-form-section')
    const formCard = container.querySelector('#contact-form-card')

    expect(container.querySelector('main')).toBeNull()
    expect(container.querySelector('.homepage-container')).toBeNull()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Need a cake, delivery help or workshop details?',
      })
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getByText(
        /tell me what you are planning, where it needs to go and when you need it\./i
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /if you are asking for a cake price, the quote form is still the quickest way to start\./i
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get a cake quote/i })).toHaveAttribute(
      'href',
      '/get-custom-quote'
    )
    expect(screen.getByRole('link', { name: /ask a question/i })).toHaveAttribute(
      'href',
      '#contact-form-card'
    )
    expect(screen.getByRole('link', { name: /ask a question/i })).toHaveClass('btn-primary')
    expect(within(desktopContactCard).getByRole('link', { name: /message on whatsapp/i, hidden: true })).toHaveAttribute(
      'href',
      'https://wa.me/447867218194'
    )
    expect(within(desktopContactCard).getByRole('link', { name: /hello@olgishcakes\.co\.uk/i, hidden: true })).toHaveAttribute(
      'href',
      'mailto:hello@olgishcakes.co.uk'
    )
    expect(within(desktopContactCard).getByRole('link', { name: /\+44 786 721 8194/i, hidden: true })).toHaveAttribute(
      'href',
      'tel:+44 786 721 8194'
    )
    expect(
      within(desktopContactCard).getByRole('heading', {
        level: 2,
        name: 'Want to check something first?',
        hidden: true,
      })
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/for something more specific, go straight to/i)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/if you already know you want/i)
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/already know you need/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /cakes by post/i })
    ).toHaveAttribute('href', '/cakes-by-post')
    expect(
      screen.getAllByRole('link', { name: /^workshops$/i })
    ).toHaveLength(1)
    expect(
      within(desktopContactCard).getByText(
        /if you want to check delivery, collection, timing or whether a workshop idea is workable, send me a message or give me a ring first and i'll tell you straight\./i
      )
    ).toBeInTheDocument()
    expect(
      within(mobileContactCard).getByText(
        /message or call if you want to check delivery, collection or timing before you fill in the form\./i
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Send me a message',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'What helps me answer quickly?',
      })
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/can this travel to york, or would leeds collection be safer\?/i)
    ).not.toBeInTheDocument()
    expect(
      screen.getByText((content) =>
        /example: hi olga, i am in chapel allerton/i.test(content) &&
        /harrogate next friday/i.test(content) &&
        /local delivery possible, or is collection easier\?/i.test(content)
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(/if there is a date in the diary, add it\. if not, say what is flexible\./i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/tell me whether this is for collection, local delivery or post\./i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /a few basics are enough\. i can tell you quickly what makes sense next\./i
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /a short note is fine\. these details usually save a follow-up message before i can answer properly\./i
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /need a cake price instead\?/i })
    ).toHaveAttribute(
      'href',
      '/get-custom-quote'
    )
    expect(heroContainer).toHaveClass(styles.contactPageContainer)
    expect(formLayout).toHaveClass(styles.contactPageContainer, styles.formLayout)
    expect(heroLayout).toHaveClass(styles.heroLayout)
    expect(formLayout).toHaveClass('tablet:gap-8')
    expect(desktopContactCard).toHaveClass(styles.desktopDirectContactCard)
    expect(mobileContactCard).toHaveClass(styles.compactDirectContactPanel)
    expect(mobileContactCard.parentElement?.parentElement).toHaveClass(styles.mobileDirectContactSection)
    expect(heroLayout.className).toContain(styles.heroLayout)
    expect(formSection).not.toBeNull()
    expect(formCard).not.toBeNull()
    expect(
      heroContainer.compareDocumentPosition(formSection as Element) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      mobileContactCard.compareDocumentPosition(formSection as Element) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(screen.getByTestId('contact-page-form')).toBeInTheDocument()
    expect(container.querySelectorAll('#contact-form-section')).toHaveLength(1)
    expect(container.querySelectorAll('#contact-form-card')).toHaveLength(1)
    expect(screen.queryByTestId('contact-routing-container')).not.toBeInTheDocument()
    expect(screen.queryByTestId('contact-routing-links')).not.toBeInTheDocument()
    expect(screen.queryByText(/choose the best starting point/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/starting in the right place usually means a faster answer/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/i have kept the main routes below/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/use the contact form below/i)).not.toBeInTheDocument()
    expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument()
    expect(
      screen.queryByText(/send the main details and i'll come back to you with a clear answer\./i)
    ).not.toBeInTheDocument()
  })

  it('renders only the contact-specific structured data blocks', () => {
    const { container } = render(<ContactPage />)
    const blocks = parseJsonLdScripts(container)
    const breadcrumbBlock = blocks.find(block => block['@type'] === 'BreadcrumbList')
    const contactPageBlock = blocks.find(block => block['@type'] === 'ContactPage')
    const bakeryBlock = blocks.find(block => block['@type'] === 'Bakery')

    expect(blocks).toHaveLength(3)
    expect(contactPageBlock).toBeDefined()
    expect(bakeryBlock).toBeDefined()
    expect(breadcrumbBlock).toBeDefined()
    expect(blocks.find(block => block['@type'] === 'Product')).toBeUndefined()
    expect(contactPageBlock?.name).toBe(
      'Contact Olga about cake quotes, delivery, workshops or general questions'
    )
    expect(bakeryBlock?.telephone).toBe('+44 786 721 8194')
    expect((breadcrumbBlock?.itemListElement as Array<Record<string, unknown>>)[1]?.name).toBe(
      'Contact'
    )
  })
})
