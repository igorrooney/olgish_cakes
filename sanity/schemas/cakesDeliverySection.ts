import { defineField, defineType } from 'sanity'
import { defaultDeliveryMethod, supportedDeliveryMethods } from '../../types/deliveryPolicy'

const deliveryTimingPattern = /(\d+)\s*(?:-|to|\u2013|\u2014)\s*(?:\d+)\s*(?:(?:working|business)\s*)?days?/i
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

function getDispatchMinDays(parent: unknown) {
  if (typeof parent !== 'object' || parent === null) {
    return null
  }

  const maybeParent = parent as { dispatchMinDays?: unknown }

  return typeof maybeParent.dispatchMinDays === 'number'
    ? maybeParent.dispatchMinDays
    : null
}

export default defineType({
  name: 'cakesDeliverySection',
  title: 'Cakes Delivery Section',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Section Name',
      type: 'string',
      initialValue: 'Delivery',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ],
      validation: Rule => [
        Rule.required().min(1),
        Rule.custom((value: unknown) => {
          if (!hasExplicitDeliveryClaims(value)) {
            return true
          }

          return 'Delivery copy includes explicit timing or shipping-cost claims. Keep these aligned with Policy fields for structured data consistency.'
        }).warning('Review delivery text against Policy fields.')
      ]
    }),
    defineField({
      name: 'policy',
      title: 'Policy',
      type: 'object',
      initialValue: {
        dispatchMinDays: 2,
        dispatchMaxDays: 3,
        shippingFeeGbp: 0,
        shippingDestinationCountry: 'GB',
        deliveryMethod: defaultDeliveryMethod
      },
      fields: [
        defineField({
          name: 'dispatchMinDays',
          title: 'Dispatch Min Days',
          type: 'number',
          validation: Rule => Rule.required().integer().min(0)
        }),
        defineField({
          name: 'dispatchMaxDays',
          title: 'Dispatch Max Days',
          type: 'number',
          validation: Rule => [
            Rule.required().integer().min(0),
            Rule.custom((value: unknown, context) => {
              if (typeof value !== 'number') {
                return true
              }

              const minDispatchDays = getDispatchMinDays(context.parent)

              if (typeof minDispatchDays === 'number' && value < minDispatchDays) {
                return 'Dispatch max days must be greater than or equal to dispatch min days.'
              }

              return true
            })
          ]
        }),
        defineField({
          name: 'shippingFeeGbp',
          title: 'Shipping Fee (GBP)',
          type: 'number',
          validation: Rule => Rule.required().min(0).precision(2)
        }),
        defineField({
          name: 'shippingDestinationCountry',
          title: 'Shipping Destination Country (ISO)',
          type: 'string',
          validation: Rule => Rule.required().min(2).max(2)
        }),
        defineField({
          name: 'deliveryMethod',
          title: 'Delivery Method URI',
          type: 'string',
          initialValue: defaultDeliveryMethod,
          options: {
            list: deliveryMethodOptions,
            layout: 'dropdown'
          },
          validation: Rule =>
            Rule.required().custom((value: unknown) => {
              if (typeof value !== 'string' || !supportedDeliveryMethodSet.has(value)) {
                return 'Delivery method must be one of the supported method URIs.'
              }

              return true
            })
        })
      ],
      validation: Rule => Rule.required()
    })
  ],
  preview: {
    select: {
      title: 'name'
    },
    prepare({
      title
    }: {
      title?: string
    }) {
      return {
        title: title?.trim() || 'Delivery',
        subtitle: 'Global cakes delivery section'
      }
    }
  }
})
