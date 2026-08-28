/**
 * Constants for structured data schemas
 */

// Product schema generation
// Limited to 30 for optimal performance - monitors should track if this needs adjustment
export const MAX_PRODUCTS_FOR_SCHEMA = 30; // Maximum number of products to generate schemas for

// Business information
export const BUSINESS_INFO = {
  name: "Olgish Cakes",
  url: "https://olgishcakes.co.uk",
  logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
  streetAddress: '15 Allerton Grange Avenue',
  postalCode: 'LS17 6PR',
  addressLocality: "Leeds",
  addressRegion: "West Yorkshire",
  addressCountry: "GB"
} as const;

// Brand structured data constants
export const BRAND_ID = "https://olgishcakes.co.uk/#brand";

// Brand entity for structured data (using @graph format)
// Using a function to ensure proper serialization in JSON-LD
export function getBrandEntity() {
  return {
    "@type": "Brand" as const,
    "@id": BRAND_ID,
    name: BUSINESS_INFO.name,
    url: BUSINESS_INFO.url,
    logo: BUSINESS_INFO.logo
  };
}

// Export as constant for direct use (spread when using)
export const BRAND_ENTITY = getBrandEntity();
