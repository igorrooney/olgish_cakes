import {
  detectDeliveryPolicyMismatch,
  extractDeliveryPolicyVisibleClaims,
  getDeliveryCountryLabel,
  normalizeDeliveryPolicy,
  type DeliveryPolicyVisibleClaims
} from '@/app/utils/delivery-policy'
import { blocksToText, type Cake } from '@/types/cake'
import { defaultDeliveryPolicy, type DeliveryPolicy } from '@/types/deliveryPolicy'

export const defaultCakeDeliveryTitle = 'Delivery'
export const fallbackCakeDeliveryPolicy: DeliveryPolicy = {
  ...defaultDeliveryPolicy
}

export const fallbackCakeDeliveryDescription: NonNullable<Cake['description']> = [
  {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'We usually prepare cake orders within 2-3 working days.'
      }
    ]
  },
  {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'Free UK delivery is included. If you need a specific delivery day, please include it in your order request.'
      }
    ]
  }
]

function formatPolicyFee(fee: number) {
  return Number.isInteger(fee)
    ? String(fee)
    : fee.toFixed(2)
}

export function getCakeDeliveryFallbackKeyPoint(policy: DeliveryPolicy) {
  const countryLabel = getDeliveryCountryLabel(policy.shippingDestinationCountry)

  return policy.shippingFeeGbp === 0
    ? `Free ${countryLabel} delivery`
    : `${countryLabel} delivery from \u00A3${formatPolicyFee(policy.shippingFeeGbp)}`
}

function hasPortableTextContent(
  value: Cake['description'] | Cake['shortDescription'] | undefined
): value is NonNullable<Cake['description']> {
  return Array.isArray(value) && value.length > 0 && blocksToText(value).trim().length > 0
}

export function resolveCakeDeliveryTitle(cake: Cake): string {
  const globalTitle = cake.cakesDeliverySection?.name

  if (typeof globalTitle === 'string' && globalTitle.trim().length > 0) {
    return globalTitle.trim()
  }

  return defaultCakeDeliveryTitle
}

export function resolveCakeDeliveryDescription(cake: Cake): NonNullable<Cake['description']> {
  const shouldUseCustomDescription = cake.deliverySection?.descriptionSource === 'custom'

  if (shouldUseCustomDescription && hasPortableTextContent(cake.deliverySection?.customDescription)) {
    return cake.deliverySection.customDescription
  }

  if (hasPortableTextContent(cake.cakesDeliverySection?.description)) {
    return cake.cakesDeliverySection.description
  }

  return fallbackCakeDeliveryDescription
}

function resolveGlobalCakeDeliveryPolicy(cake: Cake) {
  if (cake.cakesDeliverySection?.policy) {
    return normalizeDeliveryPolicy(cake.cakesDeliverySection.policy)
  }

  return fallbackCakeDeliveryPolicy
}

export function resolveCakeDeliveryPolicy(cake: Cake): DeliveryPolicy {
  const shouldUseCustomPolicy = cake.deliverySection?.policySource === 'custom'

  if (shouldUseCustomPolicy && cake.deliverySection?.customPolicy) {
    return normalizeDeliveryPolicy(cake.deliverySection.customPolicy)
  }

  return resolveGlobalCakeDeliveryPolicy(cake)
}

export function detectCakeDeliveryPolicyMismatch(cake: Cake, policy: DeliveryPolicy) {
  const description = resolveCakeDeliveryDescription(cake)
  const deliveryText = blocksToText(description)

  return detectDeliveryPolicyMismatch(deliveryText, policy)
}

export interface ResolvedCakeDeliveryContent {
  title: string
  description: NonNullable<Cake['description']>
  policy: DeliveryPolicy
  shouldEmitShippingDetails: boolean
  shippingDetailsOmissionReason?: string
  shippingDetailsVisibleClaims: DeliveryPolicyVisibleClaims
}

export function resolveCakeDeliveryContent(cake: Cake): ResolvedCakeDeliveryContent {
  const resolvedPolicy = resolveCakeDeliveryPolicy(cake)
  const resolvedDescription = resolveCakeDeliveryDescription(cake)
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
    title: resolveCakeDeliveryTitle(cake),
    description: resolvedDescription,
    policy: resolvedPolicy,
    shouldEmitShippingDetails,
    shippingDetailsOmissionReason,
    shippingDetailsVisibleClaims: visibleClaims
  }
}
