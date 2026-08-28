/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '../route'
import { revalidatePath, revalidateTag } from 'next/cache'
import { categoryLandingCanonicalPaths } from '@/app/cakes/categoryLandingConfig'
import { createSanityWriteClient } from '@/lib/sanity-admin-client'
import { ensureProductDisplayOrderEntry } from '@/lib/product-display-order-sync'

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

jest.mock('@/lib/sanity-admin-client', () => ({
  createSanityWriteClient: jest.fn(() => ({ sanityClient: true }))
}))

jest.mock('@/lib/product-display-order-sync', () => ({
  ensureProductDisplayOrderEntry: jest.fn(async () => ({
    documentId: 'sample-cake',
    fieldName: 'cakesOrder',
    updated: false,
    inserted: false,
    alreadyPresent: true
  }))
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

const mockedCreateSanityWriteClient = createSanityWriteClient as jest.MockedFunction<typeof createSanityWriteClient>
const mockedEnsureProductDisplayOrderEntry = ensureProductDisplayOrderEntry as jest.MockedFunction<typeof ensureProductDisplayOrderEntry>
const { logger: mockLogger } = jest.requireMock('@/lib/logger') as {
  logger: { error: jest.Mock }
}
const mockLoggerError = mockLogger.error

describe('/api/revalidate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.REVALIDATE_SECRET = 'test-secret'
    mockedEnsureProductDisplayOrderEntry.mockResolvedValue({
      documentId: 'sample-cake',
      fieldName: 'cakesOrder',
      updated: false,
      inserted: false,
      alreadyPresent: true
    })
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
    expect(revalidateTag).toHaveBeenCalledWith('cake-collections', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('gift-hamper-collections', { expire: 0 })
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
    expect(revalidateTag).toHaveBeenCalledWith('pages', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('cakes', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', { expire: 0 })
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
    expect(revalidateTag).toHaveBeenCalledWith('pages', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('cakes-by-post', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('gift-hampers', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', { expire: 0 })
  })

  it('revalidates allergen guidance when ingredient references change', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'ingredient'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/allergens')
    expect(revalidateTag).toHaveBeenCalledWith('ingredients', { expire: 0 })
  })

  it('revalidates testimonial-dependent pages and tags for testimonial updates', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'testimonial'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/cakes-by-post')
    expect(revalidatePath).toHaveBeenCalledWith('/custom-cakes')
    expect(revalidateTag).toHaveBeenCalledWith('testimonials', { expire: 0 })
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
    categoryLandingCanonicalPaths.forEach((path) => {
      expect(revalidatePath).toHaveBeenCalledWith(path)
    })
    expect(revalidateTag).toHaveBeenCalledWith('cakes', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('cakes-by-post', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('gift-hampers', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', { expire: 0 })
  })

  it('revalidates cake detail, listings and category landing pages for cake updates', async () => {
    const sanityClient = { sanityClient: true }
    mockedCreateSanityWriteClient.mockReturnValue(sanityClient as ReturnType<typeof createSanityWriteClient>)
    mockedEnsureProductDisplayOrderEntry.mockResolvedValue({
      documentId: 'sample-cake-id',
      fieldName: 'cakesOrder',
      updated: true,
      inserted: true,
      alreadyPresent: false
    })
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'cake',
        _id: 'sample-cake-id',
        slug: {
          current: 'sample-cake'
        }
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockedEnsureProductDisplayOrderEntry).toHaveBeenCalledWith({
      client: sanityClient,
      documentId: 'sample-cake-id',
      fieldName: 'cakesOrder'
    })
    expect(revalidatePath).toHaveBeenCalledWith('/cakes/sample-cake')
    expect(revalidatePath).toHaveBeenCalledWith('/cakes')
    expect(revalidatePath).toHaveBeenCalledWith('/')
    categoryLandingCanonicalPaths.forEach((path) => {
      expect(revalidatePath).toHaveBeenCalledWith(path)
    })
    expect(revalidateTag).toHaveBeenCalledWith('cakes', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('pages', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', { expire: 0 })
  })

  it('still revalidates cake paths when products display order sync fails', async () => {
    const sentinel = 'SENTINEL Sanity token and customer content'
    mockedEnsureProductDisplayOrderEntry.mockRejectedValue(
      Object.assign(new Error(sentinel), { code: 'SANITY_SYNC_FAILED' })
    )
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'cake',
        _id: 'sample-cake-id',
        slug: {
          current: 'sample-cake'
        }
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.productsDisplayOrder).toEqual({
      documentId: 'sample-cake-id',
      fieldName: 'cakesOrder',
      updated: false,
      inserted: false,
      alreadyPresent: false
    })
    expect(revalidatePath).toHaveBeenCalledWith('/cakes/sample-cake')
    expect(revalidatePath).toHaveBeenCalledWith('/cakes')
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidateTag).toHaveBeenCalledWith('cakes', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('pages', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', { expire: 0 })
    expect(JSON.stringify(mockLoggerError.mock.calls)).not.toContain(sentinel)
    expect(mockLoggerError).toHaveBeenCalledWith('Product display order sync failed', {
      operation: 'revalidate.product-display-order-sync',
      code: 'SANITY_SYNC_FAILED'
    })
  })

  it('returns and logs only a safe code when revalidation fails', async () => {
    const sentinel = 'SENTINEL cache failure with private webhook data'
    jest.mocked(revalidatePath).mockImplementationOnce(() => {
      throw Object.assign(new Error(sentinel), { code: 'CACHE_REVALIDATE_FAILED' })
    })
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'testimonial'
      })
    })

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({
      success: false,
      error: 'Revalidation failed',
      code: 'CACHE_REVALIDATE_FAILED'
    })
    expect(JSON.stringify(payload)).not.toContain(sentinel)
    expect(JSON.stringify(mockLoggerError.mock.calls)).not.toContain(sentinel)
    expect(mockLoggerError).toHaveBeenCalledWith('Revalidation failed', {
      operation: 'revalidate.webhook',
      code: 'CACHE_REVALIDATE_FAILED'
    })
  })

  it('syncs gift hamper detail updates into product display order', async () => {
    const sanityClient = { sanityClient: true }
    mockedCreateSanityWriteClient.mockReturnValue(sanityClient as ReturnType<typeof createSanityWriteClient>)
    mockedEnsureProductDisplayOrderEntry.mockResolvedValue({
      documentId: 'sample-hamper-id',
      fieldName: 'giftHampersOrder',
      updated: true,
      inserted: true,
      alreadyPresent: false
    })
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'giftHamper',
        _id: 'sample-hamper-id',
        slug: {
          current: 'sample-hamper'
        }
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockedEnsureProductDisplayOrderEntry).toHaveBeenCalledWith({
      client: sanityClient,
      documentId: 'sample-hamper-id',
      fieldName: 'giftHampersOrder'
    })
    expect(revalidatePath).toHaveBeenCalledWith('/cakes-by-post/sample-hamper')
    expect(revalidatePath).toHaveBeenCalledWith('/cakes-by-post')
    expect(revalidateTag).toHaveBeenCalledWith('cakes-by-post', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('gift-hampers', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('pages', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', { expire: 0 })
  })

  it('revalidates article detail and archive paths for article updates', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'article',
        slug: {
          current: 'cake-by-post-guide'
        }
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/blog/cake-by-post-guide')
    expect(revalidatePath).toHaveBeenCalledWith('/blog')
    expect(revalidateTag).toHaveBeenCalledWith('articles', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('article', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', { expire: 0 })
  })

  it('revalidates the archive when article topics change', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'articleTopic'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/blog')
    expect(revalidateTag).toHaveBeenCalledWith('articles', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', { expire: 0 })
  })

  it('revalidates category landing pages for collection updates', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'collection'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/cakes')
    categoryLandingCanonicalPaths.forEach((path) => {
      expect(revalidatePath).toHaveBeenCalledWith(path)
    })
    expect(revalidateTag).toHaveBeenCalledWith('cake-collections', { expire: 0 })
  })
})

