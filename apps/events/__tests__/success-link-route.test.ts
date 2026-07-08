import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  recordEventPhotoLinkClick: vi.fn()
}))

vi.mock('@/lib/link-clicks', () => ({
  getFeatureLinkByKey: (linkKey: string) => {
    if (linkKey !== 'gift-hampers') {
      return null
    }

    return {
      key: 'gift-hampers',
      href: 'https://olgishcakes.co.uk/gift-hampers',
      title: 'Gift hampers'
    }
  },
  recordEventPhotoLinkClick: state.recordEventPhotoLinkClick
}))

import { GET } from '@/app/(public)/success/link/[linkKey]/route'

const VALID_REQUEST_ID = '2a1024bc-5b7e-4d6e-a602-2c84d9c678f0'

function makeRequest(requestId = VALID_REQUEST_ID): NextRequest {
  return new NextRequest(
    `https://events.olgishcakes.co.uk/success/link/gift-hampers?r=${requestId}`
  )
}

function makeContext(linkKey = 'gift-hampers') {
  return {
    params: Promise.resolve({
      linkKey
    })
  }
}

describe('success link click redirect route', () => {
  beforeEach(() => {
    state.recordEventPhotoLinkClick.mockReset()
  })

  it('records valid link clicks and redirects to the website', async () => {
    state.recordEventPhotoLinkClick.mockResolvedValueOnce({ recorded: true })

    const response = await GET(makeRequest(), makeContext())

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('https://olgishcakes.co.uk/gift-hampers')
    expect(state.recordEventPhotoLinkClick).toHaveBeenCalledWith({
      requestId: VALID_REQUEST_ID,
      linkKey: 'gift-hampers'
    })
  })

  it('redirects without inserting when request id is invalid', async () => {
    const response = await GET(makeRequest('not-a-request-id'), makeContext())

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('https://olgishcakes.co.uk/gift-hampers')
    expect(state.recordEventPhotoLinkClick).not.toHaveBeenCalled()
  })

  it('returns 404 for unknown link keys', async () => {
    const response = await GET(makeRequest(), makeContext('unknown'))

    expect(response.status).toBe(404)
    expect(state.recordEventPhotoLinkClick).not.toHaveBeenCalled()
  })

  it('still redirects when recording fails', async () => {
    state.recordEventPhotoLinkClick.mockRejectedValueOnce(new Error('offline'))

    const response = await GET(makeRequest(), makeContext())

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('https://olgishcakes.co.uk/gift-hampers')
  })
})
