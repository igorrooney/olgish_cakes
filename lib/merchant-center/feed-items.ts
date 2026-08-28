import { blocksToText, type Cake, type CakeImage } from '@/types/cake'
import {
  isSupportedDeliveryMethod,
  type DeliveryPolicy
} from '@/types/deliveryPolicy'
import type { GiftHamper, GiftHamperImage } from '@/types/giftHamper'

interface MerchantImage {
  asset?: {
    _ref?: string
  }
}

type MerchantImageUrlBuilder = (image: MerchantImage) => string

const maximumMerchantTitleLength = 150
const maximumMerchantDescriptionLength = 5000

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getRequiredText(value: unknown, maximumLength: number) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length === 0 || trimmedValue.length > maximumLength) {
    return null
  }

  return trimmedValue
}

function getPositivePrice(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value
    }
  }

  return null
}

function getPortableTextDescription(
  shortDescription: Cake['shortDescription'] | GiftHamper['shortDescription'],
  description: Cake['description'] | GiftHamper['description']
) {
  const shortDescriptionText = Array.isArray(shortDescription)
    ? blocksToText(shortDescription).trim()
    : ''
  const descriptionText = Array.isArray(description)
    ? blocksToText(description).trim()
    : ''

  return getRequiredText(
    shortDescriptionText || descriptionText,
    maximumMerchantDescriptionLength
  )
}

function getCakeMainImage(cake: Cake): MerchantImage | null {
  if (cake.mainImage?.asset?._ref) {
    return cake.mainImage
  }

  return cake.designs?.standard?.find((image: CakeImage) => image.isMain && image.asset?._ref) ??
    cake.designs?.standard?.find((image: CakeImage) => image.asset?._ref) ??
    cake.designs?.individual?.find((image: CakeImage) => image.isMain && image.asset?._ref) ??
    cake.designs?.individual?.find((image: CakeImage) => image.asset?._ref) ??
    cake.images?.find((image: CakeImage) => image.asset?._ref) ??
    null
}

function getGiftHamperMainImage(hamper: GiftHamper): MerchantImage | null {
  return hamper.images?.find((image: GiftHamperImage) => image.isMain && image.asset?._ref) ??
    hamper.images?.find((image: GiftHamperImage) => image.asset?._ref) ??
    null
}

function getMerchantImageUrl(
  image: MerchantImage | null,
  buildImageUrl: MerchantImageUrlBuilder
) {
  if (!image?.asset?._ref) {
    return null
  }

  try {
    const imageUrl = buildImageUrl(image).trim()

    return imageUrl.length > 0
      ? imageUrl
      : null
  } catch {
    return null
  }
}

function getExplicitDeliveryPolicy(
  selectedPolicy: Partial<DeliveryPolicy> | undefined
): DeliveryPolicy | null {
  if (!selectedPolicy) {
    return null
  }

  const {
    dispatchMinDays,
    dispatchMaxDays,
    shippingFeeGbp,
    shippingDestinationCountry,
    deliveryMethod
  } = selectedPolicy
  const compactCountry = typeof shippingDestinationCountry === 'string'
    ? shippingDestinationCountry.trim().toUpperCase().replace(/[.\s]/g, '')
    : ''
  const normalizedCountry = compactCountry === 'GB' ||
    compactCountry === 'UK' ||
    compactCountry === 'UNITEDKINGDOM'
    ? 'GB'
    : ''
  const normalizedDeliveryMethod = typeof deliveryMethod === 'string'
    ? deliveryMethod.trim()
    : ''
  const hasValidDispatchRange = Number.isInteger(dispatchMinDays) &&
    Number.isInteger(dispatchMaxDays) &&
    typeof dispatchMinDays === 'number' &&
    typeof dispatchMaxDays === 'number' &&
    dispatchMinDays >= 0 &&
    dispatchMaxDays >= dispatchMinDays
  const hasValidShippingFee = typeof shippingFeeGbp === 'number' &&
    Number.isFinite(shippingFeeGbp) &&
    shippingFeeGbp >= 0

  if (
    !hasValidDispatchRange ||
    !hasValidShippingFee ||
    normalizedCountry !== 'GB' ||
    !isSupportedDeliveryMethod(normalizedDeliveryMethod)
  ) {
    return null
  }

  return {
    dispatchMinDays,
    dispatchMaxDays,
    shippingFeeGbp,
    shippingDestinationCountry: normalizedCountry,
    deliveryMethod: normalizedDeliveryMethod
  }
}

function resolveCakeMerchantDeliveryPolicy(cake: Cake) {
  const customPolicySelected = cake.deliverySection?.descriptionSource === 'custom' ||
    cake.deliverySection?.policySource === 'custom'

  if (customPolicySelected) {
    return getExplicitDeliveryPolicy(cake.deliverySection?.customPolicy)
  }

  return getExplicitDeliveryPolicy(cake.cakesDeliverySection?.policy)
}

function resolveGiftHamperMerchantDeliveryPolicy(hamper: GiftHamper) {
  const customPolicySelected = hamper.deliverySection?.descriptionSource === 'custom' ||
    hamper.deliverySection?.policySource === 'custom'

  if (customPolicySelected) {
    return getExplicitDeliveryPolicy(hamper.deliverySection?.customPolicy)
  }

  return getExplicitDeliveryPolicy(hamper.giftHampersDeliverySection?.policy)
}

function renderShipping(policy: DeliveryPolicy | null) {
  if (!policy) {
    return ''
  }

  return `
      <g:shipping>
        <g:country>${escapeXml(policy.shippingDestinationCountry)}</g:country>
        <g:price>${policy.shippingFeeGbp.toFixed(2)} GBP</g:price>
        <g:min_handling_time>${policy.dispatchMinDays}</g:min_handling_time>
        <g:max_handling_time>${policy.dispatchMaxDays}</g:max_handling_time>
      </g:shipping>`
}

export function generateCakeMerchantItem(
  cake: Cake,
  baseUrl: string,
  buildImageUrl: MerchantImageUrlBuilder
): string | null {
  const id = getRequiredText(cake._id, 200)
  const title = getRequiredText(cake.name, maximumMerchantTitleLength)
  const slug = getRequiredText(cake.slug?.current, 200)
  const description = getPortableTextDescription(cake.shortDescription, cake.description)
  const price = getPositivePrice(cake.pricing?.standard, cake.pricing?.individual)
  const imageUrl = getMerchantImageUrl(getCakeMainImage(cake), buildImageUrl)

  if (!id || !title || !slug || !description || !price || !imageUrl) {
    return null
  }

  const productUrl = `${baseUrl}/cakes/${encodeURIComponent(slug)}`
  const shipping = renderShipping(resolveCakeMerchantDeliveryPolicy(cake))

  return `
    <item>
      <g:id>cake_${escapeXml(id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:price>${price.toFixed(2)} GBP</g:price>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Olgish Cakes</g:brand>
      <g:product_type>Food &amp; Drink &gt; Bakery &gt; Cakes</g:product_type>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Food Items &gt; Baked Goods</g:google_product_category>${shipping}
    </item>`
}

export function generateGiftHamperMerchantItem(
  hamper: GiftHamper,
  baseUrl: string,
  buildImageUrl: MerchantImageUrlBuilder
): string | null {
  const id = getRequiredText(hamper._id, 200)
  const title = getRequiredText(hamper.name, maximumMerchantTitleLength)
  const slug = getRequiredText(hamper.slug?.current, 200)
  const description = getPortableTextDescription(hamper.shortDescription, hamper.description)
  const price = getPositivePrice(hamper.price)
  const imageUrl = getMerchantImageUrl(getGiftHamperMainImage(hamper), buildImageUrl)

  if (!id || !title || !slug || !description || !price || !imageUrl) {
    return null
  }

  const productUrl = `${baseUrl}/cakes-by-post/${encodeURIComponent(slug)}`
  const shipping = renderShipping(resolveGiftHamperMerchantDeliveryPolicy(hamper))

  return `
    <item>
      <g:id>hamper_${escapeXml(id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:price>${price.toFixed(2)} GBP</g:price>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Olgish Cakes</g:brand>
      <g:product_type>Food &amp; Drink &gt; Gift Baskets &gt; Food Gift Baskets</g:product_type>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Food Items &gt; Gift Baskets</g:google_product_category>${shipping}
    </item>`
}
