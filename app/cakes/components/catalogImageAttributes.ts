import { getSanityCdnImageUrl, isSanityCdnImageUrl, type SanityCdnImageFit } from '@/lib/utils/image-url'

export interface ResponsiveCatalogImageAttributes {
  src: string
  sizes: string
  srcSet?: string
}

interface ResponsiveCatalogImageOptions {
  fallbackWidth: number
  fit: SanityCdnImageFit
  heightWidthRatio?: number
  quality: number
  sizes: string
  widths: readonly number[]
}

function getImageHeight(width: number, heightWidthRatio?: number) {
  return typeof heightWidthRatio === 'number'
    ? Math.max(1, Math.round(width * heightWidthRatio))
    : undefined
}

export function getResponsiveCatalogImageAttributes(
  imageUrl: string,
  {
    fallbackWidth,
    fit,
    heightWidthRatio,
    quality,
    sizes,
    widths
  }: ResponsiveCatalogImageOptions
): ResponsiveCatalogImageAttributes {
  if (!isSanityCdnImageUrl(imageUrl)) {
    return {
      src: imageUrl,
      sizes
    }
  }

  const uniqueWidths = Array.from(new Set(widths))
    .filter((width) => Number.isFinite(width) && width > 0)
    .sort((a, b) => a - b)
  const src = getSanityCdnImageUrl(imageUrl, {
    width: fallbackWidth,
    height: getImageHeight(fallbackWidth, heightWidthRatio),
    fit,
    quality
  }) ?? imageUrl
  const srcSet = uniqueWidths
    .map((width) => {
      const variantUrl = getSanityCdnImageUrl(imageUrl, {
        width,
        height: getImageHeight(width, heightWidthRatio),
        fit,
        quality
      }) ?? imageUrl

      return `${variantUrl} ${width}w`
    })
    .join(', ')

  return {
    src,
    sizes,
    srcSet
  }
}
