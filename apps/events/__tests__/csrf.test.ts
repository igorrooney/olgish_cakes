import { NextRequest, NextResponse } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createCsrfToken,
  setCsrfCookie,
  validateCsrfToken
} from '@/lib/csrf'

function makeRequest(token?: string): NextRequest {
  return new NextRequest('https://events.olgishcakes.co.uk/api/event-photo/request', {
    headers: token
      ? {
          cookie: `events-csrf=${token}`
        }
      : undefined
  })
}

describe('CSRF tokens', () => {
  beforeEach(() => {
    process.env.CSRF_SECRET = 'test-csrf-secret-with-enough-length'
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('validates matching signed cookie and submitted tokens', () => {
    const token = createCsrfToken()

    expect(validateCsrfToken(makeRequest(token), token)).toBe(true)
  })

  it('rejects missing, mismatched, tampered, and expired tokens', () => {
    const token = createCsrfToken()

    expect(validateCsrfToken(makeRequest(), token)).toBe(false)
    expect(validateCsrfToken(makeRequest(token), `${token}x`)).toBe(false)
    expect(validateCsrfToken(makeRequest(`${token}x`), `${token}x`)).toBe(false)

    vi.setSystemTime(new Date('2026-05-20T13:01:00.000Z'))

    expect(validateCsrfToken(makeRequest(token), token)).toBe(false)
  })

  it('sets a same-site HTTP-only CSRF cookie', () => {
    const response = NextResponse.json({ ok: true })
    const token = createCsrfToken()

    setCsrfCookie(response, token)

    const setCookie = response.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain('events-csrf=')
    expect(setCookie.toLowerCase()).toContain('httponly')
    expect(setCookie.toLowerCase()).toContain('samesite=lax')
  })
})
