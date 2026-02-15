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
  it('renders title, intro, and faq entries', () => {
    render(
      <CatalogFaqAccordion
        sectionId='catalog-faq'
        title='Catalog FAQ'
        intro='Quick answers before you order.'
        items={faqItems}
      />
    )

    expect(screen.getByRole('heading', { level: 2, name: 'Catalog FAQ' })).toBeInTheDocument()
    expect(screen.getByText('Quick answers before you order.')).toBeInTheDocument()
    expect(screen.getByText('Do you deliver cakes by post?')).toBeInTheDocument()
    expect(screen.getByText('Yes, selected cakes are available by post across the UK.')).toBeInTheDocument()
    expect(screen.getByText('Can I request a custom design?')).toBeInTheDocument()
    expect(screen.getByText('Yes, custom requests are available for local celebration cakes.')).toBeInTheDocument()
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
