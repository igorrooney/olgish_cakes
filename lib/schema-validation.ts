/**
 * Validation utilities for structured data schemas
 * Ensures Schema.org compliance and catches potential issues before deployment
 */

import { Product, Review, WithContext } from "schema-dts";

/**
 * Validate that a product schema has all required fields for Google Search Console
 * @param schema - Product schema to validate
 * @returns Object with isValid flag and array of validation errors
 */
export function validateProductSchema(schema: WithContext<Product>): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];

  // Required fields according to Google Merchant Center
  if (!schema.name || typeof schema.name !== 'string') {
    errors.push('Missing or invalid product name');
  }

  if (!schema.description || typeof schema.description !== 'string') {
    errors.push('Missing or invalid product description');
  }

  if (!schema.image || (Array.isArray(schema.image) && schema.image.length === 0)) {
    errors.push('Missing product image');
  }

  if (!schema.offers) {
    errors.push('Missing offers object');
  } else if (typeof schema.offers === 'object') {
    const offer = schema.offers as any; // schema-dts uses complex union types
    
    if (!offer.price || typeof offer.price !== 'string') {
      errors.push('Missing or invalid offer price');
    }

    if (!offer.priceCurrency || offer.priceCurrency !== 'GBP') {
      errors.push('Missing or invalid priceCurrency (must be GBP)');
    }

    if (!offer.availability) {
      errors.push('Missing offer availability');
    }

    if (!offer.priceValidUntil) {
      errors.push('Missing priceValidUntil date');
    }
  }

  // SKU should follow OC- format
  if (!schema.sku || typeof schema.sku !== 'string' || !schema.sku.startsWith('OC-')) {
    errors.push('Missing or invalid SKU (should start with OC-)');
  }

  // MPN should be unique
  if (!schema.mpn || typeof schema.mpn !== 'string') {
    errors.push('Missing or invalid MPN');
  }

  // Brand is required
  if (!schema.brand || typeof schema.brand !== 'object') {
    errors.push('Missing brand information');
  }

  // Aggregate rating should have proper format
  if (schema.aggregateRating && typeof schema.aggregateRating === 'object') {
    const rating = schema.aggregateRating as any; // schema-dts uses complex union types
    if ('@type' in rating) {
      if (!rating.ratingValue) {
        errors.push('Missing ratingValue in aggregateRating');
      }
      if (!rating.reviewCount) {
        errors.push('Missing reviewCount in aggregateRating');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate a review schema
 * @param review - Review schema to validate
 * @returns Object with isValid flag and array of validation errors
 */
export function validateReviewSchema(review: WithContext<Review>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!review.author || typeof review.author !== 'object') {
    errors.push('Missing review author');
  }

  if (!review.reviewRating || typeof review.reviewRating !== 'object') {
    errors.push('Missing reviewRating');
  }

  if (!review.reviewBody || typeof review.reviewBody !== 'string') {
    errors.push('Missing or invalid reviewBody');
  }

  if (!review.datePublished) {
    errors.push('Missing datePublished');
  } else if (typeof review.datePublished === 'string') {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(review.datePublished)) {
      errors.push('Invalid datePublished format (should be YYYY-MM-DD)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate MPN uniqueness across multiple product schemas
 * @param schemas - Array of product schemas
 * @returns Object with isValid flag and array of duplicate MPNs
 */
export function validateMPNUniqueness(schemas: WithContext<Product>[]): {
  isValid: boolean;
  duplicates: string[];
} {
  const mpnMap = new Map<string, number>();
  const duplicates: string[] = [];

  for (const schema of schemas) {
    if (schema.mpn && typeof schema.mpn === 'string') {
      const count = mpnMap.get(schema.mpn) || 0;
      mpnMap.set(schema.mpn, count + 1);
      
      if (count === 1) {
        duplicates.push(schema.mpn);
      }
    }
  }

  return {
    isValid: duplicates.length === 0,
    duplicates
  };
}

/**
 * Batch validate all product schemas and log results
 * @param schemas - Array of product schemas to validate
 * @param logErrors - Whether to log validation errors (default: true in development)
 * @returns Number of valid schemas
 */
export function batchValidateProductSchemas(
  schemas: WithContext<Product>[], 
  logErrors: boolean = process.env.NODE_ENV !== 'production'
): number {
  let validCount = 0;
  const allErrors: Array<{ name: string; errors: string[] }> = [];

  for (const schema of schemas) {
    const validation = validateProductSchema(schema);
    if (validation.isValid) {
      validCount++;
    } else if (logErrors) {
      allErrors.push({
        name: typeof schema.name === 'string' ? schema.name : 'Unknown',
        errors: validation.errors
      });
    }
  }

  // Check MPN uniqueness
  const mpnValidation = validateMPNUniqueness(schemas);
  if (!mpnValidation.isValid && logErrors) {
    console.warn('[Schema Validation] Duplicate MPNs found:', mpnValidation.duplicates);
  }

  if (logErrors && allErrors.length > 0) {
    console.error(`[Schema Validation] ${allErrors.length} invalid schemas found:`);
    allErrors.forEach(({ name, errors }) => {
      console.error(`  - ${name}:`, errors);
    });
  }

  if (logErrors) {
    console.log(`[Schema Validation] ${validCount}/${schemas.length} schemas are valid`);
  }

  return validCount;
}

