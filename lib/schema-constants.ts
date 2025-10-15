/**
 * Constants for structured data schemas
 */

// Product schema generation
export const MAX_PRODUCTS_FOR_SCHEMA = 50; // Maximum number of products to generate schemas for

// Price validity
export const DEFAULT_PRICE_VALID_DAYS = 30;

// SKU generation
export const SKU_PREFIX = "OC";
export const MAX_SKU_NAME_LENGTH = 15;
export const SKU_PADDING_LENGTH = 3;

// Default nutrition values (per 100g serving)
export const DEFAULT_NUTRITION = {
  calories: "350 calories",
  fatContent: "15 grams",
  saturatedFatContent: "8 grams",
  carbohydrateContent: "40 grams",
  sugarContent: "25 grams",
  proteinContent: "6 grams",
  servingSize: "100g"
} as const;

// Business information
export const BUSINESS_INFO = {
  name: "Olgish Cakes",
  url: "https://olgishcakes.co.uk",
  logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
  addressLocality: "Leeds",
  addressRegion: "West Yorkshire",
  addressCountry: "GB"
} as const;

// Delivery settings
export const DELIVERY_SETTINGS = {
  deliveryLeadTimeDays: 1,
  handlingTimeMinDays: 0,
  handlingTimeMaxDays: 1,
  transitTimeMinDays: 1,
  transitTimeMaxDays: 3,
  shippingRate: 0
} as const;

// Return policy
export const RETURN_POLICY = {
  returnDays: 14,
  returnFees: "https://schema.org/FreeReturn",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  returnMethod: "https://schema.org/ReturnByMail"
} as const;

// Rating defaults
export const DEFAULT_RATING = {
  bestRating: "5",
  worstRating: "1",
  defaultValue: "5.0"
} as const;

// Fallback values
export const FALLBACK_PRICE = 25;
export const FALLBACK_IMAGE = "https://olgishcakes.co.uk/images/placeholder-cake.jpg";
export const MIN_REVIEW_COUNT_FOR_DISPLAY = 2;

