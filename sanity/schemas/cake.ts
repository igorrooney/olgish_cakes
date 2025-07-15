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
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H1", value: "h1" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "H5", value: "h5" },
            { title: "H6", value: "h6" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                title: "URL",
                name: "link",
                type: "object",
                fields: [
                  {
                    title: "URL",
                    name: "href",
                    type: "url",
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "shortDescription",
      title: "Short Description",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H1", value: "h1" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "H5", value: "h5" },
            { title: "H6", value: "h6" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                title: "URL",
                name: "link",
                type: "object",
                fields: [
                  {
                    title: "URL",
                    name: "href",
                    type: "url",
                  },
                ],
              },
            ],
          },
        },
      ],
      description: "A brief summary of the cake with basic formatting",
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
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "images",
      title: "Additional Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
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
    {
      name: "designs",
      title: "Designs",
      type: "object",
      fields: [
        {
          name: "standard",
          title: "Standard Designs",
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
                  title: "Is Main Image",
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
        {
          name: "individual",
          title: "Individual Designs",
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
                  title: "Is Main Image",
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
  ],
  preview: {
    select: {
      title: "name",
      media: "mainImage",
    },
  },
};
