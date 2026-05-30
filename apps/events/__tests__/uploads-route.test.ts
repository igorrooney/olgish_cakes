import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  validateCsrfToken: vi.fn(),
  recordPublicUploadAttempt: vi.fn(),
  getEventPhotoSettings: vi.fn(),
  createSignedUploads: vi.fn()
}))

vi.mock('@/lib/csrf', () => ({
  validateCsrfToken: state.validateCsrfToken
}))

vi.mock('@/lib/rate-limit', () => ({
  recordPublicUploadAttempt: state.recordPublicUploadAttempt,
  publicRateLimitError: (result: { retryAfterSeconds: number }) => {
    const response = Response.json({ error: 'Too many attempts.' }, { status: 429 })
    response.headers.set('retry-after', String(result.retryAfterSeconds))
    return response
  }
}))

vi.mock('@/lib/settings', () => ({
  getEventPhotoSettings: state.getEventPhotoSettings
}))

vi.mock('@/lib/supabase/admin', () => ({
  getEventPhotoBucket: () => 'event-photo-temp-uploads'
}))

vi.mock('@/lib/storage', () => ({
  createSignedUploads: state.createSignedUploads
}))

import { POST } from '@/app/api/event-photo/uploads/route'

const validUploadBody = {
  csrfToken: 'csrf-token-with-enough-length',
  files: [
    {
      name: 'cake.jpg',
      type: 'image/jpeg',
      size: 1024
    }
  ]
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('https://events.olgishcakes.co.uk/api/event-photo/uploads', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json'
    }
  })
}

describe('event photo signed upload API', () => {
  beforeEach(() => {
    state.validateCsrfToken.mockReset().mockReturnValue(true)
    state.recordPublicUploadAttempt.mockReset().mockResolvedValue({
      isLimited: false,
      retryAfterSeconds: 0
    })
    state.getEventPhotoSettings.mockReset().mockResolvedValue({
      eventName: 'Olgish Cakes event',
      maxImages: 2
    })
    state.createSignedUploads.mockReset().mockResolvedValue([
      {
        fileName: 'cake.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        path: 'incoming/cake.jpg',
        token: 'signed-token',
        proof: 'upload-proof'
      }
    ])
  })

  it('rejects malformed upload requests', async () => {
    const response = await POST(makeRequest({ csrfToken: 'short', files: [] }))

    await expect(response.json()).resolves.toEqual({
      error: 'Please check your image and try again.'
    })
    expect(response.status).toBe(400)
    expect(state.validateCsrfToken).not.toHaveBeenCalled()
  })

  it('rejects expired CSRF tokens before creating upload URLs', async () => {
    state.validateCsrfToken.mockReturnValue(false)

    const response = await POST(makeRequest(validUploadBody))

    expect(response.status).toBe(403)
    expect(state.createSignedUploads).not.toHaveBeenCalled()
  })

  it('enforces the active max image setting', async () => {
    state.getEventPhotoSettings.mockResolvedValue({
      eventName: 'Olgish Cakes event',
      maxImages: 1
    })

    const response = await POST(makeRequest({
      ...validUploadBody,
      files: [
        ...validUploadBody.files,
        {
          name: 'second.jpg',
          type: 'image/jpeg',
          size: 2048
        }
      ]
    }))

    await expect(response.json()).resolves.toEqual({
      error: 'Please upload one image only.'
    })
    expect(response.status).toBe(400)
    expect(state.recordPublicUploadAttempt).not.toHaveBeenCalled()
  })

  it('returns rate-limit responses before creating signed URLs', async () => {
    state.recordPublicUploadAttempt.mockResolvedValue({
      isLimited: true,
      retryAfterSeconds: 123
    })

    const response = await POST(makeRequest(validUploadBody))

    expect(response.status).toBe(429)
    expect(response.headers.get('retry-after')).toBe('123')
    expect(state.createSignedUploads).not.toHaveBeenCalled()
  })

  it('returns the storage bucket and signed upload metadata', async () => {
    const response = await POST(makeRequest(validUploadBody))

    await expect(response.json()).resolves.toEqual({
      bucket: 'event-photo-temp-uploads',
      uploads: [
        {
          fileName: 'cake.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          path: 'incoming/cake.jpg',
          token: 'signed-token',
          proof: 'upload-proof'
        }
      ]
    })
    expect(state.createSignedUploads).toHaveBeenCalledWith([
      {
        fileName: 'cake.jpg',
        mimeType: 'image/jpeg',
        size: 1024
      }
    ])
  })
})
