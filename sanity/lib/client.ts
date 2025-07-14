import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Configuration: Set to true for real-time data, false for cached data
const USE_REAL_TIME_DATA =
  process.env.NEXT_PUBLIC_USE_REAL_TIME_DATA === "true" || process.env.NODE_ENV === "development";

// Main client - configurable between cached and real-time
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: !USE_REAL_TIME_DATA, // Disable CDN for real-time data
  perspective: "published", // Only published content
});

// Preview client for real-time updates (no CDN)
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // No CDN for real-time updates
  perspective: "previewDrafts", // Include drafts
  token: process.env.SANITY_API_TOKEN, // Required for preview access
});

// Helper function to get the appropriate client
export function getClient(preview = false) {
  return preview ? previewClient : client;
}

// Export configuration for other parts of the app
export { USE_REAL_TIME_DATA };
