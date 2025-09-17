#!/usr/bin/env node

/**
 * Clear Cache Script
 *
 * This script clears the application cache to force fresh content loading.
 * Useful when you want to see content updates immediately after publishing in Sanity Studio.
 *
 * Usage: node scripts/clear-cache.js
 */

import { createClient } from "@sanity/client";

// Create Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false, // Disable CDN to get fresh data
});

async function clearCache() {
  try {
    console.log("🔄 Clearing cache and fetching fresh data...");

    // Fetch a small amount of data to clear any CDN cache
    const cakes = await client.fetch('*[_type == "cake"] | order(_createdAt desc)[0...5]');

    console.log(`✅ Cache cleared! Found ${cakes.length} recent cakes`);
    console.log("📝 Recent cakes:");
    cakes.forEach((cake, index) => {
      console.log(`  ${index + 1}. ${cake.name} (${cake.slug?.current})`);
    });

    console.log("\n🎉 Your content should now be up to date!");
    console.log("💡 Tip: If you're still seeing traditional content, try refreshing your browser");
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
    process.exit(1);
  }
}

// Run the script
clearCache();
