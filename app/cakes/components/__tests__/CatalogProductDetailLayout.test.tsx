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

const pricePrefixClasses = [
  '[font-family:var(--font-more-sugar),cursive,fantasy]',
  '[font-weight:var(--t-font-weight-bold)]',
  '[font-style:normal]',
  '[font-size:12px]',
  'tablet:[font-size:var(--t-font-size-subtitle-small)]',
  '[leading-trim:none]',
  '[line-height:100%]',
  '[letter-spacing:-0.02em]',
  'align-top',
  'text-primary-500'
] as const

const tabletPriceSignClasses = [
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

function createTouchPoint({
  clientX,
  clientY
}: {
  clientX: number
  clientY: number
}): Touch {
  return {
    identifier: 1,
    target: document.body,
    clientX,
    clientY,
    pageX: clientX,
    pageY: clientY,
    screenX: clientX,
    screenY: clientY,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1
  } as Touch
}

function fireGallerySwipeGesture({
  element,
  startX,
  startY,
  endX,
  endY
}: {
  element: HTMLElement
  startX: number
  startY: number
  endX: number
  endY: number
}) {
  const startTouchPoint = createTouchPoint({
    clientX: startX,
    clientY: startY
  })
  const endTouchPoint = createTouchPoint({
    clientX: endX,
    clientY: endY
  })

  fireEvent.touchStart(element, {
    touches: [startTouchPoint],
    changedTouches: [startTouchPoint],
    targetTouches: [startTouchPoint]
  })
  fireEvent.touchMove(element, {
    touches: [endTouchPoint],
    changedTouches: [endTouchPoint],
    targetTouches: [endTouchPoint]
  })
  fireEvent.touchEnd(element, {
    touches: [],
    changedTouches: [endTouchPoint],
    targetTouches: []
  })
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

  it('applies tokenized mobile and tablet typography to category label', () => {
    renderLayout()

    const categoryLabel = screen.getByText('Cakes by post')

    expect(categoryLabel).toHaveClass(
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-weight:var(--t-font-weight-normal)]',
      '[font-style:normal]',
      'text-[12px]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'tablet:[font-size:var(--t-font-size-sm)]',
      'tablet:text-(--color-catalog-detail-muted)'
    )
    expect(categoryLabel).not.toHaveClass(
      'font-sans',
      'text-[16px]',
      'leading-6',
      'tablet:text-[38px]',
      'tablet:leading-[52px]'
    )
  })

  it('applies tokenized mobile and tablet typography to product title', () => {
    renderLayout()

    const title = screen.getByRole('heading', { level: 1, name: 'Christmas Gift Box & Card' })

    expect(title).toHaveClass(
      'font-oldenburg',
      '[font-weight:var(--t-font-weight-normal)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-xl)]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-(--color-filter-sort-mobile-text)',
      'tablet:text-[24px]',
    )
    expect(title).not.toHaveClass(
      'text-[36px]',
      'leading-[42px]',
      'tablet:text-[64px]',
      'tablet:leading-[72px]'
    )
  })

  it('applies tokenized mobile and tablet typography to price text and tablet-only sign styles to currency sign', () => {
    renderLayout()

    const priceText = screen.getByText((_, element) => {
      return element?.tagName.toLowerCase() === 'span' && element.textContent === '\u00A38.50'
    })
    const currencySign = screen.getByText('\u00A3')

    expect(priceText).toHaveClass(
      '[font-family:var(--font-more-sugar),cursive,fantasy]',
      '[font-weight:var(--t-font-weight-normal)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-subtitle-small)]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-primary-500',
      'tablet:[font-size:var(--t-font-size-title-page-base)]',
      'tablet:[line-height:100%]',
      'tablet:[letter-spacing:-0.02em]',
      'tablet:text-primary-500'
    )
    expect(priceText).not.toHaveClass('tablet:text-[112px]', 'tablet:leading-[100px]')
    expect(currencySign).toHaveClass(...tabletPriceSignClasses)
    expect(currencySign).not.toHaveClass(
      '[font-weight:var(--t-font-weight-bold)]',
      '[font-size:var(--t-font-size-subtitle-small)]',
      'align-top'
    )
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

    expect(prefixText).toHaveClass(...pricePrefixClasses)
    expect(currencySign).toHaveClass(...tabletPriceSignClasses)
    expect(currencySign).not.toHaveClass(
      '[font-family:var(--font-more-sugar),cursive,fantasy]',
      '[font-weight:var(--t-font-weight-bold)]',
      '[font-size:var(--t-font-size-subtitle-small)]',
      'align-top'
    )
    expect(composedPriceText).toBeInTheDocument()
  })

  it('applies tokenized mobile and tablet typography to key points list', () => {
    renderLayout()

    const keyPointsListItem = screen.getByText('Freshly baked and packed')
    const keyPointsList = keyPointsListItem.closest('ul')

    expect(keyPointsList).not.toBeNull()
    expect(keyPointsList).toHaveClass(
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-weight:var(--t-font-weight-normal)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-base)]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-(--d-color-base-content)',
      'tablet:[font-family:var(--t-font-family-theme-primary)]',
      'tablet:[font-weight:var(--t-font-weight-normal)]',
      'tablet:[font-style:normal]',
      'tablet:[font-size:var(--t-font-size-base)]',
      'tablet:[leading-trim:none]',
      'tablet:[line-height:140%]',
      'tablet:[letter-spacing:0]',
      'tablet:text-(--d-color-base-content)'
    )
    expect(keyPointsList).not.toHaveClass('font-sans', 'text-[20px]', 'leading-[30px]', 'text-base-content')
    expect(keyPointsList).not.toHaveClass('tablet:text-[58px]', 'tablet:leading-[72px]')
  })

  it('applies tokenized mobile and tablet typography to accordion summary titles', () => {
    renderLayout()

    const ingredientsSummary = screen.getByText('Ingredients')
    const ingredientsDetails = ingredientsSummary.closest('details')

    expect(ingredientsDetails).not.toBeNull()
    expect(ingredientsDetails).toHaveClass('catalog-product-accordion-row')
    expect(ingredientsDetails).not.toHaveClass('mobile-filter-collapse-icon')

    expect(ingredientsSummary).toHaveClass(
      'box-border',
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-weight:var(--t-font-weight-normal)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-base)]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-[color:var(--d-color-base-content,#1F2937)]',
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
    expect(ingredientsSummary).not.toHaveClass('font-sans', 'text-[20px]', 'leading-[30px]', 'text-base-content')
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

    const onlyImage = screen.getByAltText('Gift hamper image 1')
    const imageWrapper = onlyImage.parentElement

    if (imageWrapper === null) {
      throw new Error('Expected single gallery image wrapper to exist')
    }

    fireGallerySwipeGesture({
      element: imageWrapper,
      startX: 220,
      startY: 120,
      endX: 120,
      endY: 122
    })

    expect(screen.getByAltText('Gift hamper image 1')).toBeInTheDocument()
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

  it('supports swipe left image navigation', () => {
    renderLayout()

    const firstImage = screen.getByAltText('Gift hamper image 1')
    const imageWrapper = firstImage.parentElement

    if (imageWrapper === null) {
      throw new Error('Expected gallery image wrapper to exist')
    }

    fireGallerySwipeGesture({
      element: imageWrapper,
      startX: 220,
      startY: 120,
      endX: 120,
      endY: 126
    })

    expect(screen.getByAltText('Gift hamper image 2')).toBeInTheDocument()
  })

  it('supports swipe right image navigation and loops from first to last image', () => {
    renderLayout()

    const firstImage = screen.getByAltText('Gift hamper image 1')
    const imageWrapper = firstImage.parentElement

    if (imageWrapper === null) {
      throw new Error('Expected gallery image wrapper to exist')
    }

    fireGallerySwipeGesture({
      element: imageWrapper,
      startX: 120,
      startY: 120,
      endX: 220,
      endY: 124
    })

    expect(screen.getByAltText('Gift hamper image 2')).toBeInTheDocument()
  })

  it('does not navigate images on short horizontal swipe', () => {
    renderLayout()

    const firstImage = screen.getByAltText('Gift hamper image 1')
    const imageWrapper = firstImage.parentElement

    if (imageWrapper === null) {
      throw new Error('Expected gallery image wrapper to exist')
    }

    fireGallerySwipeGesture({
      element: imageWrapper,
      startX: 220,
      startY: 120,
      endX: 190,
      endY: 122
    })

    expect(screen.getByAltText('Gift hamper image 1')).toBeInTheDocument()
  })

  it('does not navigate images on vertical-dominant swipe', () => {
    renderLayout()

    const firstImage = screen.getByAltText('Gift hamper image 1')
    const imageWrapper = firstImage.parentElement

    if (imageWrapper === null) {
      throw new Error('Expected gallery image wrapper to exist')
    }

    fireGallerySwipeGesture({
      element: imageWrapper,
      startX: 220,
      startY: 120,
      endX: 160,
      endY: 220
    })

    expect(screen.getByAltText('Gift hamper image 1')).toBeInTheDocument()
  })

  it('does not navigate images after touch cancel', () => {
    renderLayout()

    const firstImage = screen.getByAltText('Gift hamper image 1')
    const imageWrapper = firstImage.parentElement

    if (imageWrapper === null) {
      throw new Error('Expected gallery image wrapper to exist')
    }

    const startTouchPoint = createTouchPoint({
      clientX: 220,
      clientY: 120
    })
    const moveTouchPoint = createTouchPoint({
      clientX: 180,
      clientY: 124
    })
    const endTouchPoint = createTouchPoint({
      clientX: 80,
      clientY: 126
    })

    fireEvent.touchStart(imageWrapper, {
      touches: [startTouchPoint],
      changedTouches: [startTouchPoint],
      targetTouches: [startTouchPoint]
    })
    fireEvent.touchMove(imageWrapper, {
      touches: [moveTouchPoint],
      changedTouches: [moveTouchPoint],
      targetTouches: [moveTouchPoint]
    })
    fireEvent.touchCancel(imageWrapper, {
      touches: [],
      changedTouches: [moveTouchPoint],
      targetTouches: []
    })
    fireEvent.touchEnd(imageWrapper, {
      touches: [],
      changedTouches: [endTouchPoint],
      targetTouches: []
    })

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

  it('applies tokenized CTA button styles without duplicate daisyUI defaults', () => {
    renderLayout()

    const ctaButton = screen.getByRole('button', { name: 'Add to cart +' })

    expect(ctaButton).toHaveClass(
      'h-12',
      'min-h-12',
      'shadow-sm',
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-weight:var(--t-font-weight-semibold)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-sm)]',
      '[leading-trim:none]',
      '[line-height:var(--d-lineHeight-14)]',
      '[letter-spacing:0]',
      'text-center',
      'align-middle',
      'text-primary-content',
      'tablet:gap-2',
      'tablet:px-4'
    )
    expect(ctaButton).not.toHaveClass(
      'h-16',
      'min-h-16',
      'font-sans',
      'text-[20px]',
      'leading-6',
      'tablet:text-[48px]',
      'tablet:leading-[56px]',
      'rounded-field'
    )
  })
})

