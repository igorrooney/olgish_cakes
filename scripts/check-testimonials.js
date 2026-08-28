import dotenv from 'dotenv'
import { createClient } from '@sanity/client'

dotenv.config({ path: './.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31'
})

const query = `
  *[_type == "testimonial"] {
    _id,
    source
  }
`

async function checkTestimonials() {
  try {
    const testimonials = await client.fetch(
      query,
      {},
      { signal: AbortSignal.timeout(30_000) }
    )
    const sourceCounts = testimonials.reduce((counts, testimonial) => {
      const source = typeof testimonial.source === 'string'
        ? testimonial.source
        : 'missing'

      counts[source] = (counts[source] || 0) + 1
      return counts
    }, {})

    const summary = {
      total: testimonials.length,
      sourceCounts
    }

    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
  } catch {
    process.stderr.write('Unable to check testimonial metadata.\n')
    process.exitCode = 1
  }
}

checkTestimonials()
