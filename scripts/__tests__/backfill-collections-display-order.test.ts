import { describe, expect, it } from '@jest/globals'
import {
  shouldSeedCakeCollectionsOrder,
  sortCollectionsForBackfill,
  toCakeCollectionsOrderReferences
} from '../backfill-collections-display-order'

describe('backfillCollectionsDisplayOrder helpers', () => {
  describe('sortCollectionsForBackfill', () => {
    it('sorts by homepageOrder ascending and then by name', () => {
      const result = sortCollectionsForBackfill([
        { _id: 'collection-3', name: 'Beta', homepageOrder: 2 },
        { _id: 'collection-1', name: 'Zulu', homepageOrder: 1 },
        { _id: 'collection-2', name: 'Alpha', homepageOrder: 1 }
      ])

      expect(result.map((collection) => collection._id)).toEqual([
        'collection-2',
        'collection-1',
        'collection-3'
      ])
    })

    it('places collections without homepageOrder after ordered collections', () => {
      const result = sortCollectionsForBackfill([
        { _id: 'collection-2', name: 'Alpha' },
        { _id: 'collection-3', name: 'Beta', homepageOrder: 2 },
        { _id: 'collection-1', name: 'Zulu', homepageOrder: 1 }
      ])

      expect(result.map((collection) => collection._id)).toEqual([
        'collection-1',
        'collection-3',
        'collection-2'
      ])
    })
  })

  describe('shouldSeedCakeCollectionsOrder', () => {
    it('returns true when the singleton document is missing', () => {
      expect(shouldSeedCakeCollectionsOrder(null)).toBe(true)
    })

    it('returns true when cakeCollectionsOrder is empty', () => {
      expect(shouldSeedCakeCollectionsOrder({ cakeCollectionsOrder: [] })).toBe(true)
    })

    it('returns false when cakeCollectionsOrder already exists', () => {
      expect(shouldSeedCakeCollectionsOrder({
        cakeCollectionsOrder: [{ _ref: 'collection-1' }]
      })).toBe(false)
    })
  })

  describe('toCakeCollectionsOrderReferences', () => {
    it('returns normalized references in backfill order', () => {
      const result = toCakeCollectionsOrderReferences([
        { _id: 'collection-2', name: 'Beta', homepageOrder: 2 },
        { _id: 'drafts.collection-1', name: 'Alpha', homepageOrder: 1 }
      ])

      expect(result).toEqual([
        { _type: 'reference', _ref: 'collection-1' },
        { _type: 'reference', _ref: 'collection-2' }
      ])
    })

    it('deduplicates repeated collection ids after draft normalization', () => {
      const result = toCakeCollectionsOrderReferences([
        { _id: 'collection-1', name: 'Alpha', homepageOrder: 1 },
        { _id: 'drafts.collection-1', name: 'Alpha Draft', homepageOrder: 2 }
      ])

      expect(result).toEqual([
        { _type: 'reference', _ref: 'collection-1' }
      ])
    })
  })
})
