'use client'

import type { MouseEvent } from 'react'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { normalizePathname, readPreviousPathnameFromHistoryState } from '@/app/utils/history-state'
import { BlogBackLinkBase } from './BlogBackLinkBase'
import { buildBlogBackHref, readStoredBlogArchiveHref } from './navigation'

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
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

export function BlogBackLink() {
  const searchParams = useSearchParams()

  const backHref = useMemo(() => {
    const fromParamValues = searchParams.getAll('from')
    const fromParam = fromParamValues.length > 0
      ? fromParamValues.length === 1
        ? fromParamValues[0]
        : fromParamValues
      : readStoredBlogArchiveHref()

    return buildBlogBackHref({
      fallbackHref: '/blog',
      fromParam
    })
  }, [searchParams])

  const handleClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainLeftClick(event)) {
      return
    }

    const previousPathname = readPreviousPathnameFromHistoryState()
    const normalizedBackHrefPathname = resolveNormalizedPathname(backHref, window.location.origin)

    if (!previousPathname || !normalizedBackHrefPathname || previousPathname !== normalizedBackHrefPathname) {
      return
    }

    event.preventDefault()
    window.history.back()
  }, [backHref])

  return <BlogBackLinkBase href={backHref} onClick={handleClick} />
}
