/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CakesMobileFilterSortSheet } from '../CakesMobileFilterSortSheet'
import type { CakesCollectionOption } from '../types'

const featuredOption: CakesCollectionOption = {
  id: 'collection-featured',
  queryValue: 'c-featured',
  legacyQueryValues: [],
  label: 'Free honey cake offer',
  isFeatured: true,
  productType: 'cake'
}

const collectionOptions: CakesCollectionOption[] = [
  {
    id: 'collection-birthday',
    queryValue: 'c-birthday',
    legacyQueryValues: [],
    label: 'Birthday cakes',
    isFeatured: false,
    productType: 'cake'
  },
  {
    id: 'collection-wedding',
    queryValue: 'c-wedding',
    legacyQueryValues: [],
    label: 'Wedding cakes',
    isFeatured: false,
    productType: 'cake'
  },
  {
    id: 'collection-kids',
    queryValue: 'c-kids',
    legacyQueryValues: [],
    label: 'Kids cakes',
    isFeatured: false,
    productType: 'cake'
  },
  {
    id: 'collection-seasonal',
    queryValue: 'c-seasonal',
    legacyQueryValues: [],
    label: 'Seasonal cakes',
    isFeatured: false,
    productType: 'cake'
  }
]

function renderSheet({
  open = true,
  selectedCollectionIds = [],
  featuredCollectionOptions = [featuredOption],
  availableCollectionOptions = collectionOptions
}: {
  open?: boolean
  selectedCollectionIds?: string[]
  featuredCollectionOptions?: CakesCollectionOption[]
  availableCollectionOptions?: CakesCollectionOption[]
} = {}) {
  const onSortChange = jest.fn()
  const onToggleCollection = jest.fn()
  const onApply = jest.fn()
  const onCancel = jest.fn()

  const result = render(
    <CakesMobileFilterSortSheet
      open={open}
      selectedSort='new'
      featuredCollectionOptions={featuredCollectionOptions}
      collectionOptions={availableCollectionOptions}
      selectedCollectionIds={selectedCollectionIds}
      onSortChange={onSortChange}
      onToggleCollection={onToggleCollection}
      onApply={onApply}
      onCancel={onCancel}
    />
  )

  return {
    ...result,
    onSortChange,
    onToggleCollection,
    onApply,
    onCancel
  }
}

function createDomRect({
  top,
  bottom,
  left = 0,
  right = 0,
  width = 0
}: {
  top: number
  bottom: number
  left?: number
  right?: number
  width?: number
}): DOMRect {
  return {
    x: left,
    y: top,
    top,
    bottom,
    left,
    right,
    width,
    height: bottom - top,
    toJSON: () => ({})
  } as DOMRect
}

function setupCollectionsScrollEnvironment({
  containerTop,
  containerBottom,
  containerHeight,
  initialScrollTop,
  scrollHeight,
  initialSectionTop,
  initialSectionBottom
}: {
  containerTop: number
  containerBottom: number
  containerHeight: number
  initialScrollTop: number
  scrollHeight: number
  initialSectionTop: number
  initialSectionBottom: number
}) {
  const dialogElement = screen.getByTestId('mobile-filter-sort-sheet')
  const modalBoxElement = dialogElement.querySelector('.modal-box')
  const collectionsDetailsElement = screen.getByText('Collections').closest('details')

  if (modalBoxElement === null || collectionsDetailsElement === null) {
    throw new Error('Expected modal box and collections details elements to exist')
  }

  const modalBox = modalBoxElement as HTMLDivElement
  const collectionsDetails = collectionsDetailsElement as HTMLDetailsElement
  let currentSectionRect = createDomRect({
    top: initialSectionTop,
    bottom: initialSectionBottom
  })

  Object.defineProperty(modalBox, 'clientHeight', {
    configurable: true,
    value: containerHeight
  })
  Object.defineProperty(modalBox, 'scrollHeight', {
    configurable: true,
    value: scrollHeight
  })
  Object.defineProperty(modalBox, 'scrollTop', {
    configurable: true,
    writable: true,
    value: initialScrollTop
  })

  const scrollToMock = jest.fn((options: ScrollToOptions) => {
    if (typeof options.top === 'number') {
      modalBox.scrollTop = options.top
    }
  })

  Object.defineProperty(modalBox, 'scrollTo', {
    configurable: true,
    value: scrollToMock
  })
  Object.defineProperty(modalBox, 'getBoundingClientRect', {
    configurable: true,
    value: jest.fn(() => createDomRect({
      top: containerTop,
      bottom: containerBottom
    }))
  })
  Object.defineProperty(collectionsDetails, 'getBoundingClientRect', {
    configurable: true,
    value: jest.fn(() => currentSectionRect)
  })

  return {
    collectionsDetails,
    scrollToMock,
    setSectionRect: ({ top, bottom }: { top: number, bottom: number }) => {
      currentSectionRect = createDomRect({
        top,
        bottom
      })
    }
  }
}

function useImmediateRequestAnimationFrame() {
  const originalRequestAnimationFrame = window.requestAnimationFrame
  const requestAnimationFrameMock = jest.fn((callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })

  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    writable: true,
    value: requestAnimationFrameMock
  })

  return {
    requestAnimationFrameMock,
    restore: () => {
      Object.defineProperty(window, 'requestAnimationFrame', {
        configurable: true,
        writable: true,
        value: originalRequestAnimationFrame
      })
    }
  }
}

function mockMatchMedia(matches: boolean) {
  const matchMediaMock = jest.fn((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))

  if (typeof window.matchMedia === 'function') {
    const matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(matchMediaMock)

    return {
      matchMediaMock,
      restore: () => {
        matchMediaSpy.mockRestore()
      }
    }
  }

  const originalMatchMedia = window.matchMedia
  ;(window as Window & { matchMedia?: typeof window.matchMedia }).matchMedia = matchMediaMock

  return {
    matchMediaMock,
    restore: () => {
      ;(window as Window & { matchMedia?: typeof window.matchMedia }).matchMedia = originalMatchMedia
    }
  }
}

describe('CakesMobileFilterSortSheet', () => {
  beforeAll(() => {
    if (typeof HTMLDialogElement === 'undefined') {
      return
    }

    if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
      HTMLDialogElement.prototype.showModal = function showModal() {
        this.open = true
      }
    }

    if (typeof HTMLDialogElement.prototype.close !== 'function') {
      HTMLDialogElement.prototype.close = function close() {
        this.open = false
      }
    }
  })

  it('renders mobile sheet sections and action buttons when open', async () => {
    renderSheet({
      selectedCollectionIds: [featuredOption.id]
    })

    await waitFor(() => {
      expect(screen.getByTestId('mobile-filter-sort-sheet')).toHaveAttribute('open')
    })

    const sortByHeading = screen.getByRole('heading', { name: 'Sort by' })

    expect(sortByHeading).toBeInTheDocument()
    expect(sortByHeading).toHaveClass(
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-weight:var(--t-font-weight-bold)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-lg)]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-(--d-color-base-content)'
    )
    const activeSortOptionInput = screen.getByRole('radio', { name: 'Latest/Newest' })
    const inactiveSortOptionInput = screen.getByRole('radio', { name: 'Price: High to low' })
    const activeSortOptionRow = activeSortOptionInput.closest('label')
    const inactiveSortOptionRow = inactiveSortOptionInput.closest('label')

    if (activeSortOptionRow === null || inactiveSortOptionRow === null) {
      throw new Error('Expected sort option rows to render as labels')
    }

    expect(activeSortOptionRow).toHaveClass(
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-base)]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-(--d-color-base-content)',
      'pl-2',
      '[font-weight:var(--t-font-weight-semibold)]'
    )
    expect(inactiveSortOptionRow).toHaveClass(
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-base)]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-(--d-color-base-content)',
      'pl-2',
      '[font-weight:var(--t-font-weight-normal)]'
    )
    const filterByHeading = screen.getByRole('heading', { name: 'Filter by' })

    expect(filterByHeading).toBeInTheDocument()
    expect(filterByHeading).toHaveClass(
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-weight:var(--t-font-weight-bold)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-lg)]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-(--d-color-base-content)'
    )
    const featuredHeading = screen.getByText('Featured')
    const collectionsHeading = screen.getByText('Collections')
    const featuredSummary = featuredHeading.closest('summary')
    const collectionsSummary = collectionsHeading.closest('summary')
    const featuredDetails = featuredHeading.closest('details')
    const collectionsDetails = collectionsHeading.closest('details')

    if (
      featuredSummary === null ||
      collectionsSummary === null ||
      featuredDetails === null ||
      collectionsDetails === null
    ) {
      throw new Error('Expected collapse headings to be inside details and summary elements')
    }

    expect(featuredSummary).toHaveClass(
      'collapse-title',
      'relative',
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-weight:var(--t-font-weight-semibold)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-xl)]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-(--d-color-base-content)'
    )
    expect(collectionsSummary).toHaveClass(
      'collapse-title',
      'relative',
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-weight:var(--t-font-weight-semibold)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-xl)]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-(--d-color-base-content)'
    )
    const featuredIndicator = featuredSummary.querySelector('span[aria-hidden="true"]')
    const collectionsIndicator = collectionsSummary.querySelector('span[aria-hidden="true"]')

    if (featuredIndicator === null || collectionsIndicator === null) {
      throw new Error('Expected collapse indicators to render')
    }

    expect(featuredIndicator).toHaveClass(
      'absolute',
      'top-1/2',
      '-translate-y-1/2',
      'text-(--color-primary-400)'
    )
    expect(collectionsIndicator).toHaveClass(
      'absolute',
      'top-1/2',
      '-translate-y-1/2',
      'text-(--color-primary-400)'
    )
    expect(featuredSummary).toHaveTextContent('\u2212')
    expect(collectionsSummary).toHaveTextContent('+')
    expect(featuredDetails).toHaveClass(
      'collapse',
      'collapse-plus',
      'mobile-filter-collapse-icon'
    )
    expect(collectionsDetails).toHaveClass(
      'collapse',
      'collapse-plus',
      'mobile-filter-collapse-icon'
    )
    expect(featuredDetails).toHaveAttribute('open')
    expect(collectionsDetails).not.toHaveAttribute('open')

    collectionsDetails.open = true
    fireEvent(collectionsDetails, new Event('toggle'))
    expect(collectionsDetails).toHaveAttribute('open')
    expect(featuredDetails).not.toHaveAttribute('open')
    expect(collectionsSummary).toHaveTextContent('\u2212')

    featuredDetails.open = true
    fireEvent(featuredDetails, new Event('toggle'))
    expect(featuredDetails).toHaveAttribute('open')
    expect(collectionsDetails).not.toHaveAttribute('open')
    expect(featuredSummary).toHaveTextContent('\u2212')

    featuredDetails.open = false
    fireEvent(featuredDetails, new Event('toggle'))
    expect(featuredDetails).not.toHaveAttribute('open')
    expect(featuredSummary).toHaveTextContent('+')
    expect(collectionsDetails).not.toHaveAttribute('open')
    const checkedFeaturedCheckbox = screen.getByRole('checkbox', { name: 'Free honey cake offer' })
    const uncheckedCollectionCheckbox = screen.getByRole('checkbox', { name: 'Birthday cakes' })
    const checkedFeaturedRow = checkedFeaturedCheckbox.closest('label')
    const uncheckedCollectionRow = uncheckedCollectionCheckbox.closest('label')

    if (checkedFeaturedRow === null || uncheckedCollectionRow === null) {
      throw new Error('Expected collection option rows to render as labels')
    }

    expect(checkedFeaturedRow).toHaveClass(
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-base)]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-(--d-color-base-content)',
      '[font-weight:var(--t-font-weight-semibold)]'
    )
    expect(checkedFeaturedRow).not.toHaveClass('pl-2')
    expect(uncheckedCollectionRow).toHaveClass(
      '[font-family:var(--t-font-family-theme-primary)]',
      '[font-style:normal]',
      '[font-size:var(--t-font-size-base)]',
      '[leading-trim:none]',
      '[line-height:var(--t-font-lineHeight-leading-7)]',
      '[letter-spacing:0]',
      'align-middle',
      'text-(--d-color-base-content)',
      '[font-weight:var(--t-font-weight-normal)]'
    )
    expect(uncheckedCollectionRow).not.toHaveClass('pl-2')
    expect(screen.queryByLabelText('Mobile price range')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('opens collections by default when featured options are absent', async () => {
    renderSheet({
      featuredCollectionOptions: []
    })

    await waitFor(() => {
      expect(screen.getByTestId('mobile-filter-sort-sheet')).toHaveAttribute('open')
    })

    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
    const collectionsDetails = screen.getByText('Collections').closest('details')

    if (collectionsDetails === null) {
      throw new Error('Expected collections details to render')
    }

    expect(collectionsDetails).toHaveAttribute('open')
  })

  it('triggers sort, collection and apply handlers', async () => {
    const { onSortChange, onToggleCollection, onApply } = renderSheet()

    fireEvent.click(screen.getByRole('radio', { name: 'Price: High to low' }))
    fireEvent.click(screen.getByText('Collections'))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Birthday cakes' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onSortChange).toHaveBeenCalledWith('priceHighToLow')
    expect(onToggleCollection).toHaveBeenCalledWith('collection-birthday', true)
    expect(onApply).toHaveBeenCalledTimes(1)
  })

  it('uses cancel handler for cancel button, backdrop and ESC', async () => {
    const { onCancel } = renderSheet()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close filter and sort panel' }))
    fireEvent(screen.getByTestId('mobile-filter-sort-sheet'), new Event('cancel', { cancelable: true }))

    expect(onCancel).toHaveBeenCalledTimes(3)
  })

  it('shows see more for longer collection lists', () => {
    renderSheet()

    fireEvent.click(screen.getByText('Collections'))
    expect(screen.getByRole('button', { name: 'See more' })).toBeInTheDocument()
  })

  it('closes dialog element when open prop becomes false', async () => {
    const { rerender } = renderSheet({ open: true })

    await waitFor(() => {
      expect(screen.getByTestId('mobile-filter-sort-sheet')).toHaveAttribute('open')
    })

    rerender(
      <CakesMobileFilterSortSheet
        open={false}
        selectedSort='new'
        featuredCollectionOptions={[featuredOption]}
        collectionOptions={collectionOptions}
        selectedCollectionIds={[]}
        onSortChange={() => {}}
        onToggleCollection={() => {}}
        onApply={() => {}}
        onCancel={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('mobile-filter-sort-sheet')).not.toHaveAttribute('open')
    })
  })

  it('scrolls collections into view when the collections section is expanded', async () => {
    const { restore } = useImmediateRequestAnimationFrame()

    try {
      renderSheet()

      await waitFor(() => {
        expect(screen.getByTestId('mobile-filter-sort-sheet')).toHaveAttribute('open')
      })

      const {
        collectionsDetails,
        scrollToMock
      } = setupCollectionsScrollEnvironment({
        containerTop: 0,
        containerBottom: 200,
        containerHeight: 200,
        initialScrollTop: 100,
        scrollHeight: 1200,
        initialSectionTop: 180,
        initialSectionBottom: 380
      })

      collectionsDetails.open = true
      fireEvent(collectionsDetails, new Event('toggle'))

      expect(scrollToMock).toHaveBeenCalledTimes(1)
      expect(scrollToMock).toHaveBeenCalledWith(expect.objectContaining({
        behavior: 'smooth'
      }))
    } finally {
      restore()
    }
  })

  it('does not scroll collections when the section is already fully visible', async () => {
    const { restore } = useImmediateRequestAnimationFrame()

    try {
      renderSheet()

      await waitFor(() => {
        expect(screen.getByTestId('mobile-filter-sort-sheet')).toHaveAttribute('open')
      })

      const {
        collectionsDetails,
        scrollToMock
      } = setupCollectionsScrollEnvironment({
        containerTop: 0,
        containerBottom: 200,
        containerHeight: 200,
        initialScrollTop: 100,
        scrollHeight: 1200,
        initialSectionTop: 20,
        initialSectionBottom: 180
      })

      collectionsDetails.open = true
      fireEvent(collectionsDetails, new Event('toggle'))

      expect(scrollToMock).not.toHaveBeenCalled()
    } finally {
      restore()
    }
  })

  it('scrolls again after clicking see more in collections', async () => {
    const { restore } = useImmediateRequestAnimationFrame()

    try {
      renderSheet()

      await waitFor(() => {
        expect(screen.getByTestId('mobile-filter-sort-sheet')).toHaveAttribute('open')
      })

      const {
        collectionsDetails,
        scrollToMock,
        setSectionRect
      } = setupCollectionsScrollEnvironment({
        containerTop: 0,
        containerBottom: 200,
        containerHeight: 200,
        initialScrollTop: 100,
        scrollHeight: 1200,
        initialSectionTop: 180,
        initialSectionBottom: 380
      })

      collectionsDetails.open = true
      fireEvent(collectionsDetails, new Event('toggle'))
      scrollToMock.mockClear()

      setSectionRect({
        top: 180,
        bottom: 460
      })
      fireEvent.click(screen.getByRole('button', { name: 'See more' }))

      expect(scrollToMock).toHaveBeenCalledTimes(1)
    } finally {
      restore()
    }
  })

  it('does not auto-scroll when clicking see less', async () => {
    const { restore } = useImmediateRequestAnimationFrame()

    try {
      renderSheet()

      await waitFor(() => {
        expect(screen.getByTestId('mobile-filter-sort-sheet')).toHaveAttribute('open')
      })

      const {
        collectionsDetails,
        scrollToMock
      } = setupCollectionsScrollEnvironment({
        containerTop: 0,
        containerBottom: 200,
        containerHeight: 200,
        initialScrollTop: 100,
        scrollHeight: 1200,
        initialSectionTop: 180,
        initialSectionBottom: 420
      })

      collectionsDetails.open = true
      fireEvent(collectionsDetails, new Event('toggle'))
      scrollToMock.mockClear()

      fireEvent.click(screen.getByRole('button', { name: 'See more' }))
      scrollToMock.mockClear()
      fireEvent.click(screen.getByRole('button', { name: 'See less' }))

      expect(scrollToMock).not.toHaveBeenCalled()
    } finally {
      restore()
    }
  })

  it('uses instant scrolling when reduced motion is preferred', async () => {
    const requestAnimationFrameControl = useImmediateRequestAnimationFrame()
    const matchMediaControl = mockMatchMedia(true)

    try {
      renderSheet()

      await waitFor(() => {
        expect(screen.getByTestId('mobile-filter-sort-sheet')).toHaveAttribute('open')
      })

      const {
        collectionsDetails,
        scrollToMock
      } = setupCollectionsScrollEnvironment({
        containerTop: 0,
        containerBottom: 200,
        containerHeight: 200,
        initialScrollTop: 100,
        scrollHeight: 1200,
        initialSectionTop: 180,
        initialSectionBottom: 380
      })

      collectionsDetails.open = true
      fireEvent(collectionsDetails, new Event('toggle'))

      expect(scrollToMock).toHaveBeenCalledWith(expect.objectContaining({
        behavior: 'auto'
      }))
      expect(matchMediaControl.matchMediaMock).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    } finally {
      matchMediaControl.restore()
      requestAnimationFrameControl.restore()
    }
  })
})
