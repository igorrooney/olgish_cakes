/**
 * @jest-environment node
 */
import { jest } from '@jest/globals'

describe('/api/csrf-token', () => {
  const originalCsrfSecret = process.env.CSRF_SECRET
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    jest.resetModules()
    consoleErrorSpy.mockClear()
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })

  afterEach(() => {
    if (originalCsrfSecret === undefined) {
      delete process.env.CSRF_SECRET
      return
    }

    process.env.CSRF_SECRET = originalCsrfSecret
  })

  it('imports without throwing when CSRF_SECRET is missing', async () => {
    delete process.env.CSRF_SECRET

    const routeModule = await import('../route')

    expect(routeModule.GET).toEqual(expect.any(Function))
    expect(routeModule.dynamic).toBe('force-dynamic')
  })

  it('returns a token and cookie when the secret is configured', async () => {
    process.env.CSRF_SECRET = 'a'.repeat(32)

    const { GET } = await import('../route')
    const response = await GET()
    const payload = await response.json()
    const cookie = response.cookies.get('csrf-token')

    expect(response.status).toBe(200)
    expect(typeof payload.token).toBe('string')
    expect(cookie?.value).toBe(payload.token)
    expect(cookie?.httpOnly).toBe(true)
  })

  it('returns a generic 500 response when the secret is missing', async () => {
    delete process.env.CSRF_SECRET

    const { GET } = await import('../route')
    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to generate CSRF token'
    })
  })

  it('returns a generic 500 response when the secret is too short', async () => {
    process.env.CSRF_SECRET = 'too-short'

    const { GET } = await import('../route')
    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to generate CSRF token'
    })
  })
})
