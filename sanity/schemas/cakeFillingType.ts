interface ValidationRule {
  required: () => ValidationRule
}

export default {
  name: 'cakeFillingType',
  title: 'Cake Filling Types',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Filling Type Name',
      type: 'string',
      validation: (Rule: ValidationRule) => Rule.required()
    },
    {
      name: 'image',
      title: 'Filling Type Image',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Important for SEO and accessibility',
          validation: (Rule: ValidationRule) => Rule.required()
        }
      ],
      validation: (Rule: ValidationRule) => Rule.required()
    }
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image'
    }
  }
}
