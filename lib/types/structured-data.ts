/**
 * TypeScript types for Schema.org structured data
 * Ensures type safety and prevents string prices in offers
 */

import type { Product } from 'schema-dts'

/**
 * Base offer structure with numeric price requirement
 * This type enforces that price must be a number, not a string
 * Compatible with schema-dts Offer but with stricter price typing
 */
export interface StructuredDataOffer {
    '@type': 'Offer'
    /**
     * Price MUST be a number for Google Merchant Center compliance
     * String prices will cause "Invalid floating point number" errors
     */
    price: number
    priceCurrency: 'GBP' | 'USD' | 'EUR'
    availability?: string | 'https://schema.org/InStock' | 'https://schema.org/OutOfStock' | 'https://schema.org/PreOrder'
    priceValidUntil?: string
    url?: string
    seller?: {
        '@type': 'Organization'
        name: string
        url?: string
    }
    areaServed?: {
        '@type': 'City' | 'Place'
        name: string
    }
    deliveryLeadTime?: {
        '@type': 'QuantitativeValue'
        value: string | number
        unitCode: string
    }
    shippingDetails?: {
        '@type': 'OfferShippingDetails'
        shippingRate?: {
            '@type': 'MonetaryAmount'
            value: string | number
            currency: string
        }
        shippingDestination?: {
            '@type': 'DefinedRegion'
            addressCountry: string
            addressRegion?: string | string[]
        }
        deliveryTime?: {
            '@type': 'ShippingDeliveryTime'
            handlingTime?: {
                '@type': 'QuantitativeValue'
                minValue: number
                maxValue: number
                unitCode: string
            }
            transitTime?: {
                '@type': 'QuantitativeValue'
                minValue: number
                maxValue: number
                unitCode: string
            }
        }
        appliesToDeliveryMethod?: string
    }
    hasMerchantReturnPolicy?: {
        '@type': 'MerchantReturnPolicy'
        applicableCountry: string
        returnPolicyCategory: string
        merchantReturnDays?: number
        returnMethod?: string
        returnFees?: string
    }
}

/**
 * Product with structured data offer
 * Ensures price is numeric in offers
 */
export interface StructuredDataProduct extends Omit<Product, 'offers'> {
    '@type': 'Product'
    offers: StructuredDataOffer | StructuredDataOffer[]
}

/**
 * Helper type for ItemList with products
 */
export interface StructuredDataItemList {
    '@context': 'https://schema.org'
    '@type': 'ItemList'
    name: string
    description?: string
    url: string
    itemListElement: Array<{
        '@type': 'ListItem'
        position: number
        item: StructuredDataProduct
    }>
}

/**
 * Type guard to check if price is numeric
 */
export function isNumericPrice(price: unknown): price is number {
    return typeof price === 'number' && Number.isFinite(price) && !Number.isNaN(price)
}

/**
 * Type guard to validate structured data offer
 */
export function isValidStructuredDataOffer(offer: unknown): offer is StructuredDataOffer {
    if (typeof offer !== 'object' || offer === null) return false
    const o = offer as Record<string, unknown>
    return (
        o['@type'] === 'Offer' &&
        isNumericPrice(o.price) &&
        typeof o.priceCurrency === 'string'
    )
}

