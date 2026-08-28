import { createElement, type ReactNode } from 'react'
import { defineField, defineType } from 'sanity'
import {
  isExternalReviewSource
} from '../../lib/testimonials/review-source'
import { validateTestimonialSourceUrl } from './testimonialSourceEvidence'

const fallbackPreviewMedia: ReactNode = createElement('img', {
  src: '/images/placeholder-cake.jpg',
  alt: 'Cake placeholder',
  style: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
})

type TestimonialPreviewSelection = {
  title?: string
  subtitle?: string
  media?: unknown
}

export default defineType({
  name: 'testimonial',
  title: 'Testimonials',
  type: 'document',
  fields: [
    defineField({
      name: 'customerName',
      title: 'Customer name',
      type: 'string',
      description: 'Name or initials approved for public display.'
    }),
    defineField({
      name: 'cakeType',
      title: 'Cake type',
      type: 'string'
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: 'Rating recorded by the source, from 1 to 5.',
      validation: (rule) => rule.required().min(1).max(5)
    }),
    defineField({
      name: 'date',
      title: 'Review date',
      type: 'date',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'title',
      title: 'Review title',
      type: 'string'
    }),
    defineField({
      name: 'text',
      title: 'Review text',
      type: 'text',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'cakeImage',
      title: 'Cake image',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'source',
      title: 'Review source',
      type: 'string',
      options: {
        list: [
          { title: 'Instagram', value: 'instagram' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'Google', value: 'google' },
          { title: 'Trustpilot', value: 'trustpilot' },
          { title: 'Direct', value: 'direct' },
          { title: 'Historical customer record', value: 'historical' }
        ]
      }
    }),
    defineField({
      name: 'sourceUrl',
      title: 'External source URL',
      type: 'url',
      description: 'Optional link to the original external review.',
      hidden: ({ document }) => !isExternalReviewSource(document?.source),
      validation: (rule) => rule.uri({ scheme: ['https'] }).custom((value, context) => {
        return validateTestimonialSourceUrl(
          value,
          context.document?.source
        )
      })
    }),
    defineField({
      name: 'sourceReviewId',
      title: 'Platform review ID',
      type: 'string',
      description: 'Optional identifier shown by the external platform.',
      hidden: ({ document }) => !isExternalReviewSource(document?.source)
    }),
    defineField({
      name: 'incentivised',
      title: 'Incentivised review',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'incentiveDisclosure',
      title: 'Public incentive disclosure',
      type: 'string',
      description: 'Plain-language disclosure displayed beside an incentivised review.',
      hidden: ({ document }) => document?.incentivised !== true
    })
  ],
  preview: {
    select: {
      title: 'customerName',
      subtitle: 'cakeType',
      media: 'cakeImage'
    },
    prepare({
      title,
      subtitle,
      media
    }: TestimonialPreviewSelection) {
      return {
        title: title || 'Customer review',
        subtitle: subtitle || 'Cake testimonial',
        media: (media as ReactNode) || fallbackPreviewMedia
      }
    }
  }
})
