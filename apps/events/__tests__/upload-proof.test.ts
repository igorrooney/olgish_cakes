import { beforeEach, describe, expect, it } from 'vitest'

import {
  createUploadProof,
  verifyUploadProof
} from '@/lib/upload-proof'

describe('upload proof', () => {
  beforeEach(() => {
    process.env.CSRF_SECRET = 'test-csrf-secret-with-enough-length'
  })

  it('round-trips verified temporary upload metadata', () => {
    const proof = createUploadProof({
      path: 'incoming/2026-05-20/photo.jpg',
      fileName: 'photo.jpg',
      mimeType: 'image/jpeg',
      size: 1234
    })

    expect(verifyUploadProof(proof)).toMatchObject({
      path: 'incoming/2026-05-20/photo.jpg',
      fileName: 'photo.jpg',
      mimeType: 'image/jpeg',
      size: 1234
    })
  })

  it('rejects tampered proofs', () => {
    const proof = createUploadProof({
      path: 'incoming/2026-05-20/photo.jpg',
      fileName: 'photo.jpg',
      mimeType: 'image/jpeg',
      size: 1234
    })

    expect(verifyUploadProof(`${proof}x`)).toBeNull()
  })
})
