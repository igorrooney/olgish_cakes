interface ValidationContext {
  parent?: {
    asset?: unknown
  }
}

interface ValidationRule {
  required: () => ValidationRule
  custom: (fn: (value: unknown, context: ValidationContext) => true | string) => unknown
}

export default {
  name: 'cakesFeaturedOffer',
  title: 'Cakes Featured Offer',
  type: 'document',
  fields: [
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Toggle this off to hide the featured offer from the cakes page.',
      initialValue: true
    },
    {
      name: 'featuredCake',
      title: 'Featured Cake',
      type: 'reference',
      to: [{ type: 'cake' }],
      validation: (Rule: ValidationRule) => Rule.required()
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'Featured',
      validation: (Rule: ValidationRule) => Rule.required()
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'FREE Honey Cake Offer',
      validation: (Rule: ValidationRule) => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      initialValue: 'For a limited time enjoy some honey cake on us.\nNo strings attached.',
      validation: (Rule: ValidationRule) => Rule.required()
    },
    {
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      initialValue: 'Get free honey cake',
      validation: (Rule: ValidationRule) => Rule.required()
    },
    {
      name: 'overrideImage',
      title: 'Override Image',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Required when override image is set.',
          validation: (Rule: ValidationRule) =>
            Rule.custom((value: unknown, context: ValidationContext) => {
              if (!context.parent?.asset) {
                return true
              }

              if (typeof value !== 'string' || value.trim() === '') {
                return 'Alternative Text is required when override image is set.'
              }

              return true
            })
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'featuredCake.name',
      media: 'overrideImage'
    },
    prepare({
      title,
      subtitle
    }: {
      title?: string
      subtitle?: string
    }) {
      return {
        title: title || 'Cakes Featured Offer',
        subtitle: subtitle ? `Cake: ${subtitle}` : 'No cake selected yet'
      }
    }
  }
}
