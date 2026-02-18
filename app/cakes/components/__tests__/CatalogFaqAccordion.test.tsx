/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { CatalogFaqAccordion } from '../CatalogFaqAccordion'
import type { CatalogFaqItem } from '../../catalogFaqItems'

const faqItems: CatalogFaqItem[] = [
  {
    question: 'Do you deliver cakes by post?',
    answer: 'Yes, selected cakes are available by post across the UK.'
  },
  {
    question: 'Can I request a custom design?',
    answer: 'Yes, custom requests are available for local celebration cakes.'
  }
]

describe('CatalogFaqAccordion', () => {
  it('renders responsive intro copy and faq entries', () => {
    render(
      <CatalogFaqAccordion
        sectionId='catalog-faq'
        title='Catalog FAQ'
        intro='Quick answers before you order.'
        mobileIntro='Quick mobile FAQs.'
        items={faqItems}
      />
    )

    expect(screen.getByRole('heading', { level: 2, name: 'Catalog FAQ' })).toBeInTheDocument()
    const mobileIntro = screen.getByText('Quick mobile FAQs.')
    const desktopIntro = screen.getByText('Quick answers before you order.')
    expect(mobileIntro).toBeInTheDocument()
    expect(mobileIntro).toHaveClass('tablet:hidden')
    expect(desktopIntro).toBeInTheDocument()
    expect(desktopIntro).toHaveClass('hidden', 'tablet:block')
    expect(screen.getByText('Do you deliver cakes by post?')).toBeInTheDocument()
    expect(screen.getByText('Yes, selected cakes are available by post across the UK.')).toBeInTheDocument()
    expect(screen.getByText('Can I request a custom design?')).toBeInTheDocument()
    expect(screen.getByText('Yes, custom requests are available for local celebration cakes.')).toBeInTheDocument()
  })

  it('falls back to mobile intro when desktop intro is missing', () => {
    render(
      <CatalogFaqAccordion
        sectionId='catalog-faq-mobile-only'
        title='Catalog FAQ'
        mobileIntro='Quick mobile FAQs.'
        items={faqItems}
      />
    )

    expect(screen.getByText('Quick mobile FAQs.')).toBeInTheDocument()
    expect(screen.queryByText('Quick answers before you order.')).not.toBeInTheDocument()
  })

  it('renders nothing when no faq items are provided', () => {
    const { container } = render(
      <CatalogFaqAccordion
        title='Catalog FAQ'
        items={[]}
      />
    )

    expect(container.firstChild).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Catalog FAQ' })).not.toBeInTheDocument()
  })
})
