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
import { batchValidateProductSchemas } from "./schema-validation";

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
 * Generate a unique SKU for a product with fallback handling
 * @param name - Product name to generate SKU from
 * @param index - Product index for uniqueness
 * @returns Formatted SKU string (e.g., "OC-HONEY-CAKE-001")
 * @example
 * generateSKU("Honey Cake", 0) // Returns "OC-HONEY-CAKE-001"
 */
export function generateSKU(name: string, index: number): string {
  // Validate inputs with fallbacks instead of throwing errors
  const safeName = (name && typeof name === 'string') ? name : 'PRODUCT';
  const safeIndex = (index >= 0) ? index : 0;

  const cleanName = safeName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, MAX_SKU_NAME_LENGTH);
  
  return `${SKU_PREFIX}-${cleanName}-${String(safeIndex + 1).padStart(SKU_PADDING_LENGTH, '0')}`;
}

/**
 * Generate Schema.org Product structured data for a single cake
 * @param cake - Cake object from Sanity CMS
 * @param index - Index for SKU generation
 * @param testimonialStats - Aggregated testimonial statistics
 * @returns Schema.org Product structured data with full context
 * @example
 * const schema = generateProductSchema(cake, 0, { count: 16, averageRating: 4.8 });
 */
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

  const sku = generateSKU(cakeName, index);
  // Generate truly unique MPN by combining slug, price, and SKU suffix
  // Use fallback to avoid malformed MPNs when slug is empty
  const cleanSlug = cakeSlug || 'PRODUCT';
  const mpn = `${cleanSlug.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-${cakePrice}-${sku.split('-').pop()}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${BUSINESS_INFO.url}/order#${cakeSlug}`,
    name: cakeName,
    description: cakeDescription,
    sku,
    mpn,
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
 * Generate Schema.org Product structured data for all cakes with error handling
 * @param cakes - Array of cake objects from Sanity CMS
 * @param testimonialStats - Aggregated testimonial statistics (count and averageRating)
 * @returns Array of Schema.org Product structured data with fallbacks for failed schemas
 * @example
 * const schemas = generateAllProductSchemas(cakes, { count: 16, averageRating: 4.8 });
 */
export function generateAllProductSchemas(cakes: Cake[], testimonialStats: TestimonialStats): WithContext<Product>[] {
  const startTime = performance.now();
  const validCakes = cakes.filter(cake => cake && cake.name);
  const invalidCount = cakes.length - validCakes.length;
  
  // Log invalid cakes in all environments for monitoring
  if (invalidCount > 0) {
    const logMessage = `[Product Schemas] Filtered out ${invalidCount} invalid cake(s) without names`;
    if (process.env.NODE_ENV === 'production') {
      // In production, log to console for server-side monitoring (e.g., Vercel logs, Sentry)
      console.warn(logMessage, { invalidCount, totalCakes: cakes.length });
    } else {
      console.warn(logMessage);
    }
  }

  const failedSchemas: Array<{ cakeId: string; cakeName: string; error: string }> = [];

  const schemas = validCakes
    .map((cake: Cake, index: number) => {
      try {
        return generateProductSchema(cake, index, testimonialStats);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorDetails = {
          cakeId: cake._id,
          cakeName: cake.name || 'Unknown',
          error: errorMessage,
        };
        
        failedSchemas.push(errorDetails);
        
        // Always log errors in production for monitoring
        if (process.env.NODE_ENV === 'production') {
          // Production: Log structured error for monitoring tools
          console.error('[Product Schemas] Schema generation failed', {
            ...errorDetails,
            timestamp: new Date().toISOString(),
            environment: 'production',
          });
        } else {
          // Development: Log detailed error with full context
          console.error(
            `[Product Schemas] Failed to generate schema for cake "${cake.name}" (ID: ${cake._id}):`,
            errorMessage,
            { cake, error }
          );
        }
        
        // Return null for failed schemas and filter them out later
        return null;
      }
    })
    .filter((schema): schema is WithContext<Product> => schema !== null);

  const failedCount = validCakes.length - schemas.length;
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Log summary in all environments
  if (failedCount > 0) {
    const summaryMessage = `[Product Schemas] ${failedCount} schema(s) failed to generate`;
    if (process.env.NODE_ENV === 'production') {
      console.error(summaryMessage, {
        failedCount,
        totalValid: validCakes.length,
        successCount: schemas.length,
        duration: `${duration.toFixed(2)}ms`,
        failedSchemas: failedSchemas.slice(0, 5), // Limit to first 5 to avoid log bloat
      });
    } else {
      console.warn(summaryMessage);
    }
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Product Schemas] Successfully generated ${schemas.length} product schemas in ${duration.toFixed(2)}ms`);
    
    // Validate all generated schemas in development
    batchValidateProductSchemas(schemas);
  }

  return schemas;
}
