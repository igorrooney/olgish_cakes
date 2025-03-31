import { defineField, defineType } from "sanity";

export const cakes = defineType({
    name: "cakes",
    title: "Cakes",
    type: "document",
    fields: [
        defineField({
            name: 'title',
            type: 'string',
        }),
        defineField({
            name: 'slug',
            type: 'slug',
            options: {
                source: 'title'
            }
        }),
        defineField({
            name: 'cakeName',
            type: 'string',

        }),
        defineField({
            name: 'cakeDescription',
            type: 'text',
        }),
        defineField({
            name: 'cakePrice',
            type: 'number',
        }),
        defineField({
            name: 'cakeImage',
            type: 'url',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'size',
            type: 'string',
        }),
        defineField({
            name: 'views',
            type: 'number',
        })
    ],
})