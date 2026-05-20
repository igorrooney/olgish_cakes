'use client'

import type { MouseEvent, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type ContactFormScrollLinkProps = {
  children: ReactNode
  className?: string
}

const contactPagePathname = '/contact'
const contactFormHash = '#contact-form-card'

function updateContactFormHash() {
  if (window.location.hash === contactFormHash) {
    return
  }

  const nextUrl = `${window.location.pathname}${window.location.search}${contactFormHash}`
  window.history.pushState(window.history.state, '', nextUrl)
}

export function ContactFormScrollLink ({
  children,
  className = ''
}: ContactFormScrollLinkProps) {
  const pathname = usePathname()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const isPlainLeftClick =
      event.button === 0 &&
      event.metaKey === false &&
      event.ctrlKey === false &&
      event.shiftKey === false &&
      event.altKey === false

    if (pathname !== contactPagePathname || isPlainLeftClick === false) {
      return
    }

    const contactFormSection = document.getElementById('contact-form-card')

    if (!contactFormSection) {
      return
    }

    event.preventDefault()
    updateContactFormHash()
    contactFormSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Link href={contactFormHash} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
