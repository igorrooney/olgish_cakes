/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { CatalogCategoryHero } from '../CatalogCategoryHero'
import { getCategoryLandingConfig } from '../../categoryLandingConfig'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>) => (
    <a href={href} {...props}>{children}</a>
  )
}))

describe('CatalogCategoryHero', () => {
  it('renders a wider commercial hero with tablet-only secondary copy', () => {
    const config = getCategoryLandingConfig('birthday-cakes')
    const { container } = render(<CatalogCategoryHero config={config} />)

    expect(screen.queryByRole('navigation', { name: /breadcrumb/i })).not.toBeInTheDocument()
    const heading = screen.getByRole('heading', { level: 1, name: config.heroTitle })
    const secondaryCopy = screen.getByText(config.heroBody)

    expect(heading).toHaveClass('max-w-[16ch]', 'tablet:max-w-[18ch]', 'small-laptop:max-w-[20ch]')
    expect(container.firstChild).not.toHaveClass('border', 'bg-base-100', 'shadow-[0_18px_48px_rgba(97,39,0,0.08)]')
    expect(screen.getByText(config.heroLead)).toBeInTheDocument()
    expect(secondaryCopy).toHaveClass('hidden', 'tablet:block')
    expect(screen.queryByText(config.heroSupportLine ?? '')).not.toBeInTheDocument()

    const primaryCta = screen.getByRole('link', { name: config.heroPrimaryAction.label })
    const secondaryCta = screen.getByRole('link', { name: config.heroSecondaryAction.label })

    expect(primaryCta).toHaveAttribute('href', config.heroPrimaryAction.href)
    expect(primaryCta).toHaveClass('w-full', 'tablet:w-auto')
    expect(secondaryCta).toHaveAttribute('href', config.heroSecondaryAction.href)
    expect(secondaryCta).toHaveClass('w-full', 'tablet:w-auto')
  })
})
