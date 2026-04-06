'use client'

import Link, { type LinkProps } from 'next/link'
import type {
  AnchorHTMLAttributes,
  FocusEventHandler,
  MouseEventHandler,
  ReactNode
} from 'react'
import { useState } from 'react'

type HoverPrefetchLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    children: ReactNode
  }

export function HoverPrefetchLink({
  children,
  onFocus,
  onMouseEnter,
  ...props
}: HoverPrefetchLinkProps) {
  const [isPrefetchEnabled, setIsPrefetchEnabled] = useState(false)

  const enablePrefetch: MouseEventHandler<HTMLAnchorElement> = event => {
    if (!isPrefetchEnabled) {
      setIsPrefetchEnabled(true)
    }

    onMouseEnter?.(event)
  }

  const handleFocus: FocusEventHandler<HTMLAnchorElement> = event => {
    if (!isPrefetchEnabled) {
      setIsPrefetchEnabled(true)
    }

    onFocus?.(event)
  }

  return (
    <Link
      {...props}
      prefetch={isPrefetchEnabled ? null : false}
      onMouseEnter={enablePrefetch}
      onFocus={handleFocus}
    >
      {children}
    </Link>
  )
}
