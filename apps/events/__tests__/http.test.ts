import { describe, expect, it } from 'vitest'

import { jsonError, readJsonBody } from '@/lib/http'

describe('HTTP helpers', () => {
  it('returns structured JSON errors with the requested status', async () => {
    const response = jsonError('Bad request', 422)

    await expect(response.json()).resolves.toEqual({ error: 'Bad request' })
    expect(response.status).toBe(422)
  })

  it('returns null for malformed JSON bodies', async () => {
    const request = new Request('https://events.olgishcakes.co.uk/api/test', {
      method: 'POST',
      body: '{not-json',
      headers: {
        'content-type': 'application/json'
      }
    })

    await expect(readJsonBody(request)).resolves.toBeNull()
  })
})
