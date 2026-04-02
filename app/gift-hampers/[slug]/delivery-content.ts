import {
  detectDeliveryPolicyMismatch,
  extractDeliveryPolicyVisibleClaims,
  getDeliveryCountryLabel,
  normalizeDeliveryPolicy,
  type DeliveryPolicyVisibleClaims
} from '@/app/utils/delivery-policy'
import { blocksToText } from '@/types/cake'
import { defaultDeliveryPolicy, type DeliveryPolicy } from '@/types/deliveryPolicy'
import type { GiftHamper } from '@/types/giftHamper'

export const defaultGiftHamperDeliveryTitle = 'Delivery'
export const fallbackGiftHamperDeliveryPolicy: DeliveryPolicy = {
  ...defaultDeliveryPolicy
}

export const fallbackGiftHamperDeliveryDescription: NonNullable<GiftHamper['description']> = [
  {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'We dispatch cake-by-post orders within 2-3 working days.'
      }
    ]
  },
  {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'Free UK shipping is included. Add any delivery notes in your order request and we will confirm availability.'
      }
    ]
  }
]

function formatPolicyFee(fee: number) {
  return Number.isInteger(fee)
    ? String(fee)
    : fee.toFixed(2)
}

export function getGiftHamperDeliveryFallbackKeyPoint(policy: DeliveryPolicy) {
  const countryLabel = getDeliveryCountryLabel(policy.shippingDestinationCountry)

  return policy.shippingFeeGbp === 0
    ? `Free ${countryLabel} shipping`
    : `${countryLabel} shipping from \u00A3${formatPolicyFee(policy.shippingFeeGbp)}`
}

function hasPortableTextContent(
  value: GiftHamper['description'] | GiftHamper['shortDescription'] | undefined
): value is NonNullable<GiftHamper['description']> {
  return Array.isArray(value) && value.length > 0 && blocksToText(value).trim().length > 0
}

export function resolveGiftHamperDeliveryTitle(hamper: GiftHamper): string {
  const globalTitle = hamper.giftHampersDeliverySection?.name

  if (typeof globalTitle === 'string' && globalTitle.trim().length > 0) {
    return globalTitle.trim()
  }

  return defaultGiftHamperDeliveryTitle
}

export function resolveGiftHamperDeliveryDescription(
  hamper: GiftHamper
): NonNullable<GiftHamper['description']> {
  const shouldUseCustomDescription = hamper.deliverySection?.descriptionSource === 'custom'

  if (shouldUseCustomDescription && hasPortableTextContent(hamper.deliverySection?.customDescription)) {
    return hamper.deliverySection.customDescription
  }

  if (hasPortableTextContent(hamper.giftHampersDeliverySection?.description)) {
    return hamper.giftHampersDeliverySection.description
  }

  return fallbackGiftHamperDeliveryDescription
}

function resolveGlobalGiftHamperDeliveryPolicy(hamper: GiftHamper) {
  if (hamper.giftHampersDeliverySection?.policy) {
    return normalizeDeliveryPolicy(hamper.giftHampersDeliverySection.policy)
  }

  return fallbackGiftHamperDeliveryPolicy
}

export function resolveGiftHamperDeliveryPolicy(hamper: GiftHamper): DeliveryPolicy {
  const shouldUseCustomPolicy = hamper.deliverySection?.descriptionSource === 'custom' ||
    hamper.deliverySection?.policySource === 'custom'

  if (shouldUseCustomPolicy && hamper.deliverySection?.customPolicy) {
    return normalizeDeliveryPolicy(hamper.deliverySection.customPolicy)
  }

  return resolveGlobalGiftHamperDeliveryPolicy(hamper)
}

export function detectGiftHamperDeliveryPolicyMismatch(
  hamper: GiftHamper,
  policy: DeliveryPolicy
) {
  const description = resolveGiftHamperDeliveryDescription(hamper)
  const deliveryText = blocksToText(description)

  return detectDeliveryPolicyMismatch(deliveryText, policy)
}

export interface ResolvedGiftHamperDeliveryContent {
  title: string
  description: NonNullable<GiftHamper['description']>
  policy: DeliveryPolicy
  shouldEmitShippingDetails: boolean
  shippingDetailsOmissionReason?: string
  shippingDetailsVisibleClaims: DeliveryPolicyVisibleClaims
}

export function resolveGiftHamperDeliveryContent(
  hamper: GiftHamper
): ResolvedGiftHamperDeliveryContent {
  const resolvedPolicy = resolveGiftHamperDeliveryPolicy(hamper)
  const resolvedDescription = resolveGiftHamperDeliveryDescription(hamper)
  const resolvedDeliveryText = blocksToText(resolvedDescription)
  const mismatch = detectDeliveryPolicyMismatch(
    resolvedDeliveryText,
    resolvedPolicy
  )
  const visibleClaims = extractDeliveryPolicyVisibleClaims(resolvedDeliveryText)
  const shouldEmitShippingDetails = mismatch.shouldEmitShippingDetails
  const shippingDetailsOmissionReason = shouldEmitShippingDetails
    ? undefined
    : mismatch.reason

  return {
    title: resolveGiftHamperDeliveryTitle(hamper),
    description: resolvedDescription,
    policy: resolvedPolicy,
    shouldEmitShippingDetails,
    shippingDetailsOmissionReason,
    shippingDetailsVisibleClaims: visibleClaims
  }
}
