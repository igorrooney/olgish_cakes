import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  MAX_IMAGES_LIMIT,
  TEMP_UPLOAD_CLEANUP_HOURS
} from '@/lib/constants'
import { getRequiredEnv } from '@/lib/env'
import {
  EVENT_PHOTO_CLEANUP_REQUEST_BATCH_SIZE,
  EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED,
  type EventPhotoCleanupRequest,
  listRequestsForCleanup
} from '@/lib/requests'
import {
  beginEventPhotoTempExternalDeletion,
  claimEventPhotoOrphanCleanupCursor,
  claimEventPhotoTempCleanup,
  filterReferencedEventPhotoTempPaths,
  finalizeEventPhotoOrphanCleanupCursor,
  finalizeEventPhotoTempCleanup,
  releaseEventPhotoOrphanCleanupCursor,
  releaseEventPhotoTempCleanup
} from '@/lib/retention-cleanup'
import { getEventPhotoBucket } from '@/lib/supabase/admin'
import {
  deleteTempImages,
  listTempImagePage,
  TEMP_STORAGE_PAGE_SIZE,
  type TempStorageEntry
} from '@/lib/storage'

const CLEANUP_FAILED = 'EVENT_PHOTO_CLEANUP_FAILED'
const REQUEST_CONCURRENCY = 3
const ORPHAN_PAGE_BUDGET = 20
const ORPHAN_OBJECT_BUDGET = 2000
const ORPHAN_TIME_BUDGET_MS = 30000
const cleanupFailureCodes = new Set([
  CLEANUP_FAILED,
  EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED
])

const getSafeCleanupFailureCode = (error: unknown): string =>
  error instanceof Error && cleanupFailureCodes.has(error.message)
    ? error.message
    : CLEANUP_FAILED

const cleanupFailureResponse = (error: unknown): NextResponse => {
  const status = 500
  const code = getSafeCleanupFailureCode(error)

  console.error({
    operation: 'event-photo-temp.cleanup',
    code,
    status
  })

  return NextResponse.json({
    error: 'Event-photo cleanup failed.',
    code
  }, {
    status,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}

export function isCleanupRequestAuthorized(request: NextRequest): boolean {
  const secret = getRequiredEnv('CRON_SECRET')
  const authorization = request.headers.get('authorization')

  return authorization === `Bearer ${secret}`
}

interface CleanupCount {
  deletedFiles: number
  updatedRequests: number
  failedRequests: number
}

const emptyCleanupCount = (): CleanupCount => ({
  deletedFiles: 0,
  updatedRequests: 0,
  failedRequests: 0
})

async function cleanupRequest(
  row: EventPhotoCleanupRequest,
  cutoffIso: string,
  expectedBucket: string
): Promise<CleanupCount> {
  let claimToken: string | null = null

  try {
    const claim = await claimEventPhotoTempCleanup(row.id, cutoffIso)
    claimToken = claim.claimToken

    if (claim.status !== 'claimed') {
      return emptyCleanupCount()
    }
    if (
      !claimToken ||
      claim.bucket !== expectedBucket ||
      claim.paths.length < 1 ||
      claim.paths.length > MAX_IMAGES_LIMIT
    ) {
      throw new Error(CLEANUP_FAILED)
    }

    await beginEventPhotoTempExternalDeletion(
      row.id,
      claimToken,
      claim.bucket,
      claim.paths
    )
    await deleteTempImages(claim.bucket, claim.paths)
    const finalStatus = await finalizeEventPhotoTempCleanup(row.id, claimToken)
    claimToken = null

    if (finalStatus !== 'deleted') {
      return emptyCleanupCount()
    }

    return {
      deletedFiles: claim.paths.length,
      updatedRequests: 1,
      failedRequests: 0
    }
  } catch {
    if (claimToken) {
      await releaseEventPhotoTempCleanup(
        row.id,
        claimToken,
        CLEANUP_FAILED
      ).catch(() => undefined)
    }
    return {
      deletedFiles: 0,
      updatedRequests: 0,
      failedRequests: 1
    }
  }
}

const addCleanupCount = (
  total: CleanupCount,
  next: CleanupCount
): CleanupCount => ({
  deletedFiles: total.deletedFiles + next.deletedFiles,
  updatedRequests: total.updatedRequests + next.updatedRequests,
  failedRequests: total.failedRequests + next.failedRequests
})

async function cleanupRequestBatch(
  rows: EventPhotoCleanupRequest[],
  cutoffIso: string,
  bucket: string
): Promise<CleanupCount> {
  let total = emptyCleanupCount()

  for (let index = 0; index < rows.length; index += REQUEST_CONCURRENCY) {
    const chunk = rows.slice(index, index + REQUEST_CONCURRENCY)
    const results = await Promise.all(
      chunk.map((row) => cleanupRequest(row, cutoffIso, bucket))
    )
    total = results.reduce(addCleanupCount, total)
  }

  return total
}

const isOldFile = (entry: TempStorageEntry, cutoff: Date) => {
  if (!entry.isManaged || !entry.timestamp) {
    return false
  }

  const timestamp = Date.parse(entry.timestamp)
  return !Number.isNaN(timestamp) && timestamp < cutoff.getTime()
}

interface OrphanCleanupPageResult {
  status: 'processed' | 'busy'
  deletedFiles: number
  examinedFiles: number
  cycleComplete: boolean
}

async function cleanupOneOrphanStoragePage(
  bucket: string,
  cutoff: Date,
  limit: number,
  signal: AbortSignal
): Promise<OrphanCleanupPageResult> {
  const cursor = await claimEventPhotoOrphanCleanupCursor()
  if (cursor.status === 'busy' || !cursor.cursorToken) {
    return {
      status: 'busy',
      deletedFiles: 0,
      examinedFiles: 0,
      cycleComplete: false
    }
  }

  const cursorToken = cursor.cursorToken

  try {
    const page = await listTempImagePage(
      bucket,
      'incoming',
      cursor.objectCursor,
      limit,
      signal
    )
    const oldPaths = [...new Set(
      page.entries
        .filter((entry) => isOldFile(entry, cutoff))
        .map((entry) => entry.path)
    )]
    const referencedPaths = await filterReferencedEventPhotoTempPaths(oldPaths)
    const referencedPathSet = new Set(referencedPaths)
    const orphanPaths = oldPaths.filter((path) => !referencedPathSet.has(path))

    await deleteTempImages(bucket, orphanPaths)
    await finalizeEventPhotoOrphanCleanupCursor(cursorToken, {
      objectCursor: page.nextCursor
    })

    return {
      status: 'processed',
      deletedFiles: orphanPaths.length,
      examinedFiles: page.entries.length,
      cycleComplete: !page.hasNext
    }
  } catch (error) {
    await releaseEventPhotoOrphanCleanupCursor(cursorToken)
      .catch(() => undefined)
    throw error
  }
}

async function cleanupOrphanStoragePages(
  bucket: string,
  cutoff: Date,
  signal: AbortSignal
): Promise<number> {
  const deadline = Date.now() + ORPHAN_TIME_BUDGET_MS
  let deletedFiles = 0
  let examinedFiles = 0

  for (let pageIndex = 0; pageIndex < ORPHAN_PAGE_BUDGET; pageIndex += 1) {
    if (
      signal.aborted ||
      Date.now() >= deadline ||
      examinedFiles >= ORPHAN_OBJECT_BUDGET
    ) {
      break
    }

    const remaining = ORPHAN_OBJECT_BUDGET - examinedFiles
    const result = await cleanupOneOrphanStoragePage(
      bucket,
      cutoff,
      Math.min(TEMP_STORAGE_PAGE_SIZE, remaining),
      signal
    )

    if (result.status === 'busy') {
      break
    }

    deletedFiles += result.deletedFiles
    examinedFiles += result.examinedFiles

    if (result.cycleComplete) {
      break
    }
  }

  return deletedFiles
}

async function runCleanup(request: NextRequest): Promise<NextResponse> {
  if (!isCleanupRequestAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bucket = getEventPhotoBucket()
  const cutoff = new Date(Date.now() - TEMP_UPLOAD_CLEANUP_HOURS * 60 * 60 * 1000)
  const cutoffIso = cutoff.toISOString()
  const oldRequests = await listRequestsForCleanup(
    cutoffIso,
    EVENT_PHOTO_CLEANUP_REQUEST_BATCH_SIZE
  )
  const requestCounts = await cleanupRequestBatch(oldRequests, cutoffIso, bucket)
  let deletedFiles = requestCounts.deletedFiles
  const updatedRequests = requestCounts.updatedRequests
  let failedRequests = requestCounts.failedRequests

  try {
    deletedFiles += await cleanupOrphanStoragePages(
      bucket,
      cutoff,
      request.signal
    )
  } catch {
    failedRequests += 1
  }

  return NextResponse.json({
    deletedFiles,
    updatedRequests,
    failedRequests
  }, {
    status: failedRequests > 0 ? 500 : 200
  })
}

export const maxDuration = 60

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    return await runCleanup(request)
  } catch (error) {
    return cleanupFailureResponse(error)
  }
}
