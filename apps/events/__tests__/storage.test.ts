import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MAX_FILE_BYTES } from '@/lib/constants'

const {
  createSignedUploadUrlMock,
  downloadMock,
  listMock,
  removeMock
} = vi.hoisted(() => ({
  createSignedUploadUrlMock: vi.fn(),
  downloadMock: vi.fn(),
  listMock: vi.fn(),
  removeMock: vi.fn()
}))

vi.mock('@/lib/supabase/admin', () => ({
  getEventPhotoBucket: () => 'event-photo-temp-uploads',
  getSupabaseAdmin: () => ({
    storage: {
      from: () => ({
        createSignedUploadUrl: createSignedUploadUrlMock,
        download: downloadMock,
        list: listMock,
        remove: removeMock
      })
    }
  })
}))

import {
  createSignedUploads,
  deleteTempImages,
  downloadTempDocuments,
  findInvalidTempDocumentSize,
  listOldTempImagePaths
} from '@/lib/storage'

describe('storage cleanup helpers', () => {
  beforeEach(() => {
    process.env.CSRF_SECRET = 'test-csrf-secret-with-enough-length'
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T12:00:00.000Z'))
    createSignedUploadUrlMock.mockReset()
    downloadMock.mockReset()
    listMock.mockReset()
    removeMock.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates signed uploads with sanitized temporary paths and proof tokens', async () => {
    createSignedUploadUrlMock.mockResolvedValue({
      data: { token: 'signed-token' },
      error: null
    })

    const uploads = await createSignedUploads([
      {
        fileName: 'My Cake.JPG',
        mimeType: 'image/jpeg',
        size: 1024
      }
    ])

    expect(createSignedUploadUrlMock).toHaveBeenCalledWith(
      expect.stringMatching(/^incoming\/2026-05-20\/.+-my-cake\.jpg$/)
    )
    expect(uploads[0]).toMatchObject({
      fileName: 'My Cake.JPG',
      mimeType: 'image/jpeg',
      size: 1024,
      token: 'signed-token'
    })
    expect(uploads[0]?.proof).toEqual(expect.any(String))
  })

  it('downloads temporary documents from their signed paths', async () => {
    const blob = new Blob(['image-bytes'], { type: 'image/jpeg' })
    downloadMock.mockResolvedValue({ data: blob, error: null })

    await expect(downloadTempDocuments(
      'event-photo-temp-uploads',
      [
        {
          fileName: 'photo.jpg',
          mimeType: 'image/jpeg',
          path: 'incoming/photo.jpg'
        }
      ]
    )).resolves.toEqual([
      {
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        path: 'incoming/photo.jpg',
        blob
      }
    ])
  })

  it('deletes temporary images in storage-sized batches', async () => {
    removeMock.mockResolvedValue({ error: null })
    const paths = Array.from({ length: 1001 }, (_, index) => `incoming/photo-${index}.jpg`)

    await deleteTempImages('event-photo-temp-uploads', paths)

    expect(removeMock).toHaveBeenNthCalledWith(1, paths.slice(0, 1000))
    expect(removeMock).toHaveBeenNthCalledWith(2, paths.slice(1000))
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

  it('surfaces storage errors with user-safe context', async () => {
    createSignedUploadUrlMock.mockResolvedValue({
      data: null,
      error: { message: 'sign denied' }
    })
    await expect(createSignedUploads([
      {
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        size: 1024
      }
    ])).rejects.toThrow('Could not create upload link: sign denied')

    downloadMock.mockResolvedValue({
      data: null,
      error: { message: 'download denied' }
    })
    await expect(downloadTempDocuments(
      'event-photo-temp-uploads',
      [
        {
          fileName: 'photo.jpg',
          mimeType: 'image/jpeg',
          path: 'incoming/photo.jpg'
        }
      ]
    )).rejects.toThrow('Could not download uploaded image: download denied')

    removeMock.mockResolvedValue({ error: { message: 'remove denied' } })
    await expect(deleteTempImages(
      'event-photo-temp-uploads',
      ['incoming/photo.jpg']
    )).rejects.toThrow('Could not delete temporary image files: remove denied')

    listMock.mockResolvedValue({ data: null, error: { message: 'list denied' } })
    await expect(listOldTempImagePaths(
      'event-photo-temp-uploads',
      new Date('2026-05-20T00:00:00.000Z')
    )).rejects.toThrow('Could not list temporary image files: list denied')
  })
})
