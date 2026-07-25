/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { AnniversaryLandingEditorial } from '../categoryLandingEditorial/AnniversaryLandingEditorial'
import { BabyShowerLandingEditorial } from '../categoryLandingEditorial/BabyShowerLandingEditorial'
import { BirthdayLandingEditorial } from '../categoryLandingEditorial/BirthdayLandingEditorial'
import { WeddingLandingEditorial } from '../categoryLandingEditorial/WeddingLandingEditorial'
import { getCategoryLandingConfig } from '../../categoryLandingConfig'

jest.mock('next/link', () => {
  return ({ children, href, ...props }: { children: ReactNode, href: string }) => (
    <a href={href} {...props}>{children}</a>
  )
})

describe('category landing editorial components', () => {
  it('renders wedding editorial with specific planning, logistics and proof sections', () => {
    const config = getCategoryLandingConfig('wedding-cakes')

    if (!config.audienceIntroTitle || !config.audienceIntroBody) {
      throw new Error('Expected wedding overview content')
    }

    const { container } = render(
      <WeddingLandingEditorial
        config={config}
        reviewSection={<section data-testid='homepage-reviews'><h2>Our reviews</h2></section>}
      />
    )
    const sections = container.querySelectorAll('section')

    expect(sections[0]?.id).toBe(`${config.slug}-proof`)
    expect(sections[1]).toHaveAttribute('data-testid', 'homepage-reviews')
    expect(screen.getByRole('heading', { level: 2, name: config.audienceIntroTitle })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: config.proofSectionTitle })).toBeInTheDocument()
    expect(screen.getByText(config.audienceIntroBody).parentElement).toHaveClass(
      'mx-auto',
      'max-w-[760px]',
      'text-center'
    )
    expect(container.querySelector('article')).not.toHaveClass('text-center')
    expect(screen.queryByRole('heading', { level: 3, name: 'Get a custom quote' })).not.toBeInTheDocument()
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('renders birthday editorial with proof, local delivery guidance and ordering steps', () => {
    const config = getCategoryLandingConfig('birthday-cakes')
    const { container } = render(
      <BirthdayLandingEditorial
        config={config}
        reviewSection={<section data-testid='homepage-reviews'><h2>Our reviews</h2></section>}
      />
    )
    const sections = container.querySelectorAll('section')

    expect(sections[0]?.id).toBe(`${config.slug}-proof`)
    expect(sections[1]).toHaveAttribute('data-testid', 'homepage-reviews')
    expect(screen.getByRole('heading', { level: 2, name: config.proofSectionTitle })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: config.editorial.delivery?.title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: config.orderingSectionTitle })).toBeInTheDocument()
    expect(screen.getByText(config.proofPoints[0])).toBeInTheDocument()
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('renders anniversary editorial with flavour guidance and milestone sections', () => {
    const config = getCategoryLandingConfig('anniversary-cakes-leeds')
    const flavourItems = config.flavourSectionItems

    if (!flavourItems) {
      throw new Error('Expected anniversary flavour section items')
    }

    const { container } = render(
      <AnniversaryLandingEditorial
        config={config}
        reviewSection={<section data-testid='homepage-reviews'><h2>Our reviews</h2></section>}
      />
    )
    const sections = container.querySelectorAll('section')

    expect(sections[0]?.id).toBe(`${config.slug}-proof`)
    expect(sections[1]).toHaveAttribute('data-testid', 'homepage-reviews')
    expect(sections[2]?.id).toBe(`${config.slug}-process`)
    expect(screen.getByRole('heading', { level: 2, name: config.flavourSectionTitle })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: config.editorial.delivery?.title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: flavourItems[0].title })).toBeInTheDocument()
    expect(screen.getByText('Choose from honey cake, sponge cake, red velvet and other flavours. We help match the cake size to your guest numbers and serving plan.')).toBeInTheDocument()
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('renders baby shower editorial with softer styling and practical planning steps', () => {
    const config = getCategoryLandingConfig('baby-shower-cakes')

    if (!config.audienceIntroTitle || !config.useCases) {
      throw new Error('Expected baby shower overview content')
    }

    const { container } = render(
      <BabyShowerLandingEditorial
        config={config}
        reviewSection={<section data-testid='homepage-reviews'><h2>Our reviews</h2></section>}
      />
    )
    const sections = container.querySelectorAll('section')

    expect(sections[0]?.id).toBe(`${config.slug}-proof`)
    expect(sections[1]).toHaveAttribute('data-testid', 'homepage-reviews')
    expect(sections[2]?.id).toBe(`${config.slug}-process`)
    expect(screen.getByRole('heading', { level: 2, name: config.audienceIntroTitle })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: config.editorial.delivery?.title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: config.orderingSectionTitle })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: config.useCases[0].title })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /contact page/i }).every((element) => element.getAttribute('href') === '/contact')).toBe(true)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('keeps the H2 sets distinct across the four category pages', () => {
    const headingSets = [
      [
        getCategoryLandingConfig('wedding-cakes').audienceIntroTitle,
        getCategoryLandingConfig('wedding-cakes').proofSectionTitle,
        getCategoryLandingConfig('wedding-cakes').orderingSectionTitle
      ],
      [
        getCategoryLandingConfig('birthday-cakes').proofSectionTitle,
        getCategoryLandingConfig('birthday-cakes').editorial.delivery?.title,
        getCategoryLandingConfig('birthday-cakes').orderingSectionTitle
      ],
      [
        getCategoryLandingConfig('anniversary-cakes-leeds').proofSectionTitle,
        getCategoryLandingConfig('anniversary-cakes-leeds').editorial.delivery?.title,
        getCategoryLandingConfig('anniversary-cakes-leeds').orderingSectionTitle
      ],
      [
        getCategoryLandingConfig('baby-shower-cakes').proofSectionTitle,
        getCategoryLandingConfig('baby-shower-cakes').editorial.delivery?.title,
        getCategoryLandingConfig('baby-shower-cakes').orderingSectionTitle
      ]
    ]

    const uniqueHeadingSets = new Set(headingSets.map((headings) => headings.join('|')))

    expect(uniqueHeadingSets.size).toBe(4)
  })
})

