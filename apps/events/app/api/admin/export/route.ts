import type { NextRequest } from 'next/server'

import { requireAdminFromRequest } from '@/lib/admin-auth'
import { buildKlaviyoCsv } from '@/lib/csv'
import { listEventPhotoRequests } from '@/lib/requests'

export async function GET(request: NextRequest): Promise<Response> {
  if (!requireAdminFromRequest(request)) {
    return Response.redirect(new URL('/admin/login', request.url), 303)
  }

  const eventName = request.nextUrl.searchParams.get('eventName') ?? undefined
  const rows = await listEventPhotoRequests({ eventName })
  const csv = buildKlaviyoCsv(rows)
  const suffix = eventName ? eventName.toLowerCase().replace(/[^\w-]+/g, '-') : 'all-events'

  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="klaviyo-${suffix}.csv"`
    }
  })
}
