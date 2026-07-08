import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  getFeatureLinkByKey,
  recordEventPhotoLinkClick
} from '@/lib/link-clicks'
import { parseSuccessRequestId } from '@/lib/success'

interface SuccessLinkRouteContext {
  params: Promise<{
    linkKey: string
  }>
}

export async function GET(
  request: NextRequest,
  context: SuccessLinkRouteContext
): Promise<Response> {
  const { linkKey } = await context.params
  const link = getFeatureLinkByKey(linkKey)

  if (!link) {
    return new Response('Not found', { status: 404 })
  }

  const requestId = parseSuccessRequestId(request.nextUrl.searchParams.get('r') ?? undefined)

  if (requestId) {
    try {
      await recordEventPhotoLinkClick({
        requestId,
        linkKey
      })
    } catch {
      // Clicking through should not fail because analytics is temporarily unavailable.
    }
  }

  return NextResponse.redirect(link.href, 303)
}
