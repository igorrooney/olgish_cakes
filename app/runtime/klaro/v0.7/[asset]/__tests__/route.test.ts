/**
 * @jest-environment node
 */
import { GET } from '../route'

const request = new Request('http://localhost/runtime/klaro/v0.7/klaro.js')

describe('/runtime/klaro/v0.7/[asset]', () => {
  it('serves Klaro JavaScript with immutable cache headers', async () => {
    const response = await GET(request, {
      params: Promise.resolve({ asset: 'klaro.js' })
    })
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable')
    expect(response.headers.get('Content-Type')).toBe('application/javascript; charset=utf-8')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(Number(response.headers.get('Content-Length'))).toBeGreaterThan(200000)
    expect(body).toContain('klaro')
  })

  it('serves the no-CSS Klaro JavaScript bundle with immutable cache headers', async () => {
    const response = await GET(request, {
      params: Promise.resolve({ asset: 'klaro-no-css.js' })
    })
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable')
    expect(response.headers.get('Content-Type')).toBe('application/javascript; charset=utf-8')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(Number(response.headers.get('Content-Length'))).toBeGreaterThan(200000)
    expect(Number(response.headers.get('Content-Length'))).toBeLessThan(220000)
    expect(body).toContain('klaro')
  })

  it('serves Klaro CSS with immutable cache headers', async () => {
    const response = await GET(request, {
      params: Promise.resolve({ asset: 'klaro.min.css' })
    })
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable')
    expect(response.headers.get('Content-Type')).toBe('text/css; charset=utf-8')
    expect(Number(response.headers.get('Content-Length'))).toBeGreaterThan(10000)
    expect(body).toContain('.klaro')
  })

  it('rejects unknown runtime asset names', async () => {
    const response = await GET(request, {
      params: Promise.resolve({ asset: '../secret.js' })
    })

    expect(response.status).toBe(404)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    await expect(response.text()).resolves.toBe('Not found')
  })
})
