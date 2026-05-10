/**
 * Merchant return policy for made-to-order and perishable cakes.
 * Standard returns are not offered, so JSON-LD must not claim a 14-day mail return.
 */

type SchemaType = string | string[]
type StructuredDataRecord = Record<string, unknown> & {
  '@graph'?: unknown
  '@type'?: SchemaType
  hasOfferCatalog?: unknown
  name?: unknown
  offers?: unknown
}
type OfferRecord = Record<string, unknown> & {
  '@type': 'Offer'
  hasMerchantReturnPolicy?: unknown
  itemOffered?: unknown
}
type ValidationResult = {
  isValid: boolean
  missingPolicies: string[]
  fixedData: StructuredDataRecord
}

export const STANDARD_MERCHANT_RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'GB',
  returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted'
} as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function hasSchemaType(value: unknown, schemaType: string): value is StructuredDataRecord {
  return isRecord(value) && value['@type'] === schemaType
}

function isOffer(value: unknown): value is OfferRecord {
  return hasSchemaType(value, 'Offer')
}

function getName(value: unknown, fallback = 'unnamed') {
  if (!isRecord(value)) {
    return fallback
  }

  return typeof value.name === 'string' && value.name.trim().length > 0
    ? value.name
    : fallback
}

/**
 * Ensures an offer object has the required hasMerchantReturnPolicy field
 * @param offer - The offer object to check and enhance
 * @returns The offer with hasMerchantReturnPolicy added if missing
 */
export function ensureMerchantReturnPolicy<T extends Record<string, unknown>>(offer: T): T | (T & {
  hasMerchantReturnPolicy: typeof STANDARD_MERCHANT_RETURN_POLICY
}) {
  if (!isOffer(offer)) {
    return offer
  }

  if (!offer.hasMerchantReturnPolicy) {
    return {
      ...offer,
      hasMerchantReturnPolicy: STANDARD_MERCHANT_RETURN_POLICY
    }
  }

  return offer
}

/**
 * Ensures all offers in an array have the required hasMerchantReturnPolicy field
 * @param offers - Array of offer objects
 * @returns Array of offers with hasMerchantReturnPolicy added where missing
 */
export function ensureAllOffersHaveReturnPolicy<T extends Record<string, unknown>>(offers: T[]) {
  return offers.map(offer => ensureMerchantReturnPolicy(offer))
}

/**
 * Validates that a structured data object has proper merchant return policies
 * @param structuredData - The structured data object to validate
 * @returns Object with validation results
 */
export function validateMerchantReturnPolicies(
  structuredData: StructuredDataRecord
): ValidationResult {
  const missingPolicies: string[] = []
  const fixedData: StructuredDataRecord = { ...structuredData }

  if (hasSchemaType(structuredData, 'Product') && isOffer(structuredData.offers)) {
    if (!structuredData.offers.hasMerchantReturnPolicy) {
      missingPolicies.push(`Product "${getName(structuredData)}" - main offer`)
      fixedData.offers = ensureMerchantReturnPolicy(structuredData.offers)
    }
  }

  const offerCatalog = isRecord(structuredData.hasOfferCatalog)
    ? structuredData.hasOfferCatalog
    : null
  const offerCatalogItems = isRecord(offerCatalog) && Array.isArray(offerCatalog.itemListElement)
    ? offerCatalog.itemListElement
    : null

  if (offerCatalogItems) {
    offerCatalogItems.forEach((item, index) => {
      if (isOffer(item) && !item.hasMerchantReturnPolicy) {
        missingPolicies.push(`OfferCatalog item ${index}: "${getName(item.itemOffered)}"`)
      }
    })

    fixedData.hasOfferCatalog = {
      ...offerCatalog,
      itemListElement: ensureAllOffersHaveReturnPolicy(
        offerCatalogItems.filter(isRecord)
      )
    }
  }

  if (Array.isArray(structuredData['@graph'])) {
    fixedData['@graph'] = structuredData['@graph'].map((item, index) => {
      if (hasSchemaType(item, 'Product') && isOffer(item.offers)) {
        if (!item.offers.hasMerchantReturnPolicy) {
          missingPolicies.push(`@graph Product ${index}: "${getName(item)}"`)
          return {
            ...item,
            offers: ensureMerchantReturnPolicy(item.offers)
          }
        }
      }

      return item
    })
  }

  return {
    isValid: missingPolicies.length === 0,
    missingPolicies,
    fixedData
  }
}
