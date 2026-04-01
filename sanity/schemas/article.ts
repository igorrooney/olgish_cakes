import { defineArrayMember, defineField, defineType } from 'sanity'
import { articleFieldHelpComponents } from '../components/articleFieldHelpContent'

const portableTextBlock = defineArrayMember({
  type: 'block',
  styles: [
    { title: 'Normal', value: 'normal' },
    { title: 'H2', value: 'h2' },
    { title: 'H3', value: 'h3' },
    { title: 'H4', value: 'h4' },
    { title: 'Quote', value: 'blockquote' }
  ],
  lists: [
    { title: 'Bullet', value: 'bullet' },
    { title: 'Numbered', value: 'number' }
  ],
  marks: {
    decorators: [
      { title: 'Strong', value: 'strong' },
      { title: 'Emphasis', value: 'em' }
    ],
    annotations: [
      {
        title: 'Link',
        name: 'link',
        type: 'object',
        fields: [
        defineField({
          name: 'href',
          title: 'URL',
          type: 'url',
          validation: (Rule) => Rule.required()
          })
        ]
      }
    ]
  }
})

const articleImage = defineArrayMember({
  type: 'image',
  options: {
    hotspot: true
  },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative Text',
      type: 'string',
      ...articleFieldHelpComponents('bodyImage.alt'),
      description: 'Describe what is actually visible and why it matters here. Avoid generic alt such as "cake" or "cake by post".',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      ...articleFieldHelpComponents('bodyImage.caption')
    })
  ]
})

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      ...articleFieldHelpComponents('title'),
      validation: (Rule) => Rule.required().max(110)
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      ...articleFieldHelpComponents('slug'),
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      ...articleFieldHelpComponents('summary'),
      rows: 3,
      description: 'Used in archive cards and short previews. Make it concrete, bakery-specific, and different from the title.',
      validation: (Rule) => Rule.required().max(220)
    }),
    defineField({
      name: 'dek',
      title: 'Dek',
      type: 'text',
      ...articleFieldHelpComponents('dek'),
      rows: 4,
      description: 'Short introduction shown under the article title. Write a clear human summary, not a generic hook or a repeat of the summary.',
      validation: (Rule) => Rule.required().max(320)
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      ...articleFieldHelpComponents('coverImage'),
      options: {
        hotspot: true
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          ...articleFieldHelpComponents('coverImage.alt'),
          description: 'Describe the actual image, not the topic. Explain what the reader would see.',
          validation: (Rule) => Rule.required()
        })
      ]
    }),
    defineField({
      name: 'cardImage',
      title: 'Card Image',
      type: 'image',
      ...articleFieldHelpComponents('cardImage'),
      description: 'Optional crop specifically for the archive card.',
      options: {
        hotspot: true
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          ...articleFieldHelpComponents('cardImage.alt'),
          description: 'Describe the crop that appears on archive cards. Avoid generic labels.',
          validation: (Rule) => Rule.required()
        })
      ]
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      ...articleFieldHelpComponents('body'),
      of: [portableTextBlock, articleImage],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'reference',
      ...articleFieldHelpComponents('topic'),
      to: [{ type: 'articleTopic' }],
      options: {
        disableNew: false
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'primaryProduct',
      title: 'Primary Product',
      type: 'reference',
      ...articleFieldHelpComponents('primaryProduct'),
      to: [{ type: 'cake' }, { type: 'giftHamper' }],
      description: 'Optional product to feature within the article.'
    }),
    defineField({
      name: 'relatedProducts',
      title: 'Related Products',
      type: 'array',
      ...articleFieldHelpComponents('relatedProducts'),
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'cake' }, { type: 'giftHamper' }]
        })
      ],
      validation: (Rule) => Rule.max(4)
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      ...articleFieldHelpComponents('publishedAt'),
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'editorialUpdatedAt',
      title: 'Editorial Updated At',
      type: 'datetime',
      ...articleFieldHelpComponents('editorialUpdatedAt'),
      description: 'Reader-facing last updated date. This is refreshed only when you mark a meaningful editorial update before publishing.',
      readOnly: true
    }),
    defineField({
      name: 'refreshEditorialUpdatedAt',
      title: 'Refresh Editorial Updated Date On Next Publish',
      type: 'boolean',
      ...articleFieldHelpComponents('refreshEditorialUpdatedAt'),
      initialValue: false,
      description: 'Turn this on only when the article has changed in a way readers should see as a meaningful update. It resets after publish.'
    }),
    defineField({
      name: 'faqItems',
      title: 'FAQ Items',
      type: 'array',
      ...articleFieldHelpComponents('faqItems'),
      description: 'Only use FAQs that are also shown on the article page.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              ...articleFieldHelpComponents('faqItems.question'),
              validation: (Rule) => Rule.required().max(180)
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              ...articleFieldHelpComponents('faqItems.answer'),
              rows: 4,
              validation: (Rule) => Rule.required().max(600)
            })
          ],
          preview: {
            select: {
              title: 'question',
              subtitle: 'answer'
            }
          }
        })
      ]
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      ...articleFieldHelpComponents('seo'),
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          ...articleFieldHelpComponents('seo.metaTitle'),
          description: 'Write a unique, search-led title that still sounds human. Length is guidance only.',
          validation: (Rule) => Rule.max(70).warning('Keep it concise, but do not force an artificial character target.')
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          ...articleFieldHelpComponents('seo.metaDescription'),
          rows: 3,
          description: 'Summarise the page in plain English so the reader can decide to click. Length is guidance only.',
          validation: (Rule) => Rule.max(180).warning('Treat description length as editorial guidance, not a hard limit.')
        }),
        defineField({
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          ...articleFieldHelpComponents('seo.keywords'),
          of: [{ type: 'string' }]
        }),
        defineField({
          name: 'canonicalUrl',
          title: 'Canonical URL',
          type: 'url',
          ...articleFieldHelpComponents('seo.canonicalUrl'),
          description: 'Usually leave blank. Only add a full URL when this article should canonically point to another page.'
        })
      ]
    })
  ],
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }]
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'topic.title',
      media: 'coverImage',
    },
    prepare(selection) {

      return {
        title: selection.title,
        subtitle: selection.subtitle,
        media: selection.media
      }
    }
  }
})
