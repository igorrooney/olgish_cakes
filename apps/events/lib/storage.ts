import { randomUUID } from 'node:crypto'

import { MAX_FILE_BYTES } from '@/lib/constants'
import { getEventPhotoBucket, getSupabaseAdmin } from '@/lib/supabase/admin'
import { createUploadProof } from '@/lib/upload-proof'
import { sanitizeFileName } from '@/lib/validation'

export interface SignedUploadInput {
  fileName: string
  mimeType: string
  size: number
}

export interface SignedUpload {
  fileName: string
  mimeType: string
  size: number
  path: string
  token: string
  proof: string
}

export interface TempDocument {
  fileName: string
  mimeType: string
  path: string
  blob: Blob
}

export interface TempDocumentSizeIssue {
  fileName: string
  expectedSize: number | null
  actualSize: number
  reason: 'mismatch' | 'too_large'
}

export interface TempStorageEntry {
  name: string
  path: string
  isManaged: boolean
  timestamp: string | null
}

export interface TempStoragePage {
  entries: TempStorageEntry[]
  nextCursor: string | null
  hasNext: boolean
}

export const TEMP_STORAGE_PAGE_SIZE = 100

function buildUploadPath(fileName: string): string {
  const today = new Date().toISOString().slice(0, 10)
  return `incoming/${today}/${randomUUID()}-${sanitizeFileName(fileName)}`
}

export async function createSignedUploads(files: SignedUploadInput[]): Promise<SignedUpload[]> {
  const supabase = getSupabaseAdmin()
  const bucket = getEventPhotoBucket()

  return Promise.all(files.map(async (file) => {
    const path = buildUploadPath(file.fileName)
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path)

    if (error) {
      throw new Error(`Could not create upload link: ${error.message}`)
    }

    return {
      fileName: file.fileName,
      mimeType: file.mimeType,
      size: file.size,
      path,
      token: data.token,
      proof: createUploadProof({
        path,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size
      })
    }
  }))
}

export async function downloadTempDocuments(
  bucket: string,
  files: Pick<SignedUpload, 'fileName' | 'mimeType' | 'path'>[]
): Promise<TempDocument[]> {
  const supabase = getSupabaseAdmin()

  return Promise.all(files.map(async (file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(file.path)

    if (error) {
      throw new Error(`Could not download uploaded image: ${error.message}`)
    }

    if (!data) {
      throw new Error('Could not download uploaded image.')
    }

    return {
      fileName: file.fileName,
      mimeType: file.mimeType,
      path: file.path,
      blob: data
    }
  }))
}

export function findInvalidTempDocumentSize(
  documents: Pick<TempDocument, 'blob' | 'fileName'>[],
  files: Pick<SignedUpload, 'fileName' | 'size'>[]
): TempDocumentSizeIssue | null {
  for (let index = 0; index < documents.length; index += 1) {
    const document = documents[index]
    const file = files[index]
    const actualSize = document.blob.size

    if (actualSize > MAX_FILE_BYTES) {
      return {
        fileName: document.fileName,
        expectedSize: file?.size ?? null,
        actualSize,
        reason: 'too_large'
      }
    }

    if (!file || document.fileName !== file.fileName || actualSize !== file.size) {
      return {
        fileName: document.fileName,
        expectedSize: file?.size ?? null,
        actualSize,
        reason: 'mismatch'
      }
    }
  }

  return null
}

export async function deleteTempImages(bucket: string, paths: string[]): Promise<void> {
  if (paths.length === 0) {
    return
  }

  const supabase = getSupabaseAdmin()

  for (let index = 0; index < paths.length; index += 1000) {
    const chunk = paths.slice(index, index + 1000)
    const { error } = await supabase.storage
      .from(bucket)
      .remove(chunk)

    if (error) {
      throw new Error(`Could not delete temporary image files: ${error.message}`)
    }
  }
}

export async function listTempImagePage(
  bucket: string,
  prefix: string,
  cursor: string | null,
  limit: number,
  signal: AbortSignal
): Promise<TempStoragePage> {
  if (
    prefix !== 'incoming' ||
    !(
      cursor === null ||
      (
        typeof cursor === 'string' &&
        cursor.length > 0 &&
        cursor.length <= 4096 &&
        !cursor.includes('\0')
      )
    ) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > TEMP_STORAGE_PAGE_SIZE
  ) {
    throw new Error('EVENT_PHOTO_STORAGE_LIST_FAILED')
  }

  const { data, error } = await getSupabaseAdmin().storage
    .from(bucket)
    .listV2({
      prefix: `${prefix}/`,
      limit,
      ...(cursor ? { cursor } : {}),
      with_delimiter: false,
      sortBy: { column: 'name', order: 'asc' }
    }, { signal })

  if (
    error ||
    !data ||
    typeof data.hasNext !== 'boolean' ||
    !Array.isArray(data.folders) ||
    !Array.isArray(data.objects) ||
    data.folders.length !== 0 ||
    data.objects.length > limit ||
    (
      data.hasNext &&
      (
        typeof data.nextCursor !== 'string' ||
        data.nextCursor.length === 0 ||
        data.nextCursor.length > 4096 ||
        data.nextCursor.includes('\0')
      )
    )
  ) {
    throw new Error('EVENT_PHOTO_STORAGE_LIST_FAILED')
  }

  if (data.objects.some((entry) => (
    typeof entry.name !== 'string' ||
    entry.name.length === 0 ||
    entry.name.length > 1024 ||
    !entry.name.startsWith('incoming/')
  ))) {
    throw new Error('EVENT_PHOTO_STORAGE_LIST_FAILED')
  }

  return {
    entries: data.objects.map((entry) => ({
      name: entry.name.slice('incoming/'.length),
      path: entry.name,
      isManaged: (
        /^incoming\/(?:[0-9]{4}-[0-9]{2}-[0-9]{2}\/)?[^/\\]+$/.test(entry.name) &&
        !entry.name.includes('..')
      ),
      timestamp: entry.updated_at ?? entry.created_at ?? entry.last_accessed_at ?? null
    })),
    nextCursor: data.hasNext ? data.nextCursor ?? null : null,
    hasNext: data.hasNext
  }
}
