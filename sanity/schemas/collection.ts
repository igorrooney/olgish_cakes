interface ValidationContext {
  document?: {
    _id?: string
    _type?: string
    showOnHomepage?: boolean
  }
  getClient: (options?: { apiVersion?: string }) => {
    fetch: <T = unknown>(query: string, params?: Record<string, unknown>) => Promise<T>
  }
}

interface DuplicateDocument {
  _id: string
  name: string
  homepageOrder: number
}

interface ValidationRule {
  required: () => ValidationRule
  min: (value: number) => ValidationRule & { integer: () => ValidationRule & { custom: (fn: (value: number | undefined, context: ValidationContext) => Promise<true | string>) => unknown } }
  max: (value: number) => ValidationRule
  integer: () => ValidationRule
  custom: (fn: (value: unknown, context: ValidationContext) => Promise<true | string> | true | string) => unknown
  warning: (message: string) => ValidationRule
}

export default {
  name: 'collection',
  title: 'Collections',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Collection Name',
      type: 'string',
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Collection Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Important for SEO and accessibility',
          validation: (Rule: ValidationRule) => Rule.required(),
        },
      ],
    },
    {
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Title for search engines (50-60 characters recommended)',
          validation: (Rule: ValidationRule) =>
            Rule.max(60).warning('Meta title should be under 60 characters'),
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'Description for search engines (150-160 characters recommended)',
          validation: (Rule: ValidationRule) =>
            Rule.max(160).warning('Meta description should be under 160 characters'),
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Relevant keywords for this collection',
        },
        {
          name: 'canonicalUrl',
          title: 'Canonical URL',
          type: 'url',
          description: 'Canonical URL if different from the page URL',
        },
      ],
    },
    {
      name: 'showOnHomepage',
      title: 'Show on Homepage',
      type: 'boolean',
      description: 'Show this collection on the homepage',
      initialValue: false,
    },
    {
      name: 'homepageOrder',
      title: 'Homepage Order',
      type: 'number',
      description: 'Lower numbers appear first on the homepage.',
      hidden: ({ document }: { document?: { showOnHomepage?: boolean } }) => !document?.showOnHomepage,
      validation: (Rule: ValidationRule) =>
        Rule.min(0)
          .integer()
          .custom(async (orderNumber: unknown, context: ValidationContext): Promise<true | string> => {
            if (orderNumber === undefined || orderNumber === null || typeof orderNumber !== 'number') {
              return true
            }

            const { document, getClient } = context
            if (!document?.showOnHomepage) {
              return true
            }

            const client = getClient({ apiVersion: '2025-03-31' })
            const currentId = document?._id
            const isDraft = Boolean(currentId?.startsWith('drafts.'))
            const publishedId = currentId
              ? isDraft
                ? currentId.replace(/^drafts\./, '')
                : currentId
              : ''
            const draftId = currentId
              ? isDraft
                ? currentId
                : `drafts.${currentId}`
              : ''
            const excludedIds = Array.from(
              new Set([currentId, publishedId, draftId].filter(Boolean))
            )

            try {
              const duplicates = await client.fetch<DuplicateDocument[]>(
                `*[_type == "collection" && homepageOrder == $order && !(_id in $excludedIds)] {
                  _id,
                  name,
                  homepageOrder
                }`,
                { order: orderNumber, excludedIds }
              )

              if (duplicates.length > 0) {
                const duplicateNames = duplicates.map((duplicate: DuplicateDocument) => duplicate.name).join(', ')
                return `Homepage order ${orderNumber} is already used by: ${duplicateNames}. Please use a unique order number.`
              }
            } catch (error: unknown) {
              console.warn('Failed to check for duplicate homepage order numbers:', error)
            }

            return true
          }),
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
}
