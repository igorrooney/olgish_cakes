/**
 * @jest-environment node
 */
import { POST } from '../route'

describe('/api/quote', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('returns a safe deprecation response without side effects', async () => {
    const response = POST()
    const data = await response.json()

    expect(response.status).toBe(410)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(data).toEqual({
      error: 'This quote endpoint is retired. Use /api/custom-cake-enquiry.'
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
