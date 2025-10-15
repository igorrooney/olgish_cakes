import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Configuration: Set to true for real-time data, false for cached data
const USE_REAL_TIME_DATA =
  process.env.NEXT_PUBLIC_USE_REAL_TIME_DATA === "true" || process.env.NODE_ENV === "development";

// Helper function to validate Sanity environment variables at runtime
function validateSanityConfig() {
  const actualDataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const actualProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  
  if (!actualDataset || !actualProjectId) {
    throw new Error(
      `Missing required Sanity environment variables: ${
        !actualDataset ? 'NEXT_PUBLIC_SANITY_DATASET' : ''
      }${!actualDataset && !actualProjectId ? ', ' : ''}${
        !actualProjectId ? 'NEXT_PUBLIC_SANITY_PROJECT_ID' : ''
      }`
    );
  }
  
  return { dataset: actualDataset, projectId: actualProjectId };
}

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

// Server-side client with write permissions for API routes
export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_API_TOKEN, // Required for write operations
});

// Helper function to get the appropriate client
export function getClient(preview = false) {
  return preview ? previewClient : client;
}

// Export configuration for other parts of the app
export { USE_REAL_TIME_DATA };
