/**
 * Utility functions for image URL handling
 * Ensures image URLs are always absolute for SEO and structured data compliance
 */

/**
 * Sanity CDN base URL for constructing absolute URLs from relative paths
 */
const SANITY_CDN_BASE = 'https://cdn.sanity.io'

/**
 * Ensures an image URL is absolute (starts with http:// or https://)
 * Converts relative URLs to absolute using the Sanity CDN base URL
 *
 * @param imageUrl - Image URL (may be absolute or relative)
 * @param baseUrl - Base URL for relative paths (default: Sanity CDN)
 * @returns Absolute image URL
 *
 * @example
 * ```ts
 * ensureAbsoluteImageUrl('https://cdn.sanity.io/image.jpg') // 'https://cdn.sanity.io/image.jpg'
 * ensureAbsoluteImageUrl('/images/relative.jpg') // 'https://cdn.sanity.io/images/relative.jpg'
 * ensureAbsoluteImageUrl('images/relative.jpg') // 'https://cdn.sanity.io/images/relative.jpg'
 * ```
 */
export function ensureAbsoluteImageUrl(
  imageUrl: string,
  baseUrl: string = SANITY_CDN_BASE
): string {
  // Already absolute URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // Handle relative URLs using URL constructor for robust parsing
  try {
    // URL constructor handles both absolute and relative paths correctly
    // If imageUrl starts with '/', it's treated as absolute path from base
    // If not, it's treated as relative path from base
    return new URL(imageUrl, baseUrl).toString()
  } catch {
    // Fallback for edge cases where URL constructor fails
    // This should rarely happen, but provides safety
    const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
    return `${baseUrl}${normalizedPath}`
  }
}

/**
 * Validates that an image URL is absolute and well-formed
 *
 * @param imageUrl - Image URL to validate
 * @returns true if URL is absolute and valid, false otherwise
 *
 * @example
 * ```ts
 * isValidAbsoluteImageUrl('https://cdn.sanity.io/image.jpg') // true
 * isValidAbsoluteImageUrl('/images/relative.jpg') // false
 * isValidAbsoluteImageUrl('invalid-url') // false
 * ```
 */
export function isValidAbsoluteImageUrl(imageUrl: string): boolean {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false
  }

  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    return false
  }

  try {
    new URL(imageUrl)
    return true
  } catch {
    return false
  }
}

