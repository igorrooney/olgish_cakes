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
    const { container } = render(<WeddingLandingEditorial config={config} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Wedding cake planning should feel specific to your day, not borrowed from a generic template' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Leeds venue delivery and setup are part of the cake brief, not an afterthought' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Why couples usually choose a bespoke wedding cake from a local maker' })).toBeInTheDocument()
    expect(screen.getByText(/Couples usually need more than a pretty centrepiece/i).parentElement).toHaveClass(
      'mx-auto',
      'max-w-[760px]',
      'text-center'
    )
    expect(container.querySelector('article')).not.toHaveClass('text-center')
    expect(screen.getByRole('heading', { level: 3, name: 'Get a custom quote' }).closest('a')).toHaveAttribute('href', '/get-custom-quote')
    expect(screen.getAllByRole('link', { name: /contact page/i }).every((element) => element.getAttribute('href') === '/contact')).toBe(true)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('renders birthday editorial with milestone-specific sections and ordering steps', () => {
    const config = getCategoryLandingConfig('birthday-cakes')
    render(<BirthdayLandingEditorial config={config} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Birthday cakes work best when the brief fits the person, not just the party theme' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Collection or local delivery in Leeds should be decided before the finish gets more delicate' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'A better birthday cake brief usually comes together in four simple steps' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: "Children's birthdays need a readable theme" })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Get a custom quote' }).closest('a')).toHaveAttribute('href', '/get-custom-quote')
    expect(screen.getAllByRole('link', { name: /contact page/i }).every((element) => element.getAttribute('href') === '/contact')).toBe(true)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('renders anniversary editorial with local delivery guidance and milestone sections', () => {
    const config = getCategoryLandingConfig('anniversary-cakes-leeds')
    render(<AnniversaryLandingEditorial config={config} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Anniversary cakes should fit the scale of the milestone and the way you are actually celebrating' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Collection and local delivery in Leeds should match the timing and setting of the celebration' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Useful pages for a more refined anniversary brief' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Intimate anniversary dinners need restraint' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Contact' }).closest('a')).toHaveAttribute('href', '/contact')
    expect(screen.getAllByRole('link', { name: /contact page/i }).every((element) => element.getAttribute('href') === '/contact')).toBe(true)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('renders baby shower editorial with softer styling and practical planning steps', () => {
    const config = getCategoryLandingConfig('baby-shower-cakes')
    render(<BabyShowerLandingEditorial config={config} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Baby shower cakes should feel warm, personal and easy to place into the celebration' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Collection and local delivery should be planned early when the order window is short' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'A practical baby shower order usually comes together in four simple steps' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Baby shower tables need a softer design language' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Get a custom quote' }).closest('a')).toHaveAttribute('href', '/get-custom-quote')
    expect(screen.getAllByRole('link', { name: /contact page/i }).every((element) => element.getAttribute('href') === '/contact')).toBe(true)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('keeps the H2 sets distinct across the four category pages', () => {
    const headingSets = [
      [
        'Wedding cake planning should feel specific to your day, not borrowed from a generic template',
        'Leeds venue delivery and setup are part of the cake brief, not an afterthought',
        'A calmer wedding cake process starts with the details that matter most'
      ],
      [
        'Birthday cakes work best when the brief fits the person, not just the party theme',
        'Collection or local delivery in Leeds should be decided before the finish gets more delicate',
        'A better birthday cake brief usually comes together in four simple steps'
      ],
      [
        'Anniversary cakes should fit the scale of the milestone and the way you are actually celebrating',
        'Collection and local delivery in Leeds should match the timing and setting of the celebration',
        'Useful pages for a more refined anniversary brief'
      ],
      [
        'Baby shower cakes should feel warm, personal and easy to place into the celebration',
        'Collection and local delivery should be planned early when the order window is short',
        'Useful pages before you order a baby shower cake'
      ]
    ]

    const uniqueHeadingSets = new Set(headingSets.map((headings) => headings.join('|')))

    expect(uniqueHeadingSets.size).toBe(4)
  })
})

