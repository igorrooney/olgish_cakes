export default {
  name: "cake",
  title: "Cakes",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Cake Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "size",
      title: "Size",
      type: "string",
      options: {
        list: [
          { title: "6 inch", value: "6" },
          { title: "8 inch", value: "8" },
          { title: "10 inch", value: "10" },
          { title: "12 inch", value: "12" },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "pricing",
      title: "Pricing",
      type: "object",
      fields: [
        {
          name: "standard",
          title: "Standard Design Price",
          type: "number",
          validation: (Rule: any) => Rule.required().min(0),
        },
        {
          name: "individual",
          title: "Individual Design Price",
          type: "number",
          validation: (Rule: any) => Rule.required().min(0),
        },
      ],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "designs",
      title: "Cake Designs",
      type: "object",
      fields: [
        {
          name: "standard",
          title: "Standard Design",
          type: "array",
          of: [
            {
              type: "image",
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: "isMain",
                  title: "Use as Main Image",
                  type: "boolean",
                  initialValue: false,
                },
                {
                  name: "alt",
                  title: "Alternative Text",
                  type: "string",
                },
              ],
            },
          ],
          validation: (Rule: any) => Rule.required().min(1),
        },
        {
          name: "individual",
          title: "Individual Design Examples",
          type: "array",
          of: [
            {
              type: "image",
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: "isMain",
                  title: "Use as Main Image",
                  type: "boolean",
                  initialValue: false,
                },
                {
                  name: "alt",
                  title: "Alternative Text",
                  type: "string",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Traditional", value: "traditional" },
          { title: "Seasonal", value: "seasonal" },
          { title: "Custom", value: "custom" },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "ingredients",
      title: "Ingredients",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "allergens",
      title: "Allergens",
      type: "array",
      of: [{ type: "string" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      media: "designs.standard.0",
    },
  },
};
