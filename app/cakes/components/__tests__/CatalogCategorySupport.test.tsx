/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { CatalogCategorySupport } from '../CatalogCategorySupport'
import { getCategoryLandingConfig } from '../../categoryLandingConfig'
import {
  categoryLandingPanelPaddingClassName,
  categoryLandingStandardShellClassName
} from '../categoryLandingLayout'

describe('CatalogCategorySupport', () => {
  it('renders editorial support content without repeating the hero CTA row', () => {
    const config = getCategoryLandingConfig('birthday-cakes')
    const { container } = render(<CatalogCategorySupport config={config} />)

    const heading = screen.getByRole('heading', { level: 2, name: config.supportContent.title })
    const leftColumn = heading.parentElement
    const panel = leftColumn?.parentElement

    expect(heading).toBeInTheDocument()
    expect(screen.getByText(config.supportContent.body)).toBeInTheDocument()
    expect(screen.getByText(config.supportContent.highlights[0])).toBeInTheDocument()
    expect(container.querySelector('section')).toHaveClass(...categoryLandingStandardShellClassName.split(' '))
    expect(panel).toHaveClass(...categoryLandingPanelPaddingClassName.split(' '))
    expect(leftColumn).toHaveClass(
      'mx-auto',
      'max-w-[760px]',
      'text-center',
      'small-laptop:mx-0',
      'small-laptop:max-w-none',
      'small-laptop:text-left'
    )
    expect(container.querySelector('ul')).toHaveStyle({ listStyle: 'none', margin: '0px', paddingLeft: '0px' })
    expect(container.querySelector('li')).toHaveStyle({ display: 'block', listStyle: 'none', marginBottom: '0px' })
    expect(screen.queryByRole('link', { name: config.heroPrimaryAction.label })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: config.heroSecondaryAction.label })).not.toBeInTheDocument()
  })
})