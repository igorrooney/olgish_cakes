/**
 * @jest-environment jsdom
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
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

const originalWindowImage = window.Image

interface WindowImagePreloadMock {
  preloadedSrcs: string[]
  triggerLoad: (src: string) => void
  triggerDecode: (src: string) => Promise<void>
  triggerError: (src: string) => void
  restore: () => void
}

let defaultWindowImagePreloadMock: WindowImagePreloadMock | null = null

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

const burstNavigationGalleryImages = [
  {
    src: '/images/hamper-1.jpg',
    alt: 'Gift hamper image 1'
  },
  {
    src: '/images/hamper-2.jpg',
    alt: 'Gift hamper image 2'
  },
  {
    src: '/images/hamper-3.jpg',
    alt: 'Gift hamper image 3'
  },
  {
    src: '/images/hamper-4.jpg',
    alt: 'Gift hamper image 4'
  },
  {
    src: '/images/hamper-5.jpg',
    alt: 'Gift hamper image 5'
  },
  {
    src: '/images/hamper-6.jpg',
    alt: 'Gift hamper image 6'
  },
  {
    src: '/images/hamper-7.jpg',
    alt: 'Gift hamper image 7'
  }
]

function mockWindowImagePreload(
  options: {
    autoLoad?: boolean
    supportsDecode?: boolean
    autoDecode?: boolean
  } = {}
): WindowImagePreloadMock {
  const {
    autoLoad = true,
    supportsDecode = false,
    autoDecode = supportsDecode && autoLoad
  } = options
  const preloadedSrcs: string[] = []
  const originalImage = window.Image
  const imageInstancesBySrc = new Map<string, MockWindowImage[]>()

  class MockWindowImage {
    onload: HTMLImageElement['onload'] = null
    onerror: HTMLImageElement['onerror'] = null
    complete = false
    decode?: () => Promise<void>
    private hasSettled = false
    private hasDecoded = false
    private rejectDecodePromise: ((reason?: unknown) => void) | null = null
    private resolveDecodePromise: (() => void) | null = null
    private srcValue = ''
    private decodePromise = Promise.resolve()

    constructor() {
      if (supportsDecode) {
        this.resetDecodePromise()
        this.decode = () => this.decodePromise
      }
    }

    get src() {
      return this.srcValue
    }

    set src(value: string) {
      this.srcValue = value
      this.hasSettled = false
      this.hasDecoded = false
      this.complete = false

      if (supportsDecode) {
        this.resetDecodePromise()
      }

      preloadedSrcs.push(value)

      const imageInstances = imageInstancesBySrc.get(value) ?? []
      imageInstances.push(this)
      imageInstancesBySrc.set(value, imageInstances)

      if (autoLoad) {
        this.triggerLoad()
      }
    }

    private resetDecodePromise() {
      this.decodePromise = new Promise((resolve, reject) => {
        this.resolveDecodePromise = resolve
        this.rejectDecodePromise = reject
      })
    }

    triggerLoad() {
      if (this.hasSettled) {
        return
      }

      this.hasSettled = true
      this.complete = true
      this.onload?.call(this as unknown as GlobalEventHandlers, new Event('load'))

      if (supportsDecode && autoDecode) {
        void this.triggerDecode()
      }
    }

    async triggerDecode() {
      if (!supportsDecode || this.hasDecoded) {
        return
      }

      this.hasDecoded = true
      const decodePromise = this.decodePromise
      this.resolveDecodePromise?.()
      await decodePromise
    }

    triggerError() {
      if (this.hasSettled) {
        return
      }

      this.hasSettled = true
      this.complete = false

      if (supportsDecode) {
        this.rejectDecodePromise?.(new Error('Mock gallery preload failed'))
      }

      this.onerror?.call(this as unknown as GlobalEventHandlers, new Event('error'))
    }
  }

  window.Image = MockWindowImage as unknown as typeof window.Image

  return {
    preloadedSrcs,
    triggerLoad(src) {
      imageInstancesBySrc.get(src)?.forEach((imageInstance) => {
        imageInstance.triggerLoad()
      })
    },
    async triggerDecode(src) {
      const imageInstances = imageInstancesBySrc.get(src) ?? []

      await Promise.all(imageInstances.map(async (imageInstance) => {
        await imageInstance.triggerDecode()
      }))
    },
    triggerError(src) {
      imageInstancesBySrc.get(src)?.forEach((imageInstance) => {
        imageInstance.triggerError()
      })
    },
    restore() {
      window.Image = originalImage
    }
  }
}

function renderLayout(
  onCtaClick = jest.fn(),
  priceText = '\u00A38.50',
  images = galleryImages,
  backLabel?: string,
  orderContent?: React.ReactNode,
  isOrderFormOpen = false,
  onBackToProduct?: () => void,
  galleryBelowContent?: React.ReactNode,
  requestedActiveImageIndex?: number,
  requestedActiveImageKey?: string,
  onCtaIntent?: () => void
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
      onCtaIntent={onCtaIntent}
      orderContent={orderContent}
      isOrderFormOpen={isOrderFormOpen}
      onBackToProduct={onBackToProduct}
      galleryBelowContent={galleryBelowContent}
      requestedActiveImageIndex={requestedActiveImageIndex}
      requestedActiveImageKey={requestedActiveImageKey}
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

function fireNativeClickSequence(elements: HTMLElement[]) {
  act(() => {
    elements.forEach((element) => {
      element.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }))
    })
  })
}

function fireRapidNativeClicks(element: HTMLElement, count: number) {
  fireNativeClickSequence(Array.from({ length: count }, () => element))
}

function getGalleryViewport() {
  return screen.getByTestId('product-gallery-viewport')
}

function getGalleryStage() {
  return screen.getByTestId('product-gallery-stage')
}

function getStableGalleryImage() {
  const image = screen.queryByTestId('product-gallery-active-layer')?.querySelector('img')

  return image instanceof HTMLImageElement ? image : null
}

function getEnteringGalleryImage() {
  const image = screen.queryByTestId('product-gallery-entering-layer')?.querySelector('img')

  return image instanceof HTMLImageElement ? image : null
}

function getActiveGalleryImage() {
  const enteringImage = getEnteringGalleryImage()

  if (enteringImage) {
    return enteringImage
  }

  const stableImage = getStableGalleryImage()

  if (!stableImage) {
    throw new Error('Expected active gallery image element')
  }

  return stableImage
}

function getLeavingGalleryImage() {
  const image = screen.queryByTestId('product-gallery-leaving-layer')?.querySelector('img')

  return image instanceof HTMLImageElement ? image : null
}

function advanceGalleryFade() {
  act(() => {
    jest.advanceTimersByTime(220)
  })
}

function mockReducedMotionPreference(matches: boolean) {
  window.matchMedia = jest.fn().mockImplementation(() => {
    return {
      matches,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    } as MediaQueryList
  }) as typeof window.matchMedia
}

function expectActiveImage(imageNumber: number, imageCount: number) {
  expect(screen.getByText(`Image ${imageNumber} of ${imageCount}`)).toBeInTheDocument()

  if (imageCount > 1) {
    expect(screen.getByRole('tab', { name: `View image ${imageNumber}` })).toHaveAttribute('aria-selected', 'true')
  }
}

describe('CatalogProductDetailLayout', () => {
  beforeEach(() => {
    setHistoryStateWithPreviousPathname()
    window.matchMedia = undefined as unknown as typeof window.matchMedia
    window.location.hash = ''
    window.Image = originalWindowImage
    defaultWindowImagePreloadMock = mockWindowImagePreload()
  })

  afterEach(() => {
    defaultWindowImagePreloadMock?.restore()
    defaultWindowImagePreloadMock = null
    window.Image = originalWindowImage
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

  it('applies edge-to-edge mobile classes and preserves tablet styling on main gallery image container', () => {
    renderLayout()

    const imageWrapper = getGalleryViewport()

    expect(imageWrapper).toHaveClass(
      '-mx-4',
      'w-[calc(100%+2rem)]',
      'rounded-none',
      'tablet:mx-0',
      'tablet:w-full',
      'tablet:rounded-[8px]'
    )
    expect(imageWrapper).not.toHaveClass('rounded-box')
  })

  it('uses touch none on mobile and pan-y touch behavior from tablet up on gallery image container', () => {
    renderLayout()

    const imageWrapper = getGalleryViewport()

    expect(imageWrapper).toHaveClass('touch-none', 'tablet:touch-pan-y')
  })

  it('renders a stable gallery layer when no image transition is active', () => {
    renderLayout()

    const stage = getGalleryStage()

    expect(stage).toHaveClass('relative', 'h-full', 'w-full')
    expect(stage).not.toHaveClass('carousel', '[scroll-snap-type:x_mandatory]')
    expect(screen.getByTestId('product-gallery-active-layer')).toHaveClass('absolute', 'inset-0')
    expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 1')
    expect(screen.queryByTestId('product-gallery-entering-layer')).not.toBeInTheDocument()
    expect(screen.queryByTestId('product-gallery-leaving-layer')).not.toBeInTheDocument()
  })

  it('immediately preloads all non-active gallery images on first render', () => {
    const { preloadedSrcs, restore } = mockWindowImagePreload()

    try {
      renderLayout(jest.fn(), '\u00A38.50', burstNavigationGalleryImages)

      expect(preloadedSrcs).toEqual(
        burstNavigationGalleryImages.slice(1).map((image) => image.src)
      )
    } finally {
      restore()
    }
  })

  it('does not preload images for a single-image gallery', () => {
    const { preloadedSrcs, restore } = mockWindowImagePreload()

    try {
      renderLayout(jest.fn(), '\u00A38.50', [galleryImages[0]])

      expect(preloadedSrcs).toEqual([])
    } finally {
      restore()
    }
  })

  it('does not duplicate preloads when rerendered with the same gallery image sources', () => {
    const { preloadedSrcs, restore } = mockWindowImagePreload()
    const rerenderedGalleryImages = galleryImages.map((image) => ({ ...image }))

    try {
      const { rerender } = renderLayout()

      expect(preloadedSrcs).toEqual(['/images/hamper-2.jpg'])

      rerender(
        <CatalogProductDetailLayout
          backHref='/cakes?sort=new&page=2'
          categoryLabel='Cakes by post'
          title='Christmas Gift Box & Card'
          priceText='\u00A38.50'
          priceSuffix='+ free shipping'
          keyPoints={[
            'Freshly baked and packed',
            'Personalised charity postcard',
            'Free UK shipping'
          ]}
          ctaLabel='Add to cart +'
          onCtaClick={jest.fn()}
          images={rerenderedGalleryImages}
          sections={sections}
        />
      )

      expect(preloadedSrcs).toEqual(['/images/hamper-2.jpg'])
    } finally {
      restore()
    }
  })

  it('keeps the current image visible until a requested unloaded image is decoded and ready', async () => {
    const imagePreloadMock = mockWindowImagePreload({
      autoLoad: false,
      supportsDecode: true
    })

    try {
      renderLayout(jest.fn(), '\u00A38.50', burstNavigationGalleryImages)

      fireEvent.click(screen.getByRole('button', { name: 'View next image' }))

      expectActiveImage(1, 7)
      expect(screen.getByTestId('product-gallery-active-layer')).toBeInTheDocument()
      expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 1')
      expect(screen.queryByTestId('product-gallery-entering-layer')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-gallery-leaving-layer')).not.toBeInTheDocument()

      act(() => {
        imagePreloadMock.triggerLoad('/images/hamper-2.jpg')
      })

      expectActiveImage(1, 7)
      expect(screen.getByTestId('product-gallery-active-layer')).toBeInTheDocument()
      expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 1')
      expect(screen.queryByTestId('product-gallery-entering-layer')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-gallery-leaving-layer')).not.toBeInTheDocument()

      await act(async () => {
        await imagePreloadMock.triggerDecode('/images/hamper-2.jpg')
      })

      expectActiveImage(2, 7)
      expect(screen.queryByTestId('product-gallery-active-layer')).not.toBeInTheDocument()
      expect(getEnteringGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 2')
      expect(getLeavingGalleryImage()).toHaveAttribute('src', '/images/hamper-1.jpg')
    } finally {
      imagePreloadMock.restore()
    }
  })

  it('renders optional gallery-below content with fixed top spacing', () => {
    renderLayout(
      jest.fn(),
      '\u00A38.50',
      galleryImages,
      undefined,
      undefined,
      false,
      undefined,
      <div data-testid='gallery-below-node'>Filling preview</div>
    )

    const galleryBelowNode = screen.getByTestId('gallery-below-node')
    const galleryBelowWrapper = galleryBelowNode.parentElement

    expect(galleryBelowNode).toBeInTheDocument()
    expect(galleryBelowWrapper).not.toBeNull()
    expect(galleryBelowWrapper).toHaveClass('mt-8')
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
    expect(screen.getByText((_, element) => {
      return element?.tagName.toLowerCase() === 'span' && element.textContent === '\u00A38.50'
    })).toBeInTheDocument()
    expect(screen.getByText('+ free shipping')).toBeInTheDocument()
    expect(screen.getByText('Freshly baked and packed')).toBeInTheDocument()
    expect(screen.getByText('Personalised charity postcard')).toBeInTheDocument()
    expect(screen.getByText('Free UK shipping')).toBeInTheDocument()
  })

  it('crossfades between current and next image instead of swapping instantly', () => {
    jest.useFakeTimers()

    try {
      renderLayout()

      expectActiveImage(1, 2)

      fireEvent.click(screen.getByRole('tab', { name: 'View image 2' }))

      expectActiveImage(2, 2)
      expect(screen.queryByTestId('product-gallery-active-layer')).not.toBeInTheDocument()
      expect(screen.getByTestId('product-gallery-entering-layer')).toBeInTheDocument()
      expect(getEnteringGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 2')
      expect(screen.getByTestId('product-gallery-leaving-layer')).toHaveAttribute('aria-hidden', 'true')
      expect(getLeavingGalleryImage()).toHaveAttribute('alt', '')

      advanceGalleryFade()

      expect(screen.getByTestId('product-gallery-active-layer')).toBeInTheDocument()
      expect(screen.queryByTestId('product-gallery-entering-layer')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-gallery-leaving-layer')).not.toBeInTheDocument()
    } finally {
      act(() => {
        jest.runOnlyPendingTimers()
      })
      jest.useRealTimers()
    }
  })

  it('applies requested active image when request key changes', () => {
    const onCtaClick = jest.fn()
    const baseProps = {
      backHref: '/cakes?sort=new&page=2',
      categoryLabel: 'Cakes by post',
      title: 'Christmas Gift Box & Card',
      priceText: '\u00A38.50',
      priceSuffix: '+ free shipping',
      keyPoints: [
        'Freshly baked and packed',
        'Personalised charity postcard',
        'Free UK shipping'
      ],
      ctaLabel: 'Add to cart +',
      onCtaClick,
      images: galleryImages,
      sections
    }

    const { rerender } = render(
      <CatalogProductDetailLayout
        {...baseProps}
        requestedActiveImageIndex={1}
        requestedActiveImageKey='filling-1'
      />
    )

    expectActiveImage(2, 2)

    fireEvent.click(screen.getByRole('button', { name: 'View previous image' }))
    expectActiveImage(1, 2)

    rerender(
      <CatalogProductDetailLayout
        {...baseProps}
        requestedActiveImageIndex={1}
        requestedActiveImageKey='filling-2'
      />
    )

    expectActiveImage(2, 2)
  })

  it('ignores requested active image when requested index is out of bounds', () => {
    renderLayout(
      jest.fn(),
      '\u00A38.50',
      galleryImages,
      undefined,
      undefined,
      false,
      undefined,
      undefined,
      8,
      'filling-1'
    )

    expectActiveImage(1, 2)
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
      'cursor-pointer',
      'border',
      'border-[var(--color-gallery-dot-active)]',
      'bg-[var(--color-gallery-dot-active)]'
    )
    expect(secondDotButton).toHaveClass('h-2', 'w-2', 'cursor-pointer', 'border', 'border-base-300', 'bg-base-100')
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

  it('keeps mobile arrows hidden by default while preserving tablet visibility classes', () => {
    renderLayout()

    const previousArrow = screen.getByRole('button', { name: 'View previous image' })
    const nextArrow = screen.getByRole('button', { name: 'View next image' })

    expect(previousArrow).toHaveClass('opacity-0', 'pointer-events-none', 'tablet:opacity-80', 'tablet:pointer-events-auto')
    expect(nextArrow).toHaveClass('opacity-0', 'pointer-events-none', 'tablet:opacity-80', 'tablet:pointer-events-auto')
  })

  it('reveals mobile arrows while gallery is focused and hides them again on blur', () => {
    renderLayout()

    const galleryRegion = screen.getByRole('region', { name: 'Product gallery' })
    const galleryViewport = getGalleryViewport()
    const backLink = screen.getByRole('link', { name: 'Back to results' })
    const previousArrow = screen.getByRole('button', { name: 'View previous image' })
    const nextArrow = screen.getByRole('button', { name: 'View next image' })

    expect(galleryRegion).toHaveClass('group', 'focus:outline-none', 'focus-visible:outline-none')
    expect(galleryViewport).toHaveClass('catalog-gallery-viewport')
    expect(previousArrow).toHaveClass('opacity-0', 'pointer-events-none')
    expect(nextArrow).toHaveClass('opacity-0', 'pointer-events-none')
    expect(galleryViewport).not.toHaveClass('outline', 'outline-2', 'outline-offset-2', 'outline-primary-500')

    fireEvent.focus(galleryRegion)

    expect(previousArrow).toHaveClass('opacity-100', 'pointer-events-auto')
    expect(nextArrow).toHaveClass('opacity-100', 'pointer-events-auto')
    expect(galleryViewport).toHaveClass('outline', 'outline-2', 'outline-offset-2', 'outline-primary-500')

    fireEvent.blur(galleryRegion, { relatedTarget: backLink })

    expect(previousArrow).toHaveClass('opacity-0', 'pointer-events-none')
    expect(nextArrow).toHaveClass('opacity-0', 'pointer-events-none')
    expect(galleryViewport).not.toHaveClass('outline', 'outline-2', 'outline-offset-2', 'outline-primary-500')
  })

  it('focuses gallery on image touch start so arrows become visible on mobile', () => {
    renderLayout()

    const galleryRegion = screen.getByRole('region', { name: 'Product gallery' })
    const previousArrow = screen.getByRole('button', { name: 'View previous image' })
    const nextArrow = screen.getByRole('button', { name: 'View next image' })
    const imageWrapper = getGalleryViewport()

    const touchPoint = createTouchPoint({
      clientX: 220,
      clientY: 120
    })

    fireEvent.touchStart(imageWrapper, {
      touches: [touchPoint],
      changedTouches: [touchPoint],
      targetTouches: [touchPoint]
    })

    expect(galleryRegion).toHaveFocus()
    expect(previousArrow).toHaveClass('opacity-100', 'pointer-events-auto')
    expect(nextArrow).toHaveClass('opacity-100', 'pointer-events-auto')
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

    fireGallerySwipeGesture({
      element: getGalleryViewport(),
      startX: 220,
      startY: 120,
      endX: 120,
      endY: 122
    })

    expectActiveImage(1, 1)
    expect(screen.queryByRole('button', { name: 'View previous image' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View next image' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tablist', { name: 'Product image slides' })).not.toBeInTheDocument()
  })

  it('keeps the first image active and avoids extra fade layers when rerendering from single to multi image gallery', () => {
    const { rerender } = renderLayout(
      jest.fn(),
      '\u00A38.50',
      [
        {
          src: '/images/hamper-1.jpg',
          alt: 'Gift hamper image 1'
        }
      ]
    )

    rerender(
      <CatalogProductDetailLayout
        backHref='/cakes?sort=new&page=2'
        categoryLabel='Cakes by post'
        title='Christmas Gift Box & Card'
        priceText='\u00A38.50'
        priceSuffix='+ free shipping'
        keyPoints={[
          'Freshly baked and packed',
          'Personalised charity postcard',
          'Free UK shipping'
        ]}
        ctaLabel='Add to cart +'
        onCtaClick={jest.fn()}
        images={galleryImages}
        sections={sections}
      />
    )

    expectActiveImage(1, 2)
    expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 1')
    expect(screen.queryByTestId('product-gallery-entering-layer')).not.toBeInTheDocument()
    expect(screen.queryByTestId('product-gallery-leaving-layer')).not.toBeInTheDocument()
  })

  it('supports next arrow image navigation', () => {
    renderLayout()

    expectActiveImage(1, 2)
    fireEvent.click(screen.getByRole('button', { name: 'View next image' }))

    expectActiveImage(2, 2)
    expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 2')
  })

  it('counts rapid next clicks immediately and stops on the final image', () => {
    jest.useFakeTimers()

    try {
      renderLayout(jest.fn(), '\u00A38.50', burstNavigationGalleryImages)

      fireRapidNativeClicks(screen.getByRole('button', { name: 'View next image' }), 3)

      expectActiveImage(4, 7)
      expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 4')

      advanceGalleryFade()

      expectActiveImage(4, 7)
      expect(screen.queryByTestId('product-gallery-leaving-layer')).not.toBeInTheDocument()
    } finally {
      act(() => {
        jest.runOnlyPendingTimers()
      })
      jest.useRealTimers()
    }
  })

  it('counts rapid previous clicks from a middle image and stops on the final image', () => {
    jest.useFakeTimers()

    try {
      renderLayout(jest.fn(), '\u00A38.50', burstNavigationGalleryImages)
      fireEvent.click(screen.getByRole('tab', { name: 'View image 5' }))

      fireRapidNativeClicks(screen.getByRole('button', { name: 'View previous image' }), 3)

      expectActiveImage(2, 7)
      expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 2')

      advanceGalleryFade()

      expectActiveImage(2, 7)
      expect(screen.queryByTestId('product-gallery-leaving-layer')).not.toBeInTheDocument()
    } finally {
      act(() => {
        jest.runOnlyPendingTimers()
      })
      jest.useRealTimers()
    }
  })

  it('preserves mixed rapid directional click order', () => {
    jest.useFakeTimers()

    try {
      renderLayout(jest.fn(), '\u00A38.50', burstNavigationGalleryImages)
      fireEvent.click(screen.getByRole('tab', { name: 'View image 3' }))

      fireNativeClickSequence([
        screen.getByRole('button', { name: 'View next image' }),
        screen.getByRole('button', { name: 'View next image' }),
        screen.getByRole('button', { name: 'View previous image' })
      ])

      expectActiveImage(4, 7)
      expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 4')

      advanceGalleryFade()
      expectActiveImage(4, 7)
    } finally {
      act(() => {
        jest.runOnlyPendingTimers()
      })
      jest.useRealTimers()
    }
  })

  it('wraps rapid next clicks across the loop boundary', () => {
    jest.useFakeTimers()

    try {
      renderLayout(jest.fn(), '\u00A38.50', burstNavigationGalleryImages)
      fireEvent.click(screen.getByRole('tab', { name: 'View image 7' }))

      fireRapidNativeClicks(screen.getByRole('button', { name: 'View next image' }), 2)

      expectActiveImage(2, 7)
      expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 2')

      advanceGalleryFade()
      expectActiveImage(2, 7)
    } finally {
      act(() => {
        jest.runOnlyPendingTimers()
      })
      jest.useRealTimers()
    }
  })

  it('wraps rapid previous clicks across the loop boundary', () => {
    jest.useFakeTimers()

    try {
      renderLayout(jest.fn(), '\u00A38.50', burstNavigationGalleryImages)

      fireRapidNativeClicks(screen.getByRole('button', { name: 'View previous image' }), 2)

      expectActiveImage(6, 7)
      expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 6')
      expect(screen.getByTestId('product-gallery-entering-layer')).toBeInTheDocument()

      advanceGalleryFade()
      expectActiveImage(6, 7)
    } finally {
      act(() => {
        jest.runOnlyPendingTimers()
      })
      jest.useRealTimers()
    }
  })

  it('lets a gallery dot interrupt the current fade immediately', () => {
    jest.useFakeTimers()

    try {
      renderLayout(jest.fn(), '\u00A38.50', burstNavigationGalleryImages)

      fireEvent.click(screen.getByRole('button', { name: 'View next image' }))
      fireEvent.click(screen.getByRole('tab', { name: 'View image 7' }))

      expectActiveImage(7, 7)
      expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 7')
      expect(screen.getByTestId('product-gallery-entering-layer')).toBeInTheDocument()
      expect(getLeavingGalleryImage()).toHaveAttribute('src', '/images/hamper-2.jpg')

      advanceGalleryFade()
      expectActiveImage(7, 7)
    } finally {
      act(() => {
        jest.runOnlyPendingTimers()
      })
      jest.useRealTimers()
    }
  })

  it('lets requested image updates interrupt the current fade immediately', () => {
    jest.useFakeTimers()

    try {
      const { rerender } = renderLayout(jest.fn(), '\u00A38.50', burstNavigationGalleryImages)

      fireEvent.click(screen.getByRole('button', { name: 'View next image' }))

      rerender(
        <CatalogProductDetailLayout
          backHref='/cakes?sort=new&page=2'
          categoryLabel='Cakes by post'
          title='Christmas Gift Box & Card'
          priceText='\u00A38.50'
          priceSuffix='+ free shipping'
          keyPoints={[
            'Freshly baked and packed',
            'Personalised charity postcard',
            'Free UK shipping'
          ]}
          ctaLabel='Add to cart +'
          onCtaClick={jest.fn()}
          requestedActiveImageIndex={5}
          requestedActiveImageKey='fade-interrupt-1'
          images={burstNavigationGalleryImages}
          sections={sections}
        />
      )

      expectActiveImage(6, 7)
      expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 6')
      expect(screen.getByTestId('product-gallery-entering-layer')).toBeInTheDocument()

      advanceGalleryFade()
      expectActiveImage(6, 7)
    } finally {
      act(() => {
        jest.runOnlyPendingTimers()
      })
      jest.useRealTimers()
    }
  })

  it('cleans up entering and leaving layers after the crossfade completes', () => {
    jest.useFakeTimers()

    try {
      renderLayout()

      fireEvent.click(screen.getByRole('button', { name: 'View next image' }))

      expect(screen.getByTestId('product-gallery-entering-layer')).toBeInTheDocument()
      expect(screen.getByTestId('product-gallery-leaving-layer')).toBeInTheDocument()

      advanceGalleryFade()

      expect(screen.getByTestId('product-gallery-active-layer')).toBeInTheDocument()
      expect(screen.queryByTestId('product-gallery-entering-layer')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-gallery-leaving-layer')).not.toBeInTheDocument()
    } finally {
      act(() => {
        jest.runOnlyPendingTimers()
      })
      jest.useRealTimers()
    }
  })

  it('holds the current image in reduced motion mode until the target is decoded, then cuts with no fade layers', async () => {
    mockReducedMotionPreference(true)
    const imagePreloadMock = mockWindowImagePreload({
      autoLoad: false,
      supportsDecode: true
    })

    try {
      renderLayout(jest.fn(), '\u00A38.50', burstNavigationGalleryImages)

      fireEvent.click(screen.getByRole('button', { name: 'View next image' }))

      expectActiveImage(1, 7)
      expect(screen.getByTestId('product-gallery-active-layer')).toBeInTheDocument()
      expect(screen.queryByTestId('product-gallery-entering-layer')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-gallery-leaving-layer')).not.toBeInTheDocument()

      act(() => {
        imagePreloadMock.triggerLoad('/images/hamper-2.jpg')
      })

      expectActiveImage(1, 7)
      expect(screen.getByTestId('product-gallery-active-layer')).toBeInTheDocument()

      await act(async () => {
        await imagePreloadMock.triggerDecode('/images/hamper-2.jpg')
      })

      expectActiveImage(2, 7)
      expect(screen.getByTestId('product-gallery-active-layer')).toBeInTheDocument()
      expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 2')
      expect(screen.queryByTestId('product-gallery-entering-layer')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-gallery-leaving-layer')).not.toBeInTheDocument()
    } finally {
      imagePreloadMock.restore()
    }
  })

  it('starts a crossfade immediately when the requested image is already decoded and ready', async () => {
    const imagePreloadMock = mockWindowImagePreload({
      autoLoad: false,
      supportsDecode: true
    })

    try {
      renderLayout(jest.fn(), '\u00A38.50', burstNavigationGalleryImages)

      act(() => {
        imagePreloadMock.triggerLoad('/images/hamper-2.jpg')
      })
      await act(async () => {
        await imagePreloadMock.triggerDecode('/images/hamper-2.jpg')
      })

      fireEvent.click(screen.getByRole('button', { name: 'View next image' }))

      expectActiveImage(2, 7)
      expect(screen.queryByTestId('product-gallery-active-layer')).not.toBeInTheDocument()
      expect(screen.getByTestId('product-gallery-entering-layer')).toBeInTheDocument()
      expect(screen.getByTestId('product-gallery-leaving-layer')).toBeInTheDocument()
    } finally {
      imagePreloadMock.restore()
    }
  })

  it('keeps latest-request-wins semantics while a newer image is still waiting for decode', async () => {
    const imagePreloadMock = mockWindowImagePreload({
      autoLoad: false,
      supportsDecode: true
    })

    try {
      renderLayout(jest.fn(), '\u00A38.50', burstNavigationGalleryImages)

      fireEvent.click(screen.getByRole('button', { name: 'View next image' }))
      fireEvent.click(screen.getByRole('tab', { name: 'View image 6' }))

      act(() => {
        imagePreloadMock.triggerLoad('/images/hamper-2.jpg')
      })
      await act(async () => {
        await imagePreloadMock.triggerDecode('/images/hamper-2.jpg')
      })

      expectActiveImage(1, 7)
      expect(screen.getByTestId('product-gallery-active-layer')).toBeInTheDocument()
      expect(getActiveGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 1')
      expect(screen.queryByTestId('product-gallery-entering-layer')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-gallery-leaving-layer')).not.toBeInTheDocument()

      act(() => {
        imagePreloadMock.triggerLoad('/images/hamper-6.jpg')
      })
      await act(async () => {
        await imagePreloadMock.triggerDecode('/images/hamper-6.jpg')
      })

      expectActiveImage(6, 7)
      expect(getEnteringGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 6')
      expect(getLeavingGalleryImage()).toHaveAttribute('src', '/images/hamper-1.jpg')
    } finally {
      imagePreloadMock.restore()
    }
  })

  it('waits for decode before applying requested active image updates', async () => {
    const imagePreloadMock = mockWindowImagePreload({
      autoLoad: false,
      supportsDecode: true
    })
    const baseProps = {
      backHref: '/cakes?sort=new&page=2',
      categoryLabel: 'Cakes by post',
      title: 'Christmas Gift Box & Card',
      priceText: '\u00A38.50',
      priceSuffix: '+ free shipping',
      keyPoints: [
        'Freshly baked and packed',
        'Personalised charity postcard',
        'Free UK shipping'
      ],
      ctaLabel: 'Add to cart +',
      onCtaClick: jest.fn(),
      images: burstNavigationGalleryImages,
      sections
    }

    try {
      const { rerender } = render(
        <CatalogProductDetailLayout
          {...baseProps}
        />
      )

      rerender(
        <CatalogProductDetailLayout
          {...baseProps}
          requestedActiveImageIndex={5}
          requestedActiveImageKey='decode-gated-request-1'
        />
      )

      expectActiveImage(1, 7)
      expect(screen.getByTestId('product-gallery-active-layer')).toBeInTheDocument()
      expect(screen.queryByTestId('product-gallery-entering-layer')).not.toBeInTheDocument()
      expect(screen.queryByTestId('product-gallery-leaving-layer')).not.toBeInTheDocument()

      act(() => {
        imagePreloadMock.triggerLoad('/images/hamper-6.jpg')
      })
      await act(async () => {
        await imagePreloadMock.triggerDecode('/images/hamper-6.jpg')
      })

      expectActiveImage(6, 7)
      expect(getEnteringGalleryImage()).toHaveAttribute('alt', 'Gift hamper image 6')
      expect(getLeavingGalleryImage()).toHaveAttribute('src', '/images/hamper-1.jpg')
    } finally {
      imagePreloadMock.restore()
    }
  })

  it('does not update URL hash during gallery navigation', () => {
    renderLayout()

    window.location.hash = 'active-gallery'

    fireEvent.click(screen.getByRole('button', { name: 'View next image' }))
    fireEvent.click(screen.getByRole('tab', { name: 'View image 1' }))

    expect(window.location.hash).toBe('#active-gallery')
  })

  it('supports keyboard arrow image navigation when gallery is focused', () => {
    renderLayout()

    const galleryRegion = screen.getByRole('region', { name: 'Product gallery' })

    fireEvent.focus(galleryRegion)
    fireEvent.keyDown(galleryRegion, { key: 'ArrowRight' })
    expectActiveImage(2, 2)
    fireEvent.keyDown(galleryRegion, { key: 'ArrowLeft' })
    expectActiveImage(1, 2)
  })

  it('supports swipe left image navigation', () => {
    renderLayout()

    fireGallerySwipeGesture({
      element: getGalleryViewport(),
      startX: 220,
      startY: 120,
      endX: 120,
      endY: 126
    })

    expectActiveImage(2, 2)
  })

  it('supports swipe right image navigation and loops from first to last image', () => {
    renderLayout()

    fireGallerySwipeGesture({
      element: getGalleryViewport(),
      startX: 120,
      startY: 120,
      endX: 220,
      endY: 124
    })

    expectActiveImage(2, 2)
  })

  it('does not navigate images on short horizontal swipe', () => {
    renderLayout()

    fireGallerySwipeGesture({
      element: getGalleryViewport(),
      startX: 220,
      startY: 120,
      endX: 190,
      endY: 122
    })

    expectActiveImage(1, 2)
  })

  it('does not navigate on diagonal swipe with excessive vertical drift', () => {
    renderLayout()

    fireGallerySwipeGesture({
      element: getGalleryViewport(),
      startX: 220,
      startY: 120,
      endX: 140,
      endY: 160
    })

    expectActiveImage(1, 2)
  })

  it('navigates on horizontal swipe with minor vertical drift', () => {
    renderLayout()

    fireGallerySwipeGesture({
      element: getGalleryViewport(),
      startX: 220,
      startY: 120,
      endX: 130,
      endY: 130
    })

    expectActiveImage(2, 2)
  })

  it('does not navigate images on vertical-dominant swipe', () => {
    renderLayout()

    fireGallerySwipeGesture({
      element: getGalleryViewport(),
      startX: 220,
      startY: 120,
      endX: 160,
      endY: 220
    })

    expectActiveImage(1, 2)
  })

  it('does not navigate images after touch cancel', () => {
    renderLayout()

    const imageWrapper = getGalleryViewport()

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

    expectActiveImage(1, 2)
  })

  it('applies edge placement and focus-driven visibility styles to image arrows', () => {
    renderLayout()

    const previousArrow = screen.getByRole('button', { name: 'View previous image' })
    const nextArrow = screen.getByRole('button', { name: 'View next image' })

    expect(previousArrow).toHaveClass(
      'left-3',
      'top-1/2',
      '-translate-y-1/2',
      'bg-base-100/90',
      'shadow-md',
      'cursor-pointer',
      'opacity-0',
      'pointer-events-none',
      'tablet:opacity-80',
      'tablet:pointer-events-auto',
      'hover:opacity-100',
    )
    expect(nextArrow).toHaveClass(
      'right-3',
      'top-1/2',
      '-translate-y-1/2',
      'bg-base-100/90',
      'shadow-md',
      'cursor-pointer',
      'opacity-0',
      'pointer-events-none',
      'tablet:opacity-80',
      'tablet:pointer-events-auto',
      'hover:opacity-100',
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

  it('calls CTA intent handler on mouse enter', () => {
    const onCtaIntent = jest.fn()
    renderLayout(jest.fn(), '\u00A38.50', galleryImages, undefined, undefined, false, undefined, undefined, undefined, undefined, onCtaIntent)

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Add to cart +' }))

    expect(onCtaIntent).toHaveBeenCalledTimes(1)
  })

  it('calls CTA intent handler on focus', () => {
    const onCtaIntent = jest.fn()
    renderLayout(jest.fn(), '\u00A38.50', galleryImages, undefined, undefined, false, undefined, undefined, undefined, undefined, onCtaIntent)

    fireEvent.focus(screen.getByRole('button', { name: 'Add to cart +' }))

    expect(onCtaIntent).toHaveBeenCalledTimes(1)
  })

  it('calls CTA intent handler on touch start', () => {
    const onCtaIntent = jest.fn()
    renderLayout(jest.fn(), '\u00A38.50', galleryImages, undefined, undefined, false, undefined, undefined, undefined, undefined, onCtaIntent)

    fireEvent.touchStart(screen.getByRole('button', { name: 'Add to cart +' }))

    expect(onCtaIntent).toHaveBeenCalledTimes(1)
  })

  it('renders optional inline order content below CTA', () => {
    renderLayout(jest.fn(), '\u00A38.50', galleryImages, undefined, <div>Inline order content</div>)
    expect(screen.getByText('Inline order content')).toBeInTheDocument()
  })

  it('renders compact open-state header and inline order content in open order-form mode', () => {
    renderLayout(
      jest.fn(),
      '\u00A38.50',
      galleryImages,
      undefined,
      <div>Inline order content</div>,
      true
    )

    expect(screen.getByText('You selected:')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Christmas Gift Box & Card' })).toBeInTheDocument()
    expect(screen.getByText((_, element) => {
      return element?.tagName.toLowerCase() === 'span' && element.textContent === '\u00A38.50'
    })).toBeInTheDocument()
    expect(screen.getByText('Inline order content')).toBeInTheDocument()
    expect(screen.queryByText('Cakes by post')).not.toBeInTheDocument()
    expect(screen.queryByText('+ free shipping')).not.toBeInTheDocument()
    expect(screen.queryByText('Freshly baked and packed')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add to cart +' })).not.toBeInTheDocument()
    expect(screen.queryByText('Full description')).not.toBeInTheDocument()
  })

  it('uses in-page back callback in open order-form mode', () => {
    const onBackToProduct = jest.fn()
    const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation(() => undefined)

    renderLayout(
      jest.fn(),
      '\u00A38.50',
      galleryImages,
      'Back to product',
      <div>Inline order content</div>,
      true,
      onBackToProduct
    )

    fireEvent.click(screen.getByRole('link', { name: 'Back to product' }))

    expect(onBackToProduct).toHaveBeenCalledTimes(1)
    expect(historyBackSpy).not.toHaveBeenCalled()
    historyBackSpy.mockRestore()
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


