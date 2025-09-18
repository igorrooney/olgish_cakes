#!/usr/bin/env node

/**
 * Test script to figure out correct Sanity asset URL format
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './env.local' });

// Configuration
const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31'
};

async function testAssetUrls() {
  console.log('🔍 Testing Sanity asset URL formats...');
  
  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    token: config.token,
    apiVersion: config.apiVersion,
    useCdn: false
  });

  // Get a few assets to test
  const assetsQuery = `*[_type == "sanity.imageAsset"] | order(_createdAt desc) [0...3]`;
  const assets = await client.fetch(assetsQuery);
  
  console.log(`Found ${assets.length} assets to test:\n`);
  
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    console.log(`Asset ${i + 1}:`);
    console.log(`  ID: ${asset._id}`);
    console.log(`  Extension: ${asset.extension}`);
    console.log(`  Original filename: ${asset.originalFilename}`);
    console.log(`  Size: ${asset.size} bytes`);
    console.log(`  URL: ${asset.url}`);
    
    // Test different URL formats
    const urlFormats = [
      `https://cdn.sanity.io/images/${config.projectId}/${config.dataset}/${asset._id}-${asset.extension}`,
      `https://cdn.sanity.io/images/${config.projectId}/${config.dataset}/${asset._id}.${asset.extension}`,
      asset.url,
      `https://cdn.sanity.io/images/${config.projectId}/${config.dataset}/${asset._id}`,
    ];
    
    console.log('  Testing URL formats:');
    for (const url of urlFormats) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`    ✅ ${url} - Status: ${response.status}`);
        if (response.status === 200) {
          console.log(`    📊 Content-Type: ${response.headers.get('content-type')}`);
          console.log(`    📊 Content-Length: ${response.headers.get('content-length')}`);
        }
      } catch (error) {
        console.log(`    ❌ ${url} - Error: ${error.message}`);
      }
    }
    
    console.log('');
  }
}

// Run the test
testAssetUrls().catch(console.error);
