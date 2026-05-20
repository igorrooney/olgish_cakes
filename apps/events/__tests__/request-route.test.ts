import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  validateCsrfToken: vi.fn(),
  recordPublicRequestAttempt: vi.fn(),
  createEventPhotoRequest: vi.fn(),
  updateTelegramStatus: vi.fn(),
  getEventPhotoSettings: vi.fn(),
  deleteTempImages: vi.fn(),
  downloadTempDocuments: vi.fn(),
  findInvalidTempDocumentSize: vi.fn(),
  findInvalidImageDocument: vi.fn(),
  sendTelegramNotification: vi.fn(),
  verifyUploadProof: vi.fn()
}))

vi.mock('@/lib/csrf', () => ({
  validateCsrfToken: state.validateCsrfToken
}))

vi.mock('@/lib/rate-limit', () => ({
  recordPublicRequestAttempt: state.recordPublicRequestAttempt,
  publicRateLimitError: (result: { retryAfterSeconds: number }) => {
    const response = Response.json({ error: 'Too many attempts.' }, { status: 429 })
    response.headers.set('retry-after', String(result.retryAfterSeconds))
    return response
  }
}))

vi.mock('@/lib/requests', () => ({
  createEventPhotoRequest: state.createEventPhotoRequest,
  updateTelegramStatus: state.updateTelegramStatus
}))

vi.mock('@/lib/settings', () => ({
  getEventPhotoSettings: state.getEventPhotoSettings
}))

vi.mock('@/lib/supabase/admin', () => ({
  getEventPhotoBucket: () => 'event-photo-temp-uploads'
}))

vi.mock('@/lib/storage', () => ({
  deleteTempImages: state.deleteTempImages,
  downloadTempDocuments: state.downloadTempDocuments,
  findInvalidTempDocumentSize: state.findInvalidTempDocumentSize
}))

vi.mock('@/lib/image-content', () => ({
  findInvalidImageDocument: state.findInvalidImageDocument
}))

vi.mock('@/lib/telegram', () => {
  class TelegramDeliveryError extends Error {
    readonly messageIds: number[]

    constructor(message: string, messageIds: number[]) {
      super(message)
      this.name = 'TelegramDeliveryError'
      this.messageIds = messageIds
    }
  }

  return {
    TelegramDeliveryError,
    sendTelegramNotification: state.sendTelegramNotification
  }
})

vi.mock('@/lib/upload-proof', () => ({
  verifyUploadProof: state.verifyUploadProof
}))

import { POST } from '@/app/api/event-photo/request/route'
import { TelegramDeliveryError } from '@/lib/telegram'

const uploadedFile = {
  fileName: 'cake.jpg',
  mimeType: 'image/jpeg',
  size: 1024,
  path: 'incoming/cake.jpg',
  proof: 'proof-token-with-enough-length'
}

const validBody = {
  csrfToken: 'csrf-token-with-enough-length',
  fullName: 'Anna Smith',
  email: 'anna@example.com',
  files: [uploadedFile]
}

const requestRow = {
  id: 'request-1',
  event_name: 'Market',
  full_name: 'Anna Smith',
  email: 'anna@example.com'
}

const documents = [
  {
    fileName: 'cake.jpg',
    mimeType: 'image/jpeg',
    path: 'incoming/cake.jpg',
    blob: new Blob([Uint8Array.from([0xff, 0xd8, 0xff])], {
      type: 'image/jpeg'
    })
  }
]

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('https://events.olgishcakes.co.uk/api/event-photo/request', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json'
    }
  })
}

describe('event photo request API', () => {
  beforeEach(() => {
    state.validateCsrfToken.mockReset().mockReturnValue(true)
    state.recordPublicRequestAttempt.mockReset().mockResolvedValue({
      isLimited: false,
      retryAfterSeconds: 0
    })
    state.getEventPhotoSettings.mockReset().mockResolvedValue({
      eventName: 'Market',
      maxImages: 2
    })
    state.verifyUploadProof.mockReset().mockReturnValue({
      path: uploadedFile.path,
      fileName: uploadedFile.fileName,
      mimeType: uploadedFile.mimeType,
      size: uploadedFile.size,
      expiresAt: Date.now() + 60_000
    })
    state.createEventPhotoRequest.mockReset().mockResolvedValue(requestRow)
    state.downloadTempDocuments.mockReset().mockResolvedValue(documents)
    state.findInvalidTempDocumentSize.mockReset().mockReturnValue(null)
    state.findInvalidImageDocument.mockReset().mockResolvedValue(null)
    state.sendTelegramNotification.mockReset().mockResolvedValue([501])
    state.deleteTempImages.mockReset().mockResolvedValue(undefined)
    state.updateTelegramStatus.mockReset().mockResolvedValue(undefined)
  })

  it('saves the email request, sends Telegram, and clears temp files', async () => {
    const response = await POST(makeRequest(validBody))

    await expect(response.json()).resolves.toEqual({ id: 'request-1' })
    expect(response.status).toBe(200)
    expect(state.createEventPhotoRequest).toHaveBeenCalledWith({
      fullName: 'Anna Smith',
      email: 'anna@example.com',
      eventName: 'Market',
      imageFilenames: ['cake.jpg'],
      imageMimeTypes: ['image/jpeg'],
      imageSizes: [1024],
      tempImageBucket: 'event-photo-temp-uploads',
      tempImagePaths: ['incoming/cake.jpg']
    })
    expect(state.sendTelegramNotification).toHaveBeenCalledWith({
      requestId: 'request-1',
      eventName: 'Market',
      fullName: 'Anna Smith',
      email: 'anna@example.com',
      documents
    })
    expect(state.updateTelegramStatus).toHaveBeenNthCalledWith(
      1,
      'request-1',
      'sent',
      [501],
      null,
      false
    )
    expect(state.updateTelegramStatus).toHaveBeenNthCalledWith(
      2,
      'request-1',
      'sent',
      [501],
      null,
      true
    )
  })

  it('rejects malformed request bodies', async () => {
    const response = await POST(makeRequest({ ...validBody, email: 'not-an-email' }))

    expect(response.status).toBe(400)
    expect(state.createEventPhotoRequest).not.toHaveBeenCalled()
  })

  it('rejects expired CSRF tokens', async () => {
    state.validateCsrfToken.mockReturnValue(false)

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(403)
    expect(state.recordPublicRequestAttempt).not.toHaveBeenCalled()
  })

  it('enforces the active max image setting', async () => {
    state.getEventPhotoSettings.mockResolvedValue({
      eventName: 'Market',
      maxImages: 1
    })

    const response = await POST(makeRequest({
      ...validBody,
      files: [
        uploadedFile,
        {
          ...uploadedFile,
          fileName: 'second.jpg',
          path: 'incoming/second.jpg'
        }
      ]
    }))

    await expect(response.json()).resolves.toEqual({
      error: 'Please upload one image only.'
    })
    expect(response.status).toBe(400)
    expect(state.createEventPhotoRequest).not.toHaveBeenCalled()
  })

  it('rejects rate-limited final submissions', async () => {
    state.recordPublicRequestAttempt.mockResolvedValue({
      isLimited: true,
      retryAfterSeconds: 321
    })

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(429)
    expect(response.headers.get('retry-after')).toBe('321')
    expect(state.verifyUploadProof).not.toHaveBeenCalled()
  })

  it('rejects tampered upload proofs before saving a request', async () => {
    state.verifyUploadProof.mockReturnValue(null)

    const response = await POST(makeRequest(validBody))

    await expect(response.json()).resolves.toEqual({
      error: 'The uploaded image could not be verified. Please try again.'
    })
    expect(response.status).toBe(400)
    expect(state.createEventPhotoRequest).not.toHaveBeenCalled()
  })

  it('marks requests failed when downloaded size differs from signed metadata', async () => {
    state.findInvalidTempDocumentSize.mockReturnValue({
      fileName: 'cake.jpg',
      expectedSize: 1024,
      actualSize: 2048,
      reason: 'mismatch'
    })

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(400)
    expect(state.deleteTempImages).toHaveBeenCalledWith('event-photo-temp-uploads', [
      'incoming/cake.jpg'
    ])
    expect(state.updateTelegramStatus).toHaveBeenCalledWith(
      'request-1',
      'failed',
      [],
      'Uploaded file size did not match verified metadata: cake.jpg',
      true
    )
  })

  it('returns a size-limit message when a downloaded file exceeds the limit', async () => {
    state.findInvalidTempDocumentSize.mockReturnValue({
      fileName: 'cake.jpg',
      expectedSize: 1024,
      actualSize: 25 * 1024 * 1024,
      reason: 'too_large'
    })

    const response = await POST(makeRequest(validBody))

    await expect(response.json()).resolves.toEqual({
      error: 'Each image must be 20 MB or smaller.'
    })
    expect(response.status).toBe(400)
  })

  it('marks requests failed when image bytes do not match a supported type', async () => {
    state.findInvalidImageDocument.mockResolvedValue({
      fileName: 'cake.jpg',
      mimeType: 'image/jpeg'
    })

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(400)
    expect(state.updateTelegramStatus).toHaveBeenCalledWith(
      'request-1',
      'failed',
      [],
      'Uploaded file content did not match a supported image type: cake.jpg',
      true
    )
  })

  it('records Telegram message ids when Telegram delivery fails midway', async () => {
    state.sendTelegramNotification.mockRejectedValue(
      new TelegramDeliveryError('Telegram unavailable', [700])
    )

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(502)
    expect(state.updateTelegramStatus).toHaveBeenCalledWith(
      'request-1',
      'failed',
      [700],
      'Telegram unavailable',
      false
    )
  })

  it('keeps a successful response when post-delivery temp cleanup fails', async () => {
    state.deleteTempImages.mockRejectedValue(new Error('storage unavailable'))

    const response = await POST(makeRequest(validBody))

    await expect(response.json()).resolves.toEqual({ id: 'request-1' })
    expect(response.status).toBe(200)
    expect(state.updateTelegramStatus).toHaveBeenCalledTimes(1)
  })
})
