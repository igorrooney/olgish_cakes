import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  FALLBACK_ERROR_MESSAGE,
  MAX_FILE_BYTES
} from '@/lib/constants'
import { validateCsrfToken } from '@/lib/csrf'
import { jsonError, readJsonBody } from '@/lib/http'
import { findInvalidImageDocument } from '@/lib/image-content'
import {
  publicRateLimitError,
  recordPublicRequestAttempt
} from '@/lib/rate-limit'
import {
  createEventPhotoRequest,
  updateTelegramStatus
} from '@/lib/requests'
import { getEventPhotoSettings } from '@/lib/settings'
import { getEventPhotoBucket } from '@/lib/supabase/admin'
import {
  deleteTempImages,
  downloadTempDocuments,
  findInvalidTempDocumentSize
} from '@/lib/storage'
import {
  TelegramDeliveryError,
  sendTelegramNotification
} from '@/lib/telegram'
import { verifyUploadProof } from '@/lib/upload-proof'
import {
  formatFileSize,
  publicRequestSchema
} from '@/lib/validation'

export const maxDuration = 60

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await readJsonBody(request)
  const parsed = publicRequestSchema.safeParse(body)

  if (!parsed.success) {
    return jsonError('Please check your details and image, then try again.', 400)
  }

  if (!validateCsrfToken(request, parsed.data.csrfToken)) {
    return jsonError('This form expired. Please refresh the page and try again.', 403)
  }

  const settings = await getEventPhotoSettings()

  if (parsed.data.files.length > settings.maxImages) {
    return jsonError(
      settings.maxImages === 1
        ? 'Please upload one image only.'
        : `Please upload no more than ${settings.maxImages} images.`,
      400
    )
  }

  const rateLimit = await recordPublicRequestAttempt(request, parsed.data.email)

  if (rateLimit.isLimited) {
    return publicRateLimitError(rateLimit)
  }

  const verifiedFiles: typeof parsed.data.files = []

  for (const file of parsed.data.files) {
    const proof = verifyUploadProof(file.proof)

    if (
      !proof ||
      proof.path !== file.path ||
      proof.fileName !== file.fileName ||
      proof.mimeType !== file.mimeType ||
      proof.size !== file.size
    ) {
      return jsonError('The uploaded image could not be verified. Please try again.', 400)
    }

    verifiedFiles.push(file)
  }

  const bucket = getEventPhotoBucket()
  const requestRow = await createEventPhotoRequest({
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    eventName: settings.eventName,
    imageFilenames: verifiedFiles.map((file) => file.fileName),
    imageMimeTypes: verifiedFiles.map((file) => file.mimeType),
    imageSizes: verifiedFiles.map((file) => file.size),
    tempImageBucket: bucket,
    tempImagePaths: verifiedFiles.map((file) => file.path)
  })

  let deliveredMessageIds: number[] = []

  try {
    const documents = await downloadTempDocuments(bucket, verifiedFiles)
    const invalidSizeDocument = findInvalidTempDocumentSize(documents, verifiedFiles)

    if (invalidSizeDocument) {
      await deleteTempImages(bucket, verifiedFiles.map((file) => file.path))
      await updateTelegramStatus(
        requestRow.id,
        'failed',
        [],
        invalidSizeDocument.reason === 'too_large'
          ? `Uploaded file exceeded the maximum size: ${invalidSizeDocument.fileName}`
          : `Uploaded file size did not match verified metadata: ${invalidSizeDocument.fileName}`,
        true
      )

      return jsonError(
        invalidSizeDocument.reason === 'too_large'
          ? `Each image must be ${formatFileSize(MAX_FILE_BYTES)} or smaller.`
          : 'The uploaded image could not be verified. Please try again.',
        400
      )
    }

    const invalidDocument = await findInvalidImageDocument(documents)

    if (invalidDocument) {
      await deleteTempImages(bucket, verifiedFiles.map((file) => file.path))
      await updateTelegramStatus(
        requestRow.id,
        'failed',
        [],
        `Uploaded file content did not match a supported image type: ${invalidDocument.fileName}`,
        true
      )

      return jsonError('Please upload a valid JPEG, PNG, WebP or HEIC image.', 400)
    }

    deliveredMessageIds = await sendTelegramNotification({
      requestId: requestRow.id,
      eventName: requestRow.event_name,
      fullName: requestRow.full_name,
      email: requestRow.email,
      documents
    })

    await updateTelegramStatus(requestRow.id, 'sent', deliveredMessageIds, null, false)

    try {
      await deleteTempImages(bucket, verifiedFiles.map((file) => file.path))
      await updateTelegramStatus(requestRow.id, 'sent', deliveredMessageIds, null, true)
    } catch {
      // The cleanup cron can remove stale temp files and clear paths later.
    }

    return NextResponse.json({
      id: requestRow.id
    })
  } catch (error) {
    const messageIds = error instanceof TelegramDeliveryError
      ? error.messageIds
      : deliveredMessageIds
    const errorMessage = error instanceof Error ? error.message : FALLBACK_ERROR_MESSAGE

    await updateTelegramStatus(requestRow.id, 'failed', messageIds, errorMessage, false)

    return jsonError(FALLBACK_ERROR_MESSAGE, 502)
  }
}
