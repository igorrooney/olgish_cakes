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
  name: 'collection',
  title: 'Cakes Collections',
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
      description: 'Show this collection in the Featured filters on the cakes page (max 3).',
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
              'count(*[_type == "collection" && isFeatured == true && !(_id in path("drafts.**")) && !(_id in [$currentId, $draftId, $publishedId])])',
              { currentId, draftId, publishedId }
            )

            if (count >= 3) {
              return 'You can select at most 3 featured collections. Uncheck another collection first.'
            }
          } catch (error: unknown) {
            console.warn('Failed to validate featured collections limit:', error)
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
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
}
