interface ValidationContext {
  document?: {
    _id?: string
    _type?: string
  }
  getClient: (options?: { apiVersion?: string }) => {
    fetch: <T = unknown>(query: string, params?: Record<string, unknown>) => Promise<T>
  }
}

interface ValidationRule {
  required: () => ValidationRule
  max: (value: number) => ValidationRule
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
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
}
