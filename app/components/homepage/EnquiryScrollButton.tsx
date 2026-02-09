'use client'

import type { ReactNode } from 'react'

type EnquiryScrollButtonProps = {
  className?: string
  children: ReactNode
}

export function EnquiryScrollButton({ className = '', children }: EnquiryScrollButtonProps) {
  const handleClick = () => {
    const heading = document.getElementById('custom-cake-enquiry-heading')
    if (!heading) {
      return
    }
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button type='button' className={className} onClick={handleClick}>
      {children}
    </button>
  )
}
