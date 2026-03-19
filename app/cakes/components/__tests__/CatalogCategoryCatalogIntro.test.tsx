/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { CatalogCategoryCatalogIntro } from '../CatalogCategoryCatalogIntro'
import { getCategoryLandingConfig } from '../../categoryLandingConfig'
import {
  categoryLandingCenteredIntroBlockClassName,
  categoryLandingCompactShellClassName
} from '../categoryLandingLayout'

describe('CatalogCategoryCatalogIntro', () => {
  it('renders a centered intro block above the product grid with compact spacing', () => {
    const config = getCategoryLandingConfig('birthday-cakes')
    const { container } = render(<CatalogCategoryCatalogIntro config={config} />)

    expect(screen.getByRole('heading', { level: 2, name: config.catalogSectionTitle })).toBeInTheDocument()
    expect(screen.getByText(config.catalogSectionIntro)).toBeInTheDocument()
    expect(container.querySelector('section')).toHaveClass(...categoryLandingCompactShellClassName.split(' '))
    expect(container.querySelector('div')).toHaveClass(...categoryLandingCenteredIntroBlockClassName.split(' '))
    expect(screen.getByText(config.catalogSectionIntro)).toHaveClass('mt-3')
  })
})