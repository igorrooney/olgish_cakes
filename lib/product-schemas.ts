import { getPriceValidUntil } from "@/app/utils/seo";
import { DEFAULT_REVIEWS } from "./structured-data-defaults";
import { blocksToText } from "@/types/cake";
import { Product, WithContext } from "schema-dts";
import {
  SKU_PREFIX,
  MAX_SKU_NAME_LENGTH,
  SKU_PADDING_LENGTH,
  DEFAULT_NUTRITION,
  BUSINESS_INFO,
  DELIVERY_SETTINGS,
  RETURN_POLICY,
  DEFAULT_RATING,
  FALLBACK_PRICE,
  FALLBACK_IMAGE,
  MIN_REVIEW_COUNT_FOR_DISPLAY,
  DEFAULT_PRICE_VALID_DAYS
} from "./schema-constants";

export interface TestimonialStats {
  count: number;
  averageRating: number;
}

export interface Cake {
  _id: string;
  name: string;
  slug?: { current: string };
  pricing?: { standard?: number };
  allergens?: string[];
  ingredients?: string[];
  mainImage?: {
    asset?: { url: string };
  };
  description?: any;
}

/**
 * Generate a unique SKU for a product
 * @throws {Error} If name is empty or invalid
 */
export function generateSKU(name: string, index: number): string {
  if (!name || typeof name !== 'string') {
    throw new Error('Product name is required for SKU generation');
  }
  
  if (index < 0) {
    throw new Error('Index must be a positive number');
  }

  const cleanName = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, MAX_SKU_NAME_LENGTH);
  
  return `${SKU_PREFIX}-${cleanName}-${String(index + 1).padStart(SKU_PADDING_LENGTH, '0')}`;
}

export function generateProductSchema(cake: Cake, index: number, testimonialStats: TestimonialStats): WithContext<Product> {
  const cakeSlug = cake.slug?.current || '';
  const cakeName = cake.name || 'Cake';
  const cakePrice = cake.pricing?.standard || FALLBACK_PRICE;
  const cakeAllergens = cake.allergens || [];
  const cakeIngredients = cake.ingredients || [];
  const cakeImage = cake.mainImage?.asset?.url || '';
  const cakeDescription = cake.description
    ? (typeof cake.description === 'string' ? cake.description : blocksToText(cake.description))
    : `Delicious ${cakeName} handmade with authentic recipes in ${BUSINESS_INFO.addressLocality}.`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${BUSINESS_INFO.url}/order#${cakeSlug}`,
    name: cakeName,
    description: cakeDescription,
    sku: generateSKU(cakeName, index),
    mpn: `${cakeName.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-${cakePrice}`,
    brand: {
      "@type": "Brand",
      name: BUSINESS_INFO.name,
      url: BUSINESS_INFO.url,
      logo: BUSINESS_INFO.logo
    },
    manufacturer: {
      "@type": "Organization",
      name: BUSINESS_INFO.name,
      url: BUSINESS_INFO.url,
      address: {
        "@type": "PostalAddress",
        addressLocality: BUSINESS_INFO.addressLocality,
        addressRegion: BUSINESS_INFO.addressRegion,
        addressCountry: BUSINESS_INFO.addressCountry
      }
    },
    category: "Food & Drink > Bakery > Cakes",
    image: [cakeImage || FALLBACK_IMAGE],
    additionalProperty: [
      ...(cakeAllergens.length > 0 ? [{
        "@type": "PropertyValue",
        name: "Allergens",
        value: cakeAllergens.join(", ")
      }] : []),
      ...(cakeIngredients.length > 0 ? [{
        "@type": "PropertyValue",
        name: "Main Ingredients",
        value: cakeIngredients.join(", ")
      }] : [])
    ],
    containsAllergens: cakeAllergens.length > 0 ? cakeAllergens : undefined,
    nutrition: {
      "@type": "NutritionInformation",
      calories: DEFAULT_NUTRITION.calories,
      fatContent: DEFAULT_NUTRITION.fatContent,
      saturatedFatContent: DEFAULT_NUTRITION.saturatedFatContent,
      carbohydrateContent: DEFAULT_NUTRITION.carbohydrateContent,
      sugarContent: DEFAULT_NUTRITION.sugarContent,
      proteinContent: DEFAULT_NUTRITION.proteinContent,
      servingSize: DEFAULT_NUTRITION.servingSize
    },
    offers: {
      "@type": "Offer",
      "@id": `${BUSINESS_INFO.url}/order#${cakeSlug}-offer`,
      price: cakePrice.toString(),
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      priceValidUntil: getPriceValidUntil(DEFAULT_PRICE_VALID_DAYS),
      url: `${BUSINESS_INFO.url}/order`,
      seller: {
        "@type": "Organization",
        name: BUSINESS_INFO.name,
        url: BUSINESS_INFO.url
      },
      areaServed: {
        "@type": "City",
        name: BUSINESS_INFO.addressLocality
      },
      deliveryLeadTime: {
        "@type": "QuantitativeValue",
        value: DELIVERY_SETTINGS.deliveryLeadTimeDays.toString(),
        unitCode: "DAY"
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: DELIVERY_SETTINGS.shippingRate,
          currency: "GBP",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: BUSINESS_INFO.addressCountry,
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: DELIVERY_SETTINGS.handlingTimeMinDays,
            maxValue: DELIVERY_SETTINGS.handlingTimeMaxDays,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: DELIVERY_SETTINGS.transitTimeMinDays,
            maxValue: DELIVERY_SETTINGS.transitTimeMaxDays,
            unitCode: "DAY",
          },
        },
        appliesToDeliveryMethod: "https://purl.org/goodrelations/v1#DeliveryModeMail",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: BUSINESS_INFO.addressCountry,
        returnFees: RETURN_POLICY.returnFees,
        returnPolicyCategory: RETURN_POLICY.returnPolicyCategory,
        merchantReturnDays: RETURN_POLICY.returnDays,
        returnMethod: RETURN_POLICY.returnMethod,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: testimonialStats.averageRating.toFixed(1),
      reviewCount: testimonialStats.count > 0 ? testimonialStats.count.toString() : MIN_REVIEW_COUNT_FOR_DISPLAY.toString(),
      bestRating: DEFAULT_RATING.bestRating,
      worstRating: DEFAULT_RATING.worstRating,
    },
    review: DEFAULT_REVIEWS,
  } as WithContext<Product>;
}

/**
 * Generate product schemas for all cakes
 * @param cakes Array of cake objects from Sanity
 * @param testimonialStats Testimonial statistics for aggregate rating
 * @returns Array of product schemas with context
 */
export function generateAllProductSchemas(cakes: Cake[], testimonialStats: TestimonialStats): WithContext<Product>[] {
  return cakes
    .filter(cake => cake && cake.name) // Filter out invalid entries
    .map((cake: Cake, index: number) => {
      try {
        return generateProductSchema(cake, index, testimonialStats);
      } catch (error) {
        console.error(`Error generating schema for cake ${cake.name}:`, error);
        // Return null for failed schemas and filter them out later
        return null;
      }
    })
    .filter((schema): schema is WithContext<Product> => schema !== null);
}
