import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  listRequestsForCleanup: vi.fn(),
  updateTelegramStatus: vi.fn(),
  deleteTempImages: vi.fn(),
  listOldTempImagePaths: vi.fn()
}))

vi.mock('@/lib/requests', () => ({
  listRequestsForCleanup: state.listRequestsForCleanup,
  updateTelegramStatus: state.updateTelegramStatus
}))

vi.mock('@/lib/supabase/admin', () => ({
  getEventPhotoBucket: () => 'event-photo-temp-uploads'
}))

vi.mock('@/lib/storage', () => ({
  deleteTempImages: state.deleteTempImages,
  listOldTempImagePaths: state.listOldTempImagePaths
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
    state.updateTelegramStatus.mockReset().mockResolvedValue(undefined)
    state.deleteTempImages.mockReset().mockResolvedValue(undefined)
    state.listOldTempImagePaths.mockReset().mockResolvedValue([
      'incoming/orphan.jpg',
      'incoming/shared.jpg'
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

  it('deletes stale storage paths and marks pending requests failed', async () => {
    const response = await GET(makeRequest())

    await expect(response.json()).resolves.toEqual({
      deletedFiles: 4,
      updatedRequests: 2
    })
    expect(state.listRequestsForCleanup).toHaveBeenCalledWith('2026-05-19T12:00:00.000Z')
    expect(state.deleteTempImages).toHaveBeenCalledWith('event-photo-temp-uploads', [
      'incoming/old-a.jpg',
      'incoming/shared.jpg',
      'incoming/old-b.jpg',
      'incoming/orphan.jpg'
    ])
    expect(state.updateTelegramStatus).toHaveBeenCalledWith(
      'request-pending',
      'failed',
      [],
      'Temporary uploaded files were removed after 24 hours.',
      true
    )
    expect(state.updateTelegramStatus).toHaveBeenCalledWith(
      'request-sent',
      'sent',
      [501],
      null,
      true
    )
  })
})
