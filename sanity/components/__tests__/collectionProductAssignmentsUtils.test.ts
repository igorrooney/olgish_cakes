import {
  applyCollectionSelectionToVariants,
  createMirrorValue,
  createReferenceKey,
  createReferenceValue,
  isSameStringArray,
  mergeVariantCollectionIds,
  normalizeDocumentId,
  normalizeProductDocuments,
  toNormalizedCollectionIds,
  toNormalizedReferenceIds,
  toOrderedSelectedIds,
  type ProductDocumentRecord,
  type ProductReferenceValue,
  type RawProductDocument
} from '../collectionProductAssignmentsUtils'

describe('collectionProductAssignmentsUtils', () => {
  describe('normalizeDocumentId', () => {
    it('returns base id for draft documents', () => {
      expect(normalizeDocumentId('drafts.cake-1')).toBe('cake-1')
    })

    it('keeps published id unchanged', () => {
      expect(normalizeDocumentId('cake-1')).toBe('cake-1')
    })
  })

  describe('createReferenceKey', () => {
    it('uses crypto randomUUID when available', () => {
      const cryptoGetterSpy = jest.spyOn(globalThis, 'crypto', 'get').mockReturnValue({
        randomUUID: () => 'uuid-fixed-value'
      } as unknown as Crypto)

      expect(createReferenceKey()).toBe('uuid-fixed-value')

      cryptoGetterSpy.mockRestore()
    })
  })

  describe('createReferenceValue', () => {
    it('creates a Sanity reference object', () => {
      const reference = createReferenceValue('collection-1')

      expect(reference._type).toBe('reference')
      expect(reference._ref).toBe('collection-1')
      expect(typeof reference._key).toBe('string')
      expect(reference._key.length).toBeGreaterThan(0)
    })
  })

  describe('isSameStringArray', () => {
    it('returns true for equal arrays in the same order', () => {
      expect(isSameStringArray(['a', 'b'], ['a', 'b'])).toBe(true)
    })

    it('returns false for same values in different order', () => {
      expect(isSameStringArray(['a', 'b'], ['b', 'a'])).toBe(false)
    })
  })

  describe('toNormalizedReferenceIds', () => {
    it('normalizes draft refs and removes duplicates', () => {
      const value: ProductReferenceValue[] = [
        {
          _key: 'a',
          _type: 'reference',
          _ref: 'drafts.cake-1'
        },
        {
          _key: 'b',
          _type: 'reference',
          _ref: 'cake-1'
        },
        {
          _key: 'c',
          _type: 'reference',
          _ref: 'cake-2'
        }
      ]

      expect(toNormalizedReferenceIds(value)).toEqual(['cake-1', 'cake-2'])
    })

    it('ignores references with invalid ref values', () => {
      const invalidValue = [
        {
          _key: 'a',
          _type: 'reference',
          _ref: ''
        },
        {
          _key: 'b',
          _type: 'reference'
        }
      ] as unknown as ProductReferenceValue[]

      expect(toNormalizedReferenceIds(invalidValue)).toEqual([])
    })
  })

  describe('toNormalizedCollectionIds', () => {
    it('normalizes and de-duplicates collection refs', () => {
      const references: RawProductDocument['collections'] = [
        { _ref: 'drafts.collection-a' },
        { _ref: 'collection-a' },
        { _ref: 'collection-b' }
      ]

      expect(toNormalizedCollectionIds(references)).toEqual(['collection-a', 'collection-b'])
    })

    it('filters out invalid collection refs', () => {
      const invalidReferences = [
        { _ref: '' },
        {}
      ] as unknown as RawProductDocument['collections']

      expect(toNormalizedCollectionIds(invalidReferences)).toEqual([])
    })
  })

  describe('mergeVariantCollectionIds', () => {
    it('merges variant-specific refs into one de-duplicated list', () => {
      expect(mergeVariantCollectionIds(
        ['drafts.cake-1', 'cake-1'],
        {
          'drafts.cake-1': ['collection-a', 'collection-current'],
          'cake-1': ['collection-b', 'collection-current']
        }
      )).toEqual(['collection-a', 'collection-current', 'collection-b'])
    })
  })

  describe('applyCollectionSelectionToVariants', () => {
    it('adds selected collection per variant without removing other refs', () => {
      const result = applyCollectionSelectionToVariants(
        ['drafts.cake-1', 'cake-1'],
        {
          'drafts.cake-1': ['collection-a'],
          'cake-1': ['collection-b', 'collection-current']
        },
        'collection-current',
        true
      )

      expect(result).toEqual({
        variantCollectionIdsByDocumentId: {
          'drafts.cake-1': ['collection-a', 'collection-current'],
          'cake-1': ['collection-b', 'collection-current']
        },
        collectionIds: ['collection-a', 'collection-current', 'collection-b']
      })
    })

    it('removes current collection per variant and preserves other refs', () => {
      const result = applyCollectionSelectionToVariants(
        ['drafts.cake-1', 'cake-1'],
        {
          'drafts.cake-1': ['collection-a', 'collection-current'],
          'cake-1': ['collection-b', 'collection-current']
        },
        'collection-current',
        false
      )

      expect(result).toEqual({
        variantCollectionIdsByDocumentId: {
          'drafts.cake-1': ['collection-a'],
          'cake-1': ['collection-b']
        },
        collectionIds: ['collection-a', 'collection-b']
      })
    })
  })

  describe('normalizeProductDocuments', () => {
    it('merges draft/published variants by base id and combines collection ids', () => {
      const rawDocuments: RawProductDocument[] = [
        {
          _id: 'drafts.cake-2',
          _rev: 'rev-draft-cake-2',
          name: '  Zebra  ',
          collections: [{ _ref: 'drafts.collection-z' }, { _ref: 'collection-a' }]
        },
        {
          _id: 'cake-2',
          _rev: 'rev-published-cake-2',
          name: 'Zebra',
          collections: [{ _ref: 'collection-b' }]
        },
        {
          _id: 'cake-1',
          _rev: 'rev-published-cake-1',
          name: ' Apple ',
          collections: [{ _ref: 'collection-a' }]
        }
      ]

      const result = normalizeProductDocuments(rawDocuments)

      expect(result).toHaveLength(2)
      expect(result.map((item) => item.baseId)).toEqual(['cake-1', 'cake-2'])

      const mergedZebra = result.find((item) => item.baseId === 'cake-2')
      expect(mergedZebra).toEqual({
        baseId: 'cake-2',
        name: 'Zebra',
        variantDocumentIds: ['drafts.cake-2', 'cake-2'],
        variantRevisionByDocumentId: {
          'drafts.cake-2': 'rev-draft-cake-2',
          'cake-2': 'rev-published-cake-2'
        },
        variantCollectionIdsByDocumentId: {
          'drafts.cake-2': ['collection-z', 'collection-a'],
          'cake-2': ['collection-b']
        },
        collectionIds: ['collection-z', 'collection-a', 'collection-b']
      })

      expect(result.find((item) => item.baseId === 'cake-1')).toEqual({
        baseId: 'cake-1',
        name: 'Apple',
        variantDocumentIds: ['cake-1'],
        variantRevisionByDocumentId: {
          'cake-1': 'rev-published-cake-1'
        },
        variantCollectionIdsByDocumentId: {
          'cake-1': ['collection-a']
        },
        collectionIds: ['collection-a']
      })
    })

    it('prefers draft name when draft and published names differ', () => {
      const result = normalizeProductDocuments([
        {
          _id: 'cake-1',
          _rev: 'rev-published-cake-1',
          name: 'Published cake'
        },
        {
          _id: 'drafts.cake-1',
          _rev: 'rev-draft-cake-1',
          name: 'Draft cake'
        }
      ])

      expect(result).toEqual([
        {
          baseId: 'cake-1',
          name: 'Draft cake',
          variantDocumentIds: ['cake-1', 'drafts.cake-1'],
          variantRevisionByDocumentId: {
            'cake-1': 'rev-published-cake-1',
            'drafts.cake-1': 'rev-draft-cake-1'
          },
          variantCollectionIdsByDocumentId: {
            'cake-1': [],
            'drafts.cake-1': []
          },
          collectionIds: []
        }
      ])
    })

    it('keeps published name when draft name is empty', () => {
      const result = normalizeProductDocuments([
        {
          _id: 'drafts.cake-1',
          _rev: 'rev-draft-cake-1',
          name: '   '
        },
        {
          _id: 'cake-1',
          _rev: 'rev-published-cake-1',
          name: 'Published cake'
        }
      ])

      expect(result).toEqual([
        {
          baseId: 'cake-1',
          name: 'Published cake',
          variantDocumentIds: ['drafts.cake-1', 'cake-1'],
          variantRevisionByDocumentId: {
            'drafts.cake-1': 'rev-draft-cake-1',
            'cake-1': 'rev-published-cake-1'
          },
          variantCollectionIdsByDocumentId: {
            'drafts.cake-1': [],
            'cake-1': []
          },
          collectionIds: []
        }
      ])
    })

    it('uses fallback name when source name is empty', () => {
      const result = normalizeProductDocuments([
        {
          _id: 'drafts.cake-3',
          _rev: 'rev-draft-cake-3',
          name: '   '
        }
      ])

      expect(result).toEqual([
        {
          baseId: 'cake-3',
          name: 'Untitled cake-3',
          variantDocumentIds: ['drafts.cake-3'],
          variantRevisionByDocumentId: {
            'drafts.cake-3': 'rev-draft-cake-3'
          },
          variantCollectionIdsByDocumentId: {
            'drafts.cake-3': []
          },
          collectionIds: []
        }
      ])
    })
  })

  describe('toOrderedSelectedIds', () => {
    it('returns selected ids in product list order', () => {
      const products: ProductDocumentRecord[] = [
        {
          baseId: 'cake-1',
          name: 'A',
          variantDocumentIds: ['cake-1'],
          variantRevisionByDocumentId: { 'cake-1': 'rev-1' },
          variantCollectionIdsByDocumentId: { 'cake-1': [] },
          collectionIds: []
        },
        {
          baseId: 'cake-2',
          name: 'B',
          variantDocumentIds: ['cake-2'],
          variantRevisionByDocumentId: { 'cake-2': 'rev-2' },
          variantCollectionIdsByDocumentId: { 'cake-2': [] },
          collectionIds: []
        },
        {
          baseId: 'cake-3',
          name: 'C',
          variantDocumentIds: ['cake-3'],
          variantRevisionByDocumentId: { 'cake-3': 'rev-3' },
          variantCollectionIdsByDocumentId: { 'cake-3': [] },
          collectionIds: []
        }
      ]

      const selected = new Set(['cake-3', 'cake-1'])

      expect(toOrderedSelectedIds(selected, products)).toEqual(['cake-1', 'cake-3'])
    })
  })

  describe('createMirrorValue', () => {
    it('keeps existing refs when selected and normalizes draft _ref', () => {
      const products: ProductDocumentRecord[] = [
        {
          baseId: 'cake-1',
          name: 'A',
          variantDocumentIds: ['cake-1'],
          variantRevisionByDocumentId: { 'cake-1': 'rev-1' },
          variantCollectionIdsByDocumentId: { 'cake-1': [] },
          collectionIds: []
        },
        {
          baseId: 'cake-2',
          name: 'B',
          variantDocumentIds: ['cake-2'],
          variantRevisionByDocumentId: { 'cake-2': 'rev-2' },
          variantCollectionIdsByDocumentId: { 'cake-2': [] },
          collectionIds: []
        }
      ]

      const currentValue: ProductReferenceValue[] = [
        {
          _key: 'key-cake-2',
          _type: 'reference',
          _ref: 'cake-2'
        },
        {
          _key: 'key-cake-1',
          _type: 'reference',
          _ref: 'drafts.cake-1'
        }
      ]

      const result = createMirrorValue(['cake-2', 'cake-1'], currentValue, products)

      expect(result).toEqual([
        {
          _key: 'key-cake-1',
          _type: 'reference',
          _ref: 'cake-1'
        },
        {
          _key: 'key-cake-2',
          _type: 'reference',
          _ref: 'cake-2'
        }
      ])
    })

    it('preserves draft refs for products without published variants', () => {
      const products: ProductDocumentRecord[] = [
        {
          baseId: 'cake-1',
          name: 'A',
          variantDocumentIds: ['drafts.cake-1'],
          variantRevisionByDocumentId: { 'drafts.cake-1': 'rev-draft-1' },
          variantCollectionIdsByDocumentId: { 'drafts.cake-1': [] },
          collectionIds: []
        }
      ]

      const currentValue: ProductReferenceValue[] = [
        {
          _key: 'key-cake-1',
          _type: 'reference',
          _ref: 'cake-1'
        }
      ]

      const result = createMirrorValue(['cake-1'], currentValue, products)

      expect(result).toEqual([
        {
          _key: 'key-cake-1',
          _type: 'reference',
          _ref: 'drafts.cake-1'
        }
      ])
    })

    it('creates a new ref when selected item does not exist in current value', () => {
      const products: ProductDocumentRecord[] = [
        {
          baseId: 'cake-1',
          name: 'A',
          variantDocumentIds: ['cake-1'],
          variantRevisionByDocumentId: { 'cake-1': 'rev-1' },
          variantCollectionIdsByDocumentId: { 'cake-1': [] },
          collectionIds: []
        }
      ]

      const result = createMirrorValue(['cake-1'], [], products)

      expect(result).toHaveLength(1)
      expect(result[0]._type).toBe('reference')
      expect(result[0]._ref).toBe('cake-1')
      expect(typeof result[0]._key).toBe('string')
      expect(result[0]._key.length).toBeGreaterThan(0)
    })
  })
})
