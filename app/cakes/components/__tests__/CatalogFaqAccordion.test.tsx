/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
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
  it('renders responsive intro copy and an accessible accordion', () => {
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

    const firstQuestionButton = screen.getByRole('button', { name: 'Do you deliver cakes by post?' })
    const secondQuestionButton = screen.getByRole('button', { name: 'Can I request a custom design?' })

    expect(firstQuestionButton).toHaveAttribute('aria-expanded', 'true')
    expect(secondQuestionButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Yes, selected cakes are available by post across the UK.')).toBeInTheDocument()
    expect(screen.queryByText('Yes, custom requests are available for local celebration cakes.')).not.toBeInTheDocument()

    fireEvent.click(secondQuestionButton)

    expect(firstQuestionButton).toHaveAttribute('aria-expanded', 'false')
    expect(secondQuestionButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Yes, custom requests are available for local celebration cakes.')).toBeInTheDocument()
    expect(screen.queryByText('Yes, selected cakes are available by post across the UK.')).not.toBeInTheDocument()
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
