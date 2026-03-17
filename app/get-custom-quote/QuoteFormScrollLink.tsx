'use client'

import type { MouseEvent, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type QuoteFormScrollLinkProps = {
  children: ReactNode
  className?: string
}

const quotePagePathname = '/get-custom-quote'
const quoteFormHash = '#quote-form'
const quoteFormHref = `${quotePagePathname}${quoteFormHash}`

function updateQuoteFormHash() {
  if (window.location.hash === quoteFormHash) {
    return
  }

  const nextUrl = `${window.location.pathname}${window.location.search}${quoteFormHash}`
  window.history.pushState(window.history.state, '', nextUrl)
}

export function QuoteFormScrollLink({
  children,
  className = ''
}: QuoteFormScrollLinkProps) {
  const pathname = usePathname()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const isPlainLeftClick =
      event.button === 0 &&
      event.metaKey === false &&
      event.ctrlKey === false &&
      event.shiftKey === false &&
      event.altKey === false

    if (pathname !== quotePagePathname || isPlainLeftClick === false) {
      return
    }

    const quoteFormSection = document.getElementById('quote-form')
    if (!quoteFormSection) {
      return
    }

    event.preventDefault()
    updateQuoteFormHash()
    quoteFormSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Link href={quoteFormHref} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
