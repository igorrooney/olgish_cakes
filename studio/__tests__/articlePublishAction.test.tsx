import { createArticlePublishAction, applyArticleEditorialPublishUpdate } from '../articlePublishAction'

const mockUseDocumentOperation = jest.fn()

jest.mock('sanity', () => ({
  useDocumentOperation: (...args: unknown[]) => mockUseDocumentOperation(...args),
}))

describe('articlePublishAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets editorialUpdatedAt and clears the refresh flag when requested', () => {
    const execute = jest.fn()

    const didPatch = applyArticleEditorialPublishUpdate({
      draft: {
        _id: 'drafts.article-1',
        _type: 'article',
        refreshEditorialUpdatedAt: true,
      },
      patch: {
        disabled: false,
        execute,
      },
      timestamp: '2026-03-30T10:00:00.000Z',
    })

    expect(didPatch).toBe(true)
    expect(execute).toHaveBeenCalledWith([
      {
        set: {
          editorialUpdatedAt: '2026-03-30T10:00:00.000Z',
          refreshEditorialUpdatedAt: false,
        },
      },
    ])
  })

  it('leaves the publish state unchanged when the refresh flag is off', () => {
    const execute = jest.fn()

    const didPatch = applyArticleEditorialPublishUpdate({
      draft: {
        _id: 'drafts.article-1',
        _type: 'article',
        refreshEditorialUpdatedAt: false,
      },
      patch: {
        disabled: false,
        execute,
      },
      timestamp: '2026-03-30T10:00:00.000Z',
    })

    expect(didPatch).toBe(false)
    expect(execute).not.toHaveBeenCalled()
  })

  it('patches the draft before delegating to the original publish action', () => {
    const execute = jest.fn()
    const originalOnHandle = jest.fn()

    mockUseDocumentOperation.mockReturnValue({
      patch: {
        disabled: false,
        execute,
      },
    })

    const wrappedPublishAction = createArticlePublishAction(() => ({
      label: 'Publish',
      onHandle: originalOnHandle,
    }))

    const actionDescription = wrappedPublishAction({
      id: 'article-1',
      type: 'article',
      draft: {
        _id: 'drafts.article-1',
        _type: 'article',
        refreshEditorialUpdatedAt: true,
      },
      published: null,
      version: null,
      transactionSyncLock: null,
      liveEdit: false,
      liveEditSchemaType: false,
      ready: true,
      release: undefined,
      onComplete: jest.fn(),
      initialValueResolved: true,
    })

    actionDescription?.onHandle?.()

    expect(mockUseDocumentOperation).toHaveBeenCalledWith('article-1', 'article', undefined)
    expect(execute).toHaveBeenCalledTimes(1)
    expect(originalOnHandle).toHaveBeenCalledTimes(1)
  })
})
