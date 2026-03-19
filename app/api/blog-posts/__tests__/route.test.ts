/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockFetch = jest.fn()
const mockCreate = jest.fn()
const mockUpload = jest.fn()
const mockCachedSanityFetch = jest.fn()
const mockGetCacheConfig = jest.fn(() => ({ revalidate: 1800 }))

jest.mock('@sanity/client', () => ({
  createClient: jest.fn(() => ({
    fetch: mockFetch,
    create: mockCreate,
    assets: {
      upload: mockUpload
    }
  }))
}))

jest.mock('@/lib/sanity-cache', () => ({
  cachedSanityFetch: (...args: unknown[]) => mockCachedSanityFetch(...args),
  getCacheConfig: (...args: unknown[]) => mockGetCacheConfig(...args)
}))

function setSanityEnv() {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'project-id'
  process.env.NEXT_PUBLIC_SANITY_DATASET = 'production'
  process.env.SANITY_API_TOKEN = 'sanity-token'
}

function clearSanityEnv() {
  delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  delete process.env.NEXT_PUBLIC_SANITY_DATASET
  delete process.env.SANITY_API_TOKEN
}

function createBlogPostFormData() {
  const formData = new FormData()
  formData.set('title', 'Test post')
  formData.set('category', 'Recipes')
  formData.set('content', 'Body')
  formData.set('status', 'draft')
  formData.set('keywords', '[]')
  formData.set('slug', 'test-post')
  formData.set('excerpt', 'Short excerpt')
  formData.set('description', 'Short description')
  formData.set('readTime', '5 min')

  return formData
}

describe('/api/blog-posts', () => {
  const originalProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const originalDataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  const originalToken = process.env.SANITY_API_TOKEN
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    consoleErrorSpy.mockClear()
    consoleWarnSpy.mockClear()
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  afterEach(() => {
    if (originalProjectId === undefined) {
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    } else {
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = originalProjectId
    }

    if (originalDataset === undefined) {
      delete process.env.NEXT_PUBLIC_SANITY_DATASET
    } else {
      process.env.NEXT_PUBLIC_SANITY_DATASET = originalDataset
    }

    if (originalToken === undefined) {
      delete process.env.SANITY_API_TOKEN
      return
    }

    process.env.SANITY_API_TOKEN = originalToken
  })

  it('imports without throwing when Sanity write env vars are missing', async () => {
    clearSanityEnv()

    const routeModule = await import('../route')

    expect(routeModule.GET).toEqual(expect.any(Function))
    expect(routeModule.POST).toEqual(expect.any(Function))
  })

  it('returns a controlled 500 response when draft fetch needs a missing Sanity config', async () => {
    clearSanityEnv()

    const { GET } = await import('../route')
    const request = new NextRequest('http://localhost/api/blog-posts?status=draft')
    const response = await GET(request)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch blog posts'
    })
  })

  it('fetches draft blog posts at request time when Sanity config is present', async () => {
    setSanityEnv()
    mockFetch.mockResolvedValue([{ _id: 'post-1' }])

    const { GET } = await import('../route')
    const request = new NextRequest('http://localhost/api/blog-posts?status=draft')
    const response = await GET(request)
    const payload = await response.json()
    const sanityClientModule = jest.requireMock('@sanity/client')

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      posts: [{ _id: 'post-1' }]
    })
    expect(mockFetch).toHaveBeenCalled()
    expect(sanityClientModule.createClient).toHaveBeenCalledWith(expect.objectContaining({
      projectId: 'project-id',
      dataset: 'production',
      token: 'sanity-token'
    }))
  })

  it('returns a controlled 500 response when creating a post needs a missing Sanity config', async () => {
    clearSanityEnv()

    const { POST } = await import('../route')
    const request = new NextRequest('http://localhost/api/blog-posts', {
      method: 'POST',
      body: createBlogPostFormData()
    })
    const response = await POST(request)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: expect.stringContaining('Failed to create blog post')
    })
  })

  it('creates a post when Sanity config is present', async () => {
    setSanityEnv()
    mockCreate.mockResolvedValue({ _id: 'post-1' })

    const { POST } = await import('../route')
    const request = new NextRequest('http://localhost/api/blog-posts', {
      method: 'POST',
      body: createBlogPostFormData()
    })
    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      success: true,
      id: 'post-1'
    })
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      _type: 'blogPost',
      title: 'Test post',
      category: 'Recipes'
    }))
  })
})
