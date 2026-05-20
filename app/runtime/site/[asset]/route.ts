import { createDeferredRuntimeScript } from '../non-critical-script'

interface SiteRuntimeAsset {
  content: string
  contentType: string
}

const publicCacheControl = 'public, max-age=3600, stale-while-revalidate=86400'

const siteRuntimeAssets: Record<string, SiteRuntimeAsset> = {
  'non-critical.js': {
    content: createDeferredRuntimeScript(),
    contentType: 'application/javascript; charset=utf-8'
  }
}

export const dynamic = 'force-static'
export const dynamicParams = false
export const revalidate = false

export function generateStaticParams() {
  return Object.keys(siteRuntimeAssets).map((asset) => ({ asset }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset: string }> }
) {
  const { asset } = await params
  const runtimeAsset = siteRuntimeAssets[asset]

  if (!runtimeAsset) {
    return new Response('Not found', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  }

  return new Response(runtimeAsset.content, {
    headers: {
      'Cache-Control': publicCacheControl,
      'Content-Length': Buffer.byteLength(runtimeAsset.content).toString(),
      'Content-Type': runtimeAsset.contentType,
      'X-Content-Type-Options': 'nosniff'
    }
  })
}
