interface ValidationContext {
  document?: {
    _id?: string
    _type?: string
  }
  getClient: (options?: { apiVersion?: string }) => {
    fetch: <T = unknown>(query: string, params?: Record<string, unknown>) => Promise<T>
  }
  parent?: {
    order?: number
  }
}

interface DuplicateDocument {
  _id: string
  name: string
  order: number
}

interface ValidationRule {
  required: () => ValidationRule
  min: (value: number) => ValidationRule & { integer: () => ValidationRule & { custom: (fn: (value: number | undefined, context: ValidationContext) => Promise<true | string>) => unknown } }
  max: (value: number) => ValidationRule
  integer: () => ValidationRule
  custom: (fn: (value: unknown, context: ValidationContext) => Promise<true | string> | true | string) => unknown
  precision: (value: number) => ValidationRule
  warning: (message: string) => ValidationRule
  error: (message: string) => ValidationRule
}

export default {
  name: "giftHamper",
  title: "Gift Hampers",
  type: "document",
  fields: [
    {
      name: "isFeatured",
      title: "Featured",
      type: "boolean",
      description: "Show this hamper in the Featured Gift Hampers section on the homepage",
      initialValue: false,
    },
    {
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Set the order in which this hamper appears on the frontend. Lower numbers appear first. Leave empty to use creation date.",
      validation: (Rule: ValidationRule) =>
        Rule.min(0)
          .integer()
          .custom(async (orderNumber: unknown, context: ValidationContext): Promise<true | string> => {
            // If no order value provided, validation passes
            if (orderNumber === undefined || orderNumber === null || typeof orderNumber !== 'number') {
              return true
            }
            
            // Check for duplicate order numbers
            const { document, getClient } = context
            const client = getClient({ apiVersion: '2025-03-31' })
            const currentId = document?._id
            
            try {
              const duplicates = await client.fetch<DuplicateDocument[]>(
                `*[_type == "giftHamper" && order == $order && _id != $currentId] {
                  _id,
                  name,
                  order
                }`,
                { order: orderNumber, currentId: currentId || '' }
              )
              
              if (duplicates.length > 0) {
                const duplicateNames = duplicates.map((d: DuplicateDocument) => d.name).join(', ')
                return `Order number ${orderNumber} is already used by: ${duplicateNames}. Please use a unique order number.`
              }
            } catch (error: unknown) {
              // If fetch fails, just pass validation (don't block)
              console.warn('Failed to check for duplicate order numbers:', error)
            }
            
            return true
          }),
    },
    {
      name: "name",
      title: "Hamper Name",
      type: "string",
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule: ValidationRule) => Rule.required(),
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
          validation: (Rule: ValidationRule) =>
            Rule.max(60).warning("Meta title should be under 60 characters"),
        },
        {
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          description: "Description for search engines (150-160 characters recommended)",
          validation: (Rule: ValidationRule) =>
            Rule.max(160).warning("Meta description should be under 160 characters"),
        },
        {
          name: "keywords",
          title: "Keywords",
          type: "array",
          of: [{ type: "string" }],
          description: "Relevant keywords for this hamper",
        },
        {
          name: "canonicalUrl",
          title: "Canonical URL",
          type: "url",
          description: "Canonical URL if different from the page URL",
        },
        {
          name: "priority",
          title: "Sitemap Priority",
          type: "number",
          options: { list: [1.0, 0.9, 0.8, 0.7, 0.6] },
        },
        {
          name: "changefreq",
          title: "Sitemap Change Frequency",
          type: "string",
          options: {
            list: ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"],
          },
        },
        {
          name: "faq",
          title: "FAQ",
          type: "array",
          description: "Optional FAQs to display as rich results",
          of: [
            {
              type: "object",
              fields: [
                { name: "question", title: "Question", type: "string", validation: (Rule: ValidationRule) => Rule.required() },
                { name: "answer", title: "Answer", type: "text", validation: (Rule: ValidationRule) => Rule.required() },
              ],
              preview: {
                select: { title: "question", subtitle: "answer" },
              },
            },
          ],
        },
      ],
    },
    {
      name: "shortDescription",
      title: "Short Description",
      type: "array",
      of: [{ type: "block" }],
      description: "Brief description used in listings and SEO",
    },
    {
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule: ValidationRule) => Rule.min(0).precision(2),
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Chocolate", value: "chocolate" },
          { title: "Assorted", value: "assorted" },
          { title: "Seasonal", value: "seasonal" },
          { title: "Premium", value: "premium" },
        ],
      },
    },
    {
      name: "ingredients",
      title: "Ingredients",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "allergens",
      title: "Allergens",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "images",
      title: "Additional Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", title: "Alt text", type: "string" },
            { name: "caption", title: "Caption", type: "string" },
            { name: "isMain", title: "Use as main image", type: "boolean" },
          ],
        },
      ],
      description: "Optional gallery images shown on the hamper page",
    },
  ],
  preview: {
    select: {
      title: "name",
      media: "mainImage",
      subtitle: "category",
    },
  },
};
