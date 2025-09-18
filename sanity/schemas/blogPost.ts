import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required().max(100)
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required().max(200)
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Number', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              validation: Rule => Rule.required()
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption for the image'
            },
            {
              name: 'size',
              type: 'string',
              title: 'Image Size',
              options: {
                list: [
                  { title: 'Small', value: 'small' },
                  { title: 'Medium', value: 'medium' },
                  { title: 'Large', value: 'large' },
                  { title: 'Full Width', value: 'full' }
                ],
                layout: 'radio'
              },
              initialValue: 'medium'
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    }),
    defineField({
      name: 'cardImage',
      title: 'Card Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ],
      description: 'Image displayed on blog listing cards (recommended size: 400x300px)'
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Business Guide', value: 'Business Guide' },
          { title: 'Cake by Post', value: 'Cake by Post' },
          { title: 'Traditional Ukrainian', value: 'Traditional Ukrainian' },
          { title: 'Wedding Cakes', value: 'Wedding Cakes' },
          { title: 'Customer Stories', value: 'Customer Stories' },
          { title: 'Behind the Scenes', value: 'Behind the Scenes' },
          { title: 'Seasonal', value: 'Seasonal' },
        ],
        layout: 'tags'
      },
      validation: Rule => Rule.required().min(1)
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Short description of the blog post',
      validation: Rule => Rule.max(300)
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'string',
      description: 'Enter number of minutes (e.g., "8" for "8 min read")',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'viewCount',
      title: 'View Count',
      type: 'number',
      description: 'Number of times this post has been viewed (automatically updated)',
      initialValue: 0,
      validation: Rule => Rule.min(0).integer()
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Scheduled', value: 'scheduled' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio'
      },
      initialValue: 'draft',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      type: 'datetime',
      description: 'When this post should be published (for scheduled posts)',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        timeStep: 15
      },
      hidden: ({ document }) => document?.status !== 'scheduled'
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Title for search engines (max 60 characters)',
      validation: Rule => Rule.max(60)
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description: 'Description for search engines (max 160 characters)',
      validation: Rule => Rule.max(160)
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      description: 'Show this post as featured on the blog homepage',
      initialValue: false
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Name',
          type: 'string',
          validation: Rule => Rule.required()
        },
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            }
          ]
        }
      ]
    })
  ],
  orderings: [
    {
      title: 'Publish Date, New',
      name: 'publishDateDesc',
      by: [
        { field: 'publishDate', direction: 'desc' }
      ]
    },
    {
      title: 'Created Date, New',
      name: 'createdDateDesc',
      by: [
        { field: '_createdAt', direction: 'desc' }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'categories.0',
      media: 'featuredImage',
      status: 'status'
    },
    prepare(selection) {
      const { title, subtitle, media, status } = selection
      return {
        title: title,
        subtitle: `${subtitle} - ${status}`,
        media: media
      }
    }
  }
})
