import { buildOccasionOptionsFromCollections, OCCASION_OPTIONS } from '../formOptions'
import type { HomepageCollection } from '@/app/types/collection'

describe('buildOccasionOptionsFromCollections', () => {
  it('normalizes names, deduplicates case-insensitively, and keeps first-seen labels', () => {
    const collections: HomepageCollection[] = [
      { _id: 'collection-1', name: '  Wedding Cakes  ', isFeatured: true },
      { _id: 'collection-2', name: 'wedding cakes', isFeatured: false },
      { _id: 'collection-3', name: ' Baby   Shower ', isFeatured: false },
      { _id: 'collection-4', name: '' },
      { _id: 'collection-5', name: '   ' },
      { _id: 'collection-6', name: 'Other' }
    ]

    expect(buildOccasionOptionsFromCollections(collections)).toEqual([
      { label: 'Select from list', value: '', disabled: true },
      { label: 'Wedding Cakes', value: 'Wedding Cakes' },
      { label: 'Baby Shower', value: 'Baby Shower' },
      { label: 'Other', value: 'Other' }
    ])
  })

  it('adds Other option when collections do not include it', () => {
    const collections: HomepageCollection[] = [
      { _id: 'collection-1', name: 'Wedding Cakes' }
    ]

    expect(buildOccasionOptionsFromCollections(collections)).toEqual([
      { label: 'Select from list', value: '', disabled: true },
      { label: 'Wedding Cakes', value: 'Wedding Cakes' },
      { label: 'Other', value: 'other' }
    ])
  })

  it('falls back to legacy options when collections resolve to no valid names', () => {
    const collections: HomepageCollection[] = [
      { _id: 'collection-1', name: '   ' },
      { _id: 'collection-2', name: '' }
    ]

    expect(buildOccasionOptionsFromCollections(collections)).toEqual(OCCASION_OPTIONS)
  })
})
