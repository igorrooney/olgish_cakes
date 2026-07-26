import { preload } from 'react-dom'
import { getSanityCdnImageUrl, isSanityCdnImageUrl } from '@/lib/utils/image-url'

interface ResponsiveSanityImageProps {
  imageUrl?: string
  imageAlt?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'auto' | 'high' | 'low'
  sizes?: string
  containerClassName?: string
  width: number
  height: number
  fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'min' | 'scale'
  quality?: number
  preloadImage?: boolean
}

const srcSetWidths = [384, 480, 576, 640, 750, 828, 1080, 1200]

function getProportionalHeight({
  baseHeight,
  baseWidth,
  requestedWidth,
}: {
  baseHeight: number
  baseWidth: number
  requestedWidth: number
}) {
  return Math.max(1, Math.round((requestedWidth / baseWidth) * baseHeight))
}

function getSanitySrcSet({
  fit,
  height,
  imageUrl,
  quality,
  width,
}: {
  fit?: ResponsiveSanityImageProps['fit']
  height: number
  imageUrl: string
  quality?: number
  width: number
}) {
  if (!isSanityCdnImageUrl(imageUrl)) {
    return undefined
  }

  return srcSetWidths
    .filter(srcSetWidth => srcSetWidth <= width)
    .map(srcSetWidth => {
      const srcSetUrl = getSanityCdnImageUrl(imageUrl, {
        width: srcSetWidth,
        height: getProportionalHeight({
          baseHeight: height,
          baseWidth: width,
          requestedWidth: srcSetWidth,
        }),
        fit,
        quality,
      })

      return srcSetUrl ? `${srcSetUrl} ${srcSetWidth}w` : null
    })
    .filter((srcSetEntry): srcSetEntry is string => Boolean(srcSetEntry))
    .join(', ')
}

export function ResponsiveSanityImage({
  imageUrl,
  imageAlt,
  loading = 'lazy',
  fetchPriority,
  sizes = '(min-width: 1280px) 560px, (min-width: 1024px) 55vw, 100vw',
  containerClassName = 'min-h-[280px]',
  width,
  height,
  fit,
  quality,
  preloadImage = false,
}: ResponsiveSanityImageProps) {
  if (!imageUrl) {
    return null
  }

  const src = getSanityCdnImageUrl(imageUrl, {
    width,
    height,
    fit,
    quality,
  }) ?? imageUrl
  const srcSet = getSanitySrcSet({
    fit,
    height,
    imageUrl,
    quality,
    width,
  })

  if (preloadImage) {
    preload(src, {
      as: 'image',
      fetchPriority: 'high',
      imageSizes: sizes,
      imageSrcSet: srcSet,
    })
  }

  return (
    <div
      className={`relative h-full overflow-hidden rounded-box bg-base-200 ${containerClassName}`}
    >
      <img
        src={src}
        srcSet={srcSet}
        alt={imageAlt || 'Article image'}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        sizes={sizes}
        decoding='async'
        className='!h-full !w-full object-cover'
      />
    </div>
  )
}
