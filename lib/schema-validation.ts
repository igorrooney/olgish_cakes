/**
 * Validation utilities for structured data schemas
 * Ensures Schema.org compliance and catches potential issues before deployment
 */

import { Product, Review, WithContext } from "schema-dts";
import { SKU_PREFIX, MAX_SKU_NAME_LENGTH, SKU_PADDING_LENGTH } from "./schema-constants";

// Type guard for Offer objects
interface OfferLike {
  '@type'?: string;
  price?: string | number;
  priceCurrency?: string;
  availability?: string;
  priceValidUntil?: string;
}

function isOffer(offers: unknown): offers is OfferLike {
  return typeof offers === 'object' && offers !== null;
}

// Type guard for AggregateRating objects
interface AggregateRatingLike {
  '@type'?: string;
  ratingValue?: string | number;
  reviewCount?: string | number;
}

function isAggregateRating(rating: unknown): rating is AggregateRatingLike {
  return typeof rating === 'object' && rating !== null && '@type' in rating;
}

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
  } else if (schema.name.length < 3) {
    errors.push('Product name too short (minimum 3 characters)');
  } else if (schema.name.length > 150) {
    errors.push('Product name too long (maximum 150 characters)');
  }

  if (!schema.description || typeof schema.description !== 'string') {
    errors.push('Missing or invalid product description');
  } else if (schema.description.length < 10) {
    errors.push('Description too short (minimum 10 characters)');
  } else if (schema.description.length > 5000) {
    errors.push('Description too long (maximum 5000 characters)');
  }

  if (!schema.image || (Array.isArray(schema.image) && schema.image.length === 0)) {
    errors.push('Missing product image');
  }

  if (!schema.offers) {
    errors.push('Missing offers object');
  } else if (isOffer(schema.offers)) {
    const offer = schema.offers;
    
    if (!offer.price || typeof offer.price !== 'string') {
      errors.push('Missing or invalid offer price');
    } else {
      const priceValue = parseFloat(offer.price);
      if (isNaN(priceValue)) {
        errors.push('Price must be a valid number');
      } else if (priceValue <= 0) {
        errors.push('Price must be greater than zero');
      } else if (priceValue > 10000) {
        errors.push('Price seems unusually high (>£10,000)');
      }
    }

    if (!offer.priceCurrency || offer.priceCurrency !== 'GBP') {
      errors.push('Missing or invalid priceCurrency (must be GBP)');
    }

    if (!offer.availability) {
      errors.push('Missing offer availability');
    }

    if (!offer.priceValidUntil) {
      errors.push('Missing priceValidUntil date');
    } else if (typeof offer.priceValidUntil === 'string') {
      // Validate date format and that it's in the future
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(offer.priceValidUntil)) {
        errors.push('priceValidUntil must be in YYYY-MM-DD format');
      } else {
        const validUntil = new Date(offer.priceValidUntil);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (validUntil < today) {
          errors.push('priceValidUntil date is in the past');
        }
      }
    }
  }

  // SKU validation with format checks
  if (!schema.sku || typeof schema.sku !== 'string') {
    errors.push('Missing or invalid SKU');
  } else {
    if (!schema.sku.startsWith(`${SKU_PREFIX}-`)) {
      errors.push(`SKU must start with "${SKU_PREFIX}-"`);
    }
    // Expected format: OC-PRODUCTNAME-001
    const skuParts = schema.sku.split('-');
    if (skuParts.length < 3) {
      errors.push('SKU format invalid (expected: OC-PRODUCTNAME-001)');
    } else {
      const numericPart = skuParts[skuParts.length - 1];
      if (!/^\d{3}$/.test(numericPart)) {
        errors.push(`SKU must end with ${SKU_PADDING_LENGTH} digits (e.g., 001)`);
      }
    }
    if (schema.sku.length > 50) {
      errors.push('SKU too long (maximum 50 characters)');
    }
  }

  // MPN validation with format checks
  if (!schema.mpn || typeof schema.mpn !== 'string') {
    errors.push('Missing or invalid MPN');
  } else if (schema.mpn.length < 3) {
    errors.push('MPN too short (minimum 3 characters)');
  } else if (schema.mpn.length > 70) {
    errors.push('MPN too long (maximum 70 characters for Google Merchant Center)');
  }

  // Brand is required
  if (!schema.brand || typeof schema.brand !== 'object') {
    errors.push('Missing brand information');
  }

  // Aggregate rating validation with type guards
  if (schema.aggregateRating && isAggregateRating(schema.aggregateRating)) {
    const rating = schema.aggregateRating;
    
    if (!rating.ratingValue) {
      errors.push('Missing ratingValue in aggregateRating');
    } else {
      const ratingValue = typeof rating.ratingValue === 'string' 
        ? parseFloat(rating.ratingValue) 
        : rating.ratingValue;
      if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        errors.push('ratingValue must be between 1 and 5');
      }
    }
    
    if (!rating.reviewCount) {
      errors.push('Missing reviewCount in aggregateRating');
    } else {
      const reviewCount = typeof rating.reviewCount === 'string'
        ? parseInt(rating.reviewCount, 10)
        : rating.reviewCount;
      if (isNaN(reviewCount) || reviewCount < 0) {
        errors.push('reviewCount must be a positive number');
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

