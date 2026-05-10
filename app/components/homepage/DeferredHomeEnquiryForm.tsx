'use client'

import { type ComponentType, useEffect, useRef, useState } from 'react'
import type { OccasionOption } from './formOptions'

type DeferredHomeEnquiryFormProps = {
  occasionOptions: OccasionOption[]
}

type HomeEnquiryFormInnerProps = {
  occasionOptions: OccasionOption[]
}

type HomeEnquiryFormComponent = ComponentType<HomeEnquiryFormInnerProps>

const intersectionRootMargin = '420px 0px'

export function DeferredHomeEnquiryForm({
  occasionOptions
}: DeferredHomeEnquiryFormProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [HomeEnquiryFormComponent, setHomeEnquiryFormComponent] =
    useState<HomeEnquiryFormComponent | null>(null)

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
        rootMargin: intersectionRootMargin,
      }
    )

    observer.observe(observedElement)

    return () => {
      observer.disconnect()
    }
  }, [shouldLoad])

  useEffect(() => {
    if (!shouldLoad || HomeEnquiryFormComponent !== null) {
      return
    }

    let isMounted = true

    import('./HomeEnquiryFormInner').then(module => {
      if (!isMounted) {
        return
      }

      setHomeEnquiryFormComponent(() => module.HomeEnquiryFormInner)
    })

    return () => {
      isMounted = false
    }
  }, [HomeEnquiryFormComponent, shouldLoad])

  return (
    <div ref={containerRef}>
      {HomeEnquiryFormComponent ? (
        <HomeEnquiryFormComponent occasionOptions={occasionOptions} />
      ) : (
        <div
          data-testid='home-enquiry-form-placeholder'
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
