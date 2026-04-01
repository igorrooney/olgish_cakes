'use client'

import Image from 'next/image'
import type { ImageLoaderProps } from 'next/image'
import { getSanityCdnImageLoader } from '@/lib/articles'

interface ResponsiveSanityImageProps {
  imageUrl?: string
  imageAlt?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'auto' | 'high' | 'low'
  sizes?: string
  containerClassName?: string
  width?: number
  height?: number
  fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'min' | 'scale'
  quality?: number
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
}: ResponsiveSanityImageProps) {
  if (!imageUrl) {
    return null
  }

  const loader = ({ src, width: requestedWidth, quality: requestedQuality }: ImageLoaderProps) =>
    getSanityCdnImageLoader({
      width,
      height,
      fit,
      quality,
    })({
      src,
      width: requestedWidth,
      quality: requestedQuality,
    })

  return (
    <div
      className={`relative h-full overflow-hidden rounded-[24px] bg-base-200 ${containerClassName}`}
    >
      <Image
        src={imageUrl}
        alt={imageAlt || 'Article image'}
        fill
        loading={loading}
        fetchPriority={fetchPriority}
        loader={loader}
        sizes={sizes}
        className='object-cover'
      />
    </div>
  )
}
