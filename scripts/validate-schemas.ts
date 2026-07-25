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
 *   pnpm run validate:schemas          # Validate with mock data (fast, no Sanity required)
 *   pnpm run validate:schemas --real   # Validate with real Sanity data (requires env vars)
 * 
 * Environment (for --real mode):
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - NEXT_PUBLIC_SANITY_DATASET
 */

import { generateAllProductSchemas } from "../lib/product-schemas.js";
import { batchValidateProductSchemas, validateMPNUniqueness } from "../lib/schema-validation.js";
import { MAX_PRODUCTS_FOR_SCHEMA } from "../lib/schema-constants.js";
import { createBlogArchiveBreadcrumbStructuredData } from '../lib/blog-archive-structured-data.js'
import { validateSchema } from './validate-structured-data.js'
import * as fs from 'fs';
import * as path from 'path';

// Check for --real flag
const useRealData = process.argv.includes('--real');

// Load environment variables from .env.local if it exists (for --real mode)
if (useRealData) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

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

async function fetchRealCakesFromSanity() {
  try {
    // Create Sanity client directly to avoid module resolution issues
    const { createClient } = await import("@sanity/client");
    
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
    
    if (!projectId || !dataset) {
      throw new Error('Missing required environment variables: NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET');
    }
    
    const client = createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      useCdn: false,
    });
    
    console.log('📡 Fetching real data from Sanity...');
    const fetchStartTime = performance.now();
    
    // Fetch cakes and testimonial stats
    const [cakes, testimonials] = await Promise.all([
      client.fetch(`
        *[_type == "cake"] | order(name asc) [0...${MAX_PRODUCTS_FOR_SCHEMA}] {
          _id,
          name,
          slug,
          pricing,
          allergens,
          ingredients,
          mainImage {
            asset-> {
              url
            }
          },
          description
        }
      `),
      client.fetch(`*[_type == "testimonial"] { rating }`)
    ]);
    
    // Calculate testimonial stats
    const count = testimonials.length;
    const averageRating = count > 0 
      ? testimonials.reduce((sum: number, t: { rating: number }) => sum + (t.rating || 0), 0) / count
      : 5.0;
    
    const stats = { count, averageRating };
    
    const fetchTime = performance.now() - fetchStartTime;
    console.log(`✅ Fetched ${cakes.length} cakes and ${count} testimonials in ${fetchTime.toFixed(2)}ms`);
    console.log(`   Average rating: ${averageRating.toFixed(1)}/5.0\n`);
    
    return { cakes, stats };
  } catch (error) {
    console.error('❌ Failed to fetch from Sanity:', error instanceof Error ? error.message : error);
    console.log('\nℹ️  Make sure environment variables are set:');
    console.log('   - NEXT_PUBLIC_SANITY_PROJECT_ID');
    console.log('   - NEXT_PUBLIC_SANITY_DATASET\n');
    throw error;
  }
}

async function validateAllSchemas() {
  console.log('🔍 Starting schema validation...\n');
  
  if (useRealData) {
    console.log('📊 Mode: Real Sanity data validation\n');
  } else {
    console.log('📊 Mode: Mock data validation (use --real flag for Sanity data)\n');
  }
  
  try {
    const startTime = performance.now();
    
    let cakes, stats;
    
    if (useRealData) {
      const realData = await fetchRealCakesFromSanity();
      cakes = realData.cakes;
      stats = realData.stats;
    } else {
      cakes = mockCakes;
      stats = { count: 16, averageRating: 4.8 };
      console.log(`📊 Using ${mockCakes.length} mock cakes for validation...\n`);
    }

    // Generate schemas
    console.log('🏗️  Generating product schemas...');
    const schemaStartTime = performance.now();
    
    const schemas = generateAllProductSchemas(cakes, stats);
    
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

    console.log('\n🔗 Validating blog archive structured data...')
    const blogArchiveSchema = createBlogArchiveBreadcrumbStructuredData()
    const blogArchiveValidation = validateSchema(blogArchiveSchema, 'BreadcrumbList')
    const includesUnsupportedItemList =
      JSON.stringify(blogArchiveSchema).includes('"@type":"ItemList"')

    if (blogArchiveValidation.errors.length > 0 || includesUnsupportedItemList) {
      throw new Error(
        `Blog archive schema is invalid: ${[
          ...blogArchiveValidation.errors,
          ...(includesUnsupportedItemList ? ['Unsupported archive ItemList found'] : [])
        ].join(', ')}`
      )
    }
    console.log('✅ Blog archive BreadcrumbList is valid')

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Data source:             ${useRealData ? 'Real Sanity data' : 'Mock data'}`);
    console.log(`Cakes processed:         ${cakes.length}`);
    console.log(`Schemas generated:       ${schemas.length}`);
    console.log(`Valid schemas:           ${validCount}`);
    console.log(`Invalid schemas:         ${schemas.length - validCount}`);
    console.log(`MPN uniqueness:          ${mpnCheck.isValid ? '✅ Pass' : '❌ Fail'}`);
    console.log('Blog archive schema:     ✅ Pass');
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

