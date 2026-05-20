import {
  ensureProductDisplayOrderEntry,
  type ProductDisplayOrderField,
  type ProductDisplayOrderPatch,
  type ProductDisplayOrderSyncClient,
  type ProductReferenceValue
} from '../product-display-order-sync'

interface ProductDisplayOrderSnapshotFixture {
  _rev: string
  productExists: boolean
  orderReferences?: ProductReferenceValue[] | null
}

interface PatchRecord {
  revisionId?: string
  attributes?: Partial<Record<ProductDisplayOrderField, ProductReferenceValue[]>>
}

type CommitOutcome = unknown | Error

function createReference(_ref: string, _key = _ref): ProductReferenceValue {
  return {
    _key,
    _type: 'reference',
    _ref
  }
}

function createMockSyncClient(
  snapshots: Array<ProductDisplayOrderSnapshotFixture | null>,
  commitOutcomes: CommitOutcome[] = [undefined]
) {
  const patchRecords: PatchRecord[] = []
  const commitMock = jest.fn(async () => {
    const outcome = commitOutcomes.shift()

    if (outcome instanceof Error) {
      throw outcome
    }

    return outcome
  })
  const createIfNotExistsMock = jest.fn(async () => undefined)
  const fetchMock = jest.fn(async <T,>(): Promise<T> => {
    return snapshots.shift() as T
  })
  const patchMock = jest.fn(() => {
    const patchRecord: PatchRecord = {}
    patchRecords.push(patchRecord)

    const patch: ProductDisplayOrderPatch = {
      ifRevisionId: (revisionId: string) => {
        patchRecord.revisionId = revisionId
        return patch
      },
      set: (attributes: Partial<Record<ProductDisplayOrderField, ProductReferenceValue[]>>) => {
        patchRecord.attributes = attributes
        return patch
      },
      commit: commitMock
    }

    return patch
  })
  const client: ProductDisplayOrderSyncClient = {
    createIfNotExists: createIfNotExistsMock,
    fetch: fetchMock,
    patch: patchMock
  }

  return {
    client,
    createIfNotExistsMock,
    fetchMock,
    patchMock,
    commitMock,
    patchRecords
  }
}

describe('ensureProductDisplayOrderEntry', () => {
  it('creates the singleton and prepends a missing cake reference', async () => {
    const {
      client,
      createIfNotExistsMock,
      fetchMock,
      patchRecords
    } = createMockSyncClient([
      {
        _rev: 'revision-1',
        productExists: true,
        orderReferences: [createReference('cake-1')]
      }
    ])

    const result = await ensureProductDisplayOrderEntry({
      client,
      documentId: 'cake-2',
      fieldName: 'cakesOrder'
    })

    expect(createIfNotExistsMock).toHaveBeenCalledWith({
      _id: 'productsDisplayOrder',
      _type: 'productsDisplayOrder'
    })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('_type == "cake"'),
      {
        documentId: 'productsDisplayOrder',
        productDocumentId: 'cake-2'
      }
    )
    expect(patchRecords[0]?.revisionId).toBe('revision-1')
    expect(patchRecords[0]?.attributes?.cakesOrder?.map((reference) => reference._ref)).toEqual([
      'cake-2',
      'cake-1'
    ])
    expect(result).toEqual({
      documentId: 'cake-2',
      fieldName: 'cakesOrder',
      updated: true,
      inserted: true,
      alreadyPresent: false
    })
  })

  it('does not move a cake that is already in the manual order', async () => {
    const {
      client,
      patchMock
    } = createMockSyncClient([
      {
        _rev: 'revision-1',
        productExists: true,
        orderReferences: [
          createReference('cake-1'),
          createReference('cake-2')
        ]
      }
    ])

    const result = await ensureProductDisplayOrderEntry({
      client,
      documentId: 'cake-2',
      fieldName: 'cakesOrder'
    })

    expect(patchMock).not.toHaveBeenCalled()
    expect(result).toEqual({
      documentId: 'cake-2',
      fieldName: 'cakesOrder',
      updated: false,
      inserted: false,
      alreadyPresent: true
    })
  })

  it('deduplicates an existing product reference without reinserting it first', async () => {
    const {
      client,
      patchRecords
    } = createMockSyncClient([
      {
        _rev: 'revision-1',
        productExists: true,
        orderReferences: [
          createReference('cake-1'),
          createReference('cake-2', 'cake-2-first'),
          createReference('drafts.cake-2', 'cake-2-duplicate')
        ]
      }
    ])

    const result = await ensureProductDisplayOrderEntry({
      client,
      documentId: 'cake-2',
      fieldName: 'cakesOrder'
    })

    expect(patchRecords[0]?.attributes?.cakesOrder?.map((reference) => reference._ref)).toEqual([
      'cake-1',
      'cake-2'
    ])
    expect(result).toEqual({
      documentId: 'cake-2',
      fieldName: 'cakesOrder',
      updated: true,
      inserted: false,
      alreadyPresent: true
    })
  })

  it('removes a reference when the product no longer exists', async () => {
    const {
      client,
      patchRecords
    } = createMockSyncClient([
      {
        _rev: 'revision-1',
        productExists: false,
        orderReferences: [
          createReference('cake-1'),
          createReference('cake-2')
        ]
      }
    ])

    const result = await ensureProductDisplayOrderEntry({
      client,
      documentId: 'cake-2',
      fieldName: 'cakesOrder'
    })

    expect(patchRecords[0]?.attributes?.cakesOrder?.map((reference) => reference._ref)).toEqual([
      'cake-1'
    ])
    expect(result).toEqual({
      documentId: 'cake-2',
      fieldName: 'cakesOrder',
      updated: true,
      inserted: false,
      alreadyPresent: true
    })
  })

  it('retries once when the products display order revision changes mid-sync', async () => {
    const conflictError = new Error('revision conflict')
    const {
      client,
      fetchMock,
      patchRecords
    } = createMockSyncClient(
      [
        {
          _rev: 'revision-1',
          productExists: true,
          orderReferences: []
        },
        {
          _rev: 'revision-2',
          productExists: true,
          orderReferences: [createReference('cake-1')]
        }
      ],
      [conflictError, undefined]
    )

    const result = await ensureProductDisplayOrderEntry({
      client,
      documentId: 'drafts.cake-2',
      fieldName: 'cakesOrder'
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(patchRecords.map((record) => record.revisionId)).toEqual(['revision-1', 'revision-2'])
    expect(patchRecords[1]?.attributes?.cakesOrder?.map((reference) => reference._ref)).toEqual([
      'cake-2',
      'cake-1'
    ])
    expect(result).toEqual({
      documentId: 'cake-2',
      fieldName: 'cakesOrder',
      updated: true,
      inserted: true,
      alreadyPresent: false
    })
  })

  it('uses the gift hamper order field and product type when requested', async () => {
    const {
      client,
      fetchMock,
      patchRecords
    } = createMockSyncClient([
      {
        _rev: 'revision-1',
        productExists: true,
        orderReferences: []
      }
    ])

    await ensureProductDisplayOrderEntry({
      client,
      documentId: 'hamper-1',
      fieldName: 'giftHampersOrder'
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('_type == "giftHamper"'),
      {
        documentId: 'productsDisplayOrder',
        productDocumentId: 'hamper-1'
      }
    )
    expect(patchRecords[0]?.attributes?.giftHampersOrder?.map((reference) => reference._ref)).toEqual([
      'hamper-1'
    ])
  })

  it('throws when the products display order document cannot be loaded after creation', async () => {
    const { client } = createMockSyncClient([null])

    await expect(ensureProductDisplayOrderEntry({
      client,
      documentId: 'cake-1',
      fieldName: 'cakesOrder'
    })).rejects.toThrow('Unable to load productsDisplayOrder')
  })

  it('does not retry non-conflict mutation failures', async () => {
    const mutationError = new Error('token missing')
    const {
      client,
      fetchMock
    } = createMockSyncClient(
      [
        {
          _rev: 'revision-1',
          productExists: true,
          orderReferences: []
        }
      ],
      [mutationError]
    )

    await expect(ensureProductDisplayOrderEntry({
      client,
      documentId: 'cake-1',
      fieldName: 'cakesOrder'
    })).rejects.toThrow('token missing')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
