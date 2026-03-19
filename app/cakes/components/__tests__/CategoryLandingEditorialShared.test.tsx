/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import {
  EditorialQuotePanel,
  EditorialSplitSection
} from '../categoryLandingEditorial/shared'
import {
  categoryLandingQuotePanelPaddingClassName,
  categoryLandingStandardShellClassName
} from '../categoryLandingLayout'

describe('category landing editorial shared primitives', () => {
  it('renders EditorialSplitSection with the expected responsive layout classes', () => {
    render(
      <EditorialSplitSection
        id='test-split'
        title='Plan the detail before the design grows'
        intro='A short intro that frames the practical side.'
      >
        <p>Body copy for the split section.</p>
      </EditorialSplitSection>
    )

    const heading = screen.getByRole('heading', { level: 2, name: 'Plan the detail before the design grows' })
    const headingBlock = heading.parentElement
    const splitGrid = headingBlock?.parentElement
    const section = splitGrid?.parentElement

    expect(heading).toBeInTheDocument()
    expect(screen.getByText('A short intro that frames the practical side.')).toBeInTheDocument()
    expect(screen.getByText('Body copy for the split section.')).toBeInTheDocument()
    expect(section).toHaveAttribute('id', 'test-split')
    expect(section).toHaveClass(...categoryLandingStandardShellClassName.split(' '))
    expect(splitGrid).toHaveClass(
      'grid',
      'gap-8',
      'small-laptop:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]',
      'small-laptop:items-start'
    )
    expect(headingBlock).toHaveClass(
      'mx-auto',
      'max-w-[760px]',
      'text-center',
      'small-laptop:mx-0',
      'small-laptop:max-w-none',
      'small-laptop:text-left'
    )
  })

  it('renders EditorialQuotePanel with normalized highlighted panel spacing', () => {
    render(
      <EditorialQuotePanel
        eyebrow='Planning note'
        title='A bespoke cake should feel connected to the occasion'
        body='This panel carries a more reflective takeaway without pretending to be a testimonial.'
      />
    )

    const body = screen.getByText('This panel carries a more reflective takeaway without pretending to be a testimonial.')
    const panel = body.parentElement

    expect(screen.getByText('Planning note')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'A bespoke cake should feel connected to the occasion' })).toBeInTheDocument()
    expect(body).toBeInTheDocument()
    expect(panel).toHaveClass('rounded-[32px]', 'border', 'border-primary/15', 'bg-base-200/50', 'shadow-sm')
    expect(panel).toHaveClass(...categoryLandingQuotePanelPaddingClassName.split(' '))
  })
})