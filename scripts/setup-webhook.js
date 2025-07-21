#!/usr/bin/env node

/**
 * Setup Sanity Webhook Script
 *
 * This script creates a webhook in Sanity that will automatically
 * revalidate your Next.js app when content is published.
 *
 * Usage: node scripts/setup-webhook.js
 */

import { createClient } from "@sanity/client";

// Create Sanity client with write permissions
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Requires write token
});

async function setupWebhook() {
  try {
    console.log("🔧 Setting up Sanity webhook for content revalidation...");

    // Check if we have the required token
    if (!process.env.SANITY_API_TOKEN) {
      console.error("❌ SANITY_API_TOKEN environment variable is required");
      console.log("Please add your Sanity write token to your .env file:");
      console.log("SANITY_API_TOKEN=your_write_token_here");
      return;
    }

    // Webhook configuration
    const webhookConfig = {
      name: "Olgish Cakes Content Revalidation",
      url: process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`
        : "https://olgishcakes.co.uk/api/revalidate",
      httpMethod: "POST",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      filter: '_type in ["cake", "testimonial", "faq"]',
      events: ["create", "update", "delete"],
      description: "Automatically revalidates Next.js pages when content is published",
    };

    console.log("📋 Webhook configuration:");
    console.log(JSON.stringify(webhookConfig, null, 2));

    // Create the webhook using Sanity's API
    const response = await fetch(
      `https://api.sanity.io/v2021-06-07/webhooks/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET || "production"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
        },
        body: JSON.stringify(webhookConfig),
      }
    );

    if (response.ok) {
      const webhook = await response.json();
      console.log("✅ Webhook created successfully!");
      console.log("🔗 Webhook ID:", webhook.id);
      console.log("🌐 Webhook URL:", webhook.url);
      console.log("\n🎉 Your content will now update automatically when published!");
    } else {
      const error = await response.text();
      console.error("❌ Failed to create webhook:", error);
      console.log("\n💡 Manual setup instructions:");
      console.log("1. Go to https://www.sanity.io/manage");
      console.log("2. Find your project → API → Webhooks");
      console.log("3. Create webhook with the configuration above");
    }
  } catch (error) {
    console.error("❌ Error setting up webhook:", error);
    console.log("\n💡 Manual setup instructions:");
    console.log("1. Go to https://www.sanity.io/manage");
    console.log("2. Find your project → API → Webhooks");
    console.log("3. Create webhook with URL: https://olgishcakes.co.uk/api/revalidate");
  }
}

// Run the script
setupWebhook();
