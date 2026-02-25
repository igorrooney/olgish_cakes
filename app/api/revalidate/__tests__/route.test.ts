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
    expect(revalidatePath).toHaveBeenCalledWith('/cakes-by-post')
    expect(revalidateTag).toHaveBeenCalledWith('cake-collections', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('gift-hamper-collections', 'max')
  })

  it('revalidates cakes delivery section paths and tags', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'cakesDeliverySection'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/cakes')
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidateTag).toHaveBeenCalledWith('pages', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('cakes', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', 'max')
  })

  it('revalidates gift hampers delivery section paths and tags', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'giftHampersDeliverySection'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/cakes-by-post')
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidateTag).toHaveBeenCalledWith('pages', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('cakes-by-post', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('gift-hampers', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', 'max')
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
    expect(revalidatePath).toHaveBeenCalledWith('/cakes-by-post')
    expect(revalidateTag).toHaveBeenCalledWith('cakes', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('cakes-by-post', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('gift-hampers', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', 'max')
  })
})
