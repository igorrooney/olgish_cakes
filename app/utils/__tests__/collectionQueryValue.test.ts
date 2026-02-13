import {
  createCollectionIdByQueryValueMap,
  createCollectionQueryValueMap
} from '../collectionQueryValue'

describe('collectionQueryValue', () => {
  it('uses readable query values based on collection names', () => {
    const queryValueById = createCollectionQueryValueMap(
      [
        {
          _id: 'collection-1',
          name: 'Wedding Cakes'
        }
      ],
      'cake'
    )

    expect(queryValueById.get('collection-1')).toBe('c-wedding-cakes')
  })

  it('normalizes separator-heavy names to the legacy slug shape', () => {
    const queryValueById = createCollectionQueryValueMap(
      [
        {
          _id: 'collection-1',
          name: 'Wedding - Cakes'
        }
      ],
      'cake'
    )

    expect(queryValueById.get('collection-1')).toBe('c-wedding-cakes')
  })

  it('creates unique values when collection names collide', () => {
    const queryValueById = createCollectionQueryValueMap(
      [
        {
          _id: 'collection-1',
          name: 'Same Name'
        },
        {
          _id: 'collection-2',
          name: 'Same Name'
        }
      ],
      'cake'
    )

    expect(queryValueById.get('collection-1')).toBe('c-same-name')
    expect(queryValueById.get('collection-2')).toBe('c-same-name-collecti')
  })

  it('keeps backward aliases from raw ids and id-style values', () => {
    const collectionIdByQueryValue = createCollectionIdByQueryValueMap(
      [
        {
          _id: 'collection-1',
          name: 'Wedding Cakes'
        }
      ],
      'cake'
    )

    expect(collectionIdByQueryValue.get('c-wedding-cakes')).toBe('collection-1')
    expect(collectionIdByQueryValue.get('collection-1')).toBe('collection-1')
    expect(collectionIdByQueryValue.get('c-collection1')).toBe('collection-1')
  })

  it('falls back to id-based value when name is blank', () => {
    const collectionIdByQueryValue = createCollectionIdByQueryValueMap(
      [
        {
          _id: 'collection-1',
          name: '   '
        }
      ],
      'cake'
    )

    expect(collectionIdByQueryValue.get('c-collection1')).toBeUndefined()
    expect(collectionIdByQueryValue.get('collection-1')).toBeUndefined()
  })
})
