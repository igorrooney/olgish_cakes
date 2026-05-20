import { readFile } from 'node:fs/promises'
import path from 'node:path'

interface KlaroRuntimeAsset {
  contentType: string
  fileName: string
}

const klaroRuntimeAssets: Record<string, KlaroRuntimeAsset> = {
  'klaro.js': {
    contentType: 'application/javascript; charset=utf-8',
    fileName: 'klaro.js'
  },
  'klaro-no-css.js': {
    contentType: 'application/javascript; charset=utf-8',
    fileName: 'klaro-no-css.js'
  },
  'klaro.min.css': {
    contentType: 'text/css; charset=utf-8',
    fileName: 'klaro.min.css'
  }
}

const immutableCacheControl = 'public, max-age=31536000, immutable'

export const dynamic = 'force-static'
export const dynamicParams = false
export const revalidate = false

export function generateStaticParams() {
  return Object.keys(klaroRuntimeAssets).map((asset) => ({ asset }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset: string }> }
) {
  const { asset } = await params
  const runtimeAsset = klaroRuntimeAssets[asset]

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

  const filePath = path.join(
    process.cwd(),
    'public',
    'vendor',
    'klaro',
    'v0.7',
    runtimeAsset.fileName
  )
  const file = await readFile(filePath)

  return new Response(file, {
    headers: {
      'Cache-Control': immutableCacheControl,
      'Content-Length': file.byteLength.toString(),
      'Content-Type': runtimeAsset.contentType,
      'X-Content-Type-Options': 'nosniff'
    }
  })
}
