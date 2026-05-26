export const ORDER_TYPE_CUSTOM_CAKE = 'custom-cake' as const
export const ORDER_TYPE_CAKES_BY_POST = 'cakes-by-post' as const

export const CANONICAL_ORDER_TYPES = [
  ORDER_TYPE_CUSTOM_CAKE,
  ORDER_TYPE_CAKES_BY_POST
] as const

export type CanonicalOrderType = typeof CANONICAL_ORDER_TYPES[number]

export const LEGACY_CUSTOM_CAKE_ORDER_TYPES = [
  'browse-catalog',
  'browse our catalog',
  'custom-design',
  'custom design',
  'wedding-cake',
  'wedding cake',
  'custom-quote',
  'custom quote',
  'standard',
  'custom',
  'cake-standard-design',
  'cake standard design',
  'cake-individual-design',
  'cake individual design'
] as const

export const LEGACY_CAKES_BY_POST_ORDER_TYPES = [
  'gift-hamper',
  'gift hamper',
  'cakes by post'
] as const

const cakesByPostOrderTypes: ReadonlySet<string> = new Set([
  ORDER_TYPE_CAKES_BY_POST,
  ...LEGACY_CAKES_BY_POST_ORDER_TYPES
])

const cakesByPostProductTypes: ReadonlySet<string> = new Set([
  'gift-hamper',
  'hamper'
])

const postalDeliveryMethods: ReadonlySet<string> = new Set([
  'postal',
  'postal-delivery'
])

function normalizeToken(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function isCakesByPostOrderType(value: string | null | undefined): boolean {
  return cakesByPostOrderTypes.has(normalizeToken(value))
}

export function isCakesByPostProductType(value: string | null | undefined): boolean {
  return cakesByPostProductTypes.has(normalizeToken(value))
}

export function isPostalDeliveryMethod(value: string | null | undefined): boolean {
  return postalDeliveryMethods.has(normalizeToken(value))
}

export function isCakesByPostOrderLike(params: {
  orderType?: string | null
  productType?: string | null
  deliveryMethod?: string | null
  itemProductTypes?: ReadonlyArray<string | null | undefined>
}): boolean {
  return isCakesByPostOrderType(params.orderType) ||
    isCakesByPostProductType(params.productType) ||
    isPostalDeliveryMethod(params.deliveryMethod) ||
    (params.itemProductTypes ?? []).some(isCakesByPostProductType)
}

export function resolveCanonicalOrderType(params: {
  orderType?: string | null
  productType?: string | null
  deliveryMethod?: string | null
  itemProductTypes?: ReadonlyArray<string | null | undefined>
}): CanonicalOrderType {
  return isCakesByPostOrderLike(params)
    ? ORDER_TYPE_CAKES_BY_POST
    : ORDER_TYPE_CUSTOM_CAKE
}
