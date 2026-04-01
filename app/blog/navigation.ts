type SearchParamValue = string | string[] | undefined

export const allowedBlogPathnames = ['/blog'] as const
export const allowedBlogQueryKeys = ['topic', 'page'] as const
export const BLOG_ARCHIVE_RETURN_HREF_STORAGE_KEY = 'olgishBlogArchiveHref'

type AllowedBlogPathname = (typeof allowedBlogPathnames)[number]
type AllowedBlogQueryKey = (typeof allowedBlogQueryKeys)[number]

const blogBaseUrl = 'https://olgishcakes.co.uk'

function isAllowedBlogPathname(pathname: string): pathname is AllowedBlogPathname {
  return allowedBlogPathnames.includes(pathname as AllowedBlogPathname)
}

function isAllowedBlogQueryKey(key: string): key is AllowedBlogQueryKey {
  return allowedBlogQueryKeys.includes(key as AllowedBlogQueryKey)
}

function getSingleSearchParamValue(value: SearchParamValue) {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value) && value.length === 1) {
    return value[0]
  }

  return null
}

export function buildBlogBackHref({
  fallbackHref,
  fromParam
}: {
  fallbackHref: AllowedBlogPathname
  fromParam: SearchParamValue
}) {
  const resolvedFromParam = getSingleSearchParamValue(fromParam)

  if (!resolvedFromParam || resolvedFromParam.startsWith('/') === false) {
    return fallbackHref
  }

  try {
    const resolvedUrl = new URL(resolvedFromParam, blogBaseUrl)

    if (resolvedUrl.origin !== blogBaseUrl) {
      return fallbackHref
    }

    if (resolvedUrl.hash.length > 0 || isAllowedBlogPathname(resolvedUrl.pathname) === false) {
      return fallbackHref
    }

    const sanitizedSearchParams = new URLSearchParams()

    for (const [key, value] of resolvedUrl.searchParams.entries()) {
      if (isAllowedBlogQueryKey(key) === false) {
        return fallbackHref
      }

      if (key === 'page' && /^[1-9]\d*$/.test(value) === false) {
        return fallbackHref
      }

      if (key === 'topic' && value.trim().length === 0) {
        return fallbackHref
      }

      sanitizedSearchParams.append(key, value)
    }

    const sanitizedQueryString = sanitizedSearchParams.toString()

    return sanitizedQueryString.length > 0
      ? `${resolvedUrl.pathname}?${sanitizedQueryString}`
      : resolvedUrl.pathname
  } catch {
    return fallbackHref
  }
}

export function buildBlogArticleHref({
  fromHref,
  href
}: {
  fromHref: string
  href: string
}) {
  if (href.startsWith('/') === false) {
    return href
  }

  const resolvedHref = new URL(href, blogBaseUrl)
  resolvedHref.searchParams.set('from', fromHref)

  return `${resolvedHref.pathname}${resolvedHref.search}${resolvedHref.hash}`
}

export function readStoredBlogArchiveHref() {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    const storedHref = window.sessionStorage.getItem(BLOG_ARCHIVE_RETURN_HREF_STORAGE_KEY)

    return typeof storedHref === 'string' && storedHref.length > 0
      ? storedHref
      : undefined
  } catch {
    return undefined
  }
}

export function writeStoredBlogArchiveHref(archiveHref: string) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(BLOG_ARCHIVE_RETURN_HREF_STORAGE_KEY, archiveHref)
  } catch {
    // Ignore sessionStorage failures in restricted browser contexts.
  }
}
