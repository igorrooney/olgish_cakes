/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { GET, POST } from '../route'

const mockFetch = jest.fn()

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn()
}))

jest.mock('@/sanity/lib/client', () => ({
  serverClient: {
    fetch: (...args: unknown[]) => mockFetch(...args)
  }
}))

describe('/api/cron/revalidate-articles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'cron-secret'
    delete process.env.REVALIDATE_SECRET
  })

  it('rejects unauthorized requests', async () => {
    const request = new NextRequest('http://localhost/api/cron/revalidate-articles', {
      method: 'GET'
    })

    const response = await GET(request)

    expect(response.status).toBe(401)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns a no-op response when no articles became due', async () => {
    mockFetch.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/cron/revalidate-articles', {
      method: 'GET',
      headers: {
        authorization: 'Bearer cron-secret'
      }
    })

    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      success: true,
      message: 'No newly due articles required revalidation.',
      lookbackMinutes: 45,
      revalidatedCount: 0,
      slugs: []
    })
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('revalidates the archive and due article pages', async () => {
    mockFetch.mockResolvedValue([
      { slug: 'cake-by-post-guide' },
      { slug: 'ukrainian-honey-cake-gifts' },
      { slug: 'cake-by-post-guide' }
    ])

    const request = new NextRequest('http://localhost/api/cron/revalidate-articles?lookbackMinutes=30', {
      method: 'POST',
      headers: {
        authorization: 'Bearer cron-secret'
      }
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      success: true,
      message: 'Revalidated newly due articles.',
      lookbackMinutes: 30,
      revalidatedCount: 2,
      slugs: ['cake-by-post-guide', 'ukrainian-honey-cake-gifts']
    })
    expect(revalidatePath).toHaveBeenCalledWith('/blog')
    expect(revalidatePath).toHaveBeenCalledWith('/blog/cake-by-post-guide')
    expect(revalidatePath).toHaveBeenCalledWith('/blog/ukrainian-honey-cake-gifts')
    expect(revalidateTag).toHaveBeenCalledWith('articles', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('article', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', 'max')
  })

  it('falls back to REVALIDATE_SECRET when CRON_SECRET is not set', async () => {
    delete process.env.CRON_SECRET
    process.env.REVALIDATE_SECRET = 'revalidate-secret'
    mockFetch.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/cron/revalidate-articles', {
      method: 'GET',
      headers: {
        authorization: 'Bearer revalidate-secret'
      }
    })

    const response = await GET(request)

    expect(response.status).toBe(200)
  })
})
