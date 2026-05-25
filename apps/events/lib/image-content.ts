import type { TempDocument } from '@/lib/storage'
import type { AcceptedImageMimeType } from '@/lib/validation'

type CanonicalImageMimeType = Exclude<AcceptedImageMimeType, 'image/jpg'>

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46]
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50]
const FTYP_SIGNATURE = [0x66, 0x74, 0x79, 0x70]
const HEIC_BRANDS = new Set([
  'heic',
  'heix',
  'hevc',
  'hevx',
  'heim',
  'heis',
  'hevm',
  'hevs',
  'mif1',
  'msf1'
])

function hasSignature(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte)
}

function readAscii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.slice(start, end))
}

export function canonicalImageMimeType(mimeType: string): CanonicalImageMimeType | null {
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return 'image/jpeg'
  }

  if (mimeType === 'image/png' || mimeType === 'image/webp' || mimeType === 'image/heic') {
    return mimeType
  }

  return null
}

export function detectImageMimeType(bytes: Uint8Array): CanonicalImageMimeType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }

  if (bytes.length >= PNG_SIGNATURE.length && hasSignature(bytes, PNG_SIGNATURE)) {
    return 'image/png'
  }

  if (
    bytes.length >= 12 &&
    hasSignature(bytes, RIFF_SIGNATURE) &&
    hasSignature(bytes, WEBP_SIGNATURE, 8)
  ) {
    return 'image/webp'
  }

  if (bytes.length >= 12 && hasSignature(bytes, FTYP_SIGNATURE, 4)) {
    const majorBrand = readAscii(bytes, 8, 12)

    if (HEIC_BRANDS.has(majorBrand)) {
      return 'image/heic'
    }
  }

  return null
}

export async function findInvalidImageDocument(
  documents: Pick<TempDocument, 'blob' | 'fileName' | 'mimeType'>[]
): Promise<Pick<TempDocument, 'fileName' | 'mimeType'> | null> {
  for (const document of documents) {
    const expectedMimeType = canonicalImageMimeType(document.mimeType)

    if (!expectedMimeType) {
      return document
    }

    const bytes = new Uint8Array(await document.blob.slice(0, 32).arrayBuffer())

    if (detectImageMimeType(bytes) !== expectedMimeType) {
      return document
    }
  }

  return null
}
