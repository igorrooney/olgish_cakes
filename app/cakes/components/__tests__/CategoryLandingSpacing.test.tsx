/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { CatalogCategoryCatalogIntro } from '../CatalogCategoryCatalogIntro'
import { CatalogCategoryCtaBand } from '../CatalogCategoryCtaBand'
import { CatalogCategoryHero } from '../CatalogCategoryHero'
import { CatalogCategorySupport } from '../CatalogCategorySupport'
import { CatalogFaqAccordion } from '../CatalogFaqAccordion'
import { EditorialQuotePanel } from '../categoryLandingEditorial/shared'
import { getCategoryLandingConfig } from '../../categoryLandingConfig'
import {
  categoryLandingCompactShellClassName,
  categoryLandingCtaShellClassName,
  categoryLandingHeroShellClassName,
  categoryLandingQuotePanelPaddingClassName,
  categoryLandingStandardShellClassName,
  categoryLandingWideShellClassName
} from '../categoryLandingLayout'

jest.mock('next/link', () => {
  return ({ children, href, ...props }: { children: ReactNode, href: string }) => (
    <a href={href} {...props}>{children}</a>
  )
})

describe('category landing spacing roles', () => {
  it('applies the compact, standard, wide, and CTA shells consistently', () => {
    const config = getCategoryLandingConfig('birthday-cakes')
    const { container } = render(
      <>
        <CatalogCategoryHero config={config} />
        <CatalogCategoryCatalogIntro config={config} />
        <CatalogCategorySupport config={config} />
        <CatalogFaqAccordion
          title={config.faqTitle}
          intro={config.faqIntro}
          items={config.faqItems}
          sectionId='birthday-faq'
        />
        <CatalogCategoryCtaBand config={config} />
        <EditorialQuotePanel
          eyebrow='Planning note'
          title='A highlighted takeaway'
          body='Quote panels should use the normalized inner spacing.'
        />
      </>
    )

    const sections = container.querySelectorAll('section')

    expect(sections[0]).toHaveClass(...categoryLandingHeroShellClassName.split(' '))
    expect(sections[1]).toHaveClass(...categoryLandingCompactShellClassName.split(' '))
    expect(sections[2]).toHaveClass(...categoryLandingStandardShellClassName.split(' '))
    expect(sections[3]).toHaveClass(...categoryLandingWideShellClassName.split(' '))
    expect(sections[4]).toHaveClass(...categoryLandingCtaShellClassName.split(' '))
    expect(sections[5]).toHaveClass(...categoryLandingStandardShellClassName.split(' '))
    expect(screen.getByText('Quote panels should use the normalized inner spacing.').parentElement).toHaveClass(
      ...categoryLandingQuotePanelPaddingClassName.split(' ')
    )
  })
})