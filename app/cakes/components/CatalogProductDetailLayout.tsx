'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type FocusEvent as ReactFocusEvent, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode, type TouchEvent as ReactTouchEvent } from 'react'
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
  onCtaIntent?: () => void
  orderContent?: ReactNode
  galleryBelowContent?: ReactNode
  isOrderFormOpen?: boolean
  onBackToProduct?: () => void
  requestedActiveImageIndex?: number
  requestedActiveImageKey?: string
  images: CatalogProductDetailImage[]
  sections: CatalogProductDetailSection[]
}

interface SplitPriceTextResult {
  prefix: string
  currencySign: string | null
  remainder: string
}

type GalleryDirection = 'next' | 'previous'

interface FadeState {
  activeIndex: number
  leavingIndex: number | null
  transitionKey: number
}

const imageSizes = '(min-width: 1024px) 560px, 100vw'
const fadeDurationMs = 180

const fallbackImage: CatalogProductDetailImage = {
  src: '/images/placeholder-cake.jpg',
  alt: 'Product image placeholder'
}
const swipeNavigationMinDistancePx = 48
const swipeNavigationMaxVerticalDriftPx = 24
const swipeNavigationHorizontalDominanceRatio = 1.25

const pricePrefixClass = '[font-family:var(--font-more-sugar),cursive,fantasy] [font-weight:var(--t-font-weight-bold)] [font-style:normal] [font-size:12px] tablet:[font-size:var(--t-font-size-subtitle-small)] [leading-trim:none] [line-height:100%] [letter-spacing:-0.02em] align-top text-primary-500'
const tabletPriceSignClass = 'tablet:[font-family:var(--font-more-sugar),cursive,fantasy] tablet:[font-weight:var(--t-font-weight-bold)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-subtitle-small)] tablet:[leading-trim:none] tablet:[line-height:100%] tablet:[letter-spacing:-0.02em] tablet:align-top tablet:text-primary-500'

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

function resolveWrappedImageIndex(index: number, imageCount: number) {
  if (imageCount <= 0) {
    return 0
  }

  const normalizedIndex = index % imageCount

  return normalizedIndex >= 0 ? normalizedIndex : normalizedIndex + imageCount
}

function createNextFadeState(
  currentState: FadeState,
  nextActiveIndex: number,
  useReducedMotion: boolean
) {
  if (currentState.activeIndex === nextActiveIndex) {
    return currentState
  }

  return {
    activeIndex: nextActiveIndex,
    leavingIndex: useReducedMotion ? null : currentState.activeIndex,
    transitionKey: currentState.transitionKey + 1
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
  onCtaIntent,
  orderContent,
  galleryBelowContent,
  isOrderFormOpen = false,
  onBackToProduct,
  requestedActiveImageIndex,
  requestedActiveImageKey,
  images,
  sections
}: CatalogProductDetailLayoutProps) {
  const [fadeState, setFadeState] = useState<FadeState>({
    activeIndex: 0,
    leavingIndex: null,
    transitionKey: 0
  })
  const [isGalleryFocused, setIsGalleryFocused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const galleryRegionRef = useRef<HTMLElement | null>(null)
  const fadeCleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const preloadedGalleryImageSrcsRef = useRef(new Set<string>())
  const activeGalleryPreloadImagesRef = useRef(new Map<string, HTMLImageElement>())
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchCurrentXRef = useRef<number | null>(null)
  const touchCurrentYRef = useRef<number | null>(null)
  const isSwipeTrackingRef = useRef(false)
  const resolvedImages = useMemo(() => {
    return images.length > 0 ? images : [fallbackImage]
  }, [images])
  const isMultiImageGallery = resolvedImages.length > 1
  const splitPrice = useMemo(() => {
    return splitPriceText(priceText)
  }, [priceText])
  const normalizedActiveImageIndex = fadeState.activeIndex <= resolvedImages.length - 1
    ? fadeState.activeIndex
    : 0
  const activeImage = resolvedImages[normalizedActiveImageIndex] ?? fallbackImage
  const leavingImage = fadeState.leavingIndex !== null && fadeState.leavingIndex <= resolvedImages.length - 1
    ? resolvedImages[fadeState.leavingIndex]
    : null
  const shouldRenderOrderOnly = isOrderFormOpen && Boolean(orderContent)
  const shouldShowPriceSuffix = !shouldRenderOrderOnly && Boolean(priceSuffix)

  const clearFadeCleanupTimer = useCallback(() => {
    if (fadeCleanupTimerRef.current !== null) {
      clearTimeout(fadeCleanupTimerRef.current)
      fadeCleanupTimerRef.current = null
    }
  }, [])

  const resetSwipeTrackingState = useCallback(() => {
    touchStartXRef.current = null
    touchStartYRef.current = null
    touchCurrentXRef.current = null
    touchCurrentYRef.current = null
    isSwipeTrackingRef.current = false
  }, [])

  const focusGalleryRegion = useCallback(() => {
    if (!isMultiImageGallery || galleryRegionRef.current === null) {
      return
    }

    galleryRegionRef.current.focus({ preventScroll: true })
  }, [isMultiImageGallery])

  const handleGalleryFocusCapture = useCallback(() => {
    if (!isMultiImageGallery) {
      return
    }

    setIsGalleryFocused(true)
  }, [isMultiImageGallery])

  const handleGalleryBlurCapture = useCallback((event: ReactFocusEvent<HTMLElement>) => {
    const nextFocusedElement = event.relatedTarget

    if (nextFocusedElement instanceof Node && event.currentTarget.contains(nextFocusedElement)) {
      return
    }

    setIsGalleryFocused(false)
  }, [])

  const moveToImage = useCallback((nextImageIndex: number) => {
    if (!isMultiImageGallery) {
      return
    }

    setFadeState((currentState) => {
      return createNextFadeState(
        currentState,
        resolveWrappedImageIndex(nextImageIndex, resolvedImages.length),
        prefersReducedMotion
      )
    })
  }, [isMultiImageGallery, prefersReducedMotion, resolvedImages.length])

  const moveImageByDirection = useCallback((direction: GalleryDirection) => {
    if (!isMultiImageGallery) {
      return
    }

    setFadeState((currentState) => {
      const nextActiveIndex = resolveWrappedImageIndex(
        currentState.activeIndex + (direction === 'next' ? 1 : -1),
        resolvedImages.length
      )

      return createNextFadeState(currentState, nextActiveIndex, prefersReducedMotion)
    })
  }, [isMultiImageGallery, prefersReducedMotion, resolvedImages.length])

  const handlePreviousImage = useCallback(() => {
    moveImageByDirection('previous')
  }, [moveImageByDirection])

  const handleNextImage = useCallback(() => {
    moveImageByDirection('next')
  }, [moveImageByDirection])

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

  const handleGalleryTouchStart = useCallback((event: ReactTouchEvent<HTMLElement>) => {
    if (!isMultiImageGallery || event.touches.length !== 1) {
      resetSwipeTrackingState()
      return
    }

    focusGalleryRegion()

    const touchPoint = event.touches[0]
    touchStartXRef.current = touchPoint.clientX
    touchStartYRef.current = touchPoint.clientY
    touchCurrentXRef.current = touchPoint.clientX
    touchCurrentYRef.current = touchPoint.clientY
    isSwipeTrackingRef.current = true
  }, [focusGalleryRegion, isMultiImageGallery, resetSwipeTrackingState])

  const handleGalleryTouchMove = useCallback((event: ReactTouchEvent<HTMLElement>) => {
    if (!isSwipeTrackingRef.current) {
      return
    }

    if (event.touches.length !== 1) {
      resetSwipeTrackingState()
      return
    }

    const touchPoint = event.touches[0]
    touchCurrentXRef.current = touchPoint.clientX
    touchCurrentYRef.current = touchPoint.clientY
  }, [resetSwipeTrackingState])

  const handleGalleryTouchEnd = useCallback((event: ReactTouchEvent<HTMLElement>) => {
    if (!isMultiImageGallery || !isSwipeTrackingRef.current) {
      resetSwipeTrackingState()
      return
    }

    const touchStartX = touchStartXRef.current
    const touchStartY = touchStartYRef.current

    if (touchStartX === null || touchStartY === null) {
      resetSwipeTrackingState()
      return
    }

    const changedTouchPoint = event.changedTouches.length > 0
      ? event.changedTouches[0]
      : null
    const touchEndX = changedTouchPoint?.clientX ?? touchCurrentXRef.current
    const touchEndY = changedTouchPoint?.clientY ?? touchCurrentYRef.current

    if (touchEndX === null || touchEndY === null) {
      resetSwipeTrackingState()
      return
    }

    const deltaX = touchEndX - touchStartX
    const deltaY = touchEndY - touchStartY
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)
    const hasSufficientSwipeDistance = absDeltaX >= swipeNavigationMinDistancePx
    const hasAcceptableVerticalDrift = absDeltaY <= swipeNavigationMaxVerticalDriftPx
    const isHorizontallyDominantGesture = absDeltaX >= absDeltaY * swipeNavigationHorizontalDominanceRatio

    resetSwipeTrackingState()

    if (!hasSufficientSwipeDistance || !hasAcceptableVerticalDrift || !isHorizontallyDominantGesture) {
      return
    }

    if (deltaX < 0) {
      handleNextImage()
      return
    }

    if (deltaX > 0) {
      handlePreviousImage()
    }
  }, [
    handleNextImage,
    handlePreviousImage,
    isMultiImageGallery,
    resetSwipeTrackingState
  ])

  const handleGalleryTouchCancel = useCallback(() => {
    resetSwipeTrackingState()
  }, [resetSwipeTrackingState])

  const handleReducedMotionChange = useEffectEvent((event: MediaQueryListEvent) => {
    setPrefersReducedMotion(event.matches)
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQueryList.matches)

    mediaQueryList.addEventListener('change', handleReducedMotionChange)

    return () => {
      mediaQueryList.removeEventListener('change', handleReducedMotionChange)
    }
  }, [])

  useEffect(() => {
    clearFadeCleanupTimer()

    if (prefersReducedMotion || fadeState.leavingIndex === null) {
      return
    }

    fadeCleanupTimerRef.current = setTimeout(() => {
      fadeCleanupTimerRef.current = null
      setFadeState((currentState) => {
        return currentState.leavingIndex === null
          ? currentState
          : {
              ...currentState,
              leavingIndex: null
            }
      })
    }, fadeDurationMs)

    return clearFadeCleanupTimer
  }, [clearFadeCleanupTimer, fadeState.leavingIndex, fadeState.transitionKey, prefersReducedMotion])

  useEffect(() => {
    if (!prefersReducedMotion || fadeState.leavingIndex === null) {
      return
    }

    setFadeState((currentState) => {
      return currentState.leavingIndex === null
        ? currentState
        : {
            ...currentState,
            leavingIndex: null
          }
    })
  }, [fadeState.leavingIndex, prefersReducedMotion])

  useEffect(() => {
    setFadeState((currentState) => {
      const nextActiveIndex = currentState.activeIndex <= resolvedImages.length - 1
        ? currentState.activeIndex
        : 0

      if (nextActiveIndex === currentState.activeIndex && currentState.leavingIndex === null) {
        return currentState
      }

      return {
        activeIndex: nextActiveIndex,
        leavingIndex: null,
        transitionKey: currentState.transitionKey
      }
    })
  }, [resolvedImages.length])

  useEffect(() => {
    if (isMultiImageGallery) {
      return
    }

    setIsGalleryFocused(false)
    resetSwipeTrackingState()
  }, [isMultiImageGallery, resetSwipeTrackingState])

  useEffect(() => {
    if (typeof requestedActiveImageIndex !== 'number' || typeof requestedActiveImageKey !== 'string') {
      return
    }

    if (requestedActiveImageIndex < 0 || requestedActiveImageIndex > resolvedImages.length - 1) {
      return
    }

    moveToImage(requestedActiveImageIndex)
  }, [moveToImage, requestedActiveImageIndex, requestedActiveImageKey, resolvedImages.length])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    resolvedImages.forEach((image, index) => {
      if (index === normalizedActiveImageIndex ||
        preloadedGalleryImageSrcsRef.current.has(image.src) ||
        activeGalleryPreloadImagesRef.current.has(image.src)) {
        return
      }

      const preloadImage = new window.Image()
      const finalizePreload = () => {
        preloadImage.onload = null
        preloadImage.onerror = null
        activeGalleryPreloadImagesRef.current.delete(image.src)
      }

      preloadedGalleryImageSrcsRef.current.add(image.src)
      activeGalleryPreloadImagesRef.current.set(image.src, preloadImage)
      preloadImage.onload = finalizePreload
      preloadImage.onerror = finalizePreload
      preloadImage.src = image.src
    })
  }, [normalizedActiveImageIndex, resolvedImages])

  useEffect(() => {
    return () => {
      clearFadeCleanupTimer()
      activeGalleryPreloadImagesRef.current.forEach((preloadImage) => {
        preloadImage.onload = null
        preloadImage.onerror = null
      })
      activeGalleryPreloadImagesRef.current.clear()
    }
  }, [clearFadeCleanupTimer])

  const handleBackLinkClick = useCallback((event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (isOrderFormOpen && onBackToProduct && isPlainLeftClick(event)) {
      event.preventDefault()
      onBackToProduct()
      return
    }

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
  }, [backHref, isOrderFormOpen, onBackToProduct])

  return (
    <article className='mx-auto w-full max-w-[1432px] px-4 pb-16 pt-5 tablet:max-w-[944px] tablet:px-0 tablet:pt-8 small-laptop:max-w-[1200px] large-laptop:max-w-[1432px]'>
      <Link
        href={backHref}
        onClick={handleBackLinkClick}
        className='inline-flex items-center gap-2 text-base leading-none text-base-content transition-colors hover:text-primary-500 tablet:text-(--color-filter-sort-mobile-text)'
        aria-label={backLabel}
      >
        <span aria-hidden='true' className='text-[16px] leading-none tablet:[font-size:var(--t-font-size-base)] tablet:align-middle'>&lsaquo;</span>
        <span className='font-sans text-[16px] leading-6 text-base-content tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-base)] tablet:[leading-trim:none] tablet:[line-height:var(--t-font-lineHeight-leading-7)] tablet:[letter-spacing:0] tablet:align-middle tablet:text-(--color-filter-sort-mobile-text)'>
          {backLabel}
        </span>
      </Link>

      <div className='mt-5 grid grid-cols-1 gap-8 tablet:mt-8 tablet:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] tablet:items-start tablet:gap-10'>
        <section
          ref={galleryRegionRef}
          aria-label='Product gallery'
          role='region'
          tabIndex={isMultiImageGallery ? 0 : undefined}
          onKeyDown={handleGalleryKeyDown}
          onFocusCapture={handleGalleryFocusCapture}
          onBlurCapture={handleGalleryBlurCapture}
          className='group focus:outline-none focus-visible:outline-none'
        >
          <span className='sr-only'>
            Image {normalizedActiveImageIndex + 1} of {resolvedImages.length}
          </span>
          <div
            onTouchStart={handleGalleryTouchStart}
            onTouchMove={handleGalleryTouchMove}
            onTouchEnd={handleGalleryTouchEnd}
            onTouchCancel={handleGalleryTouchCancel}
            data-testid='product-gallery-viewport'
            className={`catalog-gallery-viewport relative -mx-4 aspect-square w-[calc(100%+2rem)] touch-none overflow-hidden rounded-none bg-base-200 ${isGalleryFocused ? 'outline outline-2 outline-offset-2 outline-primary-500' : ''} tablet:mx-0 tablet:w-full tablet:touch-pan-y tablet:rounded-[8px]`}
          >
            <div
              data-testid='product-gallery-stage'
              className='relative h-full w-full'
            >
              {leavingImage ? (
                <div
                  key={`leaving-${fadeState.transitionKey}-${fadeState.leavingIndex}`}
                  data-testid='product-gallery-leaving-layer'
                  aria-hidden='true'
                  className='pointer-events-none absolute inset-0 z-10'
                  style={prefersReducedMotion
                    ? undefined
                    : {
                        animationName: 'catalog-gallery-fade-out',
                        animationDuration: `${fadeDurationMs}ms`,
                        animationTimingFunction: 'ease-out',
                        animationFillMode: 'forwards'
                      }}
                >
                  <Image
                    src={leavingImage.src}
                    alt=''
                    fill
                    sizes={imageSizes}
                    className='object-cover'
                  />
                </div>
              ) : null}
              <div
                key={`active-${fadeState.transitionKey}-${normalizedActiveImageIndex}`}
                data-testid='product-gallery-active-layer'
                className='absolute inset-0'
              >
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  priority={normalizedActiveImageIndex === 0}
                  sizes={imageSizes}
                  className='object-cover'
                />
              </div>
            </div>
            {isMultiImageGallery ? (
              <>
                <button
                  type='button'
                  onClick={handlePreviousImage}
                  aria-label='View previous image'
                  className={`touch-target cursor-pointer absolute left-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-base-100/90 text-primary-500 shadow-md transition-opacity hover:opacity-100 ${isGalleryFocused ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} tablet:opacity-80 tablet:pointer-events-auto`}
                >
                  <span aria-hidden='true' className='text-[18px] leading-none'>&lsaquo;</span>
                </button>
                <button
                  type='button'
                  onClick={handleNextImage}
                  aria-label='View next image'
                  className={`touch-target cursor-pointer absolute right-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-base-100/90 text-primary-500 shadow-md transition-opacity hover:opacity-100 ${isGalleryFocused ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} tablet:opacity-80 tablet:pointer-events-auto`}
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
                    onClick={() => moveToImage(index)}
                    className={`h-2 w-2 cursor-pointer rounded-full border transition-colors ${
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
          {galleryBelowContent ? (
            <div className='mt-8'>
              {galleryBelowContent}
            </div>
          ) : null}
        </section>

        <section aria-label='Product details'>
          {shouldRenderOrderOnly ? (
            <>
              <header>
                <p className='[font-family:var(--t-font-family-theme-primary)] [font-weight:var(--t-font-weight-normal)] [font-style:normal] text-[12px] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-base-content/55 tablet:[font-size:var(--t-font-size-sm)] tablet:text-(--color-catalog-detail-muted)'>
                  You selected:
                </p>

                <h1 className='mt-1 font-oldenburg [font-weight:var(--t-font-weight-normal)] [font-style:normal] [font-size:var(--t-font-size-xl)] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-(--color-filter-sort-mobile-text) tablet:text-[24px]'>
                  {title}
                </h1>

                <p className='mt-3 flex flex-wrap items-end gap-x-4 gap-y-1 text-base-content'>
                  <span className='[font-family:var(--font-more-sugar),cursive,fantasy] [font-weight:var(--t-font-weight-normal)] [font-style:normal] [font-size:var(--t-font-size-subtitle-small)] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-primary-500 tablet:[font-family:var(--font-more-sugar),cursive,fantasy] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-title-page-base)] tablet:[leading-trim:none] tablet:[line-height:100%] tablet:[letter-spacing:-0.02em] tablet:align-middle tablet:text-primary-500'>
                    {splitPrice.prefix.length > 0 ? (
                      <span className={pricePrefixClass}>
                        {splitPrice.prefix}
                      </span>
                    ) : null}
                    {splitPrice.currencySign ? (
                      <span className={tabletPriceSignClass}>
                        {splitPrice.currencySign}
                      </span>
                    ) : null}
                    {splitPrice.remainder}
                  </span>
                </p>
              </header>

              <div className='mt-5'>
                {orderContent}
              </div>
            </>
          ) : (
            <>
              <header>
                <div className='flex items-start justify-between gap-4'>
                  <p className='[font-family:var(--t-font-family-theme-primary)] [font-weight:var(--t-font-weight-normal)] [font-style:normal] text-[12px] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-base-content/55 tablet:[font-size:var(--t-font-size-sm)] tablet:text-(--color-catalog-detail-muted)'>
                    {categoryLabel}
                  </p>
                </div>

                <h1 className='mt-1 font-oldenburg [font-weight:var(--t-font-weight-normal)] [font-style:normal] [font-size:var(--t-font-size-xl)] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-(--color-filter-sort-mobile-text) tablet:text-[24px]'>
                  {title}
                </h1>

                <p className='mt-3 flex flex-wrap items-end gap-x-4 gap-y-1 text-base-content'>
                  <span className='[font-family:var(--font-more-sugar),cursive,fantasy] [font-weight:var(--t-font-weight-normal)] [font-style:normal] [font-size:var(--t-font-size-subtitle-small)] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-primary-500 tablet:[font-family:var(--font-more-sugar),cursive,fantasy] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-title-page-base)] tablet:[leading-trim:none] tablet:[line-height:100%] tablet:[letter-spacing:-0.02em] tablet:align-middle tablet:text-primary-500'>
                    {splitPrice.prefix.length > 0 ? (
                      <span className={pricePrefixClass}>
                        {splitPrice.prefix}
                      </span>
                    ) : null}
                    {splitPrice.currencySign ? (
                      <span className={tabletPriceSignClass}>
                        {splitPrice.currencySign}
                      </span>
                    ) : null}
                    {splitPrice.remainder}
                  </span>
                  {shouldShowPriceSuffix ? (
                    <span className='font-sans text-[20px] leading-[30px] tablet:text-[58px] tablet:leading-[72px]'>
                      {priceSuffix}
                    </span>
                  ) : null}
                </p>
              </header>

              <ul className='mt-5 list-disc space-y-1 pl-6 [font-family:var(--t-font-family-theme-primary)] [font-weight:var(--t-font-weight-normal)] [font-style:normal] [font-size:var(--t-font-size-base)] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-(--d-color-base-content) tablet:pl-8 tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-base)] tablet:[leading-trim:none] tablet:[line-height:140%] tablet:[letter-spacing:0] tablet:text-(--d-color-base-content)'>
                {keyPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <button
                type='button'
                onClick={onCtaClick}
                onMouseEnter={onCtaIntent}
                onFocus={onCtaIntent}
                onTouchStart={onCtaIntent}
                className='btn btn-primary mt-6 h-12 min-h-12 w-full border-none px-8 normal-case shadow-sm [font-family:var(--t-font-family-theme-primary)] [font-weight:var(--t-font-weight-semibold)] [font-style:normal] [font-size:var(--t-font-size-sm)] [leading-trim:none] [line-height:var(--d-lineHeight-14)] [letter-spacing:0] text-center align-middle text-primary-content tablet:gap-2 tablet:px-4'
              >
                {ctaLabel}
              </button>

              {orderContent ? (
                <div className='mt-6'>
                  {orderContent}
                </div>
              ) : null}

              <div className='mt-7'>
                {sections.map((section) => (
                  <details
                    key={section.id}
                    open={section.defaultOpen}
                    className='catalog-product-accordion-row collapse collapse-plus rounded-none border-b border-base-300 bg-transparent first:border-t'
                  >
                    <summary
                      className='collapse-title box-border px-6 py-5 [font-family:var(--t-font-family-theme-primary)] [font-weight:var(--t-font-weight-normal)] [font-style:normal] [font-size:var(--t-font-size-base)] [leading-trim:none] [line-height:var(--t-font-lineHeight-leading-7)] [letter-spacing:0] align-middle text-[color:var(--d-color-base-content,#1F2937)] tablet:[font-family:var(--t-font-family-theme-primary)] tablet:[font-weight:var(--t-font-weight-normal)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-base)] tablet:[leading-trim:none] tablet:[line-height:var(--t-font-lineHeight-leading-7)] tablet:[letter-spacing:0] tablet:align-middle tablet:text-(--d-color-base-content)'
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
            </>
          )}
        </section>
      </div>
      <style jsx global>{`
        @keyframes catalog-gallery-fade-out {
          from {
            opacity: 1;
          }

          to {
            opacity: 0;
          }
        }
      `}</style>
    </article>
  )
}
