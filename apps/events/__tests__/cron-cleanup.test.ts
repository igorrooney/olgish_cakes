import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  listRequestsForCleanup: vi.fn(),
  deleteTempImages: vi.fn(),
  listTempImagePage: vi.fn(),
  claimEventPhotoTempCleanup: vi.fn(),
  beginEventPhotoTempExternalDeletion: vi.fn(),
  finalizeEventPhotoTempCleanup: vi.fn(),
  releaseEventPhotoTempCleanup: vi.fn(),
  claimEventPhotoOrphanCleanupCursor: vi.fn(),
  finalizeEventPhotoOrphanCleanupCursor: vi.fn(),
  releaseEventPhotoOrphanCleanupCursor: vi.fn(),
  filterReferencedEventPhotoTempPaths: vi.fn()
}))

vi.mock('@/lib/requests', () => ({
  EVENT_PHOTO_CLEANUP_REQUEST_BATCH_SIZE: 12,
  EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED: 'EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED',
  listRequestsForCleanup: state.listRequestsForCleanup
}))

vi.mock('@/lib/supabase/admin', () => ({
  getEventPhotoBucket: () => 'event-photo-temp-uploads'
}))

vi.mock('@/lib/storage', () => ({
  deleteTempImages: state.deleteTempImages,
  listTempImagePage: state.listTempImagePage,
  TEMP_STORAGE_PAGE_SIZE: 100
}))

vi.mock('@/lib/retention-cleanup', () => ({
  claimEventPhotoTempCleanup: state.claimEventPhotoTempCleanup,
  beginEventPhotoTempExternalDeletion: state.beginEventPhotoTempExternalDeletion,
  finalizeEventPhotoTempCleanup: state.finalizeEventPhotoTempCleanup,
  releaseEventPhotoTempCleanup: state.releaseEventPhotoTempCleanup,
  claimEventPhotoOrphanCleanupCursor: state.claimEventPhotoOrphanCleanupCursor,
  finalizeEventPhotoOrphanCleanupCursor: state.finalizeEventPhotoOrphanCleanupCursor,
  releaseEventPhotoOrphanCleanupCursor: state.releaseEventPhotoOrphanCleanupCursor,
  filterReferencedEventPhotoTempPaths: state.filterReferencedEventPhotoTempPaths
}))

import { GET } from '@/app/api/cron/cleanup-event-photo-temp/route'

const stalePendingRequest = {
  id: 'request-pending',
  telegram_status: 'pending',
  telegram_message_ids: [],
  telegram_error: null,
  temp_image_paths: ['incoming/old-a.jpg', 'incoming/shared.jpg']
}

const staleSentRequest = {
  id: 'request-sent',
  telegram_status: 'sent',
  telegram_message_ids: [501],
  telegram_error: null,
  temp_image_paths: ['incoming/old-b.jpg']
}

function makeRequest(secret = 'cleanup-secret'): NextRequest {
  return new NextRequest('https://events.olgishcakes.co.uk/api/cron/cleanup-event-photo-temp', {
    headers: {
      authorization: `Bearer ${secret}`
    }
  })
}

describe('cleanup cron route', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'cleanup-secret'
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T12:00:00.000Z'))
    state.listRequestsForCleanup.mockReset().mockResolvedValue([
      stalePendingRequest,
      staleSentRequest
    ])
    state.deleteTempImages.mockReset().mockResolvedValue(undefined)
    state.listTempImagePage.mockReset().mockResolvedValue({
      entries: [
        {
          name: '2026-05-18/orphan.jpg',
          path: 'incoming/2026-05-18/orphan.jpg',
          isManaged: true,
          timestamp: '2026-05-18T12:00:00.000Z'
        },
        {
          name: '2026-05-18/shared.jpg',
          path: 'incoming/2026-05-18/shared.jpg',
          isManaged: true,
          timestamp: '2026-05-18T12:00:00.000Z'
        }
      ],
      hasNext: false,
      nextCursor: null
    })
    state.claimEventPhotoTempCleanup.mockReset().mockImplementation(async (id: string) => ({
      status: 'claimed',
      claimToken: `claim-${id}`,
      bucket: 'event-photo-temp-uploads',
      paths: id === 'request-pending'
        ? ['incoming/old-a.jpg', 'incoming/shared.jpg']
        : ['incoming/old-b.jpg']
    }))
    state.beginEventPhotoTempExternalDeletion.mockReset().mockResolvedValue(undefined)
    state.finalizeEventPhotoTempCleanup.mockReset().mockResolvedValue('deleted')
    state.releaseEventPhotoTempCleanup.mockReset().mockResolvedValue(undefined)
    state.claimEventPhotoOrphanCleanupCursor.mockReset().mockResolvedValue({
      status: 'claimed',
      cursorToken: 'orphan-cursor-token',
      objectCursor: null
    })
    state.finalizeEventPhotoOrphanCleanupCursor.mockReset().mockResolvedValue(undefined)
    state.releaseEventPhotoOrphanCleanupCursor.mockReset().mockResolvedValue(undefined)
    state.filterReferencedEventPhotoTempPaths.mockReset().mockResolvedValue([
      'incoming/2026-05-18/shared.jpg'
    ])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('rejects unauthorized cleanup requests', async () => {
    const response = await GET(makeRequest('wrong-secret'))

    expect(response.status).toBe(401)
    expect(state.deleteTempImages).not.toHaveBeenCalled()
  })

  it('deletes one bounded request batch and one bounded orphan page', async () => {
    const response = await GET(makeRequest())

    await expect(response.json()).resolves.toEqual({
      deletedFiles: 4,
      updatedRequests: 2,
      failedRequests: 0
    })
    expect(state.listRequestsForCleanup).toHaveBeenCalledWith(
      '2026-05-19T12:00:00.000Z',
      12
    )
    expect(state.beginEventPhotoTempExternalDeletion).toHaveBeenNthCalledWith(
      1,
      'request-pending',
      'claim-request-pending',
      'event-photo-temp-uploads',
      ['incoming/old-a.jpg', 'incoming/shared.jpg']
    )
    expect(state.deleteTempImages).toHaveBeenNthCalledWith(1, 'event-photo-temp-uploads', [
      'incoming/old-a.jpg',
      'incoming/shared.jpg'
    ])
    expect(state.deleteTempImages).toHaveBeenNthCalledWith(2, 'event-photo-temp-uploads', [
      'incoming/old-b.jpg'
    ])
    expect(state.deleteTempImages).toHaveBeenNthCalledWith(3, 'event-photo-temp-uploads', [
      'incoming/2026-05-18/orphan.jpg'
    ])
    expect(state.listTempImagePage).toHaveBeenCalledTimes(1)
    expect(state.finalizeEventPhotoOrphanCleanupCursor).toHaveBeenCalledWith(
      'orphan-cursor-token',
      {
        objectCursor: null
      }
    )
  })

  it('does not delete skipped or busy held requests and excludes referenced paths from orphan cleanup', async () => {
    state.claimEventPhotoTempCleanup
      .mockResolvedValueOnce({ status: 'skipped', claimToken: null, bucket: null, paths: [] })
      .mockResolvedValueOnce({ status: 'busy', claimToken: null, bucket: null, paths: [] })
    state.listTempImagePage.mockResolvedValue({
      entries: [{
        name: '2026-05-18/shared.jpg',
        path: 'incoming/2026-05-18/shared.jpg',
        isManaged: true,
        timestamp: '2026-05-18T12:00:00.000Z'
      }],
      hasNext: false,
      nextCursor: null
    })

    const response = await GET(makeRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      deletedFiles: 0,
      updatedRequests: 0,
      failedRequests: 0
    })
    expect(state.beginEventPhotoTempExternalDeletion).not.toHaveBeenCalled()
    expect(state.deleteTempImages).toHaveBeenCalledWith('event-photo-temp-uploads', [])
  })

  it('keeps cursor progress when deleting the last object removes its virtual folder', async () => {
    state.listRequestsForCleanup.mockResolvedValue([])
    state.claimEventPhotoOrphanCleanupCursor
      .mockResolvedValueOnce({
        status: 'claimed',
        cursorToken: 'delete-folder-cursor-token',
        objectCursor: null
      })
      .mockResolvedValueOnce({
        status: 'busy',
        cursorToken: null,
        objectCursor: 'cursor-after-deleted-folder'
      })
    state.listTempImagePage.mockResolvedValue({
      entries: [{
        name: '2026-05-18/orphan.jpg',
        path: 'incoming/2026-05-18/orphan.jpg',
        isManaged: true,
        timestamp: '2026-05-18T12:00:00.000Z'
      }],
      hasNext: true,
      nextCursor: 'cursor-after-deleted-folder'
    })
    state.filterReferencedEventPhotoTempPaths.mockResolvedValue([])

    const response = await GET(makeRequest())

    await expect(response.json()).resolves.toEqual({
      deletedFiles: 1,
      updatedRequests: 0,
      failedRequests: 0
    })
    expect(state.finalizeEventPhotoOrphanCleanupCursor).toHaveBeenCalledWith(
      'delete-folder-cursor-token',
      {
        objectCursor: 'cursor-after-deleted-folder'
      }
    )
  })

  it('keeps the same cursor progress when a referenced object retains its virtual folder', async () => {
    state.listRequestsForCleanup.mockResolvedValue([])
    state.claimEventPhotoOrphanCleanupCursor
      .mockResolvedValueOnce({
        status: 'claimed',
        cursorToken: 'retain-folder-cursor-token',
        objectCursor: null
      })
      .mockResolvedValueOnce({
        status: 'busy',
        cursorToken: null,
        objectCursor: 'cursor-after-retained-folder'
      })
    state.listTempImagePage.mockResolvedValue({
      entries: [{
        name: '2026-05-18/protected.jpg',
        path: 'incoming/2026-05-18/protected.jpg',
        isManaged: true,
        timestamp: '2026-05-18T12:00:00.000Z'
      }],
      hasNext: true,
      nextCursor: 'cursor-after-retained-folder'
    })
    state.filterReferencedEventPhotoTempPaths.mockResolvedValue([
      'incoming/2026-05-18/protected.jpg'
    ])

    await GET(makeRequest())

    expect(state.deleteTempImages).toHaveBeenCalledWith(
      'event-photo-temp-uploads',
      []
    )
    expect(state.finalizeEventPhotoOrphanCleanupCursor).toHaveBeenCalledWith(
      'retain-folder-cursor-token',
      {
        objectCursor: 'cursor-after-retained-folder'
      }
    )
  })

  it('cleans a backlog over 100 objects and persists after every page', async () => {
    const firstPageEntries = Array.from({ length: 100 }, (_, index) => ({
      name: `2026-05-18/photo-${index}.jpg`,
      path: `incoming/2026-05-18/photo-${index}.jpg`,
      isManaged: true,
      timestamp: '2026-05-18T12:00:00.000Z'
    }))
    const secondPageEntries = Array.from({ length: 50 }, (_, index) => ({
      name: `2026-05-19/photo-${index}.jpg`,
      path: `incoming/2026-05-19/photo-${index}.jpg`,
      isManaged: true,
      timestamp: '2026-05-19T00:00:00.000Z'
    }))
    state.listRequestsForCleanup.mockResolvedValue([])
    state.claimEventPhotoOrphanCleanupCursor
      .mockResolvedValueOnce({
        status: 'claimed',
        cursorToken: 'first-cursor-token',
        objectCursor: null
      })
      .mockResolvedValueOnce({
        status: 'claimed',
        cursorToken: 'second-cursor-token',
        objectCursor: 'after-first-page'
      })
    state.listTempImagePage
      .mockResolvedValueOnce({
        entries: firstPageEntries,
        hasNext: true,
        nextCursor: 'after-first-page'
      })
      .mockResolvedValueOnce({
        entries: secondPageEntries,
        hasNext: false,
        nextCursor: null
      })
    state.filterReferencedEventPhotoTempPaths.mockResolvedValue([])

    const response = await GET(makeRequest())

    await expect(response.json()).resolves.toEqual({
      deletedFiles: 150,
      updatedRequests: 0,
      failedRequests: 0
    })
    expect(state.listTempImagePage).toHaveBeenCalledTimes(2)
    expect(state.listTempImagePage).toHaveBeenNthCalledWith(
      2,
      'event-photo-temp-uploads',
      'incoming',
      'after-first-page',
      100,
      expect.any(AbortSignal)
    )
    expect(state.finalizeEventPhotoOrphanCleanupCursor).toHaveBeenNthCalledWith(
      1,
      'first-cursor-token',
      {
        objectCursor: 'after-first-page'
      }
    )
    expect(state.finalizeEventPhotoOrphanCleanupCursor).toHaveBeenNthCalledWith(
      2,
      'second-cursor-token',
      {
        objectCursor: null
      }
    )
  })

  it('stops at the explicit 20-page and 2,000-object budget', async () => {
    const entries = Array.from({ length: 100 }, (_, index) => ({
      name: `2026-05-18/photo-${index}.jpg`,
      path: `incoming/2026-05-18/photo-${index}.jpg`,
      isManaged: true,
      timestamp: '2026-05-18T12:00:00.000Z'
    }))
    let claimIndex = 0
    let pageIndex = 0
    state.listRequestsForCleanup.mockResolvedValue([])
    state.claimEventPhotoOrphanCleanupCursor.mockImplementation(async () => {
      const current = claimIndex
      claimIndex += 1
      return {
        status: 'claimed',
        cursorToken: `claim-${current}`,
        objectCursor: current === 0 ? null : `page-${current}`
      }
    })
    state.listTempImagePage.mockImplementation(async () => {
      pageIndex += 1
      return {
        entries,
        hasNext: true,
        nextCursor: `page-${pageIndex}`
      }
    })
    state.filterReferencedEventPhotoTempPaths.mockResolvedValue([])

    const response = await GET(makeRequest())

    await expect(response.json()).resolves.toEqual({
      deletedFiles: 2000,
      updatedRequests: 0,
      failedRequests: 0
    })
    expect(state.listTempImagePage).toHaveBeenCalledTimes(20)
    expect(state.finalizeEventPhotoOrphanCleanupCursor).toHaveBeenCalledTimes(20)
    expect(state.claimEventPhotoOrphanCleanupCursor).toHaveBeenCalledTimes(20)
  })

  it('continues processing the batch when one request cleanup fails', async () => {
    state.claimEventPhotoOrphanCleanupCursor.mockResolvedValue({
      status: 'busy',
      cursorToken: null,
      objectCursor: null
    })
    state.deleteTempImages.mockImplementation(async (
      _bucket: string,
      paths: string[]
    ) => {
      if (paths.includes('incoming/old-a.jpg')) {
        throw new Error('private provider error')
      }
    })

    const response = await GET(makeRequest())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      deletedFiles: 1,
      updatedRequests: 1,
      failedRequests: 1
    })
    expect(state.finalizeEventPhotoTempCleanup).toHaveBeenCalledWith(
      'request-sent',
      'claim-request-sent'
    )
    expect(state.releaseEventPhotoTempCleanup).toHaveBeenCalledWith(
      'request-pending',
      'claim-request-pending',
      'EVENT_PHOTO_CLEANUP_FAILED'
    )
  })

  it('resumes on the next invocation after a busy orphan cursor lease', async () => {
    state.listRequestsForCleanup.mockResolvedValue([])
    state.claimEventPhotoOrphanCleanupCursor
      .mockResolvedValueOnce({
        status: 'busy',
        cursorToken: null,
        objectCursor: 'opaque-object-cursor'
      })
      .mockResolvedValueOnce({
        status: 'claimed',
        cursorToken: 'recovered-cursor-token',
        objectCursor: 'opaque-object-cursor'
      })

    const busyResponse = await GET(makeRequest())

    expect(busyResponse.status).toBe(200)
    expect(state.listTempImagePage).not.toHaveBeenCalled()
    expect(state.finalizeEventPhotoOrphanCleanupCursor).not.toHaveBeenCalled()

    const recoveredResponse = await GET(makeRequest())

    expect(recoveredResponse.status).toBe(200)
    expect(state.listTempImagePage).toHaveBeenCalledTimes(1)
    expect(state.finalizeEventPhotoOrphanCleanupCursor).toHaveBeenCalledWith(
      'recovered-cursor-token',
      { objectCursor: null }
    )
  })

  it('releases the orphan cursor with no provider detail when a page fails', async () => {
    state.listRequestsForCleanup.mockResolvedValue([])
    state.listTempImagePage.mockRejectedValue(
      new Error('SENTINEL-PROVIDER-STORAGE-DETAIL')
    )

    const response = await GET(makeRequest())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      deletedFiles: 0,
      updatedRequests: 0,
      failedRequests: 1
    })
    expect(state.releaseEventPhotoOrphanCleanupCursor).toHaveBeenCalledWith(
      'orphan-cursor-token'
    )
  })

  it('retries the same persisted orphan cursor on the next invocation after failure', async () => {
    state.listRequestsForCleanup.mockResolvedValue([])
    state.claimEventPhotoOrphanCleanupCursor.mockResolvedValue({
      status: 'claimed',
      cursorToken: 'retry-cursor-token',
      objectCursor: 'persisted-object-cursor'
    })
    state.listTempImagePage
      .mockRejectedValueOnce(new Error('temporary storage outage'))
      .mockResolvedValueOnce({
        entries: [{
          name: '2026-05-18/retry.jpg',
          path: 'incoming/2026-05-18/retry.jpg',
          isManaged: true,
          timestamp: '2026-05-18T12:00:00.000Z'
        }],
        hasNext: false,
        nextCursor: null
      })
    state.filterReferencedEventPhotoTempPaths.mockResolvedValue([])

    const failedResponse = await GET(makeRequest())
    const retriedResponse = await GET(makeRequest())

    expect(failedResponse.status).toBe(500)
    expect(retriedResponse.status).toBe(200)
    expect(state.listTempImagePage).toHaveBeenNthCalledWith(
      1,
      'event-photo-temp-uploads',
      'incoming',
      'persisted-object-cursor',
      100,
      expect.any(AbortSignal)
    )
    expect(state.listTempImagePage).toHaveBeenNthCalledWith(
      2,
      'event-photo-temp-uploads',
      'incoming',
      'persisted-object-cursor',
      100,
      expect.any(AbortSignal)
    )
    expect(state.releaseEventPhotoOrphanCleanupCursor).toHaveBeenCalledWith(
      'retry-cursor-token'
    )
  })

  it('releases a claimed item with only a fixed safe error code when storage fails', async () => {
    state.listRequestsForCleanup.mockResolvedValue([stalePendingRequest])
    state.deleteTempImages.mockRejectedValueOnce(new Error('private storage detail'))
    state.claimEventPhotoOrphanCleanupCursor.mockResolvedValue({
      status: 'busy',
      cursorToken: null,
      objectCursor: null
    })
    state.filterReferencedEventPhotoTempPaths.mockResolvedValue([])

    const response = await GET(makeRequest())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      deletedFiles: 0,
      updatedRequests: 0,
      failedRequests: 1
    })
    expect(state.releaseEventPhotoTempCleanup).toHaveBeenCalledWith(
      'request-pending',
      'claim-request-pending',
      'EVENT_PHOTO_CLEANUP_FAILED'
    )
  })

  it('does not touch claimed storage when the database rejects the exact plan', async () => {
    state.listRequestsForCleanup.mockResolvedValue([stalePendingRequest])
    state.beginEventPhotoTempExternalDeletion.mockRejectedValue(
      new Error('EVENT_PHOTO_CLEANUP_CLAIM_INVALID')
    )
    state.claimEventPhotoOrphanCleanupCursor.mockResolvedValue({
      status: 'busy',
      cursorToken: null,
      objectCursor: null
    })
    state.filterReferencedEventPhotoTempPaths.mockResolvedValue([])

    const response = await GET(makeRequest())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      deletedFiles: 0,
      updatedRequests: 0,
      failedRequests: 1
    })
    expect(state.beginEventPhotoTempExternalDeletion).toHaveBeenCalledWith(
      'request-pending',
      'claim-request-pending',
      'event-photo-temp-uploads',
      ['incoming/old-a.jpg', 'incoming/shared.jpg']
    )
    expect(state.deleteTempImages).not.toHaveBeenCalledWith(
      'event-photo-temp-uploads',
      ['incoming/old-a.jpg', 'incoming/shared.jpg']
    )
    expect(state.releaseEventPhotoTempCleanup).toHaveBeenCalledWith(
      'request-pending',
      'claim-request-pending',
      'EVENT_PHOTO_CLEANUP_FAILED'
    )
  })

  it('returns and logs only allowlisted fields when the cleanup query leaks provider data', async () => {
    const sentinel = 'SENTINEL-CUSTOMER-HEALTH-AND-PROVIDER-DETAIL'
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    state.listRequestsForCleanup.mockRejectedValue(
      new Error(`EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED ${sentinel}`)
    )

    const response = await GET(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      error: 'Event-photo cleanup failed.',
      code: 'EVENT_PHOTO_CLEANUP_FAILED'
    })
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(consoleError).toHaveBeenCalledWith({
      operation: 'event-photo-temp.cleanup',
      code: 'EVENT_PHOTO_CLEANUP_FAILED',
      status: 500
    })
    expect(JSON.stringify(body)).not.toContain(sentinel)
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(sentinel)
    expect(state.deleteTempImages).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it('preserves an exact allowlisted cleanup code without logging the raw error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    state.listRequestsForCleanup.mockRejectedValue(
      new Error('EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED')
    )

    const response = await GET(makeRequest())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Event-photo cleanup failed.',
      code: 'EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED'
    })
    expect(consoleError).toHaveBeenCalledWith({
      operation: 'event-photo-temp.cleanup',
      code: 'EVENT_PHOTO_CLEANUP_REQUEST_LIST_FAILED',
      status: 500
    })

    consoleError.mockRestore()
  })
})
