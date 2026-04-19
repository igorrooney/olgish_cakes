import { defineField, defineType } from 'sanity'
import { getFaqAnswerToneWarning, getFaqQuestionToneWarning } from './faqTone'

export default defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      description: 'Write this like a real customer message. It should sound like something somebody would type when they are trying to order a cake.',
      validation: (rule) => [
        rule.required(),
        rule
          .custom((value) => getFaqQuestionToneWarning(typeof value === 'string' ? value : undefined))
          .warning()
      ],
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      description: 'Reply like the owner answering a customer directly. Use plain English, mention real limits or next steps, and prefer Leeds / delivery / posted-cake specifics over polished filler.',
      validation: (rule) => [
        rule.required(),
        rule
          .custom((value) => getFaqAnswerToneWarning(typeof value === 'string' ? value : undefined))
          .warning()
      ],
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first.',
      validation: (rule) => rule.required().min(0),
    }),
  ],
  preview: {
    select: {
      title: 'question',
      subtitle: 'answer',
    },
  },
})
