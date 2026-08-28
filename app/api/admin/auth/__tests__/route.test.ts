/**
 * @jest-environment node
 */
const mockJwtSign = jest.fn(() => Promise.resolve('mock-token'))
const mockJwtVerify = jest.fn(() => Promise.resolve({
  payload: {
    username: 'admin',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000)
  }
}))
const mockLoggerError = jest.fn()

// Mock jose
jest.mock('jose', () => ({
  SignJWT: jest.fn(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuer: jest.fn().mockReturnThis(),
    setAudience: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    sign: (...args: unknown[]) => mockJwtSign(...args)
  })),
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args)
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

import { NextRequest } from 'next/server'
import { POST, GET } from '../route'

describe('/api/admin/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockJwtSign.mockResolvedValue('mock-token')
    mockJwtVerify.mockResolvedValue({
      payload: {
        username: 'admin',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      }
    })
    process.env.ADMIN_USERNAME = 'admin'
    process.env.ADMIN_PASSWORD = 'password'
    process.env.JWT_SECRET = 'secret'
  })

  describe('POST - Login', () => {
    it('fails closed for a native pre-hydration form POST without exposing credentials', async () => {
      const sentinelUsername = 'PRIVATE_NATIVE_USERNAME'
      const sentinelPassword = 'PRIVATE_NATIVE_PASSWORD'
      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: sentinelUsername,
          password: sentinelPassword
        })
      })

      const response = await POST(request)
      const responseBody = await response.text()
      const location = response.headers.get('location')

      expect(response.status).toBe(303)
      expect(location).toBe('http://localhost/admin/auth')
      expect(response.headers.get('cache-control')).toContain('no-store')
      expect(responseBody).toBe('')
      expect(request.nextUrl.search).toBe('')
      expect(JSON.stringify({ responseBody, location, logs: mockLoggerError.mock.calls })).not.toContain(sentinelUsername)
      expect(JSON.stringify({ responseBody, location, logs: mockLoggerError.mock.calls })).not.toContain(sentinelPassword)
      expect(mockJwtSign).not.toHaveBeenCalled()
    })

    it('should return 400 when username missing', async () => {
      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ password: 'test' })
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 when password missing', async () => {
      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ username: 'test' })
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it.each([
      ['wrong', 'password'],
      ['admin', 'wrong'],
      ['wrong', 'wrong']
    ])('should return 401 for invalid credentials', async (username, password) => {
      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should return 200 for valid credentials', async () => {
      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'password' })
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.success).toBe(true)
    })

    it('should set auth cookie', async () => {
      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'password' })
      })

      const response = await POST(request)
      const cookie = response.cookies.get('admin_auth_token')

      expect(cookie).toBeDefined()
      expect(cookie?.value).toBe('mock-token')
    })

    it('should return 500 when JWT_SECRET missing', async () => {
      delete process.env.JWT_SECRET

      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'password' })
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })

    it('should return 500 when ADMIN_USERNAME missing', async () => {
      delete process.env.ADMIN_USERNAME

      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'password' })
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })

    it('returns a generic failure and safely logs a JWT signing error', async () => {
      const sentinel = 'PRIVATE_JWT_SIGNING_MESSAGE'
      mockJwtSign.mockRejectedValueOnce(new Error(sentinel))

      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'password' })
      })

      const response = await POST(request)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body).toEqual({ error: 'Authentication failed' })
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Admin authentication request failed',
        {
          operation: 'admin.auth.login',
          code: 'OPERATION_FAILED'
        }
      )
      expect(JSON.stringify({ body, logs: mockLoggerError.mock.calls })).not.toContain(sentinel)
    })

    it('treats malformed JSON as a generic authentication failure without logging it', async () => {
      const sentinel = 'PRIVATE_MALFORMED_AUTH_BODY'
      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'POST',
        body: `{${sentinel}`
      })

      const response = await POST(request)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body).toEqual({ error: 'Authentication failed' })
      expect(JSON.stringify({ body, logs: mockLoggerError.mock.calls })).not.toContain(sentinel)
    })
  })

  describe('GET - Auth Check', () => {
    it('should return 401 when no token', async () => {
      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'GET'
      })

      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('should return 200 when token present', async () => {
      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'GET',
        headers: { Cookie: 'admin_auth_token=valid-token' }
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it.each([
      { username: 'other-admin', role: 'admin' },
      { username: 'admin', role: 'editor' }
    ])('returns 401 when the signed payload is not the configured admin: %p', async (payload) => {
      mockJwtVerify.mockResolvedValueOnce({ payload })
      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'GET',
        headers: { Cookie: 'admin_auth_token=valid-token' }
      })

      const response = await GET(request)

      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ authenticated: false })
    })

    it('returns 401 for an invalid token without exposing verification details', async () => {
      const sentinel = 'PRIVATE_JWT_VERIFY_MESSAGE'
      mockJwtVerify.mockRejectedValueOnce(new Error(sentinel))

      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'GET',
        headers: { Cookie: 'admin_auth_token=invalid-token' }
      })

      const response = await GET(request)
      const body = await response.json()

      expect(response.status).toBe(401)
      expect(body).toEqual({ authenticated: false })
      expect(JSON.stringify({ body, logs: mockLoggerError.mock.calls })).not.toContain(sentinel)
    })

    it('safely logs a configuration failure during an auth check', async () => {
      delete process.env.JWT_SECRET

      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'GET',
        headers: { Cookie: 'admin_auth_token=valid-token' }
      })

      const response = await GET(request)

      expect(response.status).toBe(401)
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Admin authentication request failed',
        {
          operation: 'admin.auth.check',
          code: 'OPERATION_FAILED'
        }
      )
      expect(JSON.stringify(mockLoggerError.mock.calls)).not.toContain('JWT_SECRET')
    })
  })
})

