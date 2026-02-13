/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { proxy } from '../../proxy'
import { isAdminAuthenticated } from '../../lib/admin-auth'

jest.mock('../../lib/admin-auth', () => ({
  isAdminAuthenticated: jest.fn()
}))

const mockedIsAdminAuthenticated = isAdminAuthenticated as jest.MockedFunction<typeof isAdminAuthenticated>

describe('proxy SEO headers for cakes filters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedIsAdminAuthenticated.mockResolvedValue(true)
  })

  it('sets noindex, follow for filtered cakes URLs', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes?sort=popular&collections=c-wedding-cakes')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBe(
      'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )
  })

  it('sets noindex, follow for occasions collection URLs', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes?collections=c-wedding-cakes')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBe(
      'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )
  })

  it('does not override robots header for clean cakes URL', async () => {
    const request = new NextRequest('https://olgishcakes.co.uk/cakes')

    const response = await proxy(request)

    expect(response.headers.get('X-Robots-Tag')).toBeNull()
  })
})
