/**
 * @jest-environment node
 */
const mockIsAdminAuthenticated = jest.fn()
const mockSanityFetch = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/sanity/lib/client', () => ({
  serverClient: {
    fetch: (...args: unknown[]) => mockSanityFetch(...args)
  }
}))

jest.mock('@/lib/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args)
  }
}))

import { NextRequest } from 'next/server'
import { GET } from '../route'

const createRequest = () => new NextRequest('http://localhost/api/admin/cakes')

describe('/api/admin/cakes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
  })

  it('rejects unauthenticated requests before querying Sanity', async () => {
    mockIsAdminAuthenticated.mockResolvedValue(false)

    const response = await GET(createRequest())

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
    expect(mockSanityFetch).not.toHaveBeenCalled()
  })

  it('returns cakes for an authenticated admin', async () => {
    const cakes = [{ _id: 'cake-1', name: 'Honey Cake' }]
    mockSanityFetch.mockResolvedValue(cakes)

    const response = await GET(createRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true, cakes })
  })

  it('returns a generic response and logs no raw CMS details', async () => {
    const sentinel = 'PRIVATE_ADMIN_CAKES_SANITY_MESSAGE'
    mockSanityFetch.mockRejectedValue(new Error(sentinel))

    const response = await GET(createRequest())
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Failed to fetch cakes' })
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to fetch cakes',
      {
        operation: 'admin.cakes.fetch',
        code: 'OPERATION_FAILED'
      }
    )
    expect(JSON.stringify({ body, logs: mockLoggerError.mock.calls })).not.toContain(sentinel)
  })
})
