/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { CakesFilterSidebar } from '../CakesFilterSidebar'
import type { CakesCollectionOption, CakesFilterState } from '../types'

const defaultFilters: CakesFilterState = {
  showByPost: true,
  showCustom: false,
  maxPrice: 13,
  selectedCollectionIds: []
}

const collectionOptions: CakesCollectionOption[] = [
  {
    id: 'collection-1',
    queryValue: 'c-celebration',
    legacyQueryValues: ['collection-1'],
    label: 'Celebration',
    isFeatured: false,
    productType: 'cake'
  }
]
const longerCollectionOptions: CakesCollectionOption[] = [
  collectionOptions[0],
  {
    id: 'collection-2',
    queryValue: 'c-birthday',
    legacyQueryValues: ['collection-2'],
    label: 'Birthday',
    isFeatured: false,
    productType: 'cake'
  },
  {
    id: 'collection-3',
    queryValue: 'c-wedding',
    legacyQueryValues: ['collection-3'],
    label: 'Wedding',
    isFeatured: false,
    productType: 'cake'
  },
  {
    id: 'collection-4',
    queryValue: 'c-anniversary',
    legacyQueryValues: ['collection-4'],
    label: 'Anniversary',
    isFeatured: false,
    productType: 'cake'
  },
  {
    id: 'collection-5',
    queryValue: 'c-baby-shower',
    legacyQueryValues: ['collection-5'],
    label: 'Baby shower',
    isFeatured: false,
    productType: 'cake'
  }
]

function renderSidebar({
  filters = defaultFilters,
  isByPostLoading = false,
  isCustomLoading = false,
  collectionOptionsOverride = collectionOptions
}: {
  filters?: CakesFilterState
  isByPostLoading?: boolean
  isCustomLoading?: boolean
  collectionOptionsOverride?: CakesCollectionOption[]
} = {}) {
  const onToggleByPost = jest.fn()
  const onToggleCustom = jest.fn()
  const onPriceChange = jest.fn()
  const onToggleCollection = jest.fn()
  const onReset = jest.fn()

  render(
    <CakesFilterSidebar
      filters={filters}
      priceMax={80}
      collectionOptions={collectionOptionsOverride}
      isByPostLoading={isByPostLoading}
      isCustomLoading={isCustomLoading}
      onToggleByPost={onToggleByPost}
      onToggleCustom={onToggleCustom}
      onPriceChange={onPriceChange}
      onToggleCollection={onToggleCollection}
      onReset={onReset}
    />
  )

  return {
    onToggleByPost,
    onToggleCustom
  }
}

describe('CakesFilterSidebar', () => {
  it('uses semantic border token on the sidebar container', () => {
    renderSidebar()

    const sidebar = screen.getByLabelText('Catalog filters')

    expect(sidebar).toHaveClass('border-base-300')
    expect(sidebar.className).not.toContain('border-[#D9D9D9]')
    expect(screen.getByText('Filter by')).toBeInTheDocument()
  })

  it('renders fixed-size control slots with checkboxes when not loading', () => {
    renderSidebar()

    const byPostControlSlot = screen.getByTestId('by-post-control-slot')
    const customControlSlot = screen.getByTestId('custom-control-slot')

    expect(byPostControlSlot).toHaveClass('h-4', 'w-4', 'items-center')
    expect(customControlSlot).toHaveClass('h-4', 'w-4', 'items-center')
    expect(screen.getByRole('checkbox', { name: /Cakes by post/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Custom cakes/i })).toBeInTheDocument()
    expect(screen.queryByTestId('by-post-loader-spinner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('custom-loader-spinner')).not.toBeInTheDocument()
  })

  it('replaces custom checkbox with checkbox-sized spinner when custom loading is active', () => {
    renderSidebar({ isCustomLoading: true })

    const customSpinner = screen.getByTestId('custom-loader-spinner')

    expect(customSpinner).toHaveClass('loading', 'loading-spinner', 'h-4', 'w-4')
    expect(screen.queryByTestId('by-post-loader-spinner')).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /Custom cakes/i })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Cakes by post/i })).toBeInTheDocument()
    expect(screen.getByText('Loading custom cakes')).toHaveClass('sr-only')
  })

  it('replaces by-post checkbox with checkbox-sized spinner when by-post loading is active', () => {
    renderSidebar({ isByPostLoading: true })

    const byPostSpinner = screen.getByTestId('by-post-loader-spinner')

    expect(byPostSpinner).toHaveClass('loading', 'loading-spinner', 'h-4', 'w-4')
    expect(screen.queryByTestId('custom-loader-spinner')).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /Cakes by post/i })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Custom cakes/i })).toBeInTheDocument()
    expect(screen.getByText('Loading cakes by post')).toHaveClass('sr-only')
  })

  it('shows both spinners and hides both category checkboxes when both loading flags are active', () => {
    renderSidebar({
      isByPostLoading: true,
      isCustomLoading: true
    })

    expect(screen.getByTestId('by-post-loader-spinner')).toBeInTheDocument()
    expect(screen.getByTestId('custom-loader-spinner')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /Cakes by post/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /Custom cakes/i })).not.toBeInTheDocument()
  })

  it('keeps remaining visible category checkbox interactive while the other one is loading', () => {
    const { onToggleByPost, onToggleCustom } = renderSidebar({
      isByPostLoading: true,
      isCustomLoading: false
    })

    fireEvent.click(screen.getByRole('checkbox', { name: /Custom cakes/i }))

    expect(onToggleByPost).not.toHaveBeenCalled()
    expect(onToggleCustom).toHaveBeenCalledWith(true)
  })

  it('triggers handlers from checkboxes when no loading is active', () => {
    const { onToggleByPost, onToggleCustom } = renderSidebar()

    fireEvent.click(screen.getByRole('checkbox', { name: /Cakes by post/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Custom cakes/i }))

    expect(onToggleByPost).toHaveBeenCalledWith(false)
    expect(onToggleCustom).toHaveBeenCalledWith(true)
  })

  it('keeps a selected collection visible when the collection list is collapsed', () => {
    renderSidebar({
      collectionOptionsOverride: longerCollectionOptions,
      filters: {
        ...defaultFilters,
        showByPost: false,
        showCustom: true,
        selectedCollectionIds: ['collection-5']
      }
    })

    expect(screen.getByRole('checkbox', { name: 'Baby shower' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'See more' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Anniversary' })).not.toBeInTheDocument()
  })
})
