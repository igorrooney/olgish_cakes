/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockCommit = jest.fn()
const mockSet = jest.fn(() => ({
  commit: mockCommit
}))
const mockPatch = jest.fn(() => ({
  set: mockSet
}))
const mockDelete = jest.fn()
const mockUpload = jest.fn()

jest.mock('@sanity/client', () => ({
  createClient: jest.fn(() => ({
    assets: {
      upload: mockUpload
    },
    patch: mockPatch,
    delete: mockDelete
  }))
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

function createUpdateFormData() {
  const formData = new FormData()
  formData.set('title', 'Updated title')
  formData.set('category', 'Recipes')
  formData.set('content', 'Updated body')
  formData.set('status', 'published')
  formData.set('keywords', '[]')
  formData.set('slug', 'updated-title')
  formData.set('excerpt', 'Updated excerpt')
  formData.set('description', 'Updated description')
  formData.set('readTime', '6 min')

  return formData
}

describe('/api/blog-posts/[id]', () => {
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

    expect(routeModule.PUT).toEqual(expect.any(Function))
    expect(routeModule.PATCH).toEqual(expect.any(Function))
    expect(routeModule.DELETE).toEqual(expect.any(Function))
  })

  it('returns a controlled 500 response when deleting needs a missing Sanity config', async () => {
    clearSanityEnv()

    const { DELETE } = await import('../route')
    const response = await DELETE(
      new NextRequest('http://localhost/api/blog-posts/post-1', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'post-1' }) }
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to delete blog post'
    })
  })

  it('updates a blog post when Sanity config is present', async () => {
    setSanityEnv()
    mockCommit.mockResolvedValue({ _id: 'post-1' })

    const { PUT } = await import('../route')
    const response = await PUT(
      new NextRequest('http://localhost/api/blog-posts/post-1', {
        method: 'PUT',
        body: createUpdateFormData()
      }),
      { params: Promise.resolve({ id: 'post-1' }) }
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      success: true,
      result: { _id: 'post-1' }
    })
    expect(mockPatch).toHaveBeenCalledWith('post-1')
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Updated title',
      category: 'Recipes'
    }))
  })

  it('patches a blog post when Sanity config is present', async () => {
    setSanityEnv()
    mockCommit.mockResolvedValue({ _id: 'post-1', status: 'published' })

    const { PATCH } = await import('../route')
    const response = await PATCH(
      new NextRequest('http://localhost/api/blog-posts/post-1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'published' }),
        headers: {
          'content-type': 'application/json'
        }
      }),
      { params: Promise.resolve({ id: 'post-1' }) }
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      success: true,
      result: { _id: 'post-1', status: 'published' }
    })
    expect(mockPatch).toHaveBeenCalledWith('post-1')
    expect(mockSet).toHaveBeenCalledWith({ status: 'published' })
  })
})
