import {
  isRevisionConflictError,
  syncCollectionAssignmentsWithRetry
} from '../collectionProductAssignmentsSync'
import type {
  ProductDocumentRecord,
  ProductReferenceValue,
  RawProductDocument
} from '../collectionProductAssignmentsUtils'

type SyncClient = Parameters<typeof syncCollectionAssignmentsWithRetry>[0]['client']
type SyncTransaction = ReturnType<SyncClient['transaction']>
type SyncPatch = Parameters<Parameters<SyncTransaction['patch']>[1]>[0]

interface MockPatchRecord {
  documentId: string
  revisionId: string
  operation: 'set' | 'unset'
  referenceIds: string[]
  unsetPaths: string[]
}

function createProductRecord({
  revisionId,
  collectionIds
}: {
  revisionId: string
  collectionIds?: string[]
}): ProductDocumentRecord {
  const nextCollectionIds = collectionIds ?? []

  return {
    baseId: 'cake-1',
    name: 'Cake 1',
    variantDocumentIds: ['cake-1'],
    variantRevisionByDocumentId: {
      'cake-1': revisionId
    },
    variantCollectionIdsByDocumentId: {
      'cake-1': nextCollectionIds
    },
    collectionIds: nextCollectionIds
  }
}

function createRawProductDocument({
  revisionId,
  collectionIds
}: {
  revisionId: string
  collectionIds?: string[]
}): RawProductDocument {
  return {
    _id: 'cake-1',
    _rev: revisionId,
    name: 'Cake 1',
    collections: (collectionIds ?? []).map((collectionId) => ({
      _ref: collectionId
    }))
  }
}

function createConflictError() {
  return Object.assign(new Error('revision conflict'), {
    statusCode: 409
  })
}

function createMockTransaction(
  patchRecords: MockPatchRecord[],
  commitImpl: () => Promise<unknown>
): SyncTransaction {
  const transaction: SyncTransaction = {
    patch: (documentId, patchBuilder) => {
      const nextRecord: MockPatchRecord = {
        documentId,
        revisionId: '',
        operation: 'unset',
        referenceIds: [],
        unsetPaths: []
      }

      const patch: SyncPatch = {
        ifRevisionId: (revisionId) => {
          nextRecord.revisionId = revisionId
          return patch
        },
        set: (attributes: { collections: ProductReferenceValue[] }) => {
          nextRecord.operation = 'set'
          nextRecord.referenceIds = attributes.collections.map((reference) => reference._ref)
          return patch
        },
        unset: (paths: string[]) => {
          nextRecord.operation = 'unset'
          nextRecord.unsetPaths = paths
          return patch
        }
      }

      patchBuilder(patch)
      patchRecords.push(nextRecord)

      return transaction
    },
    commit: commitImpl
  }

  return transaction
}

describe('syncCollectionAssignmentsWithRetry', () => {
  it('applies guarded patches with ifRevisionId on successful sync', async () => {
    const patchRecordsByAttempt: MockPatchRecord[][] = []

    const client = {
      transaction: jest.fn(() => {
        const patchRecords: MockPatchRecord[] = []
        patchRecordsByAttempt.push(patchRecords)

        return createMockTransaction(patchRecords, async () => {})
      }),
      fetch: jest.fn<Promise<RawProductDocument[]>, [string, (Record<string, unknown> | undefined)?]>()
    } as unknown as SyncClient

    const result = await syncCollectionAssignmentsWithRetry({
      client,
      products: [createProductRecord({ revisionId: 'rev-1' })],
      nextSelectedIdsSet: new Set(['cake-1']),
      collectionBaseId: 'collection-current',
      refreshByIdsQuery: '*[_id in $documentIds] { _id, _rev, name, collections[] { _ref } }'
    })

    expect(client.transaction).toHaveBeenCalledTimes(1)
    expect(client.fetch).not.toHaveBeenCalled()
    expect(patchRecordsByAttempt[0]).toEqual([
      {
        documentId: 'cake-1',
        revisionId: 'rev-1',
        operation: 'set',
        referenceIds: ['collection-current'],
        unsetPaths: []
      }
    ])
    expect(result.nextProducts[0].collectionIds).toEqual(['collection-current'])
    expect(result.changedProductIds).toEqual(['cake-1'])
  })

  it('syncs all variants when selection is missing on published variant only', async () => {
    const patchRecordsByAttempt: MockPatchRecord[][] = []

    const client = {
      transaction: jest.fn(() => {
        const patchRecords: MockPatchRecord[] = []
        patchRecordsByAttempt.push(patchRecords)

        return createMockTransaction(patchRecords, async () => {})
      }),
      fetch: jest.fn<Promise<RawProductDocument[]>, [string, (Record<string, unknown> | undefined)?]>()
    } as unknown as SyncClient

    const result = await syncCollectionAssignmentsWithRetry({
      client,
      products: [
        {
          baseId: 'cake-1',
          name: 'Cake 1',
          variantDocumentIds: ['drafts.cake-1', 'cake-1'],
          variantRevisionByDocumentId: {
            'drafts.cake-1': 'rev-draft',
            'cake-1': 'rev-published'
          },
          variantCollectionIdsByDocumentId: {
            'drafts.cake-1': ['collection-current'],
            'cake-1': []
          },
          collectionIds: ['collection-current']
        }
      ],
      nextSelectedIdsSet: new Set(['cake-1']),
      collectionBaseId: 'collection-current',
      refreshByIdsQuery: '*[_id in $documentIds] { _id, _rev, name, collections[] { _ref } }'
    })

    expect(client.transaction).toHaveBeenCalledTimes(1)
    expect(client.fetch).not.toHaveBeenCalled()
    expect(patchRecordsByAttempt[0]).toEqual([
      {
        documentId: 'drafts.cake-1',
        revisionId: 'rev-draft',
        operation: 'set',
        referenceIds: ['collection-current'],
        unsetPaths: []
      },
      {
        documentId: 'cake-1',
        revisionId: 'rev-published',
        operation: 'set',
        referenceIds: ['collection-current'],
        unsetPaths: []
      }
    ])
    expect(result.nextProducts[0].variantCollectionIdsByDocumentId['cake-1']).toEqual(['collection-current'])
    expect(result.changedProductIds).toEqual(['cake-1'])
  })

  it('refreshes and retries once on revision conflict', async () => {
    const patchRecordsByAttempt: MockPatchRecord[][] = []
    const commitImpls = [
      async () => {
        throw createConflictError()
      },
      async () => {}
    ]

    const client = {
      transaction: jest.fn(() => {
        const patchRecords: MockPatchRecord[] = []
        patchRecordsByAttempt.push(patchRecords)
        const commitImpl = commitImpls.shift()

        return createMockTransaction(
          patchRecords,
          commitImpl ?? (async () => {})
        )
      }),
      fetch: jest.fn<Promise<RawProductDocument[]>, [string, (Record<string, unknown> | undefined)?]>()
        .mockResolvedValue([
          createRawProductDocument({
            revisionId: 'rev-2',
            collectionIds: ['collection-existing']
          })
        ])
    } as unknown as SyncClient

    const result = await syncCollectionAssignmentsWithRetry({
      client,
      products: [createProductRecord({ revisionId: 'rev-1' })],
      nextSelectedIdsSet: new Set(['cake-1']),
      collectionBaseId: 'collection-current',
      refreshByIdsQuery: '*[_id in $documentIds] { _id, _rev, name, collections[] { _ref } }'
    })

    expect(client.transaction).toHaveBeenCalledTimes(2)
    expect(client.fetch).toHaveBeenCalledTimes(1)
    expect(patchRecordsByAttempt[0][0].revisionId).toBe('rev-1')
    expect(patchRecordsByAttempt[1][0].revisionId).toBe('rev-2')
    expect(result.nextProducts[0].collectionIds).toEqual(['collection-existing', 'collection-current'])
    expect(result.changedProductIds).toEqual(['cake-1'])
  })

  it('retries once and then throws if conflict persists', async () => {
    const commitImpls = [
      async () => {
        throw createConflictError()
      },
      async () => {
        throw createConflictError()
      }
    ]

    const client = {
      transaction: jest.fn(() => {
        const commitImpl = commitImpls.shift()

        return createMockTransaction(
          [],
          commitImpl ?? (async () => {})
        )
      }),
      fetch: jest.fn<Promise<RawProductDocument[]>, [string, (Record<string, unknown> | undefined)?]>()
        .mockResolvedValue([
          createRawProductDocument({
            revisionId: 'rev-2',
            collectionIds: []
          })
        ])
    } as unknown as SyncClient

    await expect(syncCollectionAssignmentsWithRetry({
      client,
      products: [createProductRecord({ revisionId: 'rev-1' })],
      nextSelectedIdsSet: new Set(['cake-1']),
      collectionBaseId: 'collection-current',
      refreshByIdsQuery: '*[_id in $documentIds] { _id, _rev, name, collections[] { _ref } }'
    })).rejects.toMatchObject({ statusCode: 409 })

    expect(client.transaction).toHaveBeenCalledTimes(2)
    expect(client.fetch).toHaveBeenCalledTimes(1)
  })

  it('does not retry non-conflict failures', async () => {
    const serverError = Object.assign(new Error('server failure'), {
      statusCode: 500
    })

    const client = {
      transaction: jest.fn(() => {
        return createMockTransaction([], async () => {
          throw serverError
        })
      }),
      fetch: jest.fn<Promise<RawProductDocument[]>, [string, (Record<string, unknown> | undefined)?]>()
    } as unknown as SyncClient

    await expect(syncCollectionAssignmentsWithRetry({
      client,
      products: [createProductRecord({ revisionId: 'rev-1' })],
      nextSelectedIdsSet: new Set(['cake-1']),
      collectionBaseId: 'collection-current',
      refreshByIdsQuery: '*[_id in $documentIds] { _id, _rev, name, collections[] { _ref } }'
    })).rejects.toBe(serverError)

    expect(client.transaction).toHaveBeenCalledTimes(1)
    expect(client.fetch).not.toHaveBeenCalled()
  })
})

describe('isRevisionConflictError', () => {
  it('returns true for 409 conflict status', () => {
    expect(isRevisionConflictError(createConflictError())).toBe(true)
  })

  it('returns false for non-conflict errors', () => {
    expect(isRevisionConflictError(new Error('something else'))).toBe(false)
  })
})
