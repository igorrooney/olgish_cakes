import { beforeEach, describe, expect, it, vi } from 'vitest'

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

import { listOldTempImagePaths } from '@/lib/storage'

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
})
