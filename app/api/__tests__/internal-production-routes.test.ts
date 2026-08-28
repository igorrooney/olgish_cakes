/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockSanityFetch = jest.fn()
const mockGetAllCakes = jest.fn()
const mockGetAllGiftHampers = jest.fn()
const mockRevalidateTag = jest.fn()

jest.mock('@/sanity/lib/client', () => ({
  serverClient: {
    fetch: (...args: unknown[]) => mockSanityFetch(...args)
  }
}))

jest.mock('@/app/utils/fetchCakes', () => ({
  getAllCakes: (...args: unknown[]) => mockGetAllCakes(...args)
}))

jest.mock('@/app/utils/fetchGiftHampers', () => ({
  getAllGiftHampers: (...args: unknown[]) => mockGetAllGiftHampers(...args)
}))

jest.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args)
}))

import { POST as generateTestEmail } from '@/app/api/test-email/route'
import { GET as testSanityWrite } from '@/app/api/test-sanity-write/route'
import { GET as getMerchantTestFeed } from '@/app/api/merchant-center/test/route'
import { GET as getMerchantValidation } from '@/app/api/merchant-center/validate/route'
import { GET as legacyMerchantRevalidation } from '@/app/api/merchant-center/revalidate/route'

describe('production-only internal route shutdown', () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NODE_ENV = 'production'
  })

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it.each([
    {
      label: 'legacy test email generator',
      invoke: () => generateTestEmail(new NextRequest('http://localhost/api/test-email', {
        method: 'POST',
        body: 'not-json'
      }))
    },
    {
      label: 'Sanity write diagnostic',
      invoke: () => testSanityWrite(new NextRequest('http://localhost/api/test-sanity-write'))
    },
    {
      label: 'Merchant Center test feed',
      invoke: () => getMerchantTestFeed(new NextRequest('http://localhost/api/merchant-center/test'))
    },
    {
      label: 'Merchant Center validator',
      invoke: () => getMerchantValidation()
    },
    {
      label: 'legacy Merchant Center GET revalidation',
      invoke: () => legacyMerchantRevalidation(
        new NextRequest('http://localhost/api/merchant-center/revalidate?token=private-token')
      )
    }
  ])('returns an empty private 404 for the $label', async ({ invoke }) => {
    const response = await invoke()

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('')
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
    expect(mockSanityFetch).not.toHaveBeenCalled()
    expect(mockGetAllCakes).not.toHaveBeenCalled()
    expect(mockGetAllGiftHampers).not.toHaveBeenCalled()
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })
})
