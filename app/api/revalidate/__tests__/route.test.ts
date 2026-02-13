/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '../route'
import { revalidatePath, revalidateTag } from 'next/cache'

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn()
}))

jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: (handler: unknown) => handler
}))

jest.mock('@/app/utils/fetchCakes', () => ({
  invalidateCache: jest.fn()
}))

describe('/api/revalidate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.REVALIDATE_SECRET = 'test-secret'
  })

  it('revalidates collections paths and tags for collectionsDisplayOrder', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'collectionsDisplayOrder'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/cakes')
    expect(revalidateTag).toHaveBeenCalledWith('cake-collections', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('gift-hamper-collections', 'max')
  })

  it('revalidates product paths and tags for productsDisplayOrder', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'productsDisplayOrder'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/cakes')
    expect(revalidatePath).toHaveBeenCalledWith('/gift-hampers')
    expect(revalidateTag).toHaveBeenCalledWith('cakes', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('gift-hampers', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', 'max')
  })
})
