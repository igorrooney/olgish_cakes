import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { requireAdminFromRequest } from '@/lib/admin-auth'
import { settingsSchema } from '@/lib/validation'
import { updateEventPhotoSettings } from '@/lib/settings'

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!requireAdminFromRequest(request)) {
    return NextResponse.redirect(new URL('/admin/login', request.url), 303)
  }

  const formData = await request.formData()
  const parsed = settingsSchema.safeParse({
    eventName: formData.get('eventName'),
    maxImages: formData.get('maxImages')
  })

  if (!parsed.success) {
    return NextResponse.redirect(new URL('/admin/settings?error=1', request.url), 303)
  }

  await updateEventPhotoSettings(parsed.data)

  return NextResponse.redirect(new URL('/admin/settings?saved=1', request.url), 303)
}
