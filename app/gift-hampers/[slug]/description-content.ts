import { blocksToText } from '@/types/cake'
import type { GiftHamper } from '@/types/giftHamper'

export const giftHamperVisibleDescriptionFallback = 'Handmade cake-by-post hamper prepared in Leeds and packed with care for UK delivery.'

function normalizeDescriptionText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function hasPortableTextContent(
  value: GiftHamper['description'] | GiftHamper['shortDescription']
): value is NonNullable<GiftHamper['description']> {
  return Array.isArray(value) && value.length > 0
}

function getNormalizedPortableText(
  value: GiftHamper['description'] | GiftHamper['shortDescription']
) {
  if (!hasPortableTextContent(value)) {
    return null
  }

  const normalizedDescription = normalizeDescriptionText(blocksToText(value))

  return normalizedDescription.length > 0
    ? normalizedDescription
    : null
}

export function getGiftHamperVisibleDescriptionText(hamper: GiftHamper): string {
  const normalizedDescription = getNormalizedPortableText(hamper.description)
  if (normalizedDescription) {
    return normalizedDescription
  }

  const normalizedShortDescription = getNormalizedPortableText(hamper.shortDescription)
  if (normalizedShortDescription) {
    return normalizedShortDescription
  }

  return giftHamperVisibleDescriptionFallback
}
