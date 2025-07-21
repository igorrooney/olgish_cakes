#!/usr/bin/env node

/**
 * Test Webhook Script
 *
 * This script tests the webhook functionality by simulating
 * content updates and checking if revalidation works.
 *
 * Usage: node scripts/test-webhook.js
 */

import { createClient } from "@sanity/client";

// Create Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false,
});

async function testWebhook() {
  try {
    console.log("🧪 Testing webhook functionality...");

    // Get your production URL
    const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://olgishcakes.co.uk";
    const webhookUrl = `${productionUrl}/api/revalidate`;

    console.log("🌐 Testing webhook URL:", webhookUrl);

    // Test 1: GET request to check if endpoint is active
    console.log("\n📡 Test 1: Checking webhook endpoint...");
    const getResponse = await fetch(webhookUrl, { method: "GET" });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log("✅ Webhook endpoint is active:", getData.message);
    } else {
      console.log("❌ Webhook endpoint not accessible");
      return;
    }

    // Test 2: Simulate cake update
    console.log("\n📡 Test 2: Simulating cake update...");
    const cakeUpdatePayload = {
      _type: "cake",
      _id: "test-cake-id",
      slug: { current: "honey-cake-medovik" },
    };

    const postResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cakeUpdatePayload),
    });

    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log("✅ Cake update simulation successful:", postData.message);
      console.log("🔄 Revalidated:", postData.revalidated);
    } else {
      console.log("❌ Cake update simulation failed");
      const error = await postResponse.text();
      console.log("Error:", error);
    }

    // Test 3: Simulate testimonial update
    console.log("\n📡 Test 3: Simulating testimonial update...");
    const testimonialPayload = {
      _type: "testimonial",
      _id: "test-testimonial-id",
    };

    const testimonialResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testimonialPayload),
    });

    if (testimonialResponse.ok) {
      const testimonialData = await testimonialResponse.json();
      console.log("✅ Testimonial update simulation successful:", testimonialData.message);
    } else {
      console.log("❌ Testimonial update simulation failed");
    }

    // Test 4: Check if we can fetch fresh data
    console.log("\n📡 Test 4: Checking data freshness...");
    const cakes = await client.fetch('*[_type == "cake"] | order(_createdAt desc)[0...3]');
    console.log("✅ Fetched", cakes.length, "recent cakes from Sanity");

    console.log("\n🎉 Webhook testing completed!");
    console.log("\n📋 Next steps:");
    console.log("1. Deploy your app to production");
    console.log("2. Run: pnpm run setup-webhook");
    console.log("3. Or manually create webhook in Sanity Studio");
    console.log("4. Test by publishing content in Sanity Studio");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testWebhook();
