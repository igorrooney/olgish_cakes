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

export async function listOldTempImagePaths(
  bucket: string,
  cutoff: Date,
  prefix = 'incoming'
): Promise<string[]> {
  const supabase = getSupabaseAdmin()
  const paths: string[] = []
  const pageSize = 1000

  async function visit(currentPrefix: string): Promise<void> {
    let offset = 0

    while (true) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(currentPrefix, {
          limit: pageSize,
          offset,
          sortBy: { column: 'name', order: 'asc' }
        })

      if (error) {
        throw new Error(`Could not list temporary image files: ${error.message}`)
      }

      const entries = data ?? []

      await Promise.all(entries.map(async (entry) => {
        const childPath = `${currentPrefix}/${entry.name}`
        const isFolder = entry.id === null

        if (isFolder) {
          await visit(childPath)
          return
        }

        const timestamp = entry.updated_at ?? entry.created_at ?? entry.last_accessed_at

        if (timestamp && new Date(timestamp) < cutoff) {
          paths.push(childPath)
        }
      }))

      if (entries.length < pageSize) {
        break
      }

      offset += pageSize
    }
  }

  await visit(prefix)

  return paths
}
