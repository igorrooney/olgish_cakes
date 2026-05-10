import { defineField, defineType } from 'sanity'
import { articleTopicFieldHelpComponents } from '../components/articleTopicFieldHelpContent'

export default defineType({
  name: 'articleTopic',
  title: 'Article Topic',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      ...articleTopicFieldHelpComponents('title'),
      validation: (Rule) => Rule.required().max(80)
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      ...articleTopicFieldHelpComponents('slug'),
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      ...articleTopicFieldHelpComponents('description'),
      rows: 3,
      validation: (Rule) => Rule.max(240)
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      ...articleTopicFieldHelpComponents('order'),
      description: 'Lower numbers appear first in the blog topic filters.',
      validation: (Rule) => Rule.integer().min(0)
    })
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    },
    {
      title: 'Title',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description'
    }
  }
})
