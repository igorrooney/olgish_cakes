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
      name: "seo",
      title: "SEO Settings",
      type: "object",
      fields: [
        {
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
          description: "Title for search engines (50-60 characters recommended)",
          validation: (Rule: any) =>
            Rule.max(60).warning("Meta title should be under 60 characters"),
        },
        {
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          description: "Description for search engines (150-160 characters recommended)",
          validation: (Rule: any) =>
            Rule.max(160).warning("Meta description should be under 160 characters"),
        },
        {
          name: "keywords",
          title: "Keywords",
          type: "array",
          of: [{ type: "string" }],
          description: "Relevant keywords for this cake",
        },
        {
          name: "canonicalUrl",
          title: "Canonical URL",
          type: "url",
          description: "Canonical URL if different from the page URL",
        },
      ],
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
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
        },
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              title: "Alternative Text",
              type: "string",
              description: "Important for accessibility and SEO",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "caption",
              title: "Caption",
              type: "string",
              description: "Optional caption for the image",
            },
          ],
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
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
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
      fields: [
        {
          name: "alt",
          title: "Alternative Text",
          type: "string",
          description: "Important for accessibility and SEO",
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: "caption",
          title: "Caption",
          type: "string",
          description: "Optional caption for the image",
        },
      ],
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
          fields: [
            {
              name: "alt",
              title: "Alternative Text",
              type: "string",
              description: "Important for accessibility and SEO",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "caption",
              title: "Caption",
              type: "string",
              description: "Optional caption for the image",
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
                  description: "Important for accessibility and SEO",
                  validation: (Rule: any) => Rule.required(),
                },
                {
                  name: "caption",
                  title: "Caption",
                  type: "string",
                  description: "Optional caption for the image",
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
                  description: "Important for accessibility and SEO",
                  validation: (Rule: any) => Rule.required(),
                },
                {
                  name: "caption",
                  title: "Caption",
                  type: "string",
                  description: "Optional caption for the image",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "structuredData",
      title: "Structured Data",
      type: "object",
      fields: [
        {
          name: "enableProductSchema",
          title: "Enable Product Schema",
          type: "boolean",
          initialValue: true,
          description: "Add structured data for product information",
        },
        {
          name: "brand",
          title: "Brand",
          type: "string",
          initialValue: "Olgish Cakes",
          description: "Brand name for structured data",
        },
        {
          name: "availability",
          title: "Availability",
          type: "string",
          options: {
            list: [
              { title: "In Stock", value: "InStock" },
              { title: "Out of Stock", value: "OutOfStock" },
              { title: "Preorder", value: "PreOrder" },
              { title: "Discontinued", value: "Discontinued" },
            ],
          },
          initialValue: "InStock",
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
