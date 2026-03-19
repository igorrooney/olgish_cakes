import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'ingredient',
  title: 'Ingredients',
  type: 'document',
  fields: [
    defineField({
      name: 'cakeName',
      title: 'Cake Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'ingredients',
      title: 'Ingredients',
      type: 'array',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required()
    })
  ],
  preview: {
    select: {
      title: 'cakeName'
    }
  }
})
