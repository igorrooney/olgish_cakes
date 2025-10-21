// Mock jose library BEFORE any imports
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-token')
  })),
  jwtVerify: jest.fn().mockResolvedValue({
    payload: {
      userId: 'test-user',
      role: 'admin'
    }
  })
}))

import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '../route'

describe('API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should export route handlers', () => {
    expect(GET || POST || PUT || DELETE).toBeDefined()
  })

  it('should handle requests', async () => {
    const handler = GET || POST || PUT || DELETE
    if (handler) {
      const request = new NextRequest('http://localhost/api/test')
      const response = await handler(request as any)
      expect(response).toBeDefined()
    }
  })
})
