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

export function isSanityCdnImageUrl(imageUrl?: string): boolean {
  return Boolean(imageUrl?.startsWith(`${SANITY_CDN_BASE}/images/`))
}

export type SanityCdnImageFit = 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'min' | 'scale'

interface SanityCdnImageOptions {
  width?: number
  height?: number
  fit?: SanityCdnImageFit
  quality?: number
  autoFormat?: boolean
}

type SanityCdnImageLoaderOptions = Omit<SanityCdnImageOptions, 'autoFormat'>

interface SanityCdnImageLoaderProps {
  src: string
  width: number
  quality?: number
}

function getPositiveNumberSearchParam(url: URL, key: string): number | undefined {
  const value = Number(url.searchParams.get(key))

  return Number.isFinite(value) && value > 0 ? value : undefined
}

function isSanityCdnImageFit(value: string | null): value is SanityCdnImageFit {
  return value === 'clip' ||
    value === 'crop' ||
    value === 'fill' ||
    value === 'fillmax' ||
    value === 'max' ||
    value === 'min' ||
    value === 'scale'
}

export function getSanityCdnImageUrl(
  imageUrl: string | undefined,
  {
    width,
    height,
    fit,
    quality,
    autoFormat = true
  }: SanityCdnImageOptions = {}
): string | undefined {
  if (!imageUrl || !isSanityCdnImageUrl(imageUrl)) {
    return imageUrl
  }

  const transformedUrl = new URL(imageUrl)

  if (typeof width === 'number' && Number.isFinite(width) && width > 0) {
    transformedUrl.searchParams.set('w', String(Math.round(width)))
  }

  if (typeof height === 'number' && Number.isFinite(height) && height > 0) {
    transformedUrl.searchParams.set('h', String(Math.round(height)))
  }

  if (fit) {
    transformedUrl.searchParams.set('fit', fit)
  }

  if (typeof quality === 'number' && Number.isFinite(quality)) {
    transformedUrl.searchParams.set('q', String(Math.round(quality)))
  }

  if (autoFormat) {
    transformedUrl.searchParams.set('auto', 'format')
  }

  return transformedUrl.toString()
}

export function getSanityCdnImageLoader({
  width,
  height,
  fit,
  quality
}: SanityCdnImageLoaderOptions = {}) {
  return ({ src, width: requestedWidth, quality: requestedQuality }: SanityCdnImageLoaderProps): string => {
    if (!isSanityCdnImageUrl(src)) {
      return src
    }

    const sourceUrl = new URL(src)
    const baseWidth = typeof width === 'number' && Number.isFinite(width) && width > 0
      ? width
      : getPositiveNumberSearchParam(sourceUrl, 'w')
    const baseHeight = typeof height === 'number' && Number.isFinite(height) && height > 0
      ? height
      : getPositiveNumberSearchParam(sourceUrl, 'h')
    const resolvedHeight = baseWidth && baseHeight
      ? Math.max(1, Math.round((requestedWidth / baseWidth) * baseHeight))
      : undefined
    const sourceFit = sourceUrl.searchParams.get('fit')
    const resolvedFit = fit ?? (isSanityCdnImageFit(sourceFit) ? sourceFit : undefined)
    const sourceQuality = getPositiveNumberSearchParam(sourceUrl, 'q')

    return getSanityCdnImageUrl(src, {
      width: requestedWidth,
      height: resolvedHeight,
      fit: resolvedFit,
      quality: requestedQuality ?? quality ?? sourceQuality
    }) ?? src
  }
}
