/**
 * Utility functions for price formatting in structured data
 * Ensures prices are always numeric for Google Merchant Center compliance
 */

/**
 * Converts a price value to a number for structured data
 * Handles various input formats and ensures numeric output
 *
 * @param price - Price value (number, string, or undefined)
 * @param defaultValue - Default value if price cannot be parsed (default: 0)
 * @returns Numeric price value
 *
 * @example
 * ```ts
 * formatStructuredDataPrice(25) // 25
 * formatStructuredDataPrice("25") // 25
 * formatStructuredDataPrice("From £25") // 25
 * formatStructuredDataPrice("£25.99") // 25.99
 * formatStructuredDataPrice(undefined, 25) // 25
 * ```
 */
export function formatStructuredDataPrice(
    price: number | string | undefined,
    defaultValue: number = 0
): number {
    // If already a number, validate and return
    if (typeof price === 'number') {
        if (Number.isFinite(price) && !Number.isNaN(price) && price >= 0) {
            return price
        }
        return defaultValue
    }

    // If undefined or null, return default
    if (price === undefined || price === null) {
        return defaultValue
    }

    // If string, extract numeric value
    if (typeof price === 'string') {
        // Replace "Free" with 0 first
        let cleaned = price.replace(/free/gi, '0')
        
        // Remove currency symbols
        cleaned = cleaned.replace(/[£$€]/g, '')
        
        // Remove common prefixes
        cleaned = cleaned
            .replace(/from\s+/gi, '')
            .replace(/starting\s+at\s+/gi, '')
            .replace(/price:?\s*/gi, '')
            .trim()

        // Try to parse as-is first (handles scientific notation like "1e2")
        let parsed = parseFloat(cleaned)
        
        // If parseFloat fails or returns NaN, try removing non-numeric chars except decimal, e/E, +/-
        if (Number.isNaN(parsed)) {
            const numericOnly = cleaned.replace(/[^\d.eE+-]/g, '')
            parsed = parseFloat(numericOnly)
        }

        // Validate parsed result
        if (Number.isFinite(parsed) && !Number.isNaN(parsed) && parsed >= 0) {
            return parsed
        }
    }

    return defaultValue
}

/**
 * Creates a display price string from a numeric price
 * Used for UI display while keeping structured data numeric
 *
 * @param price - Numeric price value
 * @param prefix - Optional prefix (e.g., "From")
 * @returns Formatted display price string
 *
 * @example
 * ```ts
 * formatDisplayPrice(25) // "£25"
 * formatDisplayPrice(25, "From") // "From £25"
 * formatDisplayPrice(25.99) // "£25.99"
 * ```
 */
export function formatDisplayPrice(price: number, prefix?: string): string {
    const formatted = `£${price.toFixed(price % 1 === 0 ? 0 : 2)}`
    return prefix ? `${prefix} ${formatted}` : formatted
}

/**
 * Extracts numeric price from a display price string
 * Useful when you have "From £25" but need the numeric value for structured data
 *
 * @param displayPrice - Display price string (e.g., "From £25")
 * @returns Numeric price value
 *
 * @example
 * ```ts
 * extractNumericPrice("From £25") // 25
 * extractNumericPrice("£30.99") // 30.99
 * extractNumericPrice("Free") // 0
 * ```
 */
export function extractNumericPrice(displayPrice: string): number {
    return formatStructuredDataPrice(displayPrice, 0)
}

/**
 * Type-safe price object for components that need both display and structured data formats
 */
export interface PriceData {
    /** Display price for UI (e.g., "From £25") */
    displayPrice: string
    /** Numeric price for structured data (e.g., 25) */
    numericPrice: number
}

/**
 * Creates a PriceData object from a display price string
 * Extracts numeric value automatically
 *
 * @param displayPrice - Display price string
 * @param prefix - Optional prefix for display price
 * @returns PriceData object with both formats
 *
 * @example
 * ```ts
 * createPriceData("25") // { displayPrice: "£25", numericPrice: 25 }
 * createPriceData("25", "From") // { displayPrice: "From £25", numericPrice: 25 }
 * ```
 */
export function createPriceData(price: number | string, prefix?: string): PriceData {
    const numericPrice = typeof price === 'number' ? price : extractNumericPrice(price)
    const displayPrice = formatDisplayPrice(numericPrice, prefix)
    return {
        displayPrice,
        numericPrice,
    }
}

