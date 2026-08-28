import 'server-only'
import { createHash, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

const privateResponseHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'X-Robots-Tag': 'noindex, nofollow'
} as const

function constantTimeTokenMatch(
  submittedToken: string | null | undefined,
  expectedToken: string | null | undefined
): boolean {
  const submitted = submittedToken?.trim()
  const expected = expectedToken?.trim()

  if (!submitted || !expected) {
    return false
  }

  const submittedDigest = createHash('sha256').update(submitted).digest()
  const expectedDigest = createHash('sha256').update(expected).digest()

  return timingSafeEqual(submittedDigest, expectedDigest)
}

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization')?.trim()

  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  const token = authorization.slice('Bearer '.length).trim()
  return token.length > 0 ? token : null
}

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function productionRouteNotFound(): NextResponse {
  return new NextResponse(null, {
    status: 404,
    headers: privateResponseHeaders
  })
}

export function privateJsonResponse(
  body: unknown,
  status = 200
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: privateResponseHeaders
  })
}

const getHeaderOrigin = (value: string): string | null => {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

const getValidatedAuthority = (value: string | null): string | null => {
  const authority = value?.trim()

  if (
    !authority ||
    authority.length > 512 ||
    /[\s,/\\@?#]/.test(authority)
  ) {
    return null
  }

  try {
    const parsed = new URL(`http://${authority}`)

    if (
      parsed.username ||
      parsed.password ||
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash
    ) {
      return null
    }

    return authority.toLowerCase()
  } catch {
    return null
  }
}

const getValidatedForwardedProtocol = (
  value: string | null
): 'http' | 'https' | null => {
  const protocol = value?.trim().toLowerCase()
  return protocol === 'http' || protocol === 'https' ? protocol : null
}

/**
 * NextRequest.nextUrl can contain the Next.js listener hostname rather than
 * the authority used by the browser. This is observable with `next start`,
 * where a request to 127.0.0.1 can be represented internally as localhost.
 *
 * Host is browser-controlled only through the destination URL, so it is the
 * correct authority for an origin comparison. On Vercel, x-forwarded-host is
 * documented to be identical to Host; requiring both values to agree also
 * fails closed when a client or misconfigured proxy supplies a spoofed value.
 */
const getIncomingRequestOrigin = (request: NextRequest): string | null => {
  const rawHost = request.headers.get('host')
  const host = getValidatedAuthority(rawHost ?? request.nextUrl.host)

  if (!host) {
    return null
  }

  const rawForwardedHost = request.headers.get('x-forwarded-host')
  const forwardedHost = rawForwardedHost === null
    ? null
    : getValidatedAuthority(rawForwardedHost)

  if (
    rawForwardedHost !== null &&
    (!forwardedHost || forwardedHost !== host)
  ) {
    return null
  }

  const rawForwardedProtocol = request.headers.get('x-forwarded-proto')
  const forwardedProtocol = rawForwardedProtocol === null
    ? null
    : getValidatedForwardedProtocol(rawForwardedProtocol)

  if (rawForwardedProtocol !== null && !forwardedProtocol) {
    return null
  }

  const requestProtocol = request.nextUrl.protocol.replace(/:$/, '')
  const protocol = forwardedProtocol ?? (
    requestProtocol === 'http' || requestProtocol === 'https'
      ? requestProtocol
      : null
  )

  if (!protocol) {
    return null
  }

  try {
    return new URL(`${protocol}://${host}`).origin
  } catch {
    return null
  }
}

/**
 * Reject browser-initiated state changes unless their provenance is the exact
 * request origin. SameSite cookies are not sufficient on their own because a
 * compromised sibling subdomain is still considered same-site by browsers.
 *
 * Origin is expected for fetch and form mutations. Referer is accepted as a
 * compatibility fallback, but at least one provenance header must be present.
 * Sec-Fetch-Site, when supplied by the browser, must independently agree that
 * the request is same-origin.
 */
export function requireSameOriginMutation(
  request: NextRequest
): NextResponse | null {
  const fetchSite = request.headers.get('sec-fetch-site')?.trim().toLowerCase()
  if (fetchSite && fetchSite !== 'same-origin') {
    return privateJsonResponse({ error: 'Forbidden' }, 403)
  }

  const requestOrigin = getIncomingRequestOrigin(request)
  if (!requestOrigin) {
    return privateJsonResponse({ error: 'Forbidden' }, 403)
  }

  const suppliedOrigins = [
    request.headers.get('origin'),
    request.headers.get('referer')
  ].filter((value): value is string => Boolean(value?.trim()))

  if (suppliedOrigins.length === 0) {
    return privateJsonResponse({ error: 'Forbidden' }, 403)
  }

  const hasInvalidOrigin = suppliedOrigins.some((value) => {
    const headerOrigin = getHeaderOrigin(value.trim())
    return headerOrigin === null || headerOrigin !== requestOrigin
  })

  return hasInvalidOrigin
    ? privateJsonResponse({ error: 'Forbidden' }, 403)
    : null
}

export function isBearerTokenAuthorized(
  request: NextRequest,
  expectedToken: string | null | undefined
): boolean {
  return constantTimeTokenMatch(getBearerToken(request), expectedToken)
}

export function isCronRequestAuthorized(request: NextRequest): boolean {
  return isBearerTokenAuthorized(request, process.env.CRON_SECRET)
}
