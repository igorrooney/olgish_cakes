/**
 * Helper functions for generating multiple product schemas for pages
 * Reduces duplication and ensures consistency across pages
 */

import { Product, WithContext } from 'schema-dts'
import { generateProductSchema } from '../app/utils/seo'
import { BUSINESS_CONSTANTS } from './constants'
import { validateProductHasRequiredFields } from './schema-validation'
import type { ReviewStats } from '@/app/utils/review-stats'

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
  baseUrl: string = BUSINESS_CONSTANTS.BASE_URL,
  reviewStats?: ReviewStats
): WithContext<Product>[] {
  const pageUrl = `${baseUrl}/${pagePath}`
  void reviewStats

  return products.map((product) => {
    const schema = {
      ...generateProductSchema({
        name: product.name,
        description: product.description,
        image: product.image,
        url: pageUrl,
        price: product.price,
        currency: product.currency || 'GBP',
        category: product.category,
      }),
    } as WithContext<Product>

    // Runtime validation for safety - catch issues early in development
    const validation = validateProductHasRequiredFields(schema)
    if (!validation.isValid) {
      console.error('[Schema Helpers]', {
        operation: 'generate_product_schema',
        code: 'SCHEMA_VALIDATION_FAILED'
      })
      throw new Error('Product structured data could not be generated safely')
    }

    return schema
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
  baseUrl: string = BUSINESS_CONSTANTS.BASE_URL,
  reviewStats?: ReviewStats
): Array<{ id: string; schema: WithContext<Product> }> {
  const schemas = generatePageProductSchemas(products, pagePath, baseUrl, reviewStats)

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
