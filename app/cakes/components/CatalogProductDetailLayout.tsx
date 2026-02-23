'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import { normalizePathname, readPreviousPathnameFromHistoryState } from '@/app/utils/history-state'

export interface CatalogProductDetailImage {
  src: string
  alt: string
}

export interface CatalogProductDetailSection {
  id: string
  title: string
  content: ReactNode
  defaultOpen?: boolean
}

interface CatalogProductDetailLayoutProps {
  backHref: string
  backLabel?: string
  categoryLabel: string
  title: string
  priceText: string
  priceSuffix?: string
  keyPoints: string[]
  ctaLabel: string
  onCtaClick: () => void
  images: CatalogProductDetailImage[]
  sections: CatalogProductDetailSection[]
}

const imageSizes = '(min-width: 1024px) 560px, 100vw'

const fallbackImage: CatalogProductDetailImage = {
  src: '/images/placeholder-cake.jpg',
  alt: 'Product image placeholder'
}

const tabletPricePrefixAndSignClass = 'tablet:[font-family:var(--font-more-sugar),cursive,fantasy] tablet:[font-weight:var(--t-font-weight-bold)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-subtitle-small)] tablet:[leading-trim:none] tablet:[line-height:100%] tablet:[letter-spacing:-0.02em] tablet:align-top tablet:text-primary-500'

interface SplitPriceTextResult {
  prefix: string
  currencySign: string | null
  remainder: string
}

function splitPriceText(value: string): SplitPriceTextResult {
  const currencyMatch = /[\u00A3$\u20AC]/.exec(value)

  if (!currencyMatch || typeof currencyMatch.index !== 'number') {
    return {
      prefix: value,
      currencySign: null,
      remainder: ''
    }
  }

  const symbolIndex = currencyMatch.index
  const currencySign = currencyMatch[0]

  return {
    prefix: value.slice(0, symbolIndex),
    currencySign,
    remainder: value.slice(symbolIndex + currencySign.length)
  }
}

function isPlainLeftClick(event: ReactMouseEvent<HTMLAnchorElement>) {
  return event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
}

function resolveNormalizedPathname(value: string, origin: string) {
  try {
    const parsedUrl = new URL(value, origin)
    return normalizePathname(parsedUrl.pathname)
  } catch {
    return null
  }
}

export function CatalogProductDetailLayout({
  backHref,
  backLabel = 'Back to results',
  categoryLabel,
  title,
  priceText,
  priceSuffix,
  keyPoints,
  ctaLabel,
  onCtaClick,
  images,
  sections
}: CatalogProductDetailLayoutProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const resolvedImages = useMemo(() => {
    return images.length > 0 ? images : [fallbackImage]
  }, [images])
  const isMultiImageGallery = resolvedImages.length > 1
  const splitPrice = useMemo(() => {
    return splitPriceText(priceText)
  }, [priceText])
  const normalizedActiveImageIndex = activeImageIndex <= resolvedImages.length - 1
    ? activeImageIndex
    : 0
  const activeImage = resolvedImages[normalizedActiveImageIndex] ?? resolvedImages[0]

  const handlePreviousImage = useCallback(() => {
    if (!isMultiImageGallery) {
      return
    }

    setActiveImageIndex((currentIndex) => {
      return currentIndex === 0 ? resolvedImages.length - 1 : currentIndex - 1
    })
  }, [isMultiImageGallery, resolvedImages.length])

  const handleNextImage = useCallback(() => {
    if (!isMultiImageGallery) {
      return
    }

    setActiveImageIndex((currentIndex) => {
      return currentIndex === resolvedImages.length - 1 ? 0 : currentIndex + 1
    })
  }, [isMultiImageGallery, resolvedImages.length])

  const handleGalleryKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (!isMultiImageGallery) {
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      handlePreviousImage()
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      handleNextImage()
    }
  }, [handleNextImage, handlePreviousImage, isMultiImageGallery])

  useEffect(() => {
    if (activeImageIndex <= resolvedImages.length - 1) {
      return
    }

    setActiveImageIndex(0)
  }, [activeImageIndex, resolvedImages.length])

  const handleBackLinkClick = useCallback((event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (!isPlainLeftClick(event)) {
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    if (window.history.length <= 1) {
      return
    }

    const previousPathname = readPreviousPathnameFromHistoryState()
    const normalizedBackHrefPathname = resolveNormalizedPathname(backHref, window.location.origin)

    if (!previousPathname || !normalizedBackHrefPathname || previousPathname !== normalizedBackHrefPathname) {
      return
    }

    event.preventDefault()
    window.history.back()
  }, [backHref])

  return (
    <article className='mx-auto w-full max-w-[1432px] px-4 pb-16 pt-5 tablet:max-w-[944px] tablet:px-0 tablet:pt-8 small-laptop:max-w-[1200px] large-laptop:max-w-[1432px]'>
      <Link
        href={backHref}
        onClick={handleBackLinkClick}
        className='inline-flex items-center gap-2 text-base leading-none text-base-content transition-colors hover:text-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 tablet:text-(--color-filter-sort-mobile-text)'
        aria-label={backLabel}
      >
        <span aria-hidden='true' className='text-[16px] leading-none tablet:[font-size:var(--t-font-size-base)] tablet:align-middle'>&lsaquo;</span>
        <span className='font-sans text-[16px] leading-6 text-base-content tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-base)] tablet:[leading-trim:none] tablet:[line-height:var(--t-font-lineHeight-leading-7)] tablet:[letter-spacing:0] tablet:align-middle tablet:text-(--color-filter-sort-mobile-text)'>
          {backLabel}
        </span>
      </Link>

      <div className='mt-5 grid grid-cols-1 gap-8 tablet:mt-8 tablet:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] tablet:items-start tablet:gap-10'>
        <section
          aria-label='Product gallery'
          role='region'
          tabIndex={isMultiImageGallery ? 0 : undefined}
          onKeyDown={handleGalleryKeyDown}
          className='focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'
        >
          <span className='sr-only'>
            Image {normalizedActiveImageIndex + 1} of {resolvedImages.length}
          </span>
          <div className='relative aspect-square w-full overflow-hidden rounded-[8px] bg-base-200'>
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              priority
              sizes={imageSizes}
              className='object-cover'
            />
            {isMultiImageGallery ? (
              <>
                <button
                  type='button'
                  onClick={handlePreviousImage}
                  aria-label='View previous image'
                  className='touch-target absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-base-100/90 text-primary-500 opacity-80 shadow-md transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100'
                >
                  <span aria-hidden='true' className='text-[18px] leading-none'>&lsaquo;</span>
                </button>
                <button
                  type='button'
                  onClick={handleNextImage}
                  aria-label='View next image'
                  className='touch-target absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-base-100/90 text-primary-500 opacity-80 shadow-md transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100'
                >
                  <span aria-hidden='true' className='text-[18px] leading-none'>&rsaquo;</span>
                </button>
              </>
            ) : null}
          </div>
          {isMultiImageGallery ? (
            <div className='mt-4 flex items-center justify-center gap-2' role='tablist' aria-label='Product image slides'>
              {resolvedImages.map((image, index) => {
                const isActive = index === normalizedActiveImageIndex

                return (
                  <button
                    type='button'
                    key={`${image.src}-${index}`}
                    role='tab'
                    aria-selected={isActive}
                    aria-label={`View image ${index + 1}`}
                    onClick={() => setActiveImageIndex(index)}
                    className={`h-2 w-2 rounded-full border transition-colors ${
                      isActive
                        ? 'border-[var(--color-gallery-dot-active)] bg-[var(--color-gallery-dot-active)]'
                        : 'border-base-300 bg-base-100'
                    }`}
                  >
                  </button>
                )
              })}
            </div>
          ) : null}
        </section>

        <section aria-label='Product details'>
          <header>
            <div className='flex items-start justify-between gap-4'>
              <p className='font-sans text-[16px] leading-6 text-base-content/55 tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-sm)] tablet:[leading-trim:none] tablet:[line-height:var(--t-font-lineHeight-leading-7)] tablet:[letter-spacing:0] tablet:align-middle tablet:text-(--color-catalog-detail-muted)'>
                {categoryLabel}
              </p>
            </div>

            <h1 className='mt-1 font-oldenburg text-[36px] leading-[42px] text-base-content tablet:[font-family:var(--font-oldenburg),Georgia,serif] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:text-[24px] tablet:[leading-trim:none] tablet:[line-height:var(--t-font-lineHeight-leading-7)] tablet:[letter-spacing:0] tablet:align-middle tablet:text-(--color-filter-sort-mobile-text)'>
              {title}
            </h1>

            <p className='mt-3 flex flex-wrap items-end gap-x-4 gap-y-1 text-base-content'>
              <span className='font-moreSugar text-[56px] leading-[56px] text-primary-500 tablet:[font-family:var(--font-more-sugar),cursive,fantasy] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-title-page-base)] tablet:[leading-trim:none] tablet:[line-height:100%] tablet:[letter-spacing:-0.02em] tablet:align-middle tablet:text-primary-500'>
                {splitPrice.prefix.length > 0 ? (
                  <span className={tabletPricePrefixAndSignClass}>
                    {splitPrice.prefix}
                  </span>
                ) : null}
                {splitPrice.currencySign ? (
                  <span className={tabletPricePrefixAndSignClass}>
                    {splitPrice.currencySign}
                  </span>
                ) : null}
                {splitPrice.remainder}
              </span>
              {priceSuffix ? (
                <span className='font-sans text-[20px] leading-[30px] tablet:text-[58px] tablet:leading-[72px]'>
                  {priceSuffix}
                </span>
              ) : null}
            </p>
          </header>

          <ul className='mt-5 list-disc space-y-1 pl-6 font-sans text-[20px] leading-[30px] text-base-content tablet:pl-8 tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-base)] tablet:[leading-trim:none] tablet:[line-height:140%] tablet:[letter-spacing:0] tablet:text-(--d-color-base-content)'>
            {keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          <button
            type='button'
            onClick={onCtaClick}
            className='btn btn-primary mt-6 h-16 min-h-16 w-full border-none px-8 font-sans text-[20px] font-semibold normal-case leading-6 tablet:h-12 tablet:min-h-12 tablet:gap-2 tablet:px-4 tablet:shadow-sm tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:var(--t-font-weight-semibold)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-sm)] tablet:[leading-trim:none] tablet:[line-height:var(--d-lineHeight-14)] tablet:[letter-spacing:0] tablet:text-center tablet:align-middle'
          >
            {ctaLabel}
          </button>

          <div className='mt-7'>
            {sections.map((section) => (
              <details
                key={section.id}
                open={section.defaultOpen}
                className='catalog-product-accordion-row collapse collapse-plus rounded-none border-b border-base-300 bg-transparent first:border-t'
              >
                <summary
                  className='collapse-title box-border px-6 py-5 font-sans text-[20px] leading-[30px] text-base-content tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-base)] tablet:[leading-trim:none] tablet:[line-height:var(--t-font-lineHeight-leading-7)] tablet:[letter-spacing:0] tablet:align-middle tablet:text-(--d-color-base-content)'
                  style={{ boxSizing: 'border-box' }}
                >
                  {section.title}
                </summary>
                <div className='collapse-content px-6 pb-6 pt-0'>
                  <div className='font-sans text-[16px] leading-7 text-base-content/80 tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-base)] tablet:[leading-trim:none] tablet:[line-height:140%] tablet:[letter-spacing:0] tablet:text-(--d-color-base-content)'>
                    {section.content}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </article>
  )
}
