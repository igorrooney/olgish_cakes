import { z } from 'zod'

import {
  DEFAULT_MAX_IMAGES,
  MAX_FILE_BYTES,
  MAX_IMAGES_LIMIT,
  MIN_IMAGES
} from '@/lib/constants'

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic'
] as const

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const settingsSchema = z.object({
  eventName: z.string().trim().min(1).max(120),
  maxImages: z.coerce.number().int().min(MIN_IMAGES).max(MAX_IMAGES_LIMIT)
})

export const publicSettingsSchema = z.object({
  eventName: z.string().trim().min(1).max(120),
  maxImages: z.number().int().min(MIN_IMAGES).max(MAX_IMAGES_LIMIT)
})

export const uploadedFileSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  mimeType: z.enum(ACCEPTED_IMAGE_TYPES),
  size: z.number().int().positive().max(MAX_FILE_BYTES),
  path: z.string().trim().min(1).max(500),
  proof: z.string().trim().min(20)
})

export const publicRequestSchema = z.object({
  csrfToken: z.string().trim().min(20),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().min(3).max(254).regex(emailPattern, 'Enter a valid email address'),
  files: z.array(uploadedFileSchema).min(MIN_IMAGES).max(MAX_IMAGES_LIMIT)
})

export const uploadRequestFileSchema = z.object({
  name: z.string().trim().min(1).max(180),
  type: z.enum(ACCEPTED_IMAGE_TYPES),
  size: z.number().int().positive().max(MAX_FILE_BYTES)
})

export const uploadRequestSchema = z.object({
  csrfToken: z.string().trim().min(20),
  files: z.array(uploadRequestFileSchema).min(MIN_IMAGES).max(MAX_IMAGES_LIMIT)
})

export function sanitizeFileName(fileName: string): string {
  const cleaned = fileName
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  return cleaned.length > 0 ? cleaned.slice(0, 120) : 'image'
}

export function formatFileSize(bytes: number): string {
  const megabytes = bytes / 1024 / 1024
  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`
}

export function validateClientFile(file: File): string | null {
  const mimeType = normaliseImageMimeType(file.name, file.type)

  if (!mimeType) {
    return 'Please upload a JPEG, PNG, WebP or HEIC image.'
  }

  if (file.size > MAX_FILE_BYTES) {
    return `Each image must be ${formatFileSize(MAX_FILE_BYTES)} or smaller.`
  }

  return null
}

export function normaliseImageMimeType(fileName: string, mimeType: string): string | null {
  if (ACCEPTED_IMAGE_TYPES.includes(mimeType as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return mimeType
  }

  const extension = fileName.toLowerCase().split('.').pop()

  if (extension === 'jpg' || extension === 'jpeg') {
    return 'image/jpeg'
  }

  if (extension === 'png') {
    return 'image/png'
  }

  if (extension === 'webp') {
    return 'image/webp'
  }

  if (extension === 'heic') {
    return 'image/heic'
  }

  return null
}

export function validateImageCount(count: number, maxImages = DEFAULT_MAX_IMAGES): string | null {
  if (count < MIN_IMAGES) {
    return 'Please upload one image.'
  }

  if (count > maxImages) {
    return maxImages === 1
      ? 'Please upload one image only.'
      : `Please upload no more than ${maxImages} images.`
  }

  return null
}

export type PublicRequestInput = z.infer<typeof publicRequestSchema>
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>
