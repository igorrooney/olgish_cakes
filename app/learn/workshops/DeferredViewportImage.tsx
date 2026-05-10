'use client'

import Image, { type ImageProps } from 'next/image'
import { useEffect, useRef, useState } from 'react'

type DeferredViewportImageProps = Omit<ImageProps, 'loading'> & {
  rootMargin?: string
}

const defaultRootMargin = '32px 0px'

export function DeferredViewportImage({
  rootMargin = defaultRootMargin,
  ...imageProps
}: DeferredViewportImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = useState(() => (
    typeof window !== 'undefined' && typeof window.IntersectionObserver !== 'function'
  ))

  useEffect(() => {
    if (shouldLoad) {
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    if (typeof window.IntersectionObserver !== 'function') {
      setShouldLoad(true)
      return
    }

    const observedElement = containerRef.current

    if (!observedElement) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
      }
    )

    observer.observe(observedElement)

    return () => {
      observer.disconnect()
    }
  }, [rootMargin, shouldLoad])

  return (
    <div ref={containerRef} className='h-full w-full'>
      {shouldLoad ? (
        <Image
          {...imageProps}
          loading='eager'
        />
      ) : (
        <div
          data-testid='deferred-viewport-image-placeholder'
          aria-hidden='true'
          className='h-full w-full rounded-inherit bg-base-200/50'
        />
      )}
    </div>
  )
}
