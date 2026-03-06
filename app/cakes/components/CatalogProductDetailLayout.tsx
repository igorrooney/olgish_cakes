'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FocusEvent as ReactFocusEvent, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode, type TouchEvent as ReactTouchEvent } from 'react'
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

const imageSizes = '(min-width: 1024px) 560px, 100vw'

const fallbackImage: CatalogProductDetailImage = {
  src: '/images/placeholder-cake.jpg',
  alt: 'Product image placeholder'
}
const swipeNavigationMinDistancePx = 48
const swipeNavigationMaxVerticalDriftPx = 24
const swipeNavigationHorizontalDominanceRatio = 1.25
const loopResetTransitionMs = 320
const loopResetScrollSettleIdleMs = 80
const loopResetFallbackRetryMs = 48
const loopResetFallbackMaxExtraMs = 800

const pricePrefixClass = '[font-family:var(--font-more-sugar),cursive,fantasy] [font-weight:var(--t-font-weight-bold)] [font-style:normal] [font-size:12px] tablet:[font-size:var(--t-font-size-subtitle-small)] [leading-trim:none] [line-height:100%] [letter-spacing:-0.02em] align-top text-primary-500'
const tabletPriceSignClass = 'tablet:[font-family:var(--font-more-sugar),cursive,fantasy] tablet:[font-weight:var(--t-font-weight-bold)] tablet:[font-style:normal] tablet:[font-size:var(--t-font-size-subtitle-small)] tablet:[leading-trim:none] tablet:[line-height:100%] tablet:[letter-spacing:-0.02em] tablet:align-top tablet:text-primary-500'

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

function toVisualIndex(realIndex: number, isLoopingGallery: boolean) {
  return isLoopingGallery ? realIndex + 1 : realIndex
}

function resolveVisualIndexFromScrollPosition(
  scrollLeft: number,
  clientWidth: number,
  slideCount: number
) {
  if (clientWidth <= 0 || slideCount <= 0) {
    return null
  }

  const estimatedIndex = Math.round(scrollLeft / clientWidth)
  const lastSlideIndex = slideCount - 1

  if (estimatedIndex < 0) {
    return 0
  }

  if (estimatedIndex > lastSlideIndex) {
    return lastSlideIndex
  }

  return estimatedIndex
}

function resolveRealIndexFromVisualIndex(
  visualIndex: number,
  slides: Array<{ realIndex: number }>
) {
  const selectedSlide = slides[visualIndex]

  if (!selectedSlide) {
    return 0
  }

  return selectedSlide.realIndex
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
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeVisualIndex, setActiveVisualIndex] = useState(0)
  const [isLoopReady, setIsLoopReady] = useState(false)
  const [isGalleryFocused, setIsGalleryFocused] = useState(false)
  const latestRealImageIndexRef = useRef(0)
  const galleryRegionRef = useRef<HTMLElement | null>(null)
  const galleryCarouselRef = useRef<HTMLDivElement | null>(null)
  const gallerySlideRefs = useRef<Array<HTMLDivElement | null>>([])
  const pendingScrollBehaviorRef = useRef<ScrollBehavior>('smooth')
  const scrollSettleSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loopResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingLoopResetTargetVisualIndexRef = useRef<number | null>(null)
  const lastCarouselScrollAtRef = useRef(0)
  const loopResetFallbackDeadlineAtRef = useRef<number | null>(null)
  const wasLoopingGalleryRef = useRef(false)
  const previousResolvedImageCountRef = useRef(images.length > 0 ? images.length : 1)
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchCurrentXRef = useRef<number | null>(null)
  const touchCurrentYRef = useRef<number | null>(null)
  const isSwipeTrackingRef = useRef(false)
  const resolvedImages = useMemo(() => {
    return images.length > 0 ? images : [fallbackImage]
  }, [images])
  const isMultiImageGallery = resolvedImages.length > 1
  const isLoopingGallery = isMultiImageGallery && isLoopReady
  const renderedSlides = useMemo(() => {
    if (!isLoopingGallery) {
      return resolvedImages.map((image, index) => ({
        key: `real-${index}-${image.src}`,
        image,
        realIndex: index,
        isClone: false
      }))
    }

    const firstImage = resolvedImages[0]
    const lastImage = resolvedImages[resolvedImages.length - 1]

    return [
      {
        key: `clone-head-${lastImage.src}`,
        image: lastImage,
        realIndex: resolvedImages.length - 1,
        isClone: true
      },
      ...resolvedImages.map((image, index) => ({
        key: `real-${index}-${image.src}`,
        image,
        realIndex: index,
        isClone: false
      })),
      {
        key: `clone-tail-${firstImage.src}`,
        image: firstImage,
        realIndex: 0,
        isClone: true
      }
    ]
  }, [isLoopingGallery, resolvedImages])
  const splitPrice = useMemo(() => {
    return splitPriceText(priceText)
  }, [priceText])
  const normalizedActiveImageIndex = activeImageIndex <= resolvedImages.length - 1
    ? activeImageIndex
    : 0
  const shouldRenderOrderOnly = isOrderFormOpen && Boolean(orderContent)
  const shouldShowPriceSuffix = !shouldRenderOrderOnly && Boolean(priceSuffix)

  const commitGalleryNavigationState = useCallback((
    nextRealIndex: number,
    nextVisualIndex: number,
    behavior: ScrollBehavior
  ) => {
    latestRealImageIndexRef.current = nextRealIndex
    pendingScrollBehaviorRef.current = behavior
    setActiveImageIndex(nextRealIndex)
    setActiveVisualIndex(nextVisualIndex)
  }, [])

  const resetSwipeTrackingState = useCallback(() => {
    touchStartXRef.current = null
    touchStartYRef.current = null
    touchCurrentXRef.current = null
    touchCurrentYRef.current = null
    isSwipeTrackingRef.current = false
  }, [])

  const clearPendingLoopReset = useCallback(() => {
    pendingLoopResetTargetVisualIndexRef.current = null
    loopResetFallbackDeadlineAtRef.current = null

    if (loopResetTimerRef.current !== null) {
      clearTimeout(loopResetTimerRef.current)
      loopResetTimerRef.current = null
    }
  }, [])

  const clearPendingScrollSettleSync = useCallback(() => {
    if (scrollSettleSyncTimerRef.current !== null) {
      clearTimeout(scrollSettleSyncTimerRef.current)
      scrollSettleSyncTimerRef.current = null
    }
  }, [])

  const flushPendingLoopReset = useCallback(() => {
    const targetVisualIndex = pendingLoopResetTargetVisualIndexRef.current

    if (targetVisualIndex === null) {
      return
    }

    clearPendingLoopReset()
    pendingScrollBehaviorRef.current = 'auto'
    setActiveVisualIndex(targetVisualIndex)
  }, [clearPendingLoopReset])

  const scheduleLoopReset = useCallback((targetVisualIndex: number) => {
    clearPendingLoopReset()
    pendingLoopResetTargetVisualIndexRef.current = targetVisualIndex
    const now = Date.now()
    lastCarouselScrollAtRef.current = now
    loopResetFallbackDeadlineAtRef.current = now + loopResetTransitionMs + loopResetFallbackMaxExtraMs

    const scheduleFallbackCheck = (delayMs: number) => {
      loopResetTimerRef.current = setTimeout(() => {
        if (pendingLoopResetTargetVisualIndexRef.current === null) {
          return
        }

        const currentTime = Date.now()
        const hasReachedFallbackDeadline = typeof loopResetFallbackDeadlineAtRef.current === 'number' &&
          currentTime >= loopResetFallbackDeadlineAtRef.current
        const hasScrollSettled = currentTime - lastCarouselScrollAtRef.current >= loopResetScrollSettleIdleMs

        if (hasReachedFallbackDeadline || hasScrollSettled) {
          flushPendingLoopReset()
          return
        }

        scheduleFallbackCheck(loopResetFallbackRetryMs)
      }, delayMs)
    }

    scheduleFallbackCheck(loopResetTransitionMs)
  }, [clearPendingLoopReset, flushPendingLoopReset])

  const scrollGalleryToImage = useCallback((index: number, behavior: ScrollBehavior) => {
    const targetSlide = gallerySlideRefs.current[index]
    const carouselElement = galleryCarouselRef.current

    if (!carouselElement) {
      return
    }

    const fallbackSlideOffsetLeft = targetSlide?.offsetLeft
    const fallbackScrollLeft = typeof fallbackSlideOffsetLeft === 'number'
      ? fallbackSlideOffsetLeft
      : index * carouselElement.clientWidth

    if (behavior === 'auto') {
      const previousInlineScrollBehavior = carouselElement.style.scrollBehavior
      carouselElement.style.scrollBehavior = 'auto'

      if (typeof carouselElement.scrollTo === 'function') {
        carouselElement.scrollTo({
          left: fallbackScrollLeft,
          behavior
        })
      } else if (targetSlide && typeof targetSlide.scrollIntoView === 'function') {
        targetSlide.scrollIntoView({
          behavior,
          block: 'nearest',
          inline: 'start'
        })
      } else {
        carouselElement.scrollLeft = fallbackScrollLeft
      }

      const restoreInlineScrollBehavior = () => {
        if (!carouselElement.isConnected) {
          return
        }

        carouselElement.style.scrollBehavior = previousInlineScrollBehavior
      }

      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            restoreInlineScrollBehavior()
          })
        })
      } else {
        setTimeout(() => {
          restoreInlineScrollBehavior()
        }, 0)
      }

      return
    }

    if (typeof carouselElement.scrollTo === 'function') {
      carouselElement.scrollTo({
        left: fallbackScrollLeft,
        behavior
      })

      return
    }

    if (targetSlide && typeof targetSlide.scrollIntoView === 'function') {
      targetSlide.scrollIntoView({
        behavior,
        block: 'nearest',
        inline: 'start'
      })
      return
    }

    carouselElement.scrollLeft = fallbackScrollLeft
  }, [])

  const moveToRealImageIndex = useCallback((nextRealIndex: number, behavior: ScrollBehavior = 'smooth') => {
    clearPendingScrollSettleSync()
    clearPendingLoopReset()
    commitGalleryNavigationState(nextRealIndex, toVisualIndex(nextRealIndex, isLoopingGallery), behavior)
  }, [
    clearPendingLoopReset,
    clearPendingScrollSettleSync,
    commitGalleryNavigationState,
    isLoopingGallery
  ])

  const syncActiveImageIndexFromCarouselScrollPosition = useCallback((shouldSyncState: boolean) => {
    const carouselElement = galleryCarouselRef.current

    if (!carouselElement) {
      return
    }

    const visualIndex = resolveVisualIndexFromScrollPosition(
      carouselElement.scrollLeft,
      carouselElement.clientWidth,
      renderedSlides.length
    )

    if (visualIndex === null) {
      return
    }

    const realIndex = resolveRealIndexFromVisualIndex(visualIndex, renderedSlides)
    const isLoopResetPending = pendingLoopResetTargetVisualIndexRef.current !== null

    if (!isLoopResetPending || shouldSyncState) {
      latestRealImageIndexRef.current = realIndex
    }

    if (!shouldSyncState) {
      return
    }

    setActiveImageIndex((currentIndex) => {
      return currentIndex === realIndex ? currentIndex : realIndex
    })
  }, [renderedSlides])

  const handlePreviousImage = useCallback(() => {
    if (!isMultiImageGallery) {
      return
    }

    const lastRealIndex = resolvedImages.length - 1
    const currentRealIndex = latestRealImageIndexRef.current <= lastRealIndex
      ? latestRealImageIndexRef.current
      : 0

    if (!isLoopingGallery) {
      moveToRealImageIndex(currentRealIndex === 0 ? lastRealIndex : currentRealIndex - 1)
      return
    }

    if (currentRealIndex === 0) {
      clearPendingScrollSettleSync()
      clearPendingLoopReset()
      commitGalleryNavigationState(lastRealIndex, 0, 'smooth')
      scheduleLoopReset(toVisualIndex(lastRealIndex, true))
      return
    }

    moveToRealImageIndex(currentRealIndex - 1)
  }, [
    clearPendingLoopReset,
    clearPendingScrollSettleSync,
    commitGalleryNavigationState,
    isLoopingGallery,
    isMultiImageGallery,
    moveToRealImageIndex,
    resolvedImages.length,
    scheduleLoopReset
  ])

  const handleNextImage = useCallback(() => {
    if (!isMultiImageGallery) {
      return
    }

    const lastRealIndex = resolvedImages.length - 1
    const currentRealIndex = latestRealImageIndexRef.current <= lastRealIndex
      ? latestRealImageIndexRef.current
      : 0

    if (!isLoopingGallery) {
      moveToRealImageIndex(currentRealIndex === lastRealIndex ? 0 : currentRealIndex + 1)
      return
    }

    if (currentRealIndex === lastRealIndex) {
      clearPendingScrollSettleSync()
      clearPendingLoopReset()
      commitGalleryNavigationState(0, renderedSlides.length - 1, 'smooth')
      scheduleLoopReset(toVisualIndex(0, true))
      return
    }

    moveToRealImageIndex(currentRealIndex + 1)
  }, [
    clearPendingLoopReset,
    clearPendingScrollSettleSync,
    commitGalleryNavigationState,
    isLoopingGallery,
    isMultiImageGallery,
    moveToRealImageIndex,
    renderedSlides.length,
    resolvedImages.length,
    scheduleLoopReset
  ])

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

  useEffect(() => {
    latestRealImageIndexRef.current = normalizedActiveImageIndex
  }, [normalizedActiveImageIndex])

  useEffect(() => {
    pendingScrollBehaviorRef.current = 'auto'

    if (isMultiImageGallery) {
      scrollGalleryToImage(0, 'auto')
    }

    setActiveVisualIndex(toVisualIndex(0, isMultiImageGallery))
    setIsLoopReady(isMultiImageGallery)
  }, [isMultiImageGallery, scrollGalleryToImage])

  useEffect(() => {
    if (activeImageIndex <= resolvedImages.length - 1) {
      return
    }

    clearPendingLoopReset()
    commitGalleryNavigationState(0, toVisualIndex(0, isLoopingGallery), 'auto')
  }, [activeImageIndex, clearPendingLoopReset, commitGalleryNavigationState, isLoopingGallery, resolvedImages.length])

  useEffect(() => {
    if (isMultiImageGallery) {
      return
    }

    clearPendingLoopReset()
    clearPendingScrollSettleSync()
    setIsGalleryFocused(false)
    resetSwipeTrackingState()
  }, [clearPendingLoopReset, clearPendingScrollSettleSync, isMultiImageGallery, resetSwipeTrackingState])

  useEffect(() => {
    if (typeof requestedActiveImageIndex !== 'number' || typeof requestedActiveImageKey !== 'string') {
      return
    }

    if (requestedActiveImageIndex < 0 || requestedActiveImageIndex > resolvedImages.length - 1) {
      return
    }

    moveToRealImageIndex(requestedActiveImageIndex)
  }, [moveToRealImageIndex, requestedActiveImageIndex, requestedActiveImageKey, resolvedImages.length])

  useEffect(() => {
    const previousIsLoopingGallery = wasLoopingGalleryRef.current
    const previousResolvedImageCount = previousResolvedImageCountRef.current
    const hasLoopingModeChanged = previousIsLoopingGallery !== isLoopingGallery
    const hasResolvedImageCountChanged = previousResolvedImageCount !== resolvedImages.length

    wasLoopingGalleryRef.current = isLoopingGallery
    previousResolvedImageCountRef.current = resolvedImages.length
    gallerySlideRefs.current = gallerySlideRefs.current.slice(0, renderedSlides.length)

    if (!hasLoopingModeChanged && !hasResolvedImageCountChanged) {
      return
    }

    clearPendingLoopReset()
    pendingScrollBehaviorRef.current = 'auto'
    setActiveVisualIndex(toVisualIndex(normalizedActiveImageIndex, isMultiImageGallery))
  }, [
    clearPendingLoopReset,
    isMultiImageGallery,
    isLoopingGallery,
    normalizedActiveImageIndex,
    renderedSlides.length,
    resolvedImages.length
  ])

  useLayoutEffect(() => {
    scrollGalleryToImage(activeVisualIndex, pendingScrollBehaviorRef.current)
    pendingScrollBehaviorRef.current = 'smooth'
  }, [activeVisualIndex, scrollGalleryToImage])

  useEffect(() => {
    return () => {
      clearPendingLoopReset()
      clearPendingScrollSettleSync()
    }
  }, [clearPendingLoopReset, clearPendingScrollSettleSync])

  const handleCarouselScroll = useCallback((event: Event) => {
    if (event.target !== galleryCarouselRef.current) {
      return
    }

    lastCarouselScrollAtRef.current = Date.now()
    syncActiveImageIndexFromCarouselScrollPosition(false)
    clearPendingScrollSettleSync()
    scrollSettleSyncTimerRef.current = setTimeout(() => {
      scrollSettleSyncTimerRef.current = null
      syncActiveImageIndexFromCarouselScrollPosition(true)
    }, loopResetScrollSettleIdleMs)
  }, [clearPendingScrollSettleSync, syncActiveImageIndexFromCarouselScrollPosition])

  const handleCarouselScrollEnd = useCallback((event: Event) => {
    if (event.target !== galleryCarouselRef.current) {
      return
    }

    clearPendingScrollSettleSync()
    syncActiveImageIndexFromCarouselScrollPosition(true)

    if (!isLoopingGallery) {
      return
    }

    flushPendingLoopReset()
  }, [
    clearPendingScrollSettleSync,
    flushPendingLoopReset,
    isLoopingGallery,
    syncActiveImageIndexFromCarouselScrollPosition
  ])

  useEffect(() => {
    const carouselElement = galleryCarouselRef.current

    if (!carouselElement) {
      return
    }

    carouselElement.addEventListener('scroll', handleCarouselScroll, { passive: true })
    carouselElement.addEventListener('scrollend', handleCarouselScrollEnd)

    return () => {
      carouselElement.removeEventListener('scroll', handleCarouselScroll)
      carouselElement.removeEventListener('scrollend', handleCarouselScrollEnd)
    }
  }, [handleCarouselScroll, handleCarouselScrollEnd])

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
              ref={galleryCarouselRef}
              data-testid='product-gallery-carousel'
              className='carousel h-full w-full [scroll-snap-type:x_mandatory]'
            >
              {renderedSlides.map((slide, index) => (
                <div
                  key={slide.key}
                  ref={(element) => {
                    gallerySlideRefs.current[index] = element
                  }}
                  data-testid={`product-gallery-slide-${index + 1}`}
                  aria-hidden={slide.isClone ? 'true' : undefined}
                  className='carousel-item relative h-full w-full flex-none [scroll-snap-align:start]'
                >
                  <Image
                    src={slide.image.src}
                    alt={slide.isClone ? '' : slide.image.alt}
                    fill
                    priority={!slide.isClone && slide.realIndex === 0}
                    sizes={imageSizes}
                    className='object-cover'
                  />
                </div>
              ))}
            </div>
            {isMultiImageGallery ? (
              <>
                <button
                  type='button'
                  onClick={handlePreviousImage}
                  aria-label='View previous image'
                  className={`touch-target cursor-pointer absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-base-100/90 text-primary-500 shadow-md transition-opacity hover:opacity-100 ${isGalleryFocused ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} tablet:opacity-80 tablet:pointer-events-auto`}
                >
                  <span aria-hidden='true' className='text-[18px] leading-none'>&lsaquo;</span>
                </button>
                <button
                  type='button'
                  onClick={handleNextImage}
                  aria-label='View next image'
                  className={`touch-target cursor-pointer absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-base-100/90 text-primary-500 shadow-md transition-opacity hover:opacity-100 ${isGalleryFocused ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} tablet:opacity-80 tablet:pointer-events-auto`}
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
                    onClick={() => moveToRealImageIndex(index)}
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
    </article>
  )
}


