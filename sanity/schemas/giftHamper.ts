import { GiftHamperCollectionsInput } from '../components/GiftHamperCollectionsInput'
import type { ReactNode } from 'react'
import { defaultDeliveryMethod, supportedDeliveryMethods } from '../../types/deliveryPolicy'

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
    descriptionSource?: string
    dispatchMinDays?: number
  }
}

interface ValidationRule {
  required: () => ValidationRule
  min: (value: number) => ValidationRule & { integer: () => ValidationRule & { custom: (fn: (value: number | undefined, context: ValidationContext) => Promise<true | string>) => ValidationRule } }
  max: (value: number) => ValidationRule
  integer: () => ValidationRule
  custom: (fn: (value: unknown, context: ValidationContext) => Promise<true | string> | true | string) => ValidationRule
  precision: (value: number) => ValidationRule
  warning: (message: string) => ValidationRule
  error: (message: string) => ValidationRule
}

interface PreviewImageValue {
  asset?: {
    _ref?: string
  }
}

const deliveryTimingPattern = /(\d+)\s*(?:-|to|\u2013|\u2014)\s*(?:\d+)\s*(?:working\s*)?days?/i
const deliveryCostPattern = /\b(?:free|paid|extra|additional)\b[^\n.]{0,40}\b(?:delivery|shipping)\b|\b(?:delivery|shipping)\b[^\n.]{0,40}\b(?:free|paid|extra|additional)\b|\b(?:delivery|shipping)\b[^\n.]{0,40}(?:\u00A3\s*\d+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?\s*gbp)\b|(?:\u00A3\s*\d+(?:\.\d{1,2})?|\b\d+(?:\.\d{1,2})?\s*gbp\b)[^\n.]{0,40}\b(?:delivery|shipping)\b/i
const deliveryOrShippingPattern = /\b(?:delivery|shipping)\b/i
const deliveryCountryNamePattern = /\b(?:uk|u\.k\.|united kingdom|great britain|gb)\b/i
const deliveryMethodPattern = /\b(?:pickup|pick[\s-]?up|collection|collect in person|click and collect|by\s+post|postal(?:\s+delivery)?|mail(?:\s+delivery)?|cake[-\s]?by[-\s]?post)\b/i
const deliverySegmentDelimiterPattern = /(?:(?<!\d)\.|\.(?!\d)|[!?]|\n)+/
const supportedDeliveryMethodSet = new Set<string>(supportedDeliveryMethods)
const deliveryMethodOptions = supportedDeliveryMethods.map((method) => ({
  title: method === defaultDeliveryMethod ? 'Mail delivery (default)' : method,
  value: method
}))
const imageArrayEditorOptions = {
  layout: 'grid' as const,
  modal: {
    type: 'popover' as const,
    width: 'auto' as const
  }
}

function extractDeliveryContextSegments(text: string) {
  return text
    .split(deliverySegmentDelimiterPattern)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .filter((segment) => deliveryOrShippingPattern.test(segment))
}

function hasExplicitCountryClaim(text: string) {
  const deliverySegments = extractDeliveryContextSegments(text)

  return deliverySegments.some((segment) => {
    return deliveryCountryNamePattern.test(segment)
  })
}

function portableTextToPlainText(value: unknown) {
  if (!Array.isArray(value)) {
    return ''
  }

  return value
    .map((block) => {
      if (typeof block !== 'object' || block === null) {
        return ''
      }

      const maybeBlock = block as { children?: Array<{ text?: string }> }
      const children = Array.isArray(maybeBlock.children)
        ? maybeBlock.children
        : []

      return children
        .map((child) => {
          return typeof child?.text === 'string'
            ? child.text
            : ''
        })
        .join(' ')
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasExplicitDeliveryClaims(value: unknown) {
  const plainText = portableTextToPlainText(value)
  if (plainText.length === 0) {
    return false
  }

  return (
    deliveryTimingPattern.test(plainText) ||
    deliveryCostPattern.test(plainText) ||
    hasExplicitCountryClaim(plainText) ||
    deliveryMethodPattern.test(plainText)
  )
}

export default {
  name: "giftHamper",
  title: "Gift Hampers",
  type: "document",
  fields: [
    {
      name: "isFeatured",
      title: "[Not used] Featured",
      type: "boolean",
      deprecated: {
        reason: 'Not used by the current website. Keep for old design compatibility until release branch no longer depends on it.'
      },
      description: 'Not used by the current website. Keep for old design compatibility until the release branch no longer depends on it.',
      initialValue: false,
    },
    {
      name: "order",
      title: "[Not used] Display Order",
      type: "number",
      deprecated: {
        reason: 'Ignored by the current website. Products Display Order is the only active sorting source. Keep only for legacy content compatibility until release branch no longer depends on it.'
      },
      description: 'Ignored by the current website. Products Display Order is the only active sorting source. Keep only for legacy content compatibility until the release branch no longer depends on it.',
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
          title: "[Not needed for Google SEO] Keywords",
          type: "array",
          deprecated: {
            reason: 'Not needed for Google SEO because Google does not use the meta keywords tag. Keep only for old design compatibility until release branch no longer depends on it.'
          },
          of: [{ type: "string" }],
          description: "Not needed for Google SEO because Google does not use the meta keywords tag. Keep only for old design compatibility until the release branch no longer depends on it.",
        },
        {
          name: "priority",
          title: "[Not needed for Google SEO] Sitemap Priority",
          type: "number",
          deprecated: {
            reason: 'Not needed for Google SEO because Google ignores sitemap priority. Keep only for old design compatibility until release branch no longer depends on it.'
          },
          description: 'Not needed for Google SEO because Google ignores sitemap priority. Keep only for old design compatibility until the release branch no longer depends on it.',
          options: { list: [1.0, 0.9, 0.8, 0.7, 0.6] },
        },
        {
          name: "changefreq",
          title: "[Not needed for Google SEO] Sitemap Change Frequency",
          type: "string",
          deprecated: {
            reason: 'Not needed for Google SEO because Google ignores sitemap changefreq. Keep only for old design compatibility until release branch no longer depends on it.'
          },
          description: 'Not needed for Google SEO because Google ignores sitemap changefreq. Keep only for old design compatibility until the release branch no longer depends on it.',
          options: {
            list: ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"],
          },
        },
        {
          name: "faq",
          title: "[Not used] FAQ",
          type: "array",
          deprecated: {
            reason: 'Not used by the current website. Keep for old design compatibility until release branch no longer depends on it.'
          },
          description: 'Not used by the current website. Keep for old design compatibility until the release branch no longer depends on it.',
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
      name: 'deliverySection',
      title: 'Delivery Section',
      type: 'object',
      description: 'Configure delivery content for this gift hamper page. Description Source controls both delivery text and delivery policy.',
      initialValue: {
        descriptionSource: 'global'
      },
      fields: [
        {
          name: 'descriptionSource',
          title: 'Description Source',
          type: 'string',
          initialValue: 'global',
          options: {
            list: [
              { title: 'Use global gift hampers delivery description', value: 'global' },
              { title: 'Use custom description for this gift hamper', value: 'custom' }
            ],
            layout: 'dropdown'
          },
          validation: (Rule: ValidationRule) => Rule.required()
        },
        {
          name: 'customDescription',
          title: 'Custom Delivery Description',
          type: 'array',
          of: [
            {
              type: 'block'
            }
          ],
          hidden: ({ parent }: { parent?: { descriptionSource?: string } }) => parent?.descriptionSource !== 'custom',
          validation: (Rule: ValidationRule) => [
            Rule.custom((value: unknown, context: ValidationContext) => {
              if (context.parent?.descriptionSource !== 'custom') {
                return true
              }

              if (!Array.isArray(value) || value.length === 0) {
                return 'Custom delivery description is required when custom source is selected.'
              }

              return true
            }),
            Rule.custom((value: unknown) => {
              if (!hasExplicitDeliveryClaims(value)) {
                return true
              }

              return 'Custom delivery description includes explicit timing or shipping-cost claims. Keep these aligned with delivery policy fields.'
            }).warning('Review custom delivery text against policy fields.')
          ]
        },
        {
          name: 'customPolicy',
          title: 'Custom Delivery Policy',
          type: 'object',
          hidden: ({ parent }: { parent?: { descriptionSource?: string } }) => parent?.descriptionSource !== 'custom',
          initialValue: {
            dispatchMinDays: 2,
            dispatchMaxDays: 3,
            shippingFeeGbp: 0,
            shippingDestinationCountry: 'GB',
            deliveryMethod: defaultDeliveryMethod
          },
          fields: [
            {
              name: 'dispatchMinDays',
              title: 'Dispatch Min Days',
              type: 'number',
              validation: (Rule: ValidationRule) => Rule.required().integer().min(0)
            },
            {
              name: 'dispatchMaxDays',
              title: 'Dispatch Max Days',
              type: 'number',
              validation: (Rule: ValidationRule) => [
                Rule.required().integer().min(0),
                Rule.custom((value: unknown, context: ValidationContext) => {
                  if (typeof value !== 'number') {
                    return true
                  }

                  const minDispatchDays = context.parent?.dispatchMinDays
                  if (typeof minDispatchDays === 'number' && value < minDispatchDays) {
                    return 'Dispatch max days must be greater than or equal to dispatch min days.'
                  }

                  return true
                })
              ]
            },
            {
              name: 'shippingFeeGbp',
              title: 'Shipping Fee (GBP)',
              type: 'number',
              validation: (Rule: ValidationRule) => Rule.required().min(0).precision(2)
            },
            {
              name: 'shippingDestinationCountry',
              title: 'Shipping Destination Country (ISO)',
              type: 'string',
              validation: (Rule: ValidationRule) => Rule.required().min(2).max(2)
            },
            {
              name: 'deliveryMethod',
              title: 'Delivery Method URI',
              type: 'string',
              initialValue: defaultDeliveryMethod,
              options: {
                list: deliveryMethodOptions,
                layout: 'dropdown'
              },
              validation: (Rule: ValidationRule) =>
                Rule.required().custom((value: unknown) => {
                  if (typeof value !== 'string' || !supportedDeliveryMethodSet.has(value)) {
                    return 'Delivery method must be one of the supported method URIs.'
                  }

                  return true
                })
            }
          ],
          validation: (Rule: ValidationRule) =>
            Rule.custom((value: unknown, context: ValidationContext) => {
              if (context.parent?.descriptionSource !== 'custom') {
                return true
              }

              if (typeof value !== 'object' || value === null) {
                return 'Custom delivery policy is required when custom description source is selected.'
              }

              return true
            })
        }
      ]
    },
    {
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule: ValidationRule) => Rule.min(0).precision(2),
    },
    {
      name: 'collections',
      title: 'Collections',
      type: 'array',
      description: 'Select one or more gift hamper collections.',
      components: {
        input: GiftHamperCollectionsInput
      },
      of: [
        {
          type: 'reference',
          to: [{ type: 'giftHamperCollection' }],
          options: {
            disableNew: true
          }
        }
      ],
    },
    {
      name: 'category',
      title: 'Category (Legacy)',
      type: 'string',
      hidden: true,
      readOnly: true
    },
    {
      name: "ingredients",
      title: "[Not used] Ingredients",
      type: "array",
      deprecated: {
        reason: 'Not used by the current website. Ingredient Reference is the active ingredients source. Keep for old design compatibility until release branch no longer depends on it.'
      },
      description: 'Not used by the current website. Ingredient Reference is the active ingredients source. Keep for old design compatibility until the release branch no longer depends on it.',
      of: [{ type: "string" }],
    },
    {
      name: 'ingredientReference',
      title: 'Ingredients Source (New Design)',
      type: 'reference',
      to: [{ type: 'ingredient' }],
      description: 'Used on the current gift hamper page as the primary ingredients source. If empty, the website shows a generic ingredients message.',
      options: {
        disableNew: true
      }
    },
    {
      name: 'allergens',
      title: '[Not used] Allergens',
      type: 'array',
      deprecated: {
        reason: 'Not used by the current website. Ingredient Reference is the active ingredients source and allergen details are handled there or shared on request. Keep for old design compatibility until release branch no longer depends on it.'
      },
      description: 'Not used by the current website. Ingredient Reference is the active ingredients source and allergen details are handled there or shared on request. Keep for old design compatibility until the release branch no longer depends on it.',
      of: [{ type: 'string' }]
    },
    {
      name: "images",
      title: "Additional Images",
      type: "array",
      options: imageArrayEditorOptions,
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", title: "Alt text", type: "string" },
            {
              name: "caption",
              title: "Caption",
              type: "string",
              deprecated: {
                reason: 'Not used by the current website. Keep for old design compatibility until release branch no longer depends on it.'
              },
              description: "Optional caption for the image",
            },
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
      images: "images",
      legacyMainImage: "mainImage",
      subtitle: "category",
    },
    prepare({
      title,
      subtitle,
      images,
      legacyMainImage
    }: {
      title?: string
      subtitle?: string
      images?: PreviewImageValue[]
      legacyMainImage?: PreviewImageValue
    }) {
      const firstImageWithAsset = images?.find((image) => Boolean(image?.asset?._ref))
      const media = firstImageWithAsset || (legacyMainImage?.asset?._ref ? legacyMainImage : undefined)

      return {
        title,
        subtitle,
        media: media as unknown as ReactNode
      }
    },
  },
};

