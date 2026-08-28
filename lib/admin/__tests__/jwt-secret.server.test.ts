/**
 * @jest-environment node
 */
import { getAdminJwtSecret } from '../jwt-secret.server'

describe('admin JWT secret validation', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalJwtSecret = process.env.JWT_SECRET

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
    process.env.JWT_SECRET = originalJwtSecret
  })

  it('requires a configured non-empty secret in every environment', () => {
    delete process.env.JWT_SECRET
    expect(() => getAdminJwtSecret()).toThrow(
      'JWT_SECRET environment variable is required'
    )

    process.env.JWT_SECRET = '   '
    expect(() => getAdminJwtSecret()).toThrow(
      'JWT_SECRET environment variable is required'
    )
  })

  it('keeps short local and test fixtures usable outside production', () => {
    process.env.NODE_ENV = 'test'
    expect(getAdminJwtSecret('test-secret')).toBe('test-secret')

    process.env.NODE_ENV = 'development'
    expect(getAdminJwtSecret('development-secret')).toBe('development-secret')
  })

  it('fails closed for production secrets shorter than 32 bytes', () => {
    process.env.NODE_ENV = 'production'

    expect(() => getAdminJwtSecret('x'.repeat(31))).toThrow(
      'JWT_SECRET must be at least 32 bytes in production'
    )
    expect(getAdminJwtSecret('x'.repeat(32))).toBe('x'.repeat(32))
  })
})
