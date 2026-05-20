import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MAX_FILE_BYTES } from '@/lib/constants'

const { listMock, removeMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
  removeMock: vi.fn()
}))

vi.mock('@/lib/supabase/admin', () => ({
  getEventPhotoBucket: () => 'event-photo-temp-uploads',
  getSupabaseAdmin: () => ({
    storage: {
      from: () => ({
        list: listMock,
        remove: removeMock
      })
    }
  })
}))

import {
  findInvalidTempDocumentSize,
  listOldTempImagePaths
} from '@/lib/storage'

describe('storage cleanup helpers', () => {
  beforeEach(() => {
    listMock.mockReset()
    removeMock.mockReset()
  })

  it('paginates through large storage folders', async () => {
    const oldTimestamp = '2026-05-19T00:00:00.000Z'
    const firstPage = Array.from({ length: 1000 }, (_, index) => ({
      id: `file-${index}`,
      name: `photo-${index}.jpg`,
      created_at: oldTimestamp,
      updated_at: null,
      last_accessed_at: null
    }))
    const secondPage = [
      {
        id: 'file-1000',
        name: 'photo-1000.jpg',
        created_at: oldTimestamp,
        updated_at: null,
        last_accessed_at: null
      }
    ]

    listMock
      .mockResolvedValueOnce({ data: firstPage, error: null })
      .mockResolvedValueOnce({ data: secondPage, error: null })

    const paths = await listOldTempImagePaths(
      'event-photo-temp-uploads',
      new Date('2026-05-20T00:00:00.000Z'),
      'incoming'
    )

    expect(listMock).toHaveBeenNthCalledWith(1, 'incoming', {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    })
    expect(listMock).toHaveBeenNthCalledWith(2, 'incoming', {
      limit: 1000,
      offset: 1000,
      sortBy: { column: 'name', order: 'asc' }
    })
    expect(paths).toHaveLength(1001)
    expect(paths).toContain('incoming/photo-1000.jpg')
  })

  it('accepts downloaded files that match their signed size', () => {
    expect(findInvalidTempDocumentSize(
      [
        {
          fileName: 'photo.jpg',
          blob: { size: 1024 } as Blob
        }
      ],
      [
        {
          fileName: 'photo.jpg',
          size: 1024
        }
      ]
    )).toBeNull()
  })

  it('detects downloaded files that do not match their signed size', () => {
    expect(findInvalidTempDocumentSize(
      [
        {
          fileName: 'photo.jpg',
          blob: { size: 2048 } as Blob
        }
      ],
      [
        {
          fileName: 'photo.jpg',
          size: 1024
        }
      ]
    )).toEqual({
      fileName: 'photo.jpg',
      expectedSize: 1024,
      actualSize: 2048,
      reason: 'mismatch'
    })
  })

  it('detects downloaded files over the app size limit', () => {
    expect(findInvalidTempDocumentSize(
      [
        {
          fileName: 'photo.jpg',
          blob: { size: MAX_FILE_BYTES + 1 } as Blob
        }
      ],
      [
        {
          fileName: 'photo.jpg',
          size: MAX_FILE_BYTES
        }
      ]
    )).toEqual({
      fileName: 'photo.jpg',
      expectedSize: MAX_FILE_BYTES,
      actualSize: MAX_FILE_BYTES + 1,
      reason: 'too_large'
    })
  })
})
