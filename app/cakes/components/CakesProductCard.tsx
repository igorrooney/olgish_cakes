'use client'

import { getResponsiveCatalogImageAttributes } from './catalogImageAttributes'
import { TabletCake } from './types'

interface CakesProductCardProps {
  cake: TabletCake
  linkHref?: string
  variant?: 'desktop' | 'mobile'
  mobileViewMode?: 'grid' | 'single'
  isLcpCandidate?: boolean
}

const cardImageSizes = '(min-width: 1512px) 379px, (min-width: 1280px) 301px, (min-width: 1024px) 336px, calc(100vw - 2rem)'
const mobileGridImageSizes = '(min-width: 952px) 452px, calc((100vw - 3rem) / 2)'
const catalogCardImageWidths = [256, 384, 480, 560, 640, 750] as const
const catalogCardImageQuality = 45

function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

export function CakesProductCard({
  cake,
  linkHref,
  variant = 'desktop',
  mobileViewMode = 'grid',
  isLcpCandidate = false
}: CakesProductCardProps) {
  const isByPostCake = cake.productType === 'giftHamper'
  const isLandingNavigation = cake.navigationTarget === 'landing'
  const formattedPrice = formatPrice(cake.price)
  const resolvedLinkHref = linkHref ?? cake.href
  const mobileImageSizes = mobileViewMode === 'grid' ? mobileGridImageSizes : cardImageSizes
  const mobileImageWrapperClassName = mobileViewMode === 'grid'
    ? 'relative aspect-square w-full overflow-hidden rounded-btn bg-base-200'
    : 'relative aspect-square w-full overflow-hidden rounded-[10px] bg-base-200'
  const mobileCardLinkClassName = mobileViewMode === 'grid'
    ? 'block h-full w-full'
    : 'block h-full'
  const imageClassName = 'h-full w-full object-cover'
  const imageFetchPriority = isLcpCandidate ? 'high' : 'low'
  const contentVisibilityClassName = isLcpCandidate ? '' : 'content-auto-card '
  const cardAriaLabel = isLandingNavigation
    ? `Explore ${cake.name}`
    : `View details for ${cake.name}`
  const imageAttributes = getResponsiveCatalogImageAttributes(cake.imageUrl, {
    fallbackWidth: 560,
    fit: 'crop',
    heightWidthRatio: 1,
    quality: catalogCardImageQuality,
    sizes: variant === 'mobile' ? mobileImageSizes : cardImageSizes,
    widths: catalogCardImageWidths
  })

  if (variant === 'mobile') {
    return (
      <a href={resolvedLinkHref} className={mobileCardLinkClassName}>
        <span className='sr-only'>{cardAriaLabel}</span>
        <article className={`${contentVisibilityClassName}flex h-full flex-col`}>
          <div className={mobileImageWrapperClassName}>
            <img
              src={imageAttributes.src}
              srcSet={imageAttributes.srcSet}
              alt={cake.imageAlt}
              sizes={imageAttributes.sizes}
              width={560}
              height={560}
              className={imageClassName}
              loading={isLcpCandidate ? 'eager' : 'lazy'}
              fetchPriority={imageFetchPriority}
              decoding='async'
            />
            <p
              data-testid='mobile-price-chip'
              className='absolute right-3 top-3 h-6 inline-flex items-center justify-center rounded-[8px] bg-primary-50 px-3 py-0 [font-family:var(--font-more-sugar),cursive,fantasy] [font-weight:var(--t-font-weight-semibold)] not-italic text-[16px] [leading-trim:none] [line-height:var(--d-lineHeight-14)] tracking-[0] text-center align-middle text-primary-500 shadow-sm'
            >
              {isLandingNavigation ? (
                <>Explore</>
              ) : isByPostCake ? (
                <>&pound;{formattedPrice}</>
              ) : (
                <>from &pound;{formattedPrice}</>
              )}
            </p>
          </div>
          <div className='px-1 pb-1 pt-2'>
            <h2 className='[font-family:var(--t-font-family-theme-primary)] [font-weight:var(--t-font-weight-semibold)] [font-style:normal] text-[12px] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-(--color-filter-sort-mobile-text)'>{cake.name}</h2>
          </div>
        </article>
      </a>
    )
  }

  return (
    <a href={resolvedLinkHref} className='block h-full'>
      <span className='sr-only'>{cardAriaLabel}</span>
      <article className={`${contentVisibilityClassName}flex h-full flex-col overflow-hidden rounded-[10px] border border-primary-50 bg-primary-50 shadow-none`}>
        <div className='p-[8px] pb-0'>
          <div className='relative aspect-square w-full overflow-hidden rounded-[8px] bg-base-200'>
            <img
              src={imageAttributes.src}
              srcSet={imageAttributes.srcSet}
              alt={cake.imageAlt}
              sizes={imageAttributes.sizes}
              width={560}
              height={560}
              className={imageClassName}
              loading={isLcpCandidate ? 'eager' : 'lazy'}
              fetchPriority={imageFetchPriority}
              decoding='async'
            />
          </div>
        </div>
        <div className='flex flex-1 flex-col gap-2 px-4 pb-3 pt-3'>
          <h2 className='text-[19px] leading-[28px] text-base-content'>{cake.name}</h2>
          <p className='line-clamp-2 text-[14px] leading-7 text-base-content/70' title={cake.description}>
            {cake.description}
          </p>
          <p className='mt-auto text-[20px] font-semibold leading-7 text-base-content'>
            {isLandingNavigation ? (
              <>Explore</>
            ) : isByPostCake ? (
              <>&pound;{formattedPrice}</>
            ) : (
              <>from &pound;{formattedPrice}</>
            )}
          </p>
        </div>
      </article>
    </a>
  )
}
