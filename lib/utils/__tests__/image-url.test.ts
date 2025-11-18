/**
 * @jest-environment jsdom
 */
import { ensureAbsoluteImageUrl, isValidAbsoluteImageUrl } from '../image-url'

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

