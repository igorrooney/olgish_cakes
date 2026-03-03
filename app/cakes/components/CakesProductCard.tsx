'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { TabletCake } from './types'

interface CakesProductCardProps {
  cake: TabletCake
  variant?: 'desktop' | 'mobile'
  mobileViewMode?: 'grid' | 'single'
  isLcpCandidate?: boolean
}

const cardImageSizes = '(min-width: 1512px) 379px, (min-width: 1280px) 301px, (min-width: 1024px) 336px, calc(100vw - 2rem)'
// Matches mobile catalog grid geometry: max-w-[952px], px-4, grid-cols-2 gap-4.
const mobileGridImageSizes = '(min-width: 952px) 452px, calc((100vw - 3rem) / 2)'

function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

export function CakesProductCard({
  cake,
  variant = 'desktop',
  mobileViewMode = 'grid',
  isLcpCandidate = false
}: CakesProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const imageWrapperRef = useRef<HTMLDivElement | null>(null)
  const isByPostCake = cake.productType === 'giftHamper'
  const mobileImageSizes = mobileViewMode === 'grid' ? mobileGridImageSizes : cardImageSizes
  const mobileImageWrapperClassName = mobileViewMode === 'grid'
    ? 'relative aspect-square w-full overflow-hidden rounded-btn bg-base-200'
    : 'relative aspect-square w-full overflow-hidden rounded-[10px] bg-base-200'
  const mobileCardLinkClassName = mobileViewMode === 'grid'
    ? 'block h-full w-full'
    : 'block h-full'
  const imageClassName = `object-cover transition-opacity duration-300 ${
    isImageLoaded ? 'opacity-100' : 'opacity-0'
  }`
  const imageLoadingOverlayClassName = `pointer-events-none absolute inset-0 bg-base-200 transition-opacity duration-300 motion-reduce:animate-none ${
    isImageLoaded ? 'opacity-0' : 'animate-pulse opacity-100'
  }`
  useEffect(() => {
    setIsImageLoaded(false)
  }, [cake.imageUrl])

  useEffect(() => {
    const imageElement = imageWrapperRef.current?.querySelector('img')

    if (!imageElement) {
      return
    }

    if (imageElement.complete && imageElement.naturalWidth > 0) {
      setIsImageLoaded(true)
    }
  }, [cake.imageUrl, variant])

  const handleImageReady = useCallback(() => {
    setIsImageLoaded(true)
  }, [])

  if (variant === 'mobile') {
    return (
      <Link href={cake.href} aria-label={`View details for ${cake.name}`} className={mobileCardLinkClassName}>
        <article className='flex h-full flex-col'>
          <div ref={imageWrapperRef} className={mobileImageWrapperClassName}>
            <div
              data-testid='cake-card-image-loading-overlay'
              className={imageLoadingOverlayClassName}
              aria-hidden='true'
            />
            <Image
              src={cake.imageUrl}
              alt={cake.imageAlt}
              fill
              sizes={mobileImageSizes}
              className={imageClassName}
              loading={isLcpCandidate ? 'eager' : 'lazy'}
              onLoad={handleImageReady}
              onError={handleImageReady}
            />
            <p
              data-testid='mobile-price-chip'
              className='absolute right-3 top-3 h-6 inline-flex items-center justify-center rounded-[8px] bg-primary-50 px-3 py-0 [font-family:var(--font-more-sugar),cursive,fantasy] [font-weight:var(--t-font-weight-semibold)] not-italic text-[16px] [leading-trim:none] [line-height:var(--d-lineHeight-14)] tracking-[0] text-center align-middle text-primary-500 shadow-sm'
            >
              {isByPostCake ? (
                <>&pound;{formatPrice(cake.price)}</>
              ) : (
                <>from &pound;{formatPrice(cake.price)}</>
              )}
            </p>
          </div>
          <div className='px-1 pb-1 pt-2'>
            <h3 className='[font-family:var(--t-font-family-theme-primary)] [font-weight:var(--t-font-weight-semibold)] [font-style:normal] text-[12px] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-(--color-filter-sort-mobile-text)'>{cake.name}</h3>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={cake.href} aria-label={`View details for ${cake.name}`} className='block h-full'>
      <article className='flex h-full flex-col overflow-hidden rounded-[10px] border border-primary-50 bg-primary-50 shadow-none'>
        <div className='p-[8px] pb-0'>
          <div ref={imageWrapperRef} className='relative aspect-square w-full overflow-hidden rounded-[8px] bg-base-200'>
            <div
              data-testid='cake-card-image-loading-overlay'
              className={imageLoadingOverlayClassName}
              aria-hidden='true'
            />
            <Image
              src={cake.imageUrl}
              alt={cake.imageAlt}
              fill
              sizes={cardImageSizes}
              className={imageClassName}
              loading={isLcpCandidate ? 'eager' : 'lazy'}
              onLoad={handleImageReady}
              onError={handleImageReady}
            />
          </div>
        </div>
        <div className='flex flex-1 flex-col gap-2 px-4 pb-3 pt-3'>
          <h3 className='text-[19px] leading-[28px] text-base-content'>{cake.name}</h3>
          <p className='line-clamp-2 text-[14px] leading-7 text-base-content/70' title={cake.description}>
            {cake.description}
          </p>
          <p className='mt-auto text-[20px] font-semibold leading-7 text-base-content'>
            {isByPostCake ? (
              <>&pound;{formatPrice(cake.price)}</>
            ) : (
              <>from &pound;{formatPrice(cake.price)}</>
            )}
          </p>
        </div>
      </article>
    </Link>
  )
}
