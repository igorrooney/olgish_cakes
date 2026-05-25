import { describe, expect, it } from 'vitest'

import {
  DEFAULT_MAX_IMAGES,
  MAX_FILE_BYTES
} from '@/lib/constants'
import {
  normaliseImageMimeType,
  publicSettingsSchema,
  validateImageCount
} from '@/lib/validation'

describe('event photo validation', () => {
  it('uses one image as the default maximum', () => {
    expect(DEFAULT_MAX_IMAGES).toBe(1)
    expect(validateImageCount(1)).toBeNull()
    expect(validateImageCount(2)).toBe('Please upload one image only.')
  })

  it('validates settings defaults and limits', () => {
    expect(publicSettingsSchema.parse({
      eventName: 'Olgish Cakes event',
      maxImages: 1
    })).toEqual({
      eventName: 'Olgish Cakes event',
      maxImages: 1
    })

    expect(publicSettingsSchema.safeParse({
      eventName: 'Olgish Cakes event',
      maxImages: 11
    }).success).toBe(false)
  })

  it('accepts supported image types and file extensions', () => {
    expect(normaliseImageMimeType('photo.jpg', '')).toBe('image/jpeg')
    expect(normaliseImageMimeType('photo.heic', '')).toBe('image/heic')
    expect(normaliseImageMimeType('photo.webp', 'image/webp')).toBe('image/webp')
    expect(normaliseImageMimeType('photo.gif', '')).toBeNull()
  })

  it('keeps file size limit at 20 MB', () => {
    expect(MAX_FILE_BYTES).toBe(20 * 1024 * 1024)
  })
})
