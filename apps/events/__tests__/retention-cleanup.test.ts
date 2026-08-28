import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  rpc: vi.fn()
}))

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({ rpc: state.rpc })
}))

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

describe('event-photo retention cleanup claims', () => {
  beforeEach(() => {
    state.rpc.mockReset()
  })

  it('claims only server-validated paths and starts the irreversible phase', async () => {
    state.rpc
      .mockResolvedValueOnce({
        data: [{
          status: 'claimed',
          claim_token: 'claim-token',
          temp_image_bucket: 'event-photo-temp-uploads',
          temp_image_paths: ['incoming/photo.jpg']
        }],
        error: null
      })
      .mockResolvedValueOnce({ data: true, error: null })

    await expect(claimEventPhotoTempCleanup(
      '11111111-1111-4111-8111-111111111111',
      '2026-08-24T12:00:00.000Z'
    )).resolves.toEqual({
      status: 'claimed',
      claimToken: 'claim-token',
      bucket: 'event-photo-temp-uploads',
      paths: ['incoming/photo.jpg']
    })
    await expect(beginEventPhotoTempExternalDeletion(
      '11111111-1111-4111-8111-111111111111',
      'claim-token',
      'event-photo-temp-uploads',
      ['incoming/photo.jpg']
    )).resolves.toBeUndefined()
    expect(state.rpc).toHaveBeenNthCalledWith(2,
      'begin_privacy_retention_external_deletion',
      {
        p_candidate_id: 'enquiry-upload:event-photo:11111111-1111-4111-8111-111111111111',
        p_claim_token: 'claim-token',
        p_bucket: 'event-photo-temp-uploads',
        p_paths: ['incoming/photo.jpg']
      }
    )
  })

  it('fails closed when the database rejects a mismatched storage plan', async () => {
    state.rpc.mockResolvedValue({ data: false, error: null })

    await expect(beginEventPhotoTempExternalDeletion(
      '11111111-1111-4111-8111-111111111111',
      'claim-token',
      'event-photo-temp-uploads',
      ['incoming/not-the-claimed-path.jpg']
    )).rejects.toThrow('EVENT_PHOTO_CLEANUP_CLAIM_INVALID')

    expect(state.rpc).toHaveBeenCalledWith(
      'begin_privacy_retention_external_deletion',
      {
        p_candidate_id: 'enquiry-upload:event-photo:11111111-1111-4111-8111-111111111111',
        p_claim_token: 'claim-token',
        p_bucket: 'event-photo-temp-uploads',
        p_paths: ['incoming/not-the-claimed-path.jpg']
      }
    )
  })

  it('finalizes and releases through token-bound controlled RPCs', async () => {
    state.rpc
      .mockResolvedValueOnce({
        data: [{ status: 'deleted', affected_count: 1, finalized_at: '2026-08-25T12:00:00.000Z' }],
        error: null
      })
      .mockResolvedValueOnce({ data: true, error: null })

    await expect(finalizeEventPhotoTempCleanup('request-id', 'claim-token')).resolves.toBe('deleted')
    await expect(releaseEventPhotoTempCleanup(
      'request-id',
      'claim-token',
      'EVENT_PHOTO_CLEANUP_FAILED'
    )).resolves.toBeUndefined()
  })

  it('claims and advances the bounded orphan cursor using an exact token', async () => {
    state.rpc
      .mockResolvedValueOnce({
        data: [{
          status: 'claimed',
          cursor_token: 'cursor-token',
          object_cursor: 'object-cursor',
          lease_expires_at: '2026-08-25T12:10:00.000Z'
        }],
        error: null
      })
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: true, error: null })

    await expect(claimEventPhotoOrphanCleanupCursor()).resolves.toEqual({
      status: 'claimed',
      cursorToken: 'cursor-token',
      objectCursor: 'object-cursor'
    })
    await expect(finalizeEventPhotoOrphanCleanupCursor('cursor-token', {
      objectCursor: 'next-object-cursor'
    })).resolves.toBeUndefined()
    await expect(releaseEventPhotoOrphanCleanupCursor('cursor-token'))
      .resolves.toBeUndefined()

    expect(state.rpc).toHaveBeenNthCalledWith(
      2,
      'finalize_event_photo_orphan_cleanup_cursor',
      {
        p_cursor_token: 'cursor-token',
        p_object_cursor: 'next-object-cursor'
      }
    )
  })

  it('checks only the bounded candidate path set for live references', async () => {
    state.rpc.mockResolvedValue({
      data: [{ temp_image_path: 'incoming/2026-05-18/protected.jpg' }],
      error: null
    })

    await expect(filterReferencedEventPhotoTempPaths([
      'incoming/2026-05-18/protected.jpg',
      'incoming/2026-05-18/orphan.jpg'
    ])).resolves.toEqual(['incoming/2026-05-18/protected.jpg'])
    expect(state.rpc).toHaveBeenCalledWith(
      'filter_referenced_event_photo_temp_paths',
      {
        p_paths: [
          'incoming/2026-05-18/protected.jpg',
          'incoming/2026-05-18/orphan.jpg'
        ]
      }
    )

    state.rpc.mockClear()
    await expect(filterReferencedEventPhotoTempPaths([])).resolves.toEqual([])
    expect(state.rpc).not.toHaveBeenCalled()
  })

  it('returns only fixed operational failures and never provider details', async () => {
    state.rpc.mockResolvedValue({
      data: null,
      error: { message: 'PRIVATE_STORAGE_AND_CUSTOMER_PATH' }
    })

    await expect(claimEventPhotoTempCleanup('request-id', '2026-08-24T12:00:00.000Z'))
      .rejects.toThrow('EVENT_PHOTO_CLEANUP_CLAIM_FAILED')
    await expect(beginEventPhotoTempExternalDeletion(
      'request-id',
      'claim-token',
      'event-photo-temp-uploads',
      ['incoming/photo.jpg']
    ))
      .rejects.toThrow('EVENT_PHOTO_CLEANUP_CLAIM_INVALID')
    await expect(finalizeEventPhotoTempCleanup('request-id', 'claim-token'))
      .rejects.toThrow('EVENT_PHOTO_CLEANUP_FINALIZE_FAILED')
    await expect(releaseEventPhotoTempCleanup(
      'request-id',
      'claim-token',
      'EVENT_PHOTO_CLEANUP_FAILED'
    )).rejects.toThrow('EVENT_PHOTO_CLEANUP_RELEASE_FAILED')
    await expect(claimEventPhotoOrphanCleanupCursor())
      .rejects.toThrow('EVENT_PHOTO_ORPHAN_CURSOR_CLAIM_FAILED')
    await expect(finalizeEventPhotoOrphanCleanupCursor('cursor-token', {
      objectCursor: null
    })).rejects.toThrow('EVENT_PHOTO_ORPHAN_CURSOR_FINALIZE_FAILED')
    await expect(releaseEventPhotoOrphanCleanupCursor('cursor-token'))
      .rejects.toThrow('EVENT_PHOTO_ORPHAN_CURSOR_RELEASE_FAILED')
    await expect(filterReferencedEventPhotoTempPaths(['incoming/photo.jpg']))
      .rejects.toThrow('EVENT_PHOTO_REFERENCE_FILTER_FAILED')
  })
})
