import { randomUUID } from 'node:crypto'

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

  async function visit(currentPrefix: string): Promise<void> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(currentPrefix, {
        limit: 1000
      })

    if (error) {
      throw new Error(`Could not list temporary image files: ${error.message}`)
    }

    await Promise.all((data ?? []).map(async (entry) => {
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
  }

  await visit(prefix)

  return paths
}
