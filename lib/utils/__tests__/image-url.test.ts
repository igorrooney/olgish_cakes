/**
 * @jest-environment jsdom
 */
import {
  ensureAbsoluteImageUrl,
  getSanityCdnImageLoader,
  getSanityCdnImageUrl,
  isSanityCdnImageUrl,
  isValidAbsoluteImageUrl
} from '../image-url'

describe('ensureAbsoluteImageUrl', () => {
  it('should return absolute URLs unchanged', () => {
    expect(ensureAbsoluteImageUrl('https://cdn.sanity.io/image.jpg')).toBe(
      'https://cdn.sanity.io/image.jpg'
    )
    expect(ensureAbsoluteImageUrl('http://example.com/image.jpg')).toBe(
      'http://example.com/image.jpg'
    )
  })

  it('should convert relative URLs starting with / to absolute', () => {
    const result = ensureAbsoluteImageUrl('/images/relative.jpg')
    expect(result).toBe('https://cdn.sanity.io/images/relative.jpg')
    expect(result).toMatch(/^https:\/\//)
  })

  it('should convert relative URLs without / to absolute', () => {
    const result = ensureAbsoluteImageUrl('images/relative.jpg')
    expect(result).toBe('https://cdn.sanity.io/images/relative.jpg')
    expect(result).toMatch(/^https:\/\//)
  })

  it('should use custom base URL when provided', () => {
    const result = ensureAbsoluteImageUrl('/image.jpg', 'https://example.com')
    expect(result).toBe('https://example.com/image.jpg')
  })

  it('should handle complex relative paths', () => {
    const result = ensureAbsoluteImageUrl('path/to/nested/image.jpg')
    expect(result).toBe('https://cdn.sanity.io/path/to/nested/image.jpg')
  })

  it('should handle query parameters in relative URLs', () => {
    const result = ensureAbsoluteImageUrl('/image.jpg?w=800&h=600')
    expect(result).toBe('https://cdn.sanity.io/image.jpg?w=800&h=600')
  })

  it('should handle hash fragments in relative URLs', () => {
    const result = ensureAbsoluteImageUrl('/image.jpg#section')
    expect(result).toBe('https://cdn.sanity.io/image.jpg#section')
  })

  it('should handle edge case with empty string', () => {
    const result = ensureAbsoluteImageUrl('')
    expect(result).toBe('https://cdn.sanity.io/')
  })

  it('should use fallback when URL constructor throws an error', () => {
    // Save original URL constructor
    const OriginalURL = global.URL
    
    // Mock URL constructor to throw an error
    global.URL = jest.fn().mockImplementation(() => {
      throw new Error('Invalid URL')
    }) as typeof URL
    
    // Test that fallback logic works
    const result = ensureAbsoluteImageUrl('test-image.jpg')
    expect(result).toBe('https://cdn.sanity.io/test-image.jpg')
    
    // Test with path starting with /
    const resultWithSlash = ensureAbsoluteImageUrl('/test-image.jpg')
    expect(resultWithSlash).toBe('https://cdn.sanity.io/test-image.jpg')
    
    // Restore original URL constructor
    global.URL = OriginalURL
  })
})

describe('isValidAbsoluteImageUrl', () => {
  it('should return true for valid absolute HTTPS URLs', () => {
    expect(isValidAbsoluteImageUrl('https://cdn.sanity.io/image.jpg')).toBe(true)
    expect(isValidAbsoluteImageUrl('https://example.com/path/to/image.png')).toBe(true)
  })

  it('should return true for valid absolute HTTP URLs', () => {
    expect(isValidAbsoluteImageUrl('http://example.com/image.jpg')).toBe(true)
  })

  it('should return false for relative URLs', () => {
    expect(isValidAbsoluteImageUrl('/images/relative.jpg')).toBe(false)
    expect(isValidAbsoluteImageUrl('images/relative.jpg')).toBe(false)
  })

  it('should return false for invalid URLs', () => {
    expect(isValidAbsoluteImageUrl('not-a-url')).toBe(false)
    expect(isValidAbsoluteImageUrl('://invalid')).toBe(false)
  })

  it('should return false for empty or null values', () => {
    expect(isValidAbsoluteImageUrl('')).toBe(false)
    expect(isValidAbsoluteImageUrl(null as unknown as string)).toBe(false)
    expect(isValidAbsoluteImageUrl(undefined as unknown as string)).toBe(false)
  })

  it('should return false for non-string values', () => {
    expect(isValidAbsoluteImageUrl(123 as unknown as string)).toBe(false)
    expect(isValidAbsoluteImageUrl({} as unknown as string)).toBe(false)
  })

  it('should return false for malformed URLs', () => {
    expect(isValidAbsoluteImageUrl('https://')).toBe(false)
    expect(isValidAbsoluteImageUrl('http://')).toBe(false)
  })
})

describe('isSanityCdnImageUrl', () => {
  it('returns true for Sanity CDN image URLs', () => {
    expect(isSanityCdnImageUrl('https://cdn.sanity.io/images/project/dataset/image.jpg')).toBe(true)
  })

  it('returns false for non-Sanity image URLs', () => {
    expect(isSanityCdnImageUrl('https://example.com/images/project/dataset/image.jpg')).toBe(false)
  })
})

describe('getSanityCdnImageUrl', () => {
  it('adds responsive Sanity transform parameters to CDN image URLs', () => {
    expect(getSanityCdnImageUrl(
      'https://cdn.sanity.io/images/project/production/image.png',
      {
        width: 720,
        height: 540,
        fit: 'crop',
        quality: 78
      }
    )).toBe('https://cdn.sanity.io/images/project/production/image.png?w=720&h=540&fit=crop&q=78&auto=format')
  })

  it('keeps non-Sanity URLs unchanged', () => {
    expect(getSanityCdnImageUrl(
      'https://example.com/image.png',
      {
        width: 720,
        height: 540,
        fit: 'crop',
        quality: 78
      }
    )).toBe('https://example.com/image.png')
  })
})

describe('getSanityCdnImageLoader', () => {
  it('resizes Sanity images at the requested Next image width', () => {
    const loader = getSanityCdnImageLoader()

    expect(loader({
      src: 'https://cdn.sanity.io/images/project/production/image.png?w=560&h=560&fit=crop&q=78&auto=format',
      width: 384,
      quality: 75
    })).toBe('https://cdn.sanity.io/images/project/production/image.png?w=384&h=384&fit=crop&q=75&auto=format')
  })

  it('uses configured dimensions to keep aspect ratio when source params are absent', () => {
    const loader = getSanityCdnImageLoader({
      width: 1120,
      height: 630,
      fit: 'crop',
      quality: 82
    })

    expect(loader({
      src: 'https://cdn.sanity.io/images/project/production/image.png',
      width: 560
    })).toBe('https://cdn.sanity.io/images/project/production/image.png?w=560&h=315&fit=crop&q=82&auto=format')
  })

  it('keeps non-Sanity images unchanged', () => {
    const loader = getSanityCdnImageLoader({ width: 560, height: 560 })

    expect(loader({
      src: '/images/placeholder-cake.jpg',
      width: 384
    })).toBe('/images/placeholder-cake.jpg')
  })
})
