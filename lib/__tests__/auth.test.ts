import { AdminUser, isAdmin, verifyToken } from '../auth'

// Mock jose module
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  SignJWT: jest.fn()
}))

const { jwtVerify: mockedJose } = require('jose')

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
      it('should return decoded user for valid admin token', async () => {
        mockedJose.mockResolvedValue({ payload: mockAdminUser } as any)

        const result = await verifyToken(validToken)

        expect(result).toEqual(mockAdminUser)
        expect(mockedJose).toHaveBeenCalled()
      })

      it('should return decoded user for valid non-admin token', async () => {
        mockedJose.mockResolvedValue({ payload: mockNonAdminUser } as any)

        const result = await verifyToken(validToken)

        expect(result).toEqual(mockNonAdminUser)
      })

      it('should use JWT_SECRET from environment', async () => {
        process.env.JWT_SECRET = 'custom-secret'
        mockedJose.mockResolvedValue({ payload: mockAdminUser } as any)

        const result = await verifyToken(validToken)

        expect(result).toEqual(mockAdminUser)
        expect(mockedJose).toHaveBeenCalled()
      })

      it('should return null if JWT_SECRET not set', async () => {
        delete process.env.JWT_SECRET

        const result = await verifyToken(validToken)

        expect(result).toBeNull()
      })
    })

    describe('with invalid token', () => {
      it('should return null for invalid token signature', async () => {
        mockedJose.mockRejectedValue(new Error('invalid signature'))

        const result = await verifyToken(invalidToken)

        expect(result).toBeNull()
      })

      it('should return null for expired token', async () => {
        mockedJose.mockRejectedValue(new Error('jwt expired'))

        const result = await verifyToken(invalidToken)

        expect(result).toBeNull()
      })

      it('should return null for malformed token', async () => {
        mockedJose.mockRejectedValue(new Error('jwt malformed'))

        const result = await verifyToken('malformed')

        expect(result).toBeNull()
      })

      it('should return null for any JWT error', async () => {
        mockedJose.mockRejectedValue(new Error('any jwt error'))

        const result = await verifyToken(invalidToken)

        expect(result).toBeNull()
      })

      it('should not throw error on verification failure', async () => {
        mockedJose.mockRejectedValue(new Error('verification failed'))

        await expect(verifyToken(invalidToken)).resolves.toBeNull()
      })
    })

    describe('edge cases', () => {
      it('should handle empty string token', async () => {
        mockedJose.mockRejectedValue(new Error('jwt must be provided'))

        const result = await verifyToken('')

        expect(result).toBeNull()
      })

      it('should handle null-like tokens', async () => {
        mockedJose.mockRejectedValue(new Error('invalid token'))

        const result = await verifyToken('null')

        expect(result).toBeNull()
      })
    })
  })

  describe('isAdmin', () => {
    describe('with admin user', () => {
      it('should return true for valid admin token', async () => {
        mockedJose.mockResolvedValue({ payload: mockAdminUser } as any)

        const result = await isAdmin(validToken)

        expect(result).toBe(true)
      })

      it('should verify token before checking role', async () => {
        mockedJose.mockResolvedValue({ payload: mockAdminUser } as any)

        await isAdmin(validToken)

        expect(mockedJose).toHaveBeenCalled()
      })
    })

    describe('with non-admin user', () => {
      it('should return false for valid non-admin token', async () => {
        mockedJose.mockResolvedValue({ payload: mockNonAdminUser } as any)

        const result = await isAdmin(validToken)

        expect(result).toBe(false)
      })

      it('should return false for user role', async () => {
        mockedJose.mockResolvedValue({ payload: { ...mockAdminUser, role: 'user' } } as any)

        expect(await isAdmin(validToken)).toBe(false)
      })

      it('should return false for moderator role', async () => {
        mockedJose.mockResolvedValue({ payload: { ...mockAdminUser, role: 'moderator' } } as any)

        expect(await isAdmin(validToken)).toBe(false)
      })

      it('should return false for guest role', async () => {
        mockedJose.mockResolvedValue({ payload: { ...mockAdminUser, role: 'guest' } } as any)

        expect(await isAdmin(validToken)).toBe(false)
      })

      it('should return false for empty role', async () => {
        mockedJose.mockResolvedValue({ payload: { ...mockAdminUser, role: '' } } as any)

        expect(await isAdmin(validToken)).toBe(false)
      })
    })

    describe('with invalid token', () => {
      it('should return false for invalid token', async () => {
        mockedJose.mockRejectedValue(new Error('invalid token'))

        const result = await isAdmin(invalidToken)

        expect(result).toBe(false)
      })

      it('should return false when verifyToken returns null', async () => {
        mockedJose.mockRejectedValue(new Error('verification failed'))

        expect(await isAdmin(invalidToken)).toBe(false)
      })

      it('should return false for expired token', async () => {
        mockedJose.mockRejectedValue(new Error('jwt expired'))

        expect(await isAdmin(validToken)).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should return false for undefined role', async () => {
        mockedJose.mockResolvedValue({ payload: { ...mockAdminUser, role: undefined as any } } as any)

        expect(await isAdmin(validToken)).toBe(false)
      })

      it('should return false for null role', async () => {
        mockedJose.mockResolvedValue({ payload: { ...mockAdminUser, role: null as any } } as any)

        expect(await isAdmin(validToken)).toBe(false)
      })

      it('should handle empty string token', async () => {
        mockedJose.mockRejectedValue(new Error('jwt must be provided'))

        expect(await isAdmin('')).toBe(false)
      })

      it('should be case-sensitive for admin role', async () => {
        mockedJose.mockResolvedValue({ payload: { ...mockAdminUser, role: 'Admin' } } as any)

        expect(await isAdmin(validToken)).toBe(false)
      })

      it('should be case-sensitive for ADMIN role', async () => {
        mockedJose.mockResolvedValue({ payload: { ...mockAdminUser, role: 'ADMIN' } } as any)

        expect(await isAdmin(validToken)).toBe(false)
      })
    })
  })
})

