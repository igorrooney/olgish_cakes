/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { CatalogProductDetailLayout, type CatalogProductDetailSection } from '../CatalogProductDetailLayout'
import { PREVIOUS_PATHNAME_STATE_KEY } from '../../../utils/history-state'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    fill: _fill,
    priority: _priority,
    sizes: _sizes,
    ...props
  }: React.ComponentProps<'img'> & {
    fill?: boolean
    priority?: boolean
    sizes?: string
  }) => (
    <img alt={alt || ''} {...props} />
  )
}))

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

const sections: CatalogProductDetailSection[] = [
  {
    id: 'full-description',
    title: 'Full description',
    content: <p>Full description content</p>
  },
  {
    id: 'ingredients',
    title: 'Ingredients',
    content: <p>Ingredients content</p>
  },
  {
    id: 'delivery',
    title: 'Delivery',
    content: <p>Delivery content</p>
  }
]

const tabletPricePrefixAndSignClasses = [
  'tablet:[font-family:var(--font-more-sugar),cursive,fantasy]',
  'tablet:[font-weight:var(--t-font-weight-bold)]',
  'tablet:[font-style:normal]',
  'tablet:[font-size:var(--t-font-size-subtitle-small)]',
  'tablet:[leading-trim:none]',
  'tablet:[line-height:100%]',
  'tablet:[letter-spacing:-0.02em]',
  'tablet:align-top',
  'tablet:text-primary-500'
] as const

const galleryImages = [
  {
    src: '/images/hamper-1.jpg',
    alt: 'Gift hamper image 1'
  },
  {
    src: '/images/hamper-2.jpg',
    alt: 'Gift hamper image 2'
  }
]

function renderLayout(
  onCtaClick = jest.fn(),
  priceText = '\u00A38.50',
  images = galleryImages,
  backLabel?: string
) {
  return render(
    <CatalogProductDetailLayout
      backHref='/cakes?sort=new&page=2'
      backLabel={backLabel}
      categoryLabel='Cakes by post'
      title='Christmas Gift Box & Card'
      priceText={priceText}
      priceSuffix='+ free shipping'
      keyPoints={[
        'Freshly baked and packed',
        'Personalised charity postcard',
        'Free UK shipping'
      ]}
      ctaLabel='Add to cart +'
      onCtaClick={onCtaClick}
      images={images}
      sections={sections}
    />
  )
}

function setHistoryStateWithPreviousPathname(pathname?: string | null) {
  const nextHistoryState: Record<string, unknown> = typeof pathname === 'undefined'
    ? {}
    : { [PREVIOUS_PATHNAME_STATE_KEY]: pathname }

  window.history.replaceState(nextHistoryState, '', window.location.href)
}

describe('CatalogProductDetailLayout', () => {
  beforeEach(() => {
    setHistoryStateWithPreviousPathname()
  })

  it('applies the tablet and desktop container max widths', () => {
    const { container } = renderLayout()
    const article = container.querySelector('article')

    expect(article).not.toBeNull()
    expect(article).toHaveClass(
      'tablet:max-w-[944px]',
      'small-laptop:max-w-[1200px]',
      'large-laptop:max-w-[1432px]'
    )
  })

  it('applies 8px radius to the main gallery image container', () => {
    renderLayout()

    const firstImage = screen.getByAltText('Gift hamper image 1')
    const imageWrapper = firstImage.parentElement

    expect(imageWrapper).not.toBeNull()
    expect(imageWrapper).toHaveClass('rounded-[8px]')
    expect(imageWrapper).not.toHaveClass('rounded-box')
  })

  it('applies tokenized tablet typography to category label', () => {
    renderLayout()

    const categoryLabel = screen.getByText('Cakes by post')

    expect(categoryLabel).toHaveClass(
      'tablet:[font-size:var(--t-font-size-sm)]',
      'tablet:[line-height:var(--t-font-lineHeight-leading-7)]',
      'tablet:text-(--color-catalog-detail-muted)'
    )
    expect(categoryLabel).not.toHaveClass('tablet:text-[38px]', 'tablet:leading-[52px]')
  })

  it('applies tokenized tablet typography to product title', () => {
    renderLayout()

    const title = screen.getByRole('heading', { level: 1, name: 'Christmas Gift Box & Card' })

    expect(title).toHaveClass(
      'tablet:text-[24px]',
      'tablet:[line-height:var(--t-font-lineHeight-leading-7)]',
      'tablet:text-(--color-filter-sort-mobile-text)'
    )
    expect(title).not.toHaveClass('tablet:text-[64px]', 'tablet:leading-[72px]')
  })

  it('applies tokenized tablet typography to price text and currency sign', () => {
    renderLayout()

    const priceText = screen.getByText((_, element) => {
      return element?.tagName.toLowerCase() === 'span' && element.textContent === '\u00A38.50'
    })
    const currencySign = screen.getByText('\u00A3')

    expect(priceText).toHaveClass(
      'tablet:[font-size:var(--t-font-size-title-page-base)]',
      'tablet:[line-height:100%]',
      'tablet:[letter-spacing:-0.02em]',
      'tablet:text-primary-500'
    )
    expect(priceText).not.toHaveClass('tablet:text-[112px]', 'tablet:leading-[100px]')
    expect(currencySign).toHaveClass(...tabletPricePrefixAndSignClasses)
    expect(currencySign).not.toHaveClass('tablet:align-middle')
  })

  it('applies tokenized tablet sign styles to any non-empty price prefix and keeps composed text', () => {
    renderLayout(jest.fn(), `from \u00A38.50`)

    const prefixText = screen.getByText('from', { selector: 'span' })
    const currencySign = screen.getByText((_, element) => {
      return element?.tagName.toLowerCase() === 'span' && element.textContent === '\u00A3'
    })
    const composedPriceText = screen.getByText((_, element) => {
      if (element?.tagName.toLowerCase() !== 'span') {
        return false
      }

      return element.textContent?.replace(/\s+/g, ' ').trim() === 'from \u00A38.50'
    })

    expect(prefixText).toHaveClass(...tabletPricePrefixAndSignClasses)
    expect(currencySign).toHaveClass(...tabletPricePrefixAndSignClasses)
    expect(composedPriceText).toBeInTheDocument()
  })

  it('applies tokenized tablet typography to key points list', () => {
    renderLayout()

    const keyPointsListItem = screen.getByText('Freshly baked and packed')
    const keyPointsList = keyPointsListItem.closest('ul')

    expect(keyPointsList).not.toBeNull()
    expect(keyPointsList).toHaveClass(
      'tablet:[font-family:var(--t-font-family-theme-primary)]',
      'tablet:[font-weight:var(--t-font-weight-normal)]',
      'tablet:[font-style:normal]',
      'tablet:[font-size:var(--t-font-size-base)]',
      'tablet:[leading-trim:none]',
      'tablet:[line-height:140%]',
      'tablet:[letter-spacing:0]',
      'tablet:text-(--d-color-base-content)'
    )
    expect(keyPointsList).not.toHaveClass('tablet:text-[58px]', 'tablet:leading-[72px]')
  })

  it('applies tokenized tablet typography to accordion summary titles', () => {
    renderLayout()

    const ingredientsSummary = screen.getByText('Ingredients')
    const ingredientsDetails = ingredientsSummary.closest('details')

    expect(ingredientsDetails).not.toBeNull()
    expect(ingredientsDetails).toHaveClass('catalog-product-accordion-row')
    expect(ingredientsDetails).not.toHaveClass('mobile-filter-collapse-icon')

    expect(ingredientsSummary).toHaveClass(
      'box-border',
      'tablet:[font-family:var(--t-font-family-theme-primary)]',
      'tablet:[font-weight:var(--t-font-weight-normal)]',
      'tablet:[font-style:normal]',
      'tablet:[font-size:var(--t-font-size-base)]',
      'tablet:[leading-trim:none]',
      'tablet:[line-height:var(--t-font-lineHeight-leading-7)]',
      'tablet:[letter-spacing:0]',
      'tablet:align-middle',
      'tablet:text-(--d-color-base-content)'
    )
    expect(ingredientsSummary).toHaveStyle({ boxSizing: 'border-box' })
    expect(ingredientsSummary).not.toHaveClass('tablet:text-[58px]', 'tablet:leading-[72px]')
  })

  it('applies tokenized tablet typography to accordion section content', () => {
    renderLayout()

    const fullDescriptionParagraph = screen.getByText('Full description content')
    const accordionContent = fullDescriptionParagraph.parentElement

    expect(accordionContent).not.toBeNull()
    expect(accordionContent).toHaveClass(
      'tablet:[font-family:var(--t-font-family-theme-primary)]',
      'tablet:[font-weight:var(--t-font-weight-normal)]',
      'tablet:[font-style:normal]',
      'tablet:[font-size:var(--t-font-size-base)]',
      'tablet:[leading-trim:none]',
      'tablet:[line-height:140%]',
      'tablet:[letter-spacing:0]',
      'tablet:text-(--d-color-base-content)'
    )
    expect(accordionContent).not.toHaveClass('tablet:text-[42px]', 'tablet:leading-[58px]')
  })

  it('renders back link with href', () => {
    renderLayout()

    expect(screen.getByRole('link', { name: 'Back to results' })).toHaveAttribute('href', '/cakes?sort=new&page=2')
  })

  it('renders a custom descriptive back label when provided', () => {
    renderLayout(jest.fn(), '\u00A38.50', galleryImages, 'Back to all cakes')

    const backLink = screen.getByRole('link', { name: 'Back to all cakes' })
    expect(backLink).toHaveAttribute('href', '/cakes?sort=new&page=2')
    expect(backLink).toHaveTextContent('Back to all cakes')
  })

  it('keeps href fallback navigation when history has no previous entry', () => {
    renderLayout()
    setHistoryStateWithPreviousPathname('/cakes')
    const historyLengthSpy = jest.spyOn(window.history, 'length', 'get').mockReturnValue(1)
    const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation(() => undefined)
    const backLink = screen.getByRole('link', { name: 'Back to results' })
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0
    })

    backLink.dispatchEvent(clickEvent)

    expect(historyBackSpy).not.toHaveBeenCalled()
    expect(clickEvent.defaultPrevented).toBe(false)
    historyBackSpy.mockRestore()
    historyLengthSpy.mockRestore()
  })

  it('uses history.back for same-origin plain-left-click back navigation', () => {
    renderLayout()
    window.history.pushState(
      { [PREVIOUS_PATHNAME_STATE_KEY]: '/cakes' },
      '',
      '/cakes/honey-cake'
    )
    const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation(() => undefined)

    fireEvent.click(screen.getByRole('link', { name: 'Back to results' }))

    expect(historyBackSpy).toHaveBeenCalledTimes(1)
    historyBackSpy.mockRestore()
  })

  it('keeps href fallback navigation when history state previous pathname does not match backHref', () => {
    renderLayout()
    window.history.pushState(
      { [PREVIOUS_PATHNAME_STATE_KEY]: '/' },
      '',
      '/cakes/honey-cake'
    )
    const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation(() => undefined)
    const backLink = screen.getByRole('link', { name: 'Back to results' })
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0
    })

    backLink.dispatchEvent(clickEvent)

    expect(historyBackSpy).not.toHaveBeenCalled()
    expect(clickEvent.defaultPrevented).toBe(false)
    historyBackSpy.mockRestore()
  })

  it('keeps href fallback navigation when history state previous pathname is missing', () => {
    renderLayout()
    setHistoryStateWithPreviousPathname()
    window.history.pushState({}, '', '/cakes/honey-cake')
    const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation(() => undefined)

    const backLink = screen.getByRole('link', { name: 'Back to results' })
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0
    })

    backLink.dispatchEvent(clickEvent)

    expect(historyBackSpy).not.toHaveBeenCalled()
    expect(clickEvent.defaultPrevented).toBe(false)
    historyBackSpy.mockRestore()
  })

  it('renders title, price and key points', () => {
    renderLayout()

    expect(screen.getByRole('heading', { level: 1, name: 'Christmas Gift Box & Card' })).toBeInTheDocument()
    expect(screen.getByText((_, element) => element?.textContent === '\u00A38.50')).toBeInTheDocument()
    expect(screen.getByText('+ free shipping')).toBeInTheDocument()
    expect(screen.getByText('Freshly baked and packed')).toBeInTheDocument()
    expect(screen.getByText('Personalised charity postcard')).toBeInTheDocument()
    expect(screen.getByText('Free UK shipping')).toBeInTheDocument()
  })

  it('supports image dot navigation', () => {
    renderLayout()

    const firstImage = screen.getByAltText('Gift hamper image 1')
    expect(firstImage).toBeInTheDocument()

    const secondDot = screen.getByRole('tab', { name: 'View image 2' })
    fireEvent.click(secondDot)

    expect(screen.getByAltText('Gift hamper image 2')).toBeInTheDocument()
  })

  it('renders strict 8x8 dots with 8px gap and tokenized active styles', () => {
    renderLayout()

    const dotsTablist = screen.getByRole('tablist', { name: 'Product image slides' })
    const firstDotButton = screen.getByRole('tab', { name: 'View image 1' })
    const secondDotButton = screen.getByRole('tab', { name: 'View image 2' })

    expect(dotsTablist).toHaveClass('gap-2')
    expect(firstDotButton).toHaveClass(
      'h-2',
      'w-2',
      'border',
      'border-[var(--color-gallery-dot-active)]',
      'bg-[var(--color-gallery-dot-active)]'
    )
    expect(secondDotButton).toHaveClass('h-2', 'w-2', 'border', 'border-base-300', 'bg-base-100')
    expect(firstDotButton).not.toHaveClass('h-6', 'w-6')
    expect(secondDotButton).not.toHaveClass('h-6', 'w-6')

    fireEvent.click(secondDotButton)

    expect(firstDotButton).toHaveClass('border-base-300', 'bg-base-100')
    expect(secondDotButton).toHaveClass(
      'border-[var(--color-gallery-dot-active)]',
      'bg-[var(--color-gallery-dot-active)]'
    )
  })

  it('renders image arrows for galleries with multiple images', () => {
    renderLayout()

    expect(screen.getByRole('button', { name: 'View previous image' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View next image' })).toBeInTheDocument()
  })

  it('hides image arrows and dots when gallery has a single image', () => {
    renderLayout(
      jest.fn(),
      '\u00A38.50',
      [
        {
          src: '/images/hamper-1.jpg',
          alt: 'Gift hamper image 1'
        }
      ]
    )

    expect(screen.queryByRole('button', { name: 'View previous image' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View next image' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tablist', { name: 'Product image slides' })).not.toBeInTheDocument()
  })

  it('supports next arrow image navigation', () => {
    renderLayout()

    expect(screen.getByAltText('Gift hamper image 1')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'View next image' }))

    expect(screen.getByAltText('Gift hamper image 2')).toBeInTheDocument()
  })

  it('wraps to the last image when previous arrow is clicked on the first image', () => {
    renderLayout()

    fireEvent.click(screen.getByRole('button', { name: 'View previous image' }))

    expect(screen.getByAltText('Gift hamper image 2')).toBeInTheDocument()
  })

  it('supports keyboard arrow image navigation when gallery is focused', () => {
    renderLayout()

    const galleryRegion = screen.getByRole('region', { name: 'Product gallery' })
    galleryRegion.focus()
    fireEvent.keyDown(galleryRegion, { key: 'ArrowRight' })
    expect(screen.getByAltText('Gift hamper image 2')).toBeInTheDocument()
    fireEvent.keyDown(galleryRegion, { key: 'ArrowLeft' })
    expect(screen.getByAltText('Gift hamper image 1')).toBeInTheDocument()
  })

  it('applies edge placement and opacity styles to image arrows', () => {
    renderLayout()

    const previousArrow = screen.getByRole('button', { name: 'View previous image' })
    const nextArrow = screen.getByRole('button', { name: 'View next image' })

    expect(previousArrow).toHaveClass(
      'left-3',
      'top-1/2',
      '-translate-y-1/2',
      'bg-base-100/90',
      'shadow-md',
      'opacity-80',
      'hover:opacity-100',
      'focus-visible:ring-2',
      'focus-visible:ring-primary-500',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-base-100'
    )
    expect(nextArrow).toHaveClass(
      'right-3',
      'top-1/2',
      '-translate-y-1/2',
      'bg-base-100/90',
      'shadow-md',
      'opacity-80',
      'hover:opacity-100',
      'focus-visible:ring-2',
      'focus-visible:ring-primary-500',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-base-100'
    )
    expect(previousArrow).not.toHaveClass('border', 'border-primary-500')
    expect(nextArrow).not.toHaveClass('border', 'border-primary-500')
  })

  it('renders accordion section labels and toggles detail state', () => {
    renderLayout()

    const ingredientsSummary = screen.getByText('Ingredients')
    const ingredientsDetails = ingredientsSummary.closest('details')
    if (!ingredientsDetails) {
      throw new Error('Expected ingredients details element')
    }

    expect(ingredientsDetails.open).toBe(false)
    fireEvent.click(ingredientsSummary)
    expect(ingredientsDetails.open).toBe(true)

    expect(screen.getByText('Full description')).toBeInTheDocument()
    expect(screen.getByText('Delivery')).toBeInTheDocument()
  })

  it('calls CTA handler', () => {
    const onCtaClick = jest.fn()
    renderLayout(onCtaClick)

    fireEvent.click(screen.getByRole('button', { name: 'Add to cart +' }))

    expect(onCtaClick).toHaveBeenCalledTimes(1)
  })

  it('applies tokenized tablet CTA button styles without duplicate daisyUI defaults', () => {
    renderLayout()

    const ctaButton = screen.getByRole('button', { name: 'Add to cart +' })

    expect(ctaButton).toHaveClass(
      'tablet:h-12',
      'tablet:min-h-12',
      'tablet:gap-2',
      'tablet:px-4',
      'tablet:shadow-sm',
      'tablet:[font-family:var(--t-font-family-theme-primary)]',
      'tablet:[font-weight:var(--t-font-weight-semibold)]',
      'tablet:[font-style:normal]',
      'tablet:[font-size:var(--t-font-size-sm)]',
      'tablet:[leading-trim:none]',
      'tablet:[line-height:var(--d-lineHeight-14)]',
      'tablet:[letter-spacing:0]',
      'tablet:text-center',
      'tablet:align-middle'
    )
    expect(ctaButton).not.toHaveClass(
      'tablet:text-[48px]',
      'tablet:leading-[56px]',
      'rounded-field'
    )
  })
})

