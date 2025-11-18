/**
 * Helper functions for generating multiple product schemas for pages
 * Reduces duplication and ensures consistency across pages
 */

import { Product, WithContext } from 'schema-dts'
import { generateProductSchema } from '../app/utils/seo'
import { BUSINESS_CONSTANTS } from './constants'
import { DEFAULT_AGGREGATE_RATING } from './structured-data-defaults'

export interface PageProductConfig {
  name: string
  description: string
  image: string
  price: number
  currency?: string
  category?: string
}

/**
 * Generate multiple product schemas for a page
 * @param products - Array of product configurations
 * @param baseUrl - Base URL for the page (defaults to BUSINESS_CONSTANTS.BASE_URL)
 * @param pagePath - Path segment for the page (e.g., 'cake-in-leeds', 'contact')
 * @returns Array of product schemas with proper typing
 */
export function generatePageProductSchemas(
  products: PageProductConfig[],
  pagePath: string,
  baseUrl: string = BUSINESS_CONSTANTS.BASE_URL
): WithContext<Product>[] {
  const pageUrl = `${baseUrl}/${pagePath}`

  return products.map((product) => {
    return {
      ...generateProductSchema({
        name: product.name,
        description: product.description,
        image: product.image,
        url: pageUrl,
        price: product.price,
        currency: product.currency || 'GBP',
        category: product.category,
        aggregateRating: {
          ratingValue: parseFloat(DEFAULT_AGGREGATE_RATING.ratingValue),
          reviewCount: parseInt(DEFAULT_AGGREGATE_RATING.reviewCount),
        },
      }),
    } as WithContext<Product>
  })
}

/**
 * Generate product schemas and return them as script tags ready for rendering
 * @param products - Array of product configurations
 * @param pagePath - Path segment for the page
 * @param baseUrl - Base URL for the page
 * @returns Array of objects with id and schema for script tag rendering
 */
export function generatePageProductSchemaScripts(
  products: PageProductConfig[],
  pagePath: string,
  baseUrl: string = BUSINESS_CONSTANTS.BASE_URL
): Array<{ id: string; schema: WithContext<Product> }> {
  const schemas = generatePageProductSchemas(products, pagePath, baseUrl)

  return schemas.map((schema, index) => {
    // Generate a clean ID from the product name (use original config name)
    const productName = products[index]?.name || `product-${index}`
    const cleanId = productName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    return {
      id: `${cleanId}-product-schema`,
      schema,
    }
  })
}

