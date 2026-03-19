/**
 * @jest-environment node
 */

describe('csrf helpers', () => {
  const originalCsrfSecret = process.env.CSRF_SECRET

  beforeEach(() => {
    jest.resetModules()
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

    const csrfModule = await import('../csrf')

    expect(csrfModule.generateCsrfToken).toEqual(expect.any(Function))
    expect(csrfModule.validateCsrfToken).toEqual(expect.any(Function))
  })

  it('generates and validates a CSRF token when the secret is configured', async () => {
    process.env.CSRF_SECRET = 'a'.repeat(32)

    const { generateCsrfToken, validateCsrfToken } = await import('../csrf')
    const token = generateCsrfToken()

    expect(validateCsrfToken(token, token)).toBe(true)
  })

  it('throws when generating a token without a secret', async () => {
    delete process.env.CSRF_SECRET

    const { generateCsrfToken } = await import('../csrf')

    expect(() => generateCsrfToken()).toThrow(
      'CSRF_SECRET environment variable must be set to a cryptographically secure value'
    )
  })

  it('throws when generating a token with a short secret', async () => {
    process.env.CSRF_SECRET = 'too-short'

    const { generateCsrfToken } = await import('../csrf')

    expect(() => generateCsrfToken()).toThrow(
      'CSRF_SECRET environment variable must be set to a cryptographically secure value'
    )
  })

  it('returns false when the submitted token does not match the cookie token', async () => {
    process.env.CSRF_SECRET = 'a'.repeat(32)

    const { generateCsrfToken, validateCsrfToken } = await import('../csrf')
    const token = generateCsrfToken()

    expect(validateCsrfToken(token, 'different-token')).toBe(false)
  })
})
