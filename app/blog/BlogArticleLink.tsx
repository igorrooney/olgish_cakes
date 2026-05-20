'use client'

import Link from 'next/link'
import type { ComponentProps, MouseEvent } from 'react'
import { useCallback } from 'react'
import { buildBlogArticleHref, writeStoredBlogArchiveHref } from './navigation'

type BlogArticleLinkProps = ComponentProps<typeof Link> & {
  archiveHref: string
}

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
}

export function BlogArticleLink({
  archiveHref,
  onClick,
  href,
  ...props
}: BlogArticleLinkProps) {
  const handleClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)

    if (!isPlainLeftClick(event)) {
      return
    }

    writeStoredBlogArchiveHref(archiveHref)
  }, [archiveHref, onClick])

  const resolvedHref = typeof href === 'string'
    ? buildBlogArticleHref({
        href,
        fromHref: archiveHref
      })
    : href

  return <Link {...props} href={resolvedHref} onClick={handleClick} />
}
