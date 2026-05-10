'use client'

import { type ComponentType, useEffect, useRef, useState } from 'react'
import { Providers } from '@/app/providers'

type WorkshopEnquiryFormComponent = ComponentType

const intersectionRootMargin = '360px 0px'

export function DeferredWorkshopEnquiryForm() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [WorkshopEnquiryFormComponent, setWorkshopEnquiryFormComponent] =
    useState<WorkshopEnquiryFormComponent | null>(null)

  useEffect(() => {
    if (shouldLoad) {
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    if (window.location.hash === '#workshop-enquiry-form') {
      setShouldLoad(true)
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
        rootMargin: intersectionRootMargin,
      }
    )

    observer.observe(observedElement)

    return () => {
      observer.disconnect()
    }
  }, [shouldLoad])

  useEffect(() => {
    if (!shouldLoad || WorkshopEnquiryFormComponent !== null) {
      return
    }

    let isMounted = true

    import('./WorkshopEnquiryForm').then(module => {
      if (!isMounted) {
        return
      }

      setWorkshopEnquiryFormComponent(() => module.WorkshopEnquiryForm)
    })

    return () => {
      isMounted = false
    }
  }, [WorkshopEnquiryFormComponent, shouldLoad])

  return (
    <div ref={containerRef}>
      {WorkshopEnquiryFormComponent ? (
        <Providers>
          <WorkshopEnquiryFormComponent />
        </Providers>
      ) : (
        <div
          data-testid='workshop-enquiry-form-placeholder'
          aria-hidden='true'
          className='grid gap-3 tablet:gap-4'
        >
          <div className='h-12 rounded-[16px] bg-base-200/70' />
          <div className='h-12 rounded-[16px] bg-base-200/60' />
          <div className='h-12 rounded-[16px] bg-base-200/70' />
          <div className='h-12 rounded-[16px] bg-base-200/60' />
          <div className='h-32 rounded-[20px] bg-base-200/60 tablet:h-36' />
          <div className='h-12 rounded-full bg-primary/12' />
        </div>
      )}
    </div>
  )
}
