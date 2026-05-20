import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { validateCsrfToken } from '@/lib/csrf'
import { jsonError, readJsonBody } from '@/lib/http'
import { getEventPhotoSettings } from '@/lib/settings'
import { getEventPhotoBucket } from '@/lib/supabase/admin'
import { createSignedUploads } from '@/lib/storage'
import { uploadRequestSchema } from '@/lib/validation'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await readJsonBody(request)
  const parsed = uploadRequestSchema.safeParse(body)

  if (!parsed.success) {
    return jsonError('Please check your image and try again.', 400)
  }

  if (!validateCsrfToken(request, parsed.data.csrfToken)) {
    return jsonError('This form expired. Please refresh the page and try again.', 403)
  }

  const settings = await getEventPhotoSettings()

  if (parsed.data.files.length > settings.maxImages) {
    return jsonError(
      settings.maxImages === 1
        ? 'Please upload one image only.'
        : `Please upload no more than ${settings.maxImages} images.`,
      400
    )
  }

  const uploads = await createSignedUploads(parsed.data.files.map((file) => ({
    fileName: file.name,
    mimeType: file.type,
    size: file.size
  })))

  return NextResponse.json({
    bucket: getEventPhotoBucket(),
    uploads
  })
}
