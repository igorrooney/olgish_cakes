import { useDocumentOperation, type DocumentActionComponent, type SanityDocument } from 'sanity'

interface ArticleEditorialDraft extends SanityDocument {
  refreshEditorialUpdatedAt?: boolean
}

interface ArticlePatchOperation {
  disabled: false | string
  execute: (patches: Array<Record<string, unknown>>) => void
}

export function applyArticleEditorialPublishUpdate({
  draft,
  patch,
  timestamp = new Date().toISOString(),
}: {
  draft: ArticleEditorialDraft | null
  patch: ArticlePatchOperation
  timestamp?: string
}) {
  if (!draft?.refreshEditorialUpdatedAt || patch.disabled) {
    return false
  }

  patch.execute([
    {
      set: {
        editorialUpdatedAt: timestamp,
        refreshEditorialUpdatedAt: false,
      },
    },
  ])

  return true
}

export function createArticlePublishAction(
  originalAction: DocumentActionComponent
): DocumentActionComponent {
  const ArticlePublishAction: DocumentActionComponent = props => {
    const { patch } = useDocumentOperation(props.id, props.type, props.release)
    const originalResult = originalAction(props)

    if (!originalResult) {
      return null
    }

    return {
      ...originalResult,
      onHandle: () => {
        applyArticleEditorialPublishUpdate({
          draft: props.draft as ArticleEditorialDraft | null,
          patch,
        })

        originalResult.onHandle?.()
      },
    }
  }

  ArticlePublishAction.displayName = 'ArticlePublishAction'

  return ArticlePublishAction
}
