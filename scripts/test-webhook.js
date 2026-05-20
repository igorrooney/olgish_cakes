#!/usr/bin/env node

/**
 * Tests the /api/revalidate endpoint with the same auth headers Sanity uses.
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local', override: true })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31'
const revalidateSecret = process.env.REVALIDATE_SECRET
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://olgishcakes.co.uk').replace(/\/$/, '')
const webhookUrl = `${siteUrl}/api/revalidate`
const vercelProtectionBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

function requireEnvValue(name, value) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
}

function createWebhookHeaders() {
  const headers = {
    authorization: `Bearer ${revalidateSecret}`,
    'content-type': 'application/json'
  }

  if (vercelProtectionBypass) {
    headers['x-vercel-protection-bypass'] = vercelProtectionBypass
  }

  return headers
}

async function readResponseBody(response) {
  const text = await response.text()

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function assertOkResponse(label, response) {
  const body = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status} ${JSON.stringify(body)}`)
  }

  console.log(`${label} ok:`)
  console.log(JSON.stringify(body, null, 2))
}

async function testWebhook() {
  requireEnvValue('NEXT_PUBLIC_SANITY_PROJECT_ID', projectId)
  requireEnvValue('REVALIDATE_SECRET', revalidateSecret)

  console.log(`Testing webhook endpoint: ${webhookUrl}`)

  const headers = createWebhookHeaders()
  const getResponse = await fetch(webhookUrl, {
    method: 'GET',
    headers
  })
  await assertOkResponse('GET /api/revalidate', getResponse)

  const cakePayload = {
    _type: 'cake',
    _id: 'fd7b4fde-cf52-4bdd-a06e-65138956fda9',
    slug: {
      current: 'red-velvet-cake'
    }
  }

  const postResponse = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(cakePayload)
  })
  await assertOkResponse('POST cake revalidation', postResponse)

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false
  })
  const recentCakes = await client.fetch('*[_type == "cake"] | order(_createdAt desc)[0...3]{name, "slug": slug.current}')

  console.log('Recent published cakes from Sanity:')
  console.log(JSON.stringify(recentCakes, null, 2))
}

testWebhook().catch((error) => {
  console.error('Webhook test failed:', error)
  process.exit(1)
})
