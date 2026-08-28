'use client'

import type { MouseEvent, ReactNode } from 'react'

type WorkshopEnquiryScrollLinkProps = {
  children: ReactNode
  className?: string
}

const workshopFormHash = '#workshop-enquiry-form'

function updateWorkshopFormHash() {
  if (window.location.hash === workshopFormHash) {
    return
  }

  const nextUrl = `${window.location.pathname}${window.location.search}${workshopFormHash}`
  window.history.pushState(window.history.state, '', nextUrl)
}

export function WorkshopEnquiryScrollLink({
  children,
  className = ''
}: WorkshopEnquiryScrollLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const isPlainLeftClick =
      event.button === 0 &&
      event.metaKey === false &&
      event.ctrlKey === false &&
      event.shiftKey === false &&
      event.altKey === false

    if (!isPlainLeftClick) {
      return
    }

    const workshopFormSection = document.getElementById('workshop-enquiry-form')
    if (!workshopFormSection) {
      return
    }

    event.preventDefault()
    updateWorkshopFormHash()
    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    workshopFormSection.focus({ preventScroll: true })
    workshopFormSection.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    })
  }

  return (
    <a href={workshopFormHash} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}
