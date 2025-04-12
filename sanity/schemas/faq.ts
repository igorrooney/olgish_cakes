import { defineField, defineType } from "sanity";

export default defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which the FAQ should appear (lower numbers appear first)",
      validation: Rule => Rule.required().min(0),
    }),
  ],
  preview: {
    select: {
      title: "question",
      subtitle: "answer",
    },
  },
});
