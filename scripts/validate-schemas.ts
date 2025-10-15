#!/usr/bin/env node

/**
 * Schema Validation Script
 * 
 * Validates all generated structured data schemas for compliance with:
 * - Schema.org standards
 * - Google Merchant Center requirements
 * - Google Search Console rich results
 * 
 * Usage:
 *   pnpm run validate:schemas
 * 
 * Environment:
 *   - Requires NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET
 * 
 * Note: This is a simplified validation that generates test schemas
 * without requiring Sanity connection. For full validation with real data,
 * check the schemas in the built application.
 */

import { generateAllProductSchemas } from "../lib/product-schemas.js";
import { batchValidateProductSchemas, validateMPNUniqueness } from "../lib/schema-validation.js";
import { MAX_PRODUCTS_FOR_SCHEMA } from "../lib/schema-constants.js";

// Mock cake data for validation testing
const mockCakes = Array.from({ length: 10 }, (_, i) => ({
  _id: `cake-${i}`,
  name: `Test Cake ${i + 1}`,
  slug: { current: `test-cake-${i + 1}` },
  pricing: { standard: 25 + i * 5 },
  allergens: i % 2 === 0 ? ['Eggs', 'Dairy'] : ['Nuts'],
  ingredients: ['Flour', 'Sugar', 'Butter'],
  mainImage: { asset: { url: 'https://example.com/image.jpg' } },
  description: `A delicious test cake number ${i + 1}`
}));

async function validateAllSchemas() {
  console.log('🔍 Starting schema validation...\n');
  console.log('ℹ️  Using mock data for validation. For full validation with real Sanity data,');
  console.log('   check schemas in the built application or use Google Rich Results Test.\n');
  
  try {
    const startTime = performance.now();
    
    console.log(`📊 Using ${mockCakes.length} mock cakes for validation...`);

    // Generate schemas
    console.log('🏗️  Generating product schemas...');
    const schemaStartTime = performance.now();
    
    const mockStats = { count: 16, averageRating: 4.8 }; // Mock data for validation
    const schemas = generateAllProductSchemas(mockCakes, mockStats);
    
    const schemaTime = performance.now() - schemaStartTime;
    console.log(`✅ Generated ${schemas.length} schemas in ${schemaTime.toFixed(2)}ms\n`);

    // Validate schemas
    console.log('✔️  Validating schemas...');
    const validationStartTime = performance.now();
    const validCount = batchValidateProductSchemas(schemas, true);
    
    const validationTime = performance.now() - validationStartTime;
    console.log(`\n⏱️  Validation completed in ${validationTime.toFixed(2)}ms`);

    // Check MPN uniqueness
    console.log('\n🔑 Checking MPN uniqueness...');
    const mpnCheck = validateMPNUniqueness(schemas);
    if (mpnCheck.isValid) {
      console.log('✅ All MPNs are unique');
    } else {
      console.error('❌ Duplicate MPNs found:', mpnCheck.duplicates);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Mock cakes used:         ${mockCakes.length}`);
    console.log(`Schemas generated:       ${schemas.length}`);
    console.log(`Valid schemas:           ${validCount}`);
    console.log(`Invalid schemas:         ${schemas.length - validCount}`);
    console.log(`MPN uniqueness:          ${mpnCheck.isValid ? '✅ Pass' : '❌ Fail'}`);
    console.log(`Total time:              ${(performance.now() - startTime).toFixed(2)}ms`);
    console.log('='.repeat(60));

    // Exit with error if validation failed
    if (validCount !== schemas.length || !mpnCheck.isValid) {
      console.error('\n❌ Validation failed! Please fix the errors above.');
      process.exit(1);
    }

    console.log('\n✅ All schemas are valid and ready for production!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error during validation:', error);
    process.exit(1);
  }
}

// Run validation
validateAllSchemas();

