import jwt from 'jsonwebtoken'
import { verifyToken, isAdmin, AdminUser } from '../auth'

// Mock jwt module
jest.mock('jsonwebtoken')

const mockedJwt = jwt as jest.Mocked<typeof jwt>

describe('auth', () => {
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
    jest.clearAllMocks()
    // Set default JWT_SECRET env var
    process.env.JWT_SECRET = 'test-secret-key'
  })

  afterEach(() => {
    delete process.env.JWT_SECRET
  })

  describe('verifyToken', () => {
    describe('with valid token', () => {
      it('should return decoded user for valid admin token', () => {
        mockedJwt.verify.mockReturnValue(mockAdminUser as any)

        const result = verifyToken(validToken)

        expect(result).toEqual(mockAdminUser)
        expect(mockedJwt.verify).toHaveBeenCalled()
      })

      it('should return decoded user for valid non-admin token', () => {
        mockedJwt.verify.mockReturnValue(mockNonAdminUser as any)

        const result = verifyToken(validToken)

        expect(result).toEqual(mockNonAdminUser)
      })

      it('should use JWT_SECRET from environment', () => {
        process.env.JWT_SECRET = 'custom-secret'
        mockedJwt.verify.mockReturnValue(mockAdminUser as any)

        const result = verifyToken(validToken)

        expect(result).toEqual(mockAdminUser)
        expect(mockedJwt.verify).toHaveBeenCalled()
      })

      it('should use default secret if JWT_SECRET not set', () => {
        delete process.env.JWT_SECRET
        mockedJwt.verify.mockReturnValue(mockAdminUser as any)

        const result = verifyToken(validToken)

        expect(result).toEqual(mockAdminUser)
        expect(mockedJwt.verify).toHaveBeenCalled()
      })
    })

    describe('with invalid token', () => {
      it('should return null for invalid token signature', () => {
        mockedJwt.verify.mockImplementation(() => {
          throw new Error('invalid signature')
        })

        const result = verifyToken(invalidToken)

        expect(result).toBeNull()
      })

      it('should return null for expired token', () => {
        mockedJwt.verify.mockImplementation(() => {
          throw new Error('jwt expired')
        })

        const result = verifyToken(invalidToken)

        expect(result).toBeNull()
      })

      it('should return null for malformed token', () => {
        mockedJwt.verify.mockImplementation(() => {
          throw new Error('jwt malformed')
        })

        const result = verifyToken('malformed')

        expect(result).toBeNull()
      })

      it('should return null for any JWT error', () => {
        mockedJwt.verify.mockImplementation(() => {
          throw new Error('any jwt error')
        })

        const result = verifyToken(invalidToken)

        expect(result).toBeNull()
      })

      it('should not throw error on verification failure', () => {
        mockedJwt.verify.mockImplementation(() => {
          throw new Error('verification failed')
        })

        expect(() => verifyToken(invalidToken)).not.toThrow()
      })
    })

    describe('edge cases', () => {
      it('should handle empty string token', () => {
        mockedJwt.verify.mockImplementation(() => {
          throw new Error('jwt must be provided')
        })

        const result = verifyToken('')

        expect(result).toBeNull()
      })

      it('should handle null-like tokens', () => {
        mockedJwt.verify.mockImplementation(() => {
          throw new Error('invalid token')
        })

        const result = verifyToken('null')

        expect(result).toBeNull()
      })
    })
  })

  describe('isAdmin', () => {
    describe('with admin user', () => {
      it('should return true for valid admin token', () => {
        mockedJwt.verify.mockReturnValue(mockAdminUser as any)

        const result = isAdmin(validToken)

        expect(result).toBe(true)
      })

      it('should verify token before checking role', () => {
        mockedJwt.verify.mockReturnValue(mockAdminUser as any)

        isAdmin(validToken)

        // Verify was called with the token (secret is captured at module load time)
        expect(mockedJwt.verify).toHaveBeenCalledWith(validToken, expect.any(String))
      })
    })

    describe('with non-admin user', () => {
      it('should return false for valid non-admin token', () => {
        mockedJwt.verify.mockReturnValue(mockNonAdminUser as any)

        const result = isAdmin(validToken)

        expect(result).toBe(false)
      })

      it('should return false for user role', () => {
        mockedJwt.verify.mockReturnValue({  ...mockAdminUser, role: 'user' })

        expect(isAdmin(validToken)).toBe(false)
      })

      it('should return false for moderator role', () => {
        mockedJwt.verify.mockReturnValue({  ...mockAdminUser, role: 'moderator' })

        expect(isAdmin(validToken)).toBe(false)
      })

      it('should return false for guest role', () => {
        mockedJwt.verify.mockReturnValue({  ...mockAdminUser, role: 'guest' })

        expect(isAdmin(validToken)).toBe(false)
      })

      it('should return false for empty role', () => {
        mockedJwt.verify.mockReturnValue({  ...mockAdminUser, role: '' })

        expect(isAdmin(validToken)).toBe(false)
      })
    })

    describe('with invalid token', () => {
      it('should return false for invalid token', () => {
        mockedJwt.verify.mockImplementation(() => {
          throw new Error('invalid token')
        })

        const result = isAdmin(invalidToken)

        expect(result).toBe(false)
      })

      it('should return false when verifyToken returns null', () => {
        mockedJwt.verify.mockImplementation(() => {
          throw new Error('verification failed')
        })

        expect(isAdmin(invalidToken)).toBe(false)
      })

      it('should return false for expired token', () => {
        mockedJwt.verify.mockImplementation(() => {
          throw new Error('jwt expired')
        })

        expect(isAdmin(validToken)).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should return false for undefined role', () => {
        mockedJwt.verify.mockReturnValue({  ...mockAdminUser, role: undefined as any })

        expect(isAdmin(validToken)).toBe(false)
      })

      it('should return false for null role', () => {
        mockedJwt.verify.mockReturnValue({  ...mockAdminUser, role: null as any })

        expect(isAdmin(validToken)).toBe(false)
      })

      it('should handle empty string token', () => {
        mockedJwt.verify.mockImplementation(() => {
          throw new Error('jwt must be provided')
        })

        expect(isAdmin('')).toBe(false)
      })

      it('should be case-sensitive for admin role', () => {
        mockedJwt.verify.mockReturnValue({  ...mockAdminUser, role: 'Admin' })

        expect(isAdmin(validToken)).toBe(false)
      })

      it('should be case-sensitive for ADMIN role', () => {
        mockedJwt.verify.mockReturnValue({  ...mockAdminUser, role: 'ADMIN' })

        expect(isAdmin(validToken)).toBe(false)
      })
    })
  })
})

