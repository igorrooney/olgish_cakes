/**
 * @jest-environment node
 */

describe('dev email security', () => {
  const originalRateLimit = process.env.EMAIL_REAL_SEND_RATE_LIMIT_PER_HOUR
  let nowSpy: jest.SpyInstance<number, []> | null = null

  beforeEach(() => {
    jest.resetModules()
    process.env.EMAIL_REAL_SEND_RATE_LIMIT_PER_HOUR = '1'
  })

  afterEach(() => {
    if (nowSpy) {
      nowSpy.mockRestore()
      nowSpy = null
    }

    if (typeof originalRateLimit === 'string') {
      process.env.EMAIL_REAL_SEND_RATE_LIMIT_PER_HOUR = originalRateLimit
    } else {
      delete process.env.EMAIL_REAL_SEND_RATE_LIMIT_PER_HOUR
    }
  })

  it('enforces per-key limit within the same window', () => {
    const { checkRealSendRateLimit } = require('../dev-security') as typeof import('../dev-security')

    const first = checkRealSendRateLimit('actor-a:127.0.0.1')
    const second = checkRealSendRateLimit('actor-a:127.0.0.1')

    expect(first.allowed).toBe(true)
    expect(first.retryAfterSeconds).toBe(0)
    expect(second.allowed).toBe(false)
    expect(second.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('evicts oldest keys after cap overflow so old exhausted keys do not persist forever', () => {
    const { checkRealSendRateLimit } = require('../dev-security') as typeof import('../dev-security')

    const seedKey = 'seed-actor:127.0.0.1'
    expect(checkRealSendRateLimit(seedKey).allowed).toBe(true)
    expect(checkRealSendRateLimit(seedKey).allowed).toBe(false)

    for (let index = 0; index < 700; index += 1) {
      const result = checkRealSendRateLimit(`actor-${index}:10.0.0.${index}`)
      expect(result.allowed).toBe(true)
    }

    const afterOverflow = checkRealSendRateLimit(seedKey)
    expect(afterOverflow.allowed).toBe(true)
    expect(afterOverflow.retryAfterSeconds).toBe(0)
  })

  it('allows a key again after the window expires and stale entries are pruned', () => {
    const { checkRealSendRateLimit } = require('../dev-security') as typeof import('../dev-security')

    let now = 1000000
    nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now)

    expect(checkRealSendRateLimit('actor-expiry:127.0.0.1').allowed).toBe(true)
    expect(checkRealSendRateLimit('actor-expiry:127.0.0.1').allowed).toBe(false)

    now += (60 * 60 * 1000) + 1

    const otherKey = checkRealSendRateLimit('actor-expiry-prune-trigger:127.0.0.2')
    const expiredKey = checkRealSendRateLimit('actor-expiry:127.0.0.1')

    expect(otherKey.allowed).toBe(true)
    expect(expiredKey.allowed).toBe(true)
    expect(expiredKey.retryAfterSeconds).toBe(0)
  })
})