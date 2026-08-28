/**
 * Validation utilities for structured data schemas
 * Ensures Schema.org compliance and catches potential issues before deployment
 */

import { Product, Review, WithContext } from "schema-dts";

// Type guard for Offer objects
interface OfferLike {
  '@type'?: string;
  price?: string | number;
  priceCurrency?: string;
  availability?: string;
  priceValidUntil?: string;
}

/**
 * Validates that price is a valid number (for Google Merchant Center compliance)
 * Accepts both number and string types, but ensures the value is numeric
 */
function isValidPrice(price: unknown): price is number {
  if (typeof price === 'number') {
    return Number.isFinite(price) && !Number.isNaN(price) && price >= 0
  }
  if (typeof price === 'string') {
    const parsed = parseFloat(price)
    return Number.isFinite(parsed) && !Number.isNaN(parsed) && parsed >= 0
  }
  return false
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
 * Validates that a Product schema has at least one of the required fields:
 * offers, review, or aggregateRating (Google Search Console requirement)
 * @param schema - Product schema to validate
 * @returns Object with isValid flag and array of validation errors
 */
export function validateProductHasRequiredFields(schema: WithContext<Product>): {
  isValid: boolean;
  errors: string[]
} {
  const errors: string[] = []

  const hasOffers = schema.offers !== undefined && schema.offers !== null
  const hasReview = schema.review !== undefined && schema.review !== null && 
    (Array.isArray(schema.review) ? schema.review.length > 0 : true)
  const hasAggregateRating = schema.aggregateRating !== undefined && schema.aggregateRating !== null

  if (!hasOffers && !hasReview && !hasAggregateRating) {
    errors.push('Product schema must have at least one of: offers, review, or aggregateRating (Google Search Console requirement)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateProductSchema(schema: WithContext<Product>): {
  isValid: boolean;
  errors: string[]
} {
  const errors: string[] = [];

  // Google Search Console requirement: must have at least one of offers, review, or aggregateRating
  const requiredFieldsCheck = validateProductHasRequiredFields(schema)
  if (!requiredFieldsCheck.isValid) {
    errors.push(...requiredFieldsCheck.errors)
  }

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

    // Price must be a number (not a string) for Google Merchant Center compliance
    // Accept both number and string types for backward compatibility during migration
    if (!offer.price || !isValidPrice(offer.price)) {
      errors.push('Missing or invalid offer price (must be a number)');
    } else {
      const priceValue = typeof offer.price === 'number' ? offer.price : parseFloat(offer.price);
      if (priceValue <= 0) {
        errors.push('Price must be greater than zero');
      } else if (priceValue > 10000) {
        errors.push('Price seems unusually high (>£10,000)');
      }
      // Warn if price is a string (should be migrated to number)
      if (typeof offer.price === 'string') {
        // Note: This is a warning, not an error, for backward compatibility
        // In the future, we may make this an error
      }
    }

    if (!offer.priceCurrency || offer.priceCurrency !== 'GBP') {
      errors.push('Missing or invalid priceCurrency (must be GBP)');
    }

    if (typeof offer.priceValidUntil === 'string') {
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

  // Optional identifiers are validated only when backed by real product data.
  if (schema.sku !== undefined && (typeof schema.sku !== 'string' || schema.sku.trim().length === 0)) {
    errors.push('Invalid SKU')
  }

  if (schema.mpn !== undefined && (typeof schema.mpn !== 'string' || schema.mpn.trim().length === 0)) {
    errors.push('Invalid MPN')
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
    console.warn(`[Schema Validation] ${validCount}/${schemas.length} schemas are valid`);
  }

  return validCount;
}

