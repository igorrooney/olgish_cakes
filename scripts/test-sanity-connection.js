#!/usr/bin/env node

/**
 * Simple test script to verify Sanity connection
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './env.local' });

async function testConnection() {
  console.log('🔍 Testing Sanity connection...');
  
  const config = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31',
    useCdn: false
  };

  console.log(`Project ID: ${config.projectId}`);
  console.log(`Dataset: ${config.dataset}`);
  console.log(`Token: ${config.token ? 'Set' : 'Missing'}`);

  if (!config.projectId || !config.dataset || !config.token) {
    throw new Error('Missing required Sanity configuration');
  }

  const client = createClient(config);
  
  // Test with a simple query
  const query = `*[_type in ["cake", "giftHamper", "testimonial", "faq", "marketSchedule", "blogPost"]] | order(_createdAt desc) [0...5]`;
  const documents = await client.fetch(query);
  
  console.log(`✅ Connection successful! Found ${documents.length} documents`);
  
  if (documents.length > 0) {
    console.log('Sample documents:');
    documents.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc._type} - ${doc.name || doc.title || doc._id}`);
    });
  }
  
  return documents;
}

// Run the test
testConnection().catch(console.error);
