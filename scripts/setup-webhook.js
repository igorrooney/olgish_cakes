#!/usr/bin/env node

/**
 * Creates the Sanity document webhook that calls /api/revalidate.
 *
 * Required env:
 * - NEXT_PUBLIC_SANITY_PROJECT_ID
 * - NEXT_PUBLIC_SANITY_DATASET
 * - SANITY_API_TOKEN
 * - REVALIDATE_SECRET
 */

import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const sanityToken = process.env.SANITY_API_TOKEN
const revalidateSecret = process.env.REVALIDATE_SECRET
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://olgishcakes.co.uk').replace(/\/$/, '')
const apiVersion = normalizeApiVersion(process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31')

const webhookDocumentTypes = [
  'cake',
  'cakesFeaturedOffer',
  'cakesDeliverySection',
  'testimonial',
  'faq',
  'giftHamper',
  'giftHampersDeliverySection',
  'ingredient',
  'article',
  'articleTopic',
  'marketSchedule',
  'collection',
  'giftHamperCollection',
  'collectionsDisplayOrder',
  'productsDisplayOrder'
]

function normalizeApiVersion(value) {
  return value.startsWith('v') ? value : `v${value}`
}

function requireEnvValue(name, value) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
}

async function setupWebhook() {
  requireEnvValue('NEXT_PUBLIC_SANITY_PROJECT_ID', projectId)
  requireEnvValue('SANITY_API_TOKEN', sanityToken)
  requireEnvValue('REVALIDATE_SECRET', revalidateSecret)

  const webhookConfig = {
    type: 'document',
    name: 'Olgish Cakes Content Revalidation',
    url: `${siteUrl}/api/revalidate`,
    dataset,
    apiVersion,
    httpMethod: 'POST',
    includeDrafts: false,
    headers: {
      Authorization: `Bearer ${revalidateSecret}`
    },
    rule: {
      on: ['create', 'update', 'delete'],
      filter: `_type in ${JSON.stringify(webhookDocumentTypes)} && !(_id in path("drafts.**"))`,
      projection: '{_id, _type, slug}'
    },
    description: 'Revalidates Next.js pages and syncs new products into Products Display Order.'
  }

  console.log('Creating Sanity webhook with configuration:')
  console.log(JSON.stringify({
    ...webhookConfig,
    headers: {
      Authorization: 'Bearer [REDACTED]'
    }
  }, null, 2))

  const response = await fetch(
    `https://${projectId}.api.sanity.io/${apiVersion}/hooks/projects/${projectId}`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${sanityToken}`
      },
      body: JSON.stringify(webhookConfig)
    }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Failed to create webhook: ${response.status} ${errorBody}`)
  }

  const webhook = await response.json()
  console.log('Webhook created.')
  console.log(JSON.stringify({
    id: webhook.id,
    name: webhook.name,
    url: webhook.url
  }, null, 2))
}

setupWebhook().catch((error) => {
  console.error('Webhook setup failed:', error)
  process.exit(1)
})
