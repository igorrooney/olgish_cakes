/**
 * @jest-environment node
 */
const mockJwtVerify = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('jose', () => ({
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args)
}))

jest.mock('../logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

import { isAdminAuthenticated, verifyAdminToken } from '../admin-auth'

describe('admin authentication helpers', () => {
  const originalJwtSecret = process.env.JWT_SECRET
  const originalAdminUsername = process.env.ADMIN_USERNAME

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    process.env.ADMIN_USERNAME = 'admin'
    mockJwtVerify.mockResolvedValue({
      payload: { username: 'admin', role: 'admin' }
    })
  })

  afterAll(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET
    } else {
      process.env.JWT_SECRET = originalJwtSecret
    }

    if (originalAdminUsername === undefined) {
      delete process.env.ADMIN_USERNAME
    } else {
      process.env.ADMIN_USERNAME = originalAdminUsername
    }
  })

  it('returns false when the request has no admin token', async () => {
    await expect(isAdminAuthenticated(new Request('http://localhost')))
      .resolves.toBe(false)
    expect(mockJwtVerify).not.toHaveBeenCalled()
  })

  it('accepts a valid admin token', async () => {
    const request = new Request('http://localhost', {
      headers: { Cookie: 'admin_auth_token=valid-token' }
    })

    await expect(isAdminAuthenticated(request)).resolves.toBe(true)
    expect(mockJwtVerify).toHaveBeenCalledWith(
      'valid-token',
      expect.any(Uint8Array),
      {
        issuer: 'olgish-cakes',
        audience: 'olgish-cakes-admin',
        algorithms: ['HS256'],
        clockTolerance: '5s'
      }
    )
  })

  it('rejects a token issued to a different configured username', async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { username: 'former-admin', role: 'admin' }
    })
    const request = new Request('http://localhost', {
      headers: { Cookie: 'admin_auth_token=valid-token' }
    })

    await expect(isAdminAuthenticated(request)).resolves.toBe(false)
  })

  it('rejects a token whose payload fields are not strings', async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { username: 42, role: ['admin'] }
    })

    await expect(verifyAdminToken('invalid-payload')).resolves.toBeNull()
  })

  it('logs only safe fields when token verification throws', async () => {
    const sentinel = 'PRIVATE_JWT_PROVIDER_MESSAGE'
    mockJwtVerify.mockRejectedValue(new Error(sentinel))

    await expect(verifyAdminToken('invalid-token')).resolves.toBeNull()

    expect(mockLoggerError).toHaveBeenCalledWith(
      'Admin authentication operation failed',
      {
        operation: 'admin-auth.verify-token',
        code: 'OPERATION_FAILED'
      }
    )
    expect(JSON.stringify(mockLoggerError.mock.calls)).not.toContain(sentinel)
  })
})
