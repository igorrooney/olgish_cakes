import { createClient } from '@sanity/client'

function getRequiredEnvValue(name: 'NEXT_PUBLIC_SANITY_PROJECT_ID' | 'NEXT_PUBLIC_SANITY_DATASET' | 'SANITY_API_TOKEN'): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

export function createSanityWriteClient() {
  return createClient({
    projectId: getRequiredEnvValue('NEXT_PUBLIC_SANITY_PROJECT_ID'),
    dataset: getRequiredEnvValue('NEXT_PUBLIC_SANITY_DATASET'),
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || '2025-03-31',
    useCdn: false,
    token: getRequiredEnvValue('SANITY_API_TOKEN'),
  })
}
