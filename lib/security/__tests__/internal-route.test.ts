/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

import {
  isBearerTokenAuthorized,
  isCronRequestAuthorized,
  privateJsonResponse,
  productionRouteNotFound,
  requireSameOriginMutation
} from '../internal-route'

describe('internal route security helpers', () => {
  const originalCronSecret = process.env.CRON_SECRET

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'cron-secret'
  })

  afterAll(() => {
    process.env.CRON_SECRET = originalCronSecret
  })

  it('matches a configured bearer token and rejects missing or malformed values', () => {
    expect(isBearerTokenAuthorized(new NextRequest('http://localhost/api/task', {
      headers: { authorization: 'Bearer expected-secret' }
    }), 'expected-secret')).toBe(true)

    expect(isBearerTokenAuthorized(new NextRequest('http://localhost/api/task', {
      headers: { authorization: 'Basic expected-secret' }
    }), 'expected-secret')).toBe(false)
    expect(isBearerTokenAuthorized(new NextRequest('http://localhost/api/task'), '')).toBe(false)
  })

  it('authorizes cron requests only with the configured cron token', () => {
    const validRequest = new NextRequest('http://localhost/api/task', {
      headers: { authorization: 'Bearer cron-secret' }
    })
    const invalidRequest = new NextRequest('http://localhost/api/task', {
      headers: { authorization: 'Bearer wrong-secret' }
    })

    expect(isCronRequestAuthorized(validRequest)).toBe(true)
    expect(isCronRequestAuthorized(invalidRequest)).toBe(false)
  })

  it('returns private, non-indexable responses', async () => {
    const privateJson = privateJsonResponse({ success: true })
    const notFound = productionRouteNotFound()

    expect(await privateJson.json()).toEqual({ success: true })
    expect(privateJson.headers.get('cache-control')).toContain('no-store')
    expect(privateJson.headers.get('x-robots-tag')).toBe('noindex, nofollow')
    expect(notFound.status).toBe(404)
    expect(await notFound.text()).toBe('')
    expect(notFound.headers.get('x-robots-tag')).toBe('noindex, nofollow')
  })

  it('accepts exact same-origin mutation provenance, including localhost', () => {
    const originRequest = new NextRequest('http://localhost:3000/api/admin/task', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
        'sec-fetch-site': 'same-origin'
      }
    })
    const refererRequest = new NextRequest('https://olgishcakes.co.uk/api/admin/task', {
      method: 'DELETE',
      headers: {
        referer: 'https://olgishcakes.co.uk/admin/privacy-retention'
      }
    })

    expect(requireSameOriginMutation(originRequest)).toBeNull()
    expect(requireSameOriginMutation(refererRequest)).toBeNull()
  })

  it('uses the incoming Host instead of Next internal hostname on a non-default port', () => {
    const request = new NextRequest('http://localhost:3001/api/admin/task', {
      method: 'POST',
      headers: {
        host: '127.0.0.1:3001',
        'x-forwarded-host': '127.0.0.1:3001',
        'x-forwarded-proto': 'http',
        referer: 'http://127.0.0.1:3001/admin',
        'sec-fetch-site': 'same-origin'
      }
    })

    expect(requireSameOriginMutation(request)).toBeNull()
  })

  it('uses validated forwarding metadata when Next sees an internal proxy URL', () => {
    const request = new NextRequest('http://internal-service:3000/api/admin/task', {
      method: 'POST',
      headers: {
        host: 'olgishcakes.co.uk',
        'x-forwarded-host': 'olgishcakes.co.uk',
        'x-forwarded-proto': 'https',
        origin: 'https://olgishcakes.co.uk',
        'sec-fetch-site': 'same-origin'
      }
    })

    expect(requireSameOriginMutation(request)).toBeNull()
  })

  it.each([
    [{
      host: 'olgishcakes.co.uk',
      'x-forwarded-host': 'attacker.example',
      'x-forwarded-proto': 'https',
      origin: 'https://attacker.example',
      'sec-fetch-site': 'same-origin'
    }, 'spoofed forwarded host'],
    [{
      host: 'olgishcakes.co.uk',
      'x-forwarded-host': 'olgishcakes.co.uk, attacker.example',
      'x-forwarded-proto': 'https',
      origin: 'https://olgishcakes.co.uk',
      'sec-fetch-site': 'same-origin'
    }, 'multiple forwarded hosts'],
    [{
      host: 'olgishcakes.co.uk',
      'x-forwarded-host': 'olgishcakes.co.uk',
      'x-forwarded-proto': 'https, http',
      origin: 'https://olgishcakes.co.uk',
      'sec-fetch-site': 'same-origin'
    }, 'multiple forwarded protocols'],
    [{
      host: 'olgishcakes.co.uk/path',
      origin: 'https://olgishcakes.co.uk',
      'sec-fetch-site': 'same-origin'
    }, 'malformed Host authority']
  ])('rejects malicious request authority metadata (%s)', async (headers) => {
    const request = new NextRequest('https://olgishcakes.co.uk/api/admin/task', {
      method: 'POST',
      headers
    })

    const response = requireSameOriginMutation(request)

    expect(response?.status).toBe(403)
    expect(await response?.json()).toEqual({ error: 'Forbidden' })
  })

  it.each([
    [{}, 'missing provenance'],
    [{ origin: 'https://attacker.example' }, 'foreign origin'],
    [{ referer: 'https://attacker.example/admin' }, 'foreign referer'],
    [{ origin: 'null' }, 'opaque origin'],
    [{ origin: 'https://olgishcakes.co.uk', referer: 'not-a-url' }, 'invalid supplied referer'],
    [{ origin: 'https://olgishcakes.co.uk', 'sec-fetch-site': 'cross-site' }, 'cross-site fetch metadata'],
    [{ origin: 'https://olgishcakes.co.uk', 'sec-fetch-site': 'same-site' }, 'sibling-site fetch metadata']
  ])('rejects %s (%s)', async (headers) => {
    const request = new NextRequest('https://olgishcakes.co.uk/api/admin/task', {
      method: 'POST',
      headers
    })

    const response = requireSameOriginMutation(request)

    expect(response?.status).toBe(403)
    expect(await response?.json()).toEqual({ error: 'Forbidden' })
    expect(response?.headers.get('cache-control')).toContain('no-store')
  })
})
