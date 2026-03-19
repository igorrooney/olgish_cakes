type SearchParamValue = string | string[] | undefined

export const allowedCatalogPathnames = ['/cakes', '/cakes-by-post'] as const
export const allowedCatalogQueryKeys = [
  'sort',
  'byPost',
  'custom',
  'maxPrice',
  'collections',
  'page'
] as const

type AllowedCatalogPathname = (typeof allowedCatalogPathnames)[number]
type AllowedCatalogQueryKey = (typeof allowedCatalogQueryKeys)[number]

const catalogBaseUrl = 'https://olgishcakes.co.uk'
const defaultSort = 'new'
const defaultPage = 1

function isAllowedCatalogPathname(pathname: string): pathname is AllowedCatalogPathname {
  return allowedCatalogPathnames.includes(pathname as AllowedCatalogPathname)
}

function isAllowedCatalogQueryKey(key: string): key is AllowedCatalogQueryKey {
  return allowedCatalogQueryKeys.includes(key as AllowedCatalogQueryKey)
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

export function buildCatalogBackHref({
  fallbackHref,
  fromParam
}: {
  fallbackHref: AllowedCatalogPathname
  fromParam: SearchParamValue
}) {
  const resolvedFromParam = getSingleSearchParamValue(fromParam)

  if (!resolvedFromParam || resolvedFromParam.startsWith('/') === false) {
    return fallbackHref
  }

  try {
    const resolvedUrl = new URL(resolvedFromParam, catalogBaseUrl)

    if (resolvedUrl.origin !== catalogBaseUrl) {
      return fallbackHref
    }

    if (resolvedUrl.hash.length > 0 || isAllowedCatalogPathname(resolvedUrl.pathname) === false) {
      return fallbackHref
    }

    const sanitizedSearchParams = new URLSearchParams()

    for (const [key, value] of resolvedUrl.searchParams.entries()) {
      if (isAllowedCatalogQueryKey(key) === false) {
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

export function buildCatalogProductLinkHref({
  defaultByPost,
  defaultCustom,
  href,
  maxPrice,
  pathname,
  page,
  selectedCollections,
  showByPost,
  showCustom,
  sort
}: {
  defaultByPost: boolean
  defaultCustom: boolean
  href: string
  maxPrice: number | null
  pathname: string
  page: number
  selectedCollections: string[]
  showByPost: boolean
  showCustom: boolean
  sort: string
}) {
  if (href.startsWith('/') === false || isAllowedCatalogPathname(pathname) === false) {
    return href
  }

  const originSearchParams = new URLSearchParams()

  if (sort !== defaultSort) {
    originSearchParams.set('sort', sort)
  }

  if (showByPost !== defaultByPost) {
    originSearchParams.set('byPost', String(showByPost))
  }

  if (showCustom !== defaultCustom) {
    originSearchParams.set('custom', String(showCustom))
  }

  if (typeof maxPrice === 'number') {
    originSearchParams.set('maxPrice', String(maxPrice))
  }

  if (selectedCollections.length > 0) {
    originSearchParams.set('collections', selectedCollections.join(','))
  }

  if (page !== defaultPage) {
    originSearchParams.set('page', String(page))
  }

  const originQueryString = originSearchParams.toString()
  const fromValue = originQueryString.length > 0
    ? `${pathname}?${originQueryString}`
    : pathname
  const resolvedHref = new URL(href, catalogBaseUrl)

  resolvedHref.searchParams.set('from', fromValue)

  return `${resolvedHref.pathname}${resolvedHref.search}${resolvedHref.hash}`
}
