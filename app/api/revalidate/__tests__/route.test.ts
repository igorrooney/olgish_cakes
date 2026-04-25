/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '../route'
import { revalidatePath, revalidateTag } from 'next/cache'
import { categoryLandingCanonicalPaths } from '@/app/cakes/categoryLandingConfig'

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
    expect(revalidateTag).toHaveBeenCalledWith('ingredients', 'max')
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
    expect(revalidatePath).toHaveBeenCalledWith('/get-custom-quote')
    expect(revalidateTag).toHaveBeenCalledWith('testimonials', 'max')
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
    expect(revalidateTag).toHaveBeenCalledWith('cakes', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('cakes-by-post', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('gift-hampers', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', 'max')
  })

  it('revalidates cake detail, listings and category landing pages for cake updates', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        _type: 'cake',
        slug: {
          current: 'sample-cake'
        }
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/cakes/sample-cake')
    expect(revalidatePath).toHaveBeenCalledWith('/cakes')
    expect(revalidatePath).toHaveBeenCalledWith('/')
    categoryLandingCanonicalPaths.forEach((path) => {
      expect(revalidatePath).toHaveBeenCalledWith(path)
    })
    expect(revalidateTag).toHaveBeenCalledWith('cakes', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('pages', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', 'max')
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
    expect(revalidateTag).toHaveBeenCalledWith('articles', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('article', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', 'max')
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
    expect(revalidateTag).toHaveBeenCalledWith('articles', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sitemaps', 'max')
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
    expect(revalidateTag).toHaveBeenCalledWith('cake-collections', 'max')
  })
})
