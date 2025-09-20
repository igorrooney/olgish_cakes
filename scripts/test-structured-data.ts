#!/usr/bin/env tsx

/**
 * Simple test to verify structured data includes hasMerchantReturnPolicy
 */

import { getMerchantReturnPolicy, getOfferShippingDetails } from '../app/utils/seo';
import { generateProductSchema } from '../app/utils/seo';

async function testStructuredData(): Promise<void> {
  console.log('🧪 Testing Structured Data Components...\n');

  // Test 1: Merchant Return Policy
  console.log('1. Testing getMerchantReturnPolicy():');
  const returnPolicy = getMerchantReturnPolicy();
  console.log('✅ Return policy generated:', JSON.stringify(returnPolicy, null, 2));
  console.log('');

  // Test 2: Shipping Details
  console.log('2. Testing getOfferShippingDetails():');
  const shippingDetails = getOfferShippingDetails();
  console.log('✅ Shipping details generated:', JSON.stringify(shippingDetails, null, 2));
  console.log('');

  // Test 3: Product Schema
  console.log('3. Testing generateProductSchema():');
  const productSchema = generateProductSchema({
    name: 'Test Honey Cake',
    description: 'Test description',
    image: 'https://example.com/test.jpg',
    url: 'https://olgishcakes.co.uk/cakes/test-honey-cake',
    price: 45,
    currency: 'GBP',
    availability: 'InStock',
    brand: 'Olgish Cakes',
    category: 'Ukrainian Honey Cake'
  });

  // Check if hasMerchantReturnPolicy is present
  const hasReturnPolicy = productSchema.offers?.hasMerchantReturnPolicy;
  if (hasReturnPolicy) {
    console.log('✅ Product schema includes hasMerchantReturnPolicy');
    console.log('   Return policy:', JSON.stringify(hasReturnPolicy, null, 2));
  } else {
    console.log('❌ Product schema missing hasMerchantReturnPolicy');
  }

  // Check if shippingDetails is present
  const hasShippingDetails = productSchema.offers?.shippingDetails;
  if (hasShippingDetails) {
    console.log('✅ Product schema includes shippingDetails');
  } else {
    console.log('❌ Product schema missing shippingDetails');
  }

  console.log('');

  // Test 4: Validate return policy structure
  console.log('4. Validating return policy structure:');
  const requiredFields = ['@type', 'applicableCountry', 'returnFees', 'returnPolicyCategory', 'merchantReturnDays', 'returnMethod'];
  const missingFields = requiredFields.filter(field => !(field in returnPolicy));
  
  if (missingFields.length === 0) {
    console.log('✅ All required fields present in return policy');
  } else {
    console.log('❌ Missing fields in return policy:', missingFields);
  }

  console.log('');
  console.log('🎉 All tests completed!');
}

testStructuredData().catch(console.error);
