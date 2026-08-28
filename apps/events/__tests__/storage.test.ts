import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MAX_FILE_BYTES } from '@/lib/constants'

const {
  createSignedUploadUrlMock,
  downloadMock,
  listV2Mock,
  removeMock
} = vi.hoisted(() => ({
  createSignedUploadUrlMock: vi.fn(),
  downloadMock: vi.fn(),
  listV2Mock: vi.fn(),
  removeMock: vi.fn()
}))

vi.mock('@/lib/supabase/admin', () => ({
  getEventPhotoBucket: () => 'event-photo-temp-uploads',
  getSupabaseAdmin: () => ({
    storage: {
      from: () => ({
        createSignedUploadUrl: createSignedUploadUrlMock,
        download: downloadMock,
        listV2: listV2Mock,
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
  listTempImagePage
} from '@/lib/storage'

describe('storage cleanup helpers', () => {
  beforeEach(() => {
    process.env.CSRF_SECRET = 'test-csrf-secret-with-enough-length'
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T12:00:00.000Z'))
    createSignedUploadUrlMock.mockReset()
    downloadMock.mockReset()
    listV2Mock.mockReset()
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

  it('lists exactly one bounded storage page with stable name ordering', async () => {
    const oldTimestamp = '2026-05-19T00:00:00.000Z'
    const signal = new AbortController().signal
    listV2Mock.mockResolvedValue({
      data: {
        hasNext: true,
        nextCursor: 'next-page-cursor',
        folders: [],
        objects: [
          {
            id: 'file-1',
            name: 'incoming/2026-05-18/nested-photo.jpg',
            metadata: { size: 10 },
            created_at: oldTimestamp,
            updated_at: null,
            last_accessed_at: null
          },
          {
            id: 'file-2',
            name: 'incoming/photo.jpg',
            metadata: { size: 10 },
            created_at: oldTimestamp,
            updated_at: null,
            last_accessed_at: null
          }
        ]
      },
      error: null
    })

    const page = await listTempImagePage(
      'event-photo-temp-uploads',
      'incoming',
      'current-page-cursor',
      2,
      signal
    )

    expect(listV2Mock).toHaveBeenCalledTimes(1)
    expect(listV2Mock).toHaveBeenCalledWith(
      {
        prefix: 'incoming/',
        limit: 2,
        cursor: 'current-page-cursor',
        with_delimiter: false,
        sortBy: { column: 'name', order: 'asc' }
      },
      { signal }
    )
    expect(page).toEqual({
      entries: [
        {
          name: '2026-05-18/nested-photo.jpg',
          path: 'incoming/2026-05-18/nested-photo.jpg',
          isManaged: true,
          timestamp: oldTimestamp
        },
        {
          name: 'photo.jpg',
          path: 'incoming/photo.jpg',
          isManaged: true,
          timestamp: oldTimestamp
        }
      ],
      hasNext: true,
      nextCursor: 'next-page-cursor'
    })
  })

  it('keeps a file with missing metadata as a file', async () => {
    listV2Mock.mockResolvedValue({
      data: {
        hasNext: false,
        folders: [],
        objects: [{
          id: 'file-without-metadata',
          name: 'incoming/photo.jpg',
          metadata: null,
          created_at: '2026-05-19T00:00:00.000Z',
          updated_at: null,
          last_accessed_at: null
        }]
      },
      error: null
    })

    await expect(listTempImagePage(
      'event-photo-temp-uploads',
      'incoming',
      null,
      100,
      new AbortController().signal
    )).resolves.toEqual({
      entries: [{
        name: 'photo.jpg',
        path: 'incoming/photo.jpg',
        isManaged: true,
        timestamp: '2026-05-19T00:00:00.000Z'
      }],
      hasNext: false,
      nextCursor: null
    })
  })

  it('rejects unbounded requests and skips unsafe objects without stalling the cursor', async () => {
    await expect(listTempImagePage(
      'event-photo-temp-uploads',
      'incoming/2026-05-18/nested',
      null,
      100,
      new AbortController().signal
    )).rejects.toThrow('EVENT_PHOTO_STORAGE_LIST_FAILED')
    await expect(listTempImagePage(
      'event-photo-temp-uploads',
      'incoming',
      null,
      101,
      new AbortController().signal
    )).rejects.toThrow('EVENT_PHOTO_STORAGE_LIST_FAILED')

    listV2Mock.mockResolvedValue({
      data: {
        hasNext: false,
        folders: [],
        objects: [{
          id: 'file-1',
          name: 'incoming/../private.jpg',
          metadata: { size: 10 },
          created_at: '2026-05-19T00:00:00.000Z',
          updated_at: null,
          last_accessed_at: null
        }]
      },
      error: null
    })
    await expect(listTempImagePage(
      'event-photo-temp-uploads',
      'incoming',
      null,
      100,
      new AbortController().signal
    )).resolves.toEqual({
      entries: [{
        name: '../private.jpg',
        path: 'incoming/../private.jpg',
        isManaged: false,
        timestamp: '2026-05-19T00:00:00.000Z'
      }],
      hasNext: false,
      nextCursor: null
    })

    listV2Mock.mockResolvedValue({
      data: {
        hasNext: true,
        folders: [],
        objects: []
      },
      error: null
    })
    await expect(listTempImagePage(
      'event-photo-temp-uploads',
      'incoming',
      null,
      100,
      new AbortController().signal
    )).rejects.toThrow('EVENT_PHOTO_STORAGE_LIST_FAILED')
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

    listV2Mock.mockResolvedValue({ data: null, error: { message: 'list denied' } })
    await expect(listTempImagePage(
      'event-photo-temp-uploads',
      'incoming',
      null,
      100,
      new AbortController().signal
    )).rejects.toThrow('EVENT_PHOTO_STORAGE_LIST_FAILED')
  })
})
