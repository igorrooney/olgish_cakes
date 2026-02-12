interface ValidationContext {
  document?: {
    _id?: string
    _type?: string
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
  name: 'giftHamperCollection',
  title: 'Gift Hampers Collections',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Collection Name',
      type: 'string',
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'isFeatured',
      title: 'Featured Collection',
      type: 'boolean',
      initialValue: false,
      description: 'Show this collection in the Featured filters on the cakes page for Cakes by post (max 3).',
      validation: (Rule: ValidationRule) =>
        Rule.custom(async (value: unknown, context: ValidationContext) => {
          if (value !== true) return true

          const { document, getClient } = context
          const client = getClient({ apiVersion: '2025-03-31' })
          const currentId = document?._id || ''
          const publishedId = currentId.replace(/^drafts\./, '')
          const draftId = publishedId ? `drafts.${publishedId}` : ''

          try {
            const count = await client.fetch<number>(
              'count(*[_type == "giftHamperCollection" && isFeatured == true && !(_id in path("drafts.**")) && !(_id in [$currentId, $draftId, $publishedId])])',
              { currentId, draftId, publishedId }
            )

            if (count >= 3) {
              return 'You can select at most 3 featured gift hamper collections. Uncheck another collection first.'
            }
          } catch (error: unknown) {
            console.warn('Failed to validate featured gift hamper collections limit:', error)
          }

          return true
        }),
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
      name: 'homepageOrder',
      title: 'Homepage Order',
      type: 'number',
      description: 'Lower numbers appear first on the homepage.',
      validation: (Rule: ValidationRule) =>
        Rule.min(0)
          .integer()
          .custom(async (orderNumber: unknown, context: ValidationContext): Promise<true | string> => {
            if (orderNumber === undefined || orderNumber === null || typeof orderNumber !== 'number') {
              return true
            }

            const { document, getClient } = context

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
                `*[_type == "giftHamperCollection" && homepageOrder == $order && !(_id in $excludedIds)] {
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
