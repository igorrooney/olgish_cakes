import { blocksToText } from "@/types/cake";
import { Product, WithContext } from "schema-dts";
import { BUSINESS_INFO } from "./schema-constants";
import { batchValidateProductSchemas } from "./schema-validation";
import { formatStructuredDataPrice } from "./utils/price-formatting";

type RichTextBlocks = Parameters<typeof blocksToText>[0];

export interface TestimonialStats {
  count: number;
  averageRating: number;
}

export interface Cake {
  _id: string;
  name: string;
  slug?: { current: string };
  pricing?: { standard?: number };
  sku?: string;
  mpn?: string;
  allergens?: string[];
  ingredients?: string[];
  mainImage?: {
    asset?: { url: string };
  };
  description?: RichTextBlocks;
}

/**
 * Generate Schema.org Product structured data for a single cake
 * @param cake - Cake object from Sanity CMS
 * @param index - Index for SKU generation
 * @param testimonialStats - Aggregated testimonial statistics
 * @returns Schema.org Product structured data with full context
 * @example
 * const schema = generateProductSchema(cake, 0, { count: 0, averageRating: 0 });
 */
export function generateProductSchema(cake: Cake, _index: number, _testimonialStats: TestimonialStats): WithContext<Product> {
  const cakeSlug = cake.slug?.current?.trim() || '';
  const cakeName = cake.name?.trim() || '';
  const cakePrice = cake.pricing?.standard;
  const cakeAllergens = cake.allergens || [];
  const cakeIngredients = cake.ingredients || [];
  const cakeImage = cake.mainImage?.asset?.url || '';
  const cakeDescription = cake.description
    ? (typeof cake.description === 'string' ? cake.description : blocksToText(cake.description))
    : '';

  if (!cakeName || !cakeSlug) {
    throw new Error('A real product name and slug are required for Product structured data')
  }

  if (!cakeDescription.trim()) {
    throw new Error('A real product description is required for Product structured data')
  }

  if (typeof cakePrice !== 'number' || !Number.isFinite(cakePrice) || cakePrice <= 0) {
    throw new Error('A real positive product price is required for Product offers')
  }

  if (!cakeImage) {
    throw new Error('A real product image is required for Product structured data')
  }

  const additionalProperty = [
    ...(cakeAllergens.length > 0 ? [{
      "@type": "PropertyValue" as const,
      name: "Allergens",
      value: cakeAllergens.join(", ")
    }] : []),
    ...(cakeIngredients.length > 0 ? [{
      "@type": "PropertyValue" as const,
      name: "Main Ingredients",
      value: cakeIngredients.join(", ")
    }] : [])
  ]
  const productUrl = `${BUSINESS_INFO.url}/cakes/${cakeSlug}`

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: cakeName,
    description: cakeDescription,
    ...(cake.sku ? { sku: cake.sku } : {}),
    ...(cake.mpn ? { mpn: cake.mpn } : {}),
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
    image: [cakeImage],
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
    ...(cakeAllergens.length > 0 ? { containsAllergens: cakeAllergens } : {}),
    offers: {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      price: formatStructuredDataPrice(cakePrice, 0),
      priceCurrency: "GBP",
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: BUSINESS_INFO.name,
        url: BUSINESS_INFO.url
      },
    }
  } as WithContext<Product>;
}

/**
 * Generate Schema.org Product structured data for all cakes with error handling
 * @param cakes - Array of cake objects from Sanity CMS
 * @param testimonialStats - Aggregated testimonial statistics (count and averageRating)
 * @returns Array of Schema.org Product structured data with fallbacks for failed schemas
 * @example
 * const schemas = generateAllProductSchemas(cakes, { count: 0, averageRating: 0 });
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

  const failedSchemaReferences: string[] = [];

  const schemas = validCakes
    .map((cake: Cake, index: number) => {
      try {
        return generateProductSchema(cake, index, testimonialStats);
      } catch (error) {
        void error
        failedSchemaReferences.push(cake._id);
        console.error('[Product Schemas] Schema generation failed', {
          operation: 'generate_product_schema',
          code: 'SCHEMA_GENERATION_FAILED',
          recordReference: cake._id
        });

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
        failedSchemaReferences: failedSchemaReferences.slice(0, 5),
      });
    } else {
      console.warn(summaryMessage);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[Product Schemas] Successfully generated ${schemas.length} product schemas in ${duration.toFixed(2)}ms`);

    // Validate all generated schemas in development
    batchValidateProductSchemas(schemas);
  }

  return schemas;
}
