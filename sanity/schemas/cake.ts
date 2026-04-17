import { CakeCollectionsInput } from '../components/CakeCollectionsInput'
import { CakeFillingTypesInput } from '../components/CakeFillingTypesInput'
import { CakeServingsPricingInput } from '../components/CakeServingsPricingInput'
import { validateCakeServingsPricing } from '../components/cakeServingsPricingDefaults'
import { defaultDeliveryMethod, supportedDeliveryMethods } from '../../types/deliveryPolicy'

interface ValidationContext {
  document?: {
    _id?: string
    _type?: string
    isBestseller?: boolean
    fillingTypes?: Array<{ _ref?: string }>
    defaultFillingType?: { _ref?: string }
  }
  getClient: (options?: { apiVersion?: string }) => {
    fetch: <T = unknown>(query: string, params?: Record<string, unknown>) => Promise<T>
  }
  parent?: {
    order?: number
    descriptionSource?: 'global' | 'custom'
    dispatchMinDays?: number
  }
}

interface DuplicateDocument {
  _id: string
  name: string
  order: number
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

const requiredWhenBestseller = (fieldLabel: string) => {
  return (value: unknown, context: ValidationContext) => {
    if (!context.document?.isBestseller) return true

    const isEmptyString = typeof value === 'string' && value.trim() === ''
    const isEmptyArray = Array.isArray(value) && value.length === 0

    if (value === undefined || value === null || isEmptyString || isEmptyArray) {
      return `${fieldLabel} is required when Bestseller is enabled.`
    }

    return true
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
function toBaseReferenceId(referenceId: string) {
  return referenceId.startsWith('drafts.')
    ? referenceId.slice('drafts.'.length)
    : referenceId
}

function toReferenceIdVariants(referenceId: string) {
  const baseReferenceId = toBaseReferenceId(referenceId)

  return [baseReferenceId, `drafts.${baseReferenceId}`]
}

function getSelectedFillingTypeReferenceIds(document: ValidationContext['document']) {
  if (!Array.isArray(document?.fillingTypes)) {
    return []
  }

  const referenceIds = document.fillingTypes.flatMap((fillingTypeReference) => {
    if (typeof fillingTypeReference?._ref !== 'string' || fillingTypeReference._ref.length === 0) {
      return []
    }

    return toReferenceIdVariants(fillingTypeReference._ref)
  })

  return Array.from(new Set(referenceIds))
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
  name: "cake",
  title: "Cakes",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Cake Name",
      type: "string",
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: "order",
      title: "[Not used] Display Order",
      type: "number",
      deprecated: {
        reason: 'Not used by the current website as the primary sorting control. Products Display Order is the active sorting source. Keep for legacy fallback compatibility until release branch no longer depends on it.'
      },
      description: "Not used by the current website as the primary sorting control. Products Display Order is the active sorting source. Keep for legacy fallback compatibility until the release branch no longer depends on it.",
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
                `*[_type == "cake" && order == $order && _id != $currentId] {
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
      name: 'isBestseller',
      title: 'Bestseller',
      type: 'boolean',
      description: 'Show this cake in the bestsellers carousel (max 3)',
      initialValue: false,
      validation: (Rule: ValidationRule) =>
        Rule.custom(async (value: unknown, context: ValidationContext) => {
          if (value !== true) return true

          const { document, getClient } = context
          const client = getClient({ apiVersion: '2025-03-31' })
          const currentId = document?._id || ''
          const publishedId = currentId.replace(/^drafts\./, '')
          const draftId = publishedId ? `drafts.${publishedId}` : ''

          try {
            const count = await client.fetch<number>(
              'count(*[_type == "cake" && isBestseller == true && !(_id in path("drafts.**")) && !(_id in [$currentId, $draftId, $publishedId])])',
              { currentId, draftId, publishedId }
            )

            if (count >= 3) {
              return 'You can select at most 3 bestseller cakes. Uncheck another cake first.'
            }
          } catch (error: unknown) {
            console.warn('Failed to validate bestseller limit:', error)
          }

          return true
        })
    },
    {
      name: 'bestsellerCustomerStory',
      title: 'Bestseller Customer Story',
      type: 'text',
      description: 'Short quote shown in the Bestsellers section',
      hidden: ({ document }: { document?: { isBestseller?: boolean } }) => !document?.isBestseller,
      validation: (Rule: ValidationRule) => Rule.custom(requiredWhenBestseller('Customer story'))
    },
    {
      name: 'bestsellerStoryDetails',
      title: 'Bestseller Story Details',
      type: 'string',
      description: 'Who the cake was made for and the occasion',
      hidden: ({ document }: { document?: { isBestseller?: boolean } }) => !document?.isBestseller,
      validation: (Rule: ValidationRule) => Rule.custom(requiredWhenBestseller('Story details'))
    },
    {
      name: 'bestsellerShortDescription',
      title: 'Bestseller Short Description',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'H5', value: 'h5' },
            { title: 'H6', value: 'h6' },
            { title: 'Quote', value: 'blockquote' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' }
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url'
                  }
                ]
              }
            ]
          },
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' }
          ]
        }
      ],
      description: 'Short description shown in the Bestsellers section',
      hidden: ({ document }: { document?: { isBestseller?: boolean } }) => !document?.isBestseller,
      validation: (Rule: ValidationRule) => Rule.custom(requiredWhenBestseller('Bestseller short description'))
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
              validation: (Rule: ValidationRule) => Rule.required(),
            },
            {
              name: "caption",
              title: "Caption",
              type: "string",
              deprecated: {
                reason: 'Not used by the current website. Keep for old design compatibility until release branch no longer depends on it.'
              },
              description: "Optional caption for the image",
            },
          ],
        },
      ],
      validation: (Rule: ValidationRule) => Rule.required(),
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
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'deliverySection',
      title: 'Delivery Section',
      type: 'object',
      description: 'Configure delivery content for this cake page. The current website follows Description Source for both delivery text and delivery policy.',
      initialValue: {
        descriptionSource: 'global'
      },
      fields: [
        {
          name: 'descriptionSource',
          title: 'Description Source',
          type: 'string',
          initialValue: 'global',
          description: 'Current website switch for both delivery text and delivery policy.',
          options: {
            list: [
              { title: 'Use global cakes delivery description', value: 'global' },
              { title: 'Use custom description for this cake', value: 'custom' }
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
      name: "size",
      title: "[Not used] Size",
      type: "string",
      deprecated: {
        reason: 'Not used by the current website cake design. Keep for old design compatibility until release branch no longer depends on it.'
      },
      description: 'Not used by the current website cake design. Keep for old design compatibility until the release branch no longer depends on it.',
      options: {
        list: [
          { title: "6 inch", value: "6" },
          { title: "8 inch", value: "8" },
          { title: "10 inch", value: "10" },
          { title: "12 inch", value: "12" },
        ],
      },
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: "pricing",
      title: "[Not used] Pricing",
      type: "object",
      deprecated: {
        reason: 'Not used by the current website as the primary pricing source. New Design Pricing by Servings is the active pricing source. Keep for legacy fallback compatibility until release branch no longer depends on it.'
      },
      description: "Not used by the current website as the primary pricing source. New Design Pricing by Servings is the active pricing source. Keep for legacy fallback compatibility until the release branch no longer depends on it.",
      fields: [
        {
          name: "standard",
          title: "Standard Design Price",
          type: "number",
          validation: (Rule: ValidationRule) => Rule.required().min(0),
        },
        {
          name: "individual",
          title: "Individual Design Price",
          type: "number",
          validation: (Rule: ValidationRule) => Rule.required().min(0),
        },
      ],
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: "newDesignPricingByServings",
      title: "New Design Pricing by Servings",
      type: "object",
      description: "New design only. Legacy pricing.standard and pricing.individual remain for current production.",
      components: {
        input: CakeServingsPricingInput
      },
      initialValue: {
        servings2To4IsDefault: false,
        servings4To8IsDefault: true,
        servings8To12IsDefault: false,
        servings12To20IsDefault: false,
        servings20PlusIsDefault: false
      },
      fields: [
        {
          name: "servings2To4",
          title: "2-4 people",
          type: "number",
          validation: (Rule: ValidationRule) => Rule.min(0).precision(2),
        },
        {
          name: "servings2To4IsDefault",
          title: "Is default",
          type: "boolean",
          initialValue: false
        },
        {
          name: "servings4To8",
          title: "4-8 people",
          type: "number",
          validation: (Rule: ValidationRule) => Rule.min(0).precision(2),
        },
        {
          name: "servings4To8IsDefault",
          title: "Is default",
          type: "boolean",
          initialValue: true
        },
        {
          name: "servings8To12",
          title: "8-12 people",
          type: "number",
          validation: (Rule: ValidationRule) => Rule.min(0).precision(2),
        },
        {
          name: "servings8To12IsDefault",
          title: "Is default",
          type: "boolean",
          initialValue: false
        },
        {
          name: "servings12To20",
          title: "12-20 people",
          type: "number",
          validation: (Rule: ValidationRule) => Rule.min(0).precision(2),
        },
        {
          name: "servings12To20IsDefault",
          title: "Is default",
          type: "boolean",
          initialValue: false
        },
        {
          name: "servings20Plus",
          title: "20+ people",
          type: "number",
          validation: (Rule: ValidationRule) => Rule.min(0).precision(2),
        },
        {
          name: "servings20PlusIsDefault",
          title: "Is default",
          type: "boolean",
          initialValue: false
        },
      ],
      validation: (Rule: ValidationRule) => Rule
        .required()
        .custom((value: unknown) => validateCakeServingsPricing(value)),
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
          validation: (Rule: ValidationRule) => Rule.required(),
        },
        {
          name: "caption",
          title: "Caption",
          type: "string",
          deprecated: {
            reason: 'Not used by the current website. Keep for old design compatibility until release branch no longer depends on it.'
          },
          description: "Optional caption for the image",
        },
      ],
      validation: (Rule: ValidationRule) => Rule.required(),
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
              validation: (Rule: ValidationRule) => Rule.required(),
            },
            {
              name: "caption",
              title: "Caption",
              type: "string",
              deprecated: {
                reason: 'Not used by the current website. Keep for old design compatibility until release branch no longer depends on it.'
              },
              description: "Optional caption for the image",
            },
          ],
        },
      ],
    },
    {
      name: 'collections',
      title: 'Collection',
      type: 'array',
      description: 'Select one or more collections for this cake.',
      components: {
        input: CakeCollectionsInput
      },
      of: [
        {
          type: 'reference',
          to: [{ type: 'collection' }],
          options: {
            disableNew: true
          }
        }
      ],
    },
    {
      name: 'fillingTypes',
      title: 'Filling Types',
      type: 'array',
      description: 'Select one or more filling types for this cake.',
      components: {
        input: CakeFillingTypesInput
      },
      of: [
        {
          type: 'reference',
          to: [{ type: 'cakeFillingType' }],
          options: {
            disableNew: true
          }
        }
      ],
      validation: (Rule: ValidationRule) =>
        Rule.required()
          .min(1)
          .error('Select at least one filling type.')
    },
    {
      name: 'defaultFillingType',
      title: 'Default Filling Type For Order Form',
      type: 'reference',
      description: 'Select the filling type that should be preselected in the cake order form.',
      to: [{ type: 'cakeFillingType' }],
      options: {
        disableNew: true,
        filter: ({ document }: { document?: ValidationContext['document'] }) => {
          const selectedReferenceIds = getSelectedFillingTypeReferenceIds(document)

          if (selectedReferenceIds.length === 0) {
            return {
              filter: '_id == $emptySelectionId',
              params: {
                emptySelectionId: '__no_selected_filling_types__'
              }
            }
          }

          return {
            filter: '_id in $selectedReferenceIds',
            params: {
              selectedReferenceIds
            }
          }
        }
      },
      validation: (Rule: ValidationRule) =>
        Rule.required()
          .custom((value: unknown, context: ValidationContext) => {
            if (typeof value !== 'object' || value === null) {
              return 'Select a default filling type for the order form.'
            }

            const maybeReferenceValue = value as { _ref?: unknown }
            if (typeof maybeReferenceValue._ref !== 'string' || maybeReferenceValue._ref.length === 0) {
              return 'Select a default filling type for the order form.'
            }

            const selectedFillingTypeBaseIds = new Set(
              (context.document?.fillingTypes ?? [])
                .map((fillingTypeReference) => {
                  return typeof fillingTypeReference?._ref === 'string'
                    ? toBaseReferenceId(fillingTypeReference._ref)
                    : ''
                })
                .filter((referenceId) => referenceId.length > 0)
            )

            const selectedDefaultBaseId = toBaseReferenceId(maybeReferenceValue._ref)

            if (!selectedFillingTypeBaseIds.has(selectedDefaultBaseId)) {
              return 'Default filling type must be one of the selected filling types.'
            }

            return true
          })
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
        reason: 'Not used by the current website. Keep for old design compatibility until release branch no longer depends on it.'
      },
      description: 'Not used by the current website. Keep for old design compatibility until the release branch no longer depends on it.',
      of: [{ type: "string" }],
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: "allergens",
      title: "[Not used] Allergens",
      type: "array",
      deprecated: {
        reason: 'Not used by the current website. Keep for old design compatibility until release branch no longer depends on it.'
      },
      description: 'Not used by the current website. Keep for old design compatibility until the release branch no longer depends on it.',
      of: [{ type: "string" }],
    },
    {
      name: 'ingredientReference',
      title: 'Ingredients Source (New Design)',
      type: 'reference',
      to: [{ type: 'ingredient' }],
      description: 'Used on the current cake page as the primary ingredients source. If empty, the website shows a generic ingredients message.',
      options: {
        disableNew: true
      }
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
                  validation: (Rule: ValidationRule) => Rule.required(),
                },
                {
                  name: "caption",
                  title: "Caption",
                  type: "string",
                  deprecated: {
                    reason: 'Not used by the current website. Keep for old design compatibility until release branch no longer depends on it.'
                  },
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
                  validation: (Rule: ValidationRule) => Rule.required(),
                },
                {
                  name: "caption",
                  title: "Caption",
                  type: "string",
                  deprecated: {
                    reason: 'Not used by the current website. Keep for old design compatibility until release branch no longer depends on it.'
                  },
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
      title: "[Not used] Structured Data",
      type: "object",
      deprecated: {
        reason: 'Not used by the current website. Keep for old design compatibility until release branch no longer depends on it.'
      },
      description: 'Not used by the current website. Keep for old design compatibility until the release branch no longer depends on it.',
      fields: [
        {
          name: "enableProductSchema",
          title: "Enable Product Schema",
          type: "boolean",
          deprecated: {
            reason: 'Not used by the current website. Keep for old design compatibility until release branch no longer depends on it.'
          },
          initialValue: true,
          description: "Add structured data for product information",
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

