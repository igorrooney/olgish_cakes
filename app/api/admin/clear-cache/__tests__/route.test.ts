/**
 * @jest-environment node
 */
jest.mock('@/app/utils/fetchCakes', () => ({
  invalidateCache: jest.fn()
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn()
}))

jest.mock('@/app/cakes/categoryLandingConfig', () => ({
  categoryLandingCanonicalPaths: ['/birthday-cakes', '/wedding-cakes']
}))

jest.mock('@/lib/admin/auth-token', () => ({
  verifyAdminAuthToken: jest.fn()
}))

import { NextRequest } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { GET, POST } from '../route'

const { invalidateCache } = jest.requireMock('@/app/utils/fetchCakes') as {
  invalidateCache: jest.MockedFunction<(pattern?: string) => Promise<void>>
}

const { verifyAdminAuthToken } = jest.requireMock('@/lib/admin/auth-token') as {
  verifyAdminAuthToken: jest.MockedFunction<(token: string | null | undefined) => Promise<boolean>>
}

describe('/api/admin/clear-cache', () => {
  const originalAdminSecretToken = process.env.ADMIN_SECRET_TOKEN

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_SECRET_TOKEN = 'server-admin-secret'
    verifyAdminAuthToken.mockResolvedValue(false)
    invalidateCache.mockResolvedValue(undefined)
  })

  afterAll(() => {
    process.env.ADMIN_SECRET_TOKEN = originalAdminSecretToken
  })

  it('returns status payload for GET requests', async () => {
    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({
      status: 'Admin cache management endpoint is active',
      usage: 'POST with optional pattern parameter'
    })
  })

  it('authorizes POST requests with a valid admin auth cookie', async () => {
    verifyAdminAuthToken.mockResolvedValue(true)

    const request = new NextRequest('http://localhost/api/admin/clear-cache', {
      method: 'POST',
      headers: {
        Cookie: 'admin_auth_token=valid-cookie-token'
      },
      body: JSON.stringify({ pattern: 'cakes:*' })
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(verifyAdminAuthToken).toHaveBeenCalledWith('valid-cookie-token')
    expect(invalidateCache).toHaveBeenCalledWith('cakes:*')
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/cakes')
    expect(revalidatePath).toHaveBeenCalledWith('/cakes-by-post')
    expect(revalidatePath).toHaveBeenCalledWith('/api/catalog/by-post-cakes')
    expect(revalidatePath).toHaveBeenCalledWith('/birthday-cakes')
    expect(revalidateTag).toHaveBeenCalledWith('cakes', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('gift-hampers', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('articles', { expire: 0 })
    expect(json.success).toBe(true)
    expect(json.revalidated).toEqual({
      paths: 13,
      tags: 15
    })
  })

  it('falls back to ADMIN_SECRET_TOKEN authorization when cookie auth fails', async () => {
    const request = new NextRequest('http://localhost/api/admin/clear-cache', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer server-admin-secret'
      },
      body: JSON.stringify({ pattern: '*' })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(verifyAdminAuthToken).toHaveBeenCalledWith('')
    expect(invalidateCache).toHaveBeenCalledWith('*')
  })

  it('rejects POST requests without valid cookie or bearer token auth', async () => {
    const request = new NextRequest('http://localhost/api/admin/clear-cache', {
      method: 'POST',
      body: JSON.stringify({ pattern: '*' })
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json).toEqual({ error: 'Unauthorized' })
    expect(invalidateCache).not.toHaveBeenCalled()
  })

  it('returns 500 when cache invalidation fails', async () => {
    verifyAdminAuthToken.mockResolvedValue(true)
    invalidateCache.mockRejectedValue(new Error('boom'))

    const request = new NextRequest('http://localhost/api/admin/clear-cache', {
      method: 'POST',
      headers: {
        Cookie: 'admin_auth_token=valid-cookie-token'
      },
      body: JSON.stringify({ pattern: '*' })
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toEqual({
      success: false,
      error: 'Cache clear failed',
      details: 'boom'
    })
  })
})
