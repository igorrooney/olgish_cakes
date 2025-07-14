import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Main client for production with CDN caching
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Keep CDN for production performance
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
