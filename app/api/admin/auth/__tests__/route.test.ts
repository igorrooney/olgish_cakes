import { NextRequest } from 'next/server'
import { POST, GET } from '../route'

// Mock jose
jest.mock('jose', () => ({
  SignJWT: jest.fn(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    sign: jest.fn(() => Promise.resolve('mock-token'))
  })),
  jwtVerify: jest.fn(() => Promise.resolve({
    payload: {
      username: 'admin',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    }
  }))
}))

describe('/api/admin/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_USERNAME = 'admin'
    process.env.ADMIN_PASSWORD = 'password'
    process.env.JWT_SECRET = 'secret'
  })

  describe('POST - Login', () => {
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

    it('should return 401 for invalid credentials', async () => {
      const request = new NextRequest('http://localhost/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ username: 'wrong', password: 'wrong' })
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
  })
})

