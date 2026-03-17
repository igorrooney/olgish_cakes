import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAdminAuthenticated } from './lib/admin-auth'
import {
  classifyPageOnlyQueryFromUrlSearchParams,
  isIndexablePageOnlyPagination
} from './lib/utils/catalog-listing-query-seo'
function isCatalogListingPath(pathname: string) {
  return pathname === '/cakes' || pathname === '/cakes-by-post' || pathname === '/gift-hampers'
}
export async function proxy(request: NextRequest) {
  // Force HTTPS redirect for all HTTP requests (except localhost in development)
  const isLocalhost = request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1'
  if (
    !isLocalhost &&
    (request.headers.get('x-forwarded-proto') === 'http' ||
      (!request.headers.get('x-forwarded-proto') && request.url.startsWith('http://')))
  ) {
    const httpsUrl = request.url.replace('http://', 'https://')
    return NextResponse.redirect(httpsUrl, 301)
  }
  if (request.nextUrl.pathname === '/traditional-ukrainian-cakes') {
    const redirectUrl = request.nextUrl.clone()

    redirectUrl.pathname = '/cakes'
    redirectUrl.search = ''

    return NextResponse.redirect(redirectUrl, 308)
  }
  if (request.nextUrl.pathname === '/corporate-cakes-leeds') {
    return new NextResponse(null, {
      status: 410,
      headers: {
        'X-Robots-Tag': 'noindex, follow'
      }
    })
  }
  // Check if this is an admin API route that needs protection
  if (
    request.nextUrl.pathname.startsWith('/api/admin') &&
    !request.nextUrl.pathname.startsWith('/api/admin/auth') &&
    !request.nextUrl.pathname.startsWith('/api/admin/logout')
  ) {
    const isAuthenticated = await isAdminAuthenticated(request)
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
  const hasCatalogQuery = isCatalogListingPath(request.nextUrl.pathname) &&
    request.nextUrl.searchParams.toString().length > 0
  let shouldApplyCatalogNoindex = false
  if (hasCatalogQuery) {
    const pageOnlyQuery = classifyPageOnlyQueryFromUrlSearchParams(request.nextUrl.searchParams)
    if (pageOnlyQuery.isPageOnly && pageOnlyQuery.pageNumber === 1) {
      const redirectUrl = new URL(request.nextUrl.toString())
      if (request.nextUrl.pathname === '/gift-hampers') {
        redirectUrl.pathname = '/cakes-by-post'
      }
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl, 308)
    }
    shouldApplyCatalogNoindex = !isIndexablePageOnlyPagination(pageOnlyQuery)
  }
  const response = NextResponse.next()
  // Add security headers (skip HSTS for localhost)
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  if (!isLocalhost) {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  // Add caching headers with better cache control
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static')
  ) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (request.nextUrl.pathname.startsWith('/api')) {
    // API routes should not be cached to ensure fresh data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  } else if (request.nextUrl.pathname.startsWith('/admin')) {
    // Admin pages should not be cached
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  } else {
    // Regular pages with shorter cache time for better data freshness
    response.headers.set('Cache-Control', 'public, max-age=60, must-revalidate')
  }
  // Prevent indexing of catalog listing query URLs.
  // Keep clean listing URLs indexable and redirect ?page=1 to base URL.
  if (shouldApplyCatalogNoindex) {
    response.headers.set(
      'X-Robots-Tag',
      'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    )
  }
  return response
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml, sitemap-images.xml, sitemap-products.xml (crawl metadata files)
     * - icon.svg and apple-icon.png (app metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemap-images.xml|sitemap-products.xml|icon.svg|apple-icon.png).*)'
  ]
}
