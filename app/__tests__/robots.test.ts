import robots from '../robots'

describe('robots.txt', () => {
  it('should return robots configuration', () => {
    const result = robots()

    expect(result).toBeDefined()
  })

  it('should allow all user agents', () => {
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules

    expect(rules.userAgent).toBe('*')
  })

  it('should allow all paths', () => {
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules

    expect(rules.allow).toBe('/')
  })

  it('should disallow studio and API paths', () => {
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules

    expect(rules.disallow).toContain('/studio/')
    expect(rules.disallow).toContain('/api/')
  })

  it('should include sitemap URL', () => {
    const result = robots()

    expect(result.sitemap).toBe('https://olgishcakes.co.uk/sitemap.xml')
  })

  it('should have correct type', () => {
    const result = robots()

    expect(result).toHaveProperty('rules')
    expect(result).toHaveProperty('sitemap')
  })
})

