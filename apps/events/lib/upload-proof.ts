import { z } from 'zod'

import { TEMP_UPLOAD_EXPIRY_SECONDS } from '@/lib/constants'
import { getRequiredEnv } from '@/lib/env'
import { decodeJsonToken, encodeJsonToken } from '@/lib/crypto'

const uploadProofSchema = z.object({
  path: z.string().min(1).max(500),
  fileName: z.string().min(1).max(180),
  mimeType: z.string().min(3).max(80),
  size: z.number().int().positive(),
  expiresAt: z.number().int().positive()
})

export interface UploadProofPayload {
  path: string
  fileName: string
  mimeType: string
  size: number
  expiresAt: number
}

export function createUploadProof(input: Omit<UploadProofPayload, 'expiresAt'>): string {
  return encodeJsonToken(
    {
      ...input,
      expiresAt: Date.now() + TEMP_UPLOAD_EXPIRY_SECONDS * 1000
    },
    getRequiredEnv('CSRF_SECRET')
  )
}

export function verifyUploadProof(proof: string): UploadProofPayload | null {
  const parsed = uploadProofSchema.safeParse(
    decodeJsonToken(proof, getRequiredEnv('CSRF_SECRET'))
  )

  if (!parsed.success || parsed.data.expiresAt <= Date.now()) {
    return null
  }

  return parsed.data
}
