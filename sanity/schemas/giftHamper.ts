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
      name: "name",
      title: "Hamper Name",
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
      validation: (Rule: any) => Rule.min(0).precision(2),
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
