import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Configuration: default to cached Sanity reads in every environment.
// Set NEXT_PUBLIC_USE_REAL_TIME_DATA=true only when deliberately bypassing the cache.
const USE_REAL_TIME_DATA =
  process.env.NEXT_PUBLIC_USE_REAL_TIME_DATA !== undefined
    ? process.env.NEXT_PUBLIC_USE_REAL_TIME_DATA === 'true'
    : false

export const sanityFetchOptions = {
  cache: 'no-store' as const
}

// Main client - configurable between cached and real-time
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published'
})

// Preview client for real-time updates (no CDN)
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'previewDrafts',
  token: process.env.SANITY_API_TOKEN
})

// Server-side client with write permissions for API routes
export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to get the appropriate client
export function getClient(preview = false) {
  return preview ? previewClient : client
}

// Export configuration for other parts of the app
export { USE_REAL_TIME_DATA }
