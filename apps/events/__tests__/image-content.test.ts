import { describe, expect, it } from 'vitest'

import {
  canonicalImageMimeType,
  detectImageMimeType,
  findInvalidImageDocument
} from '@/lib/image-content'

describe('image content validation', () => {
  it('detects supported image signatures', () => {
    expect(detectImageMimeType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg')
    expect(detectImageMimeType(Uint8Array.from([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a
    ]))).toBe('image/png')
    expect(detectImageMimeType(Uint8Array.from([
      0x52,
      0x49,
      0x46,
      0x46,
      0x00,
      0x00,
      0x00,
      0x00,
      0x57,
      0x45,
      0x42,
      0x50
    ]))).toBe('image/webp')
    expect(detectImageMimeType(Uint8Array.from([
      0x00,
      0x00,
      0x00,
      0x18,
      0x66,
      0x74,
      0x79,
      0x70,
      0x68,
      0x65,
      0x69,
      0x63
    ]))).toBe('image/heic')
  })

  it('normalizes jpeg aliases', () => {
    expect(canonicalImageMimeType('image/jpg')).toBe('image/jpeg')
    expect(canonicalImageMimeType('image/jpeg')).toBe('image/jpeg')
  })

  it('rejects documents whose bytes do not match the declared type', async () => {
    const invalid = await findInvalidImageDocument([
      {
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        blob: new Blob(['not an image'])
      }
    ])

    expect(invalid?.fileName).toBe('photo.jpg')
  })
})
