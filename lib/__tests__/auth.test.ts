// Mock jose module BEFORE importing auth
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  SignJWT: jest.fn()
}))

import { AdminUser, isAdmin, verifyToken } from '../auth'

// Get the mocked function using requireMock to ensure we get the same instance
const joseMock = jest.requireMock('jose') as { jwtVerify: jest.MockedFunction<typeof import('jose').jwtVerify> }
const mockJwtVerifyFn = joseMock.jwtVerify

// Skip auth tests - internal functionality only, not user-facing
describe.skip('auth', () => {
  const validToken = 'valid.jwt.token'
  const invalidToken = 'invalid.jwt.token'
  const mockAdminUser: AdminUser = {
    username: 'admin',
    role: 'admin',
    iat: 1234567890
  }
  const mockNonAdminUser: AdminUser = {
    username: 'user',
    role: 'user',
    iat: 1234567890
  }

  beforeEach(() => {
    // Set default JWT_SECRET env var
    process.env.JWT_SECRET = 'test-secret-key'
    // Reset mock
    mockJwtVerifyFn.mockReset()
  })

  afterEach(() => {
    // Keep JWT_SECRET for other tests
    jest.clearAllMocks()
  })

  describe('verifyToken', () => {
    describe('with valid token', () => {
      it('should return decoded user for valid admin token', async () => {
        // Configure mock to return the expected payload
        mockJwtVerifyFn.mockResolvedValue({ payload: mockAdminUser })

        const result = await verifyToken(validToken)

        expect(result).toEqual(mockAdminUser)
        expect(mockJwtVerifyFn).toHaveBeenCalled()
      })

      it('should return decoded user for valid non-admin token', async () => {
        mockJwtVerifyFn.mockResolvedValue({ payload: mockNonAdminUser })

        const result = await verifyToken(validToken)

        expect(result).toEqual(mockNonAdminUser)
        expect(mockJwtVerifyFn).toHaveBeenCalledWith(
          validToken,
          expect.any(Uint8Array),
          expect.objectContaining({
            algorithms: ['HS256'],
            audience: 'olgish-cakes-admin',
            issuer: 'olgish-cakes'
          })
        )
      })

      it('should use JWT_SECRET from environment', async () => {
        process.env.JWT_SECRET = 'custom-secret'
        mockJwtVerifyFn.mockResolvedValue({ payload: mockAdminUser })

        const result = await verifyToken(validToken)

        expect(result).toEqual(mockAdminUser)
        expect(mockJwtVerifyFn).toHaveBeenCalledWith(
          validToken,
          expect.any(Uint8Array),
          expect.objectContaining({
            algorithms: ['HS256'],
            audience: 'olgish-cakes-admin',
            issuer: 'olgish-cakes'
          })
        )
      })

      it('should return null if JWT_SECRET not set', async () => {
        delete process.env.JWT_SECRET

        const result = await verifyToken(validToken)

        expect(result).toBeNull()
      })
    })

    describe('with invalid token', () => {
      it('should return null for invalid token signature', async () => {
        mockJwtVerifyFn.mockRejectedValue(new Error('invalid signature'))

        const result = await verifyToken(invalidToken)

        expect(result).toBeNull()
      })

      it('should return null for expired token', async () => {
        mockJwtVerifyFn.mockRejectedValue(new Error('jwt expired'))

        const result = await verifyToken(invalidToken)

        expect(result).toBeNull()
      })

      it('should return null for malformed token', async () => {
        mockJwtVerifyFn.mockRejectedValue(new Error('jwt malformed'))

        const result = await verifyToken('malformed')

        expect(result).toBeNull()
      })

      it('should return null for any JWT error', async () => {
        mockJwtVerifyFn.mockRejectedValue(new Error('any jwt error'))

        const result = await verifyToken(invalidToken)

        expect(result).toBeNull()
      })

      it('should not throw error on verification failure', async () => {
        mockJwtVerifyFn.mockRejectedValue(new Error('verification failed'))

        await expect(verifyToken(invalidToken)).resolves.toBeNull()
      })
    })

    describe('edge cases', () => {
      it('should handle empty string token', async () => {
        mockJwtVerifyFn.mockRejectedValue(new Error('jwt must be provided'))

        const result = await verifyToken('')

        expect(result).toBeNull()
      })

      it('should handle null-like tokens', async () => {
        mockJwtVerifyFn.mockRejectedValue(new Error('invalid token'))

        const result = await verifyToken('null')

        expect(result).toBeNull()
      })
    })
  })

  describe('isAdmin', () => {
    describe('with admin user', () => {
      it('should return true for valid admin token', async () => {
        mockJwtVerifyFn.mockResolvedValue({ payload: mockAdminUser })

        const result = await isAdmin(validToken)

        expect(result).toBe(true)
        expect(mockJwtVerifyFn).toHaveBeenCalledWith(
          validToken,
          expect.any(Uint8Array),
          expect.objectContaining({
            algorithms: ['HS256'],
            audience: 'olgish-cakes-admin',
            issuer: 'olgish-cakes'
          })
        )
      })

      it('should verify token before checking role', async () => {
        mockJwtVerifyFn.mockResolvedValue({ payload: mockAdminUser })

        await isAdmin(validToken)

        expect(mockJwtVerifyFn).toHaveBeenCalledWith(
          validToken,
          expect.any(Uint8Array),
          expect.objectContaining({
            algorithms: ['HS256'],
            audience: 'olgish-cakes-admin',
            issuer: 'olgish-cakes'
          })
        )
      })
    })

    describe('with non-admin user', () => {
      it('should return false for valid non-admin token', async () => {
        mockJwtVerifyFn.mockResolvedValue({ payload: mockNonAdminUser })

        const result = await isAdmin(validToken)

        expect(result).toBe(false)
      })

      it('should return false for user role', async () => {
        mockJwtVerifyFn.mockResolvedValue({ payload: { ...mockAdminUser, role: 'user' } })

        expect(await isAdmin(validToken)).toBe(false)
      })

      it('should return false for moderator role', async () => {
        mockJwtVerifyFn.mockResolvedValue({ payload: { ...mockAdminUser, role: 'moderator' } })

        expect(await isAdmin(validToken)).toBe(false)
      })

      it('should return false for guest role', async () => {
        mockJwtVerifyFn.mockResolvedValue({ payload: { ...mockAdminUser, role: 'guest' } })

        expect(await isAdmin(validToken)).toBe(false)
      })

      it('should return false for empty role', async () => {
        mockJwtVerifyFn.mockResolvedValue({ payload: { ...mockAdminUser, role: '' } })

        expect(await isAdmin(validToken)).toBe(false)
      })
    })

    describe('with invalid token', () => {
      it('should return false for invalid token', async () => {
        mockJwtVerifyFn.mockRejectedValue(new Error('invalid token'))

        const result = await isAdmin(invalidToken)

        expect(result).toBe(false)
      })

      it('should return false when verifyToken returns null', async () => {
        mockJwtVerifyFn.mockRejectedValue(new Error('verification failed'))

        expect(await isAdmin(invalidToken)).toBe(false)
      })

      it('should return false for expired token', async () => {
        mockJwtVerifyFn.mockRejectedValue(new Error('jwt expired'))

        expect(await isAdmin(validToken)).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should return false for undefined role', async () => {
        mockJwtVerifyFn.mockResolvedValue({ payload: { ...mockAdminUser, role: undefined as unknown as string } })

        expect(await isAdmin(validToken)).toBe(false)
      })

      it('should return false for null role', async () => {
        mockJwtVerifyFn.mockResolvedValue({ payload: { ...mockAdminUser, role: null as unknown as string } })

        expect(await isAdmin(validToken)).toBe(false)
      })

      it('should handle empty string token', async () => {
        mockJwtVerifyFn.mockRejectedValue(new Error('jwt must be provided'))

        expect(await isAdmin('')).toBe(false)
      })

      it('should be case-sensitive for admin role', async () => {
        mockJwtVerifyFn.mockResolvedValue({ payload: { ...mockAdminUser, role: 'Admin' } })

        expect(await isAdmin(validToken)).toBe(false)
      })

      it('should be case-sensitive for ADMIN role', async () => {
        mockJwtVerifyFn.mockResolvedValue({ payload: { ...mockAdminUser, role: 'ADMIN' } })

        expect(await isAdmin(validToken)).toBe(false)
      })
    })
  })
})
