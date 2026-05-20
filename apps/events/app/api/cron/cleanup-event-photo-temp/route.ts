import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { TEMP_UPLOAD_CLEANUP_HOURS } from '@/lib/constants'
import { getRequiredEnv } from '@/lib/env'
import { listRequestsForCleanup, updateTelegramStatus } from '@/lib/requests'
import { getEventPhotoBucket } from '@/lib/supabase/admin'
import {
  deleteTempImages,
  listOldTempImagePaths
} from '@/lib/storage'

function isAuthorized(request: NextRequest): boolean {
  const secret = getRequiredEnv('CRON_SECRET')
  const authorization = request.headers.get('authorization')
  const querySecret = request.nextUrl.searchParams.get('secret')

  return authorization === `Bearer ${secret}` || querySecret === secret
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bucket = getEventPhotoBucket()
  const cutoff = new Date(Date.now() - TEMP_UPLOAD_CLEANUP_HOURS * 60 * 60 * 1000)
  const oldRequests = await listRequestsForCleanup(cutoff.toISOString())
  const dbPaths = oldRequests.flatMap((row) => row.temp_image_paths)
  const oldStoragePaths = await listOldTempImagePaths(bucket, cutoff)
  const pathsToDelete = [...new Set([...dbPaths, ...oldStoragePaths])]

  await deleteTempImages(bucket, pathsToDelete)

  await Promise.all(oldRequests.map((row) => updateTelegramStatus(
    row.id,
    row.telegram_status === 'pending' ? 'failed' : row.telegram_status,
    row.telegram_message_ids,
    row.telegram_error ?? 'Temporary uploaded files were removed after 24 hours.',
    true
  )))

  return NextResponse.json({
    deletedFiles: pathsToDelete.length,
    updatedRequests: oldRequests.length
  })
}
