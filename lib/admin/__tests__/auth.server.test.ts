/**
 * @jest-environment node
 */
jest.mock('jose', () => ({
  jwtVerify: jest.fn()
}))

const mockCookies = jest.fn()

jest.mock('next/headers', () => ({
  cookies: () => mockCookies()
}))

import { isAdminAuthenticated, verifyAdminAuthToken } from '../auth.server'

const joseMock = jest.requireMock('jose') as { jwtVerify: jest.MockedFunction<typeof import('jose').jwtVerify> }
const mockJwtVerify = joseMock.jwtVerify

const originalAdminUsername = process.env.ADMIN_USERNAME
const originalJwtSecret = process.env.JWT_SECRET

interface CookieValue {
  value: string
}

interface CookieStore {
  get: (name: string) => CookieValue | undefined
}

describe('admin auth server helpers', () => {
  beforeEach(() => {
    process.env.ADMIN_USERNAME = 'admin-user'
    process.env.JWT_SECRET = 'test-secret-1234567890'
    mockCookies.mockReset()
    mockJwtVerify.mockReset()
  })

  afterAll(() => {
    process.env.ADMIN_USERNAME = originalAdminUsername
    process.env.JWT_SECRET = originalJwtSecret
  })

  it('verifies a valid admin token', async () => {
    mockJwtVerify.mockResolvedValue({
      payload: {
        username: 'admin-user',
        role: 'admin'
      }
    } as Awaited<ReturnType<typeof import('jose').jwtVerify>>)

    await expect(verifyAdminAuthToken('valid-token')).resolves.toBe(true)
  })

  it('rejects token verification errors', async () => {
    mockJwtVerify.mockRejectedValue(new Error('invalid signature'))

    await expect(verifyAdminAuthToken('invalid-token')).resolves.toBe(false)
  })

  it('rejects a token with non-admin role', async () => {
    mockJwtVerify.mockResolvedValue({
      payload: {
        username: 'admin-user',
        role: 'editor'
      }
    } as Awaited<ReturnType<typeof import('jose').jwtVerify>>)

    await expect(verifyAdminAuthToken('valid-token')).resolves.toBe(false)
  })

  it('rejects when required env variables are missing', async () => {
    process.env.JWT_SECRET = ''

    await expect(verifyAdminAuthToken('valid-token')).resolves.toBe(false)
    expect(mockJwtVerify).not.toHaveBeenCalled()
  })

  it('reads admin_auth_token from cookies for page-level auth', async () => {
    const cookieStore: CookieStore = {
      get: () => ({ value: 'valid-cookie-token' })
    }

    mockCookies.mockResolvedValue(cookieStore)
    mockJwtVerify.mockResolvedValue({
      payload: {
        username: 'admin-user',
        role: 'admin'
      }
    } as Awaited<ReturnType<typeof import('jose').jwtVerify>>)

    await expect(isAdminAuthenticated()).resolves.toBe(true)
    expect(mockJwtVerify).toHaveBeenCalledWith(
      'valid-cookie-token',
      expect.any(Uint8Array),
      expect.objectContaining({
        algorithms: ['HS256'],
        audience: 'olgish-cakes-admin',
        issuer: 'olgish-cakes',
        clockTolerance: '5s'
      })
    )
  })

  it('returns false when admin auth cookie is missing', async () => {
    const cookieStore: CookieStore = {
      get: () => undefined
    }

    mockCookies.mockResolvedValue(cookieStore)

    await expect(isAdminAuthenticated()).resolves.toBe(false)
    expect(mockJwtVerify).not.toHaveBeenCalled()
  })
})
