/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockRevalidateTag = jest.fn()

jest.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args)
}))

import { GET, POST } from '../route'

describe('/api/merchant-center/revalidate', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalToken = process.env.MERCHANT_CENTER_REVALIDATE_TOKEN
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NODE_ENV = 'test'
    process.env.MERCHANT_CENTER_REVALIDATE_TOKEN = 'merchant-secret'
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv
    process.env.MERCHANT_CENTER_REVALIDATE_TOKEN = originalToken
  })

  it('rejects POST without a valid authorization header', async () => {
    const response = await POST(new NextRequest(
      'http://localhost/api/merchant-center/revalidate',
      { method: 'POST' }
    ))

    expect(response.status).toBe(401)
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('revalidates the feed through authenticated POST', async () => {
    const response = await POST(new NextRequest(
      'http://localhost/api/merchant-center/revalidate',
      {
        method: 'POST',
        headers: { authorization: 'Bearer merchant-secret' }
      }
    ))

    expect(response.status).toBe(200)
    expect(mockRevalidateTag).toHaveBeenCalledWith('cakes', 'max')
    expect(mockRevalidateTag).toHaveBeenCalledWith('cakes-by-post', 'max')
    expect(mockRevalidateTag).toHaveBeenCalledWith('gift-hampers', 'max')
    expect(mockRevalidateTag).toHaveBeenCalledWith('merchant-center-feed', 'max')
  })

  it('requires a bearer header for the non-production legacy GET', async () => {
    const response = await GET(new NextRequest(
      'http://localhost/api/merchant-center/revalidate?token=merchant-secret'
    ))

    expect(response.status).toBe(401)
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('returns and logs only an allowlisted error code', async () => {
    const sentinel = 'SENTINEL provider response with private details'
    mockRevalidateTag.mockImplementation(() => {
      throw Object.assign(new Error(sentinel), { code: 'CACHE_FAILURE' })
    })

    const response = await POST(new NextRequest(
      'http://localhost/api/merchant-center/revalidate',
      {
        method: 'POST',
        headers: { authorization: 'Bearer merchant-secret' }
      }
    ))
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({
      error: 'Failed to revalidate feed cache',
      code: 'CACHE_FAILURE'
    })
    expect(JSON.stringify(payload)).not.toContain(sentinel)
    expect(JSON.stringify(consoleErrorSpy.mock.calls)).not.toContain(sentinel)
  })
})
