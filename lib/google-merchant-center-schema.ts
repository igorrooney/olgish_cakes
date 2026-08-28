/**
 * Google Merchant Center Optimized Schema Generator
 * 
 * This module provides enhanced structured data specifically optimized
 * for Google Merchant Center product detection and indexing.
 */

import { formatStructuredDataPrice } from "@/lib/utils/price-formatting";
import { urlFor } from "@/sanity/lib/image";

type MerchantAvailability =
  | 'BackOrder'
  | 'Discontinued'
  | 'InStock'
  | 'InStoreOnly'
  | 'LimitedAvailability'
  | 'OnlineOnly'
  | 'OutOfStock'
  | 'PreOrder'
  | 'SoldOut'

type MerchantItemCondition =
  | 'DamagedCondition'
  | 'NewCondition'
  | 'RefurbishedCondition'
  | 'UsedCondition'

export interface MerchantCenterProductData {
  name: string;
  description: string;
  url: string;
  image?: string;
  price?: number;
  currency: string;
  availability?: MerchantAvailability;
  brand: string;
  category: string;
  gtin?: string;
  mpn?: string;
  sku?: string;
  condition?: MerchantItemCondition;
  shipping?: {
    country: string;
    service: string;
    price: number;
  };
  additionalImages?: string[];
}

interface MerchantImageAssetRef {
  _ref?: string | null;
  url?: string;
}

interface MerchantImage {
  asset?: MerchantImageAssetRef;
  isMain?: boolean;
}

interface PortableTextChild {
  text?: string | null;
}

interface PortableTextBlock {
  children?: PortableTextChild[];
}

type PortableTextValue = PortableTextBlock[];

interface MerchantPricing {
  standard?: number;
  from?: number;
}

interface MerchantDesigns {
  standard?: MerchantImage[];
  individual?: MerchantImage[];
}

export interface MerchantCakeInput {
  _id?: string;
  name: string;
  slug: { current: string };
  pricing?: MerchantPricing;
  mainImage?: MerchantImage;
  designs?: MerchantDesigns;
  images?: MerchantImage[];
  shortDescription?: string | PortableTextValue;
  description?: string | PortableTextValue;
}

export interface MerchantHamperInput {
  _id: string;
  name: string;
  slug?: { current?: string };
  price?: number;
  pricing?: MerchantPricing;
  images?: MerchantImage[];
  shortDescription?: string | PortableTextValue;
  description?: string | PortableTextValue;
}

export interface MerchantSitemapProduct {
  slug: { current: string };
  _updatedAt?: string;
  _createdAt?: string;
}

export interface MerchantValidationProduct {
  _id?: string;
  name?: string;
  slug?: { current?: string };
  pricing?: MerchantPricing;
  price?: number;
  mainImage?: MerchantImage;
  designs?: MerchantDesigns;
  images?: MerchantImage[];
  shortDescription?: string | PortableTextValue;
  description?: string | PortableTextValue;
}

function portableTextToPlainText(blocks: PortableTextValue) {
  return blocks
    .map((block) => block.children?.map((child) => child.text || "").join("") || "")
    .join(" ");
}

function toPlainText(value: string | PortableTextValue | undefined) {
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    return portableTextToPlainText(value);
  }

  return value;
}

/**
 * Generate Google Merchant Center optimized Product schema
 */
export function generateMerchantCenterProductSchema(data: MerchantCenterProductData) {
  const baseUrl = "https://olgishcakes.co.uk";
  const hasPrice = typeof data.price === 'number' && Number.isFinite(data.price) && data.price > 0
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${data.url}#product`,
    
    // Core product information
    name: data.name,
    description: data.description,
    url: data.url,
    ...(data.image ? { image: [data.image, ...(data.additionalImages || [])] } : {}),
    
    // Brand and manufacturer
    brand: {
      "@type": "Brand",
      name: data.brand,
      url: baseUrl,
      logo: `${baseUrl}/images/olgish-cakes-logo-bakery-brand.png`,
    },
    
    manufacturer: {
      "@type": "Organization",
      name: data.brand,
      url: baseUrl,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Leeds",
        addressRegion: "West Yorkshire",
        addressCountry: "GB",
        postalCode: "LS17 6PR",
      },
    },
    
    // Product identifiers for better indexing
    ...(data.gtin && { gtin: data.gtin }),
    ...(data.mpn && { mpn: data.mpn }),
    ...(data.sku && { sku: data.sku }),
    
    // Category and classification
    category: data.category,
    
    ...(hasPrice ? { offers: {
      "@type": "Offer",
      "@id": `${data.url}#offer`,
      price: formatStructuredDataPrice(data.price, 0),
      priceCurrency: data.currency,
      ...(data.availability
        ? { availability: `https://schema.org/${data.availability}` }
        : {}),
      ...(data.condition
        ? { condition: `https://schema.org/${data.condition}` }
        : {}),
      
      // Seller information
      seller: {
        "@type": "Organization",
        name: data.brand,
        url: baseUrl,
      },
      
      // Shipping details are emitted only from an explicit trusted policy.
      ...(data.shipping ? { shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: data.shipping.price,
          currency: data.currency,
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: data.shipping.country,
        },
      } } : {}),
      
      // Return policy
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "GB",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
      
    } } : {}),
  };
}

/**
 * Generate enhanced structured data for cake products
 */
export function generateCakeMerchantCenterSchema(cake: MerchantCakeInput): ReturnType<typeof generateMerchantCenterProductSchema> {
  const baseUrl = "https://olgishcakes.co.uk";
  const productSlug = cake.slug.current.trim()

  if (!productSlug) {
    throw new Error('A real public slug is required for Merchant product structured data')
  }

  const productUrl = `${baseUrl}/cakes/${productSlug}`;
  
  // Get the best available image
  const mainImage = cake.mainImage?.asset?._ref 
    ? cake.mainImage 
    : cake.designs?.standard?.find((img: MerchantImage) => img.isMain && img.asset?._ref) ||
      cake.designs?.standard?.find((img: MerchantImage) => img.asset?._ref) ||
      cake.designs?.standard?.[0] ||
      cake.designs?.individual?.find((img: MerchantImage) => img.isMain && img.asset?._ref) ||
      cake.designs?.individual?.find((img: MerchantImage) => img.asset?._ref) ||
      cake.designs?.individual?.[0] ||
      // Fallback to images array (for legacy data like Honey Cake)
      cake.images?.find((img: MerchantImage) => img.asset?._ref) ||
      cake.images?.[0];
  
  const imageUrl = mainImage?.asset?._ref 
    ? urlFor(mainImage).width(800).height(800).url()
    : undefined;

  const price = cake.pricing?.standard ?? cake.pricing?.from;
  
  // Enhanced description
  const description = (
    toPlainText(cake.shortDescription) ||
    toPlainText(cake.description)
  ).trim();

  if (!description) {
    throw new Error('A real product description is required for Merchant product structured data')
  }

  return generateMerchantCenterProductSchema({
    name: cake.name,
    description: description,
    url: productUrl,
    image: imageUrl,
    price: price,
    currency: "GBP",
    brand: "Olgish Cakes",
    category: "Food & Drink > Bakery > Cakes",
  });
}

/**
 * Generate enhanced structured data for gift hamper products
 */
export function generateHamperMerchantCenterSchema(hamper: MerchantHamperInput): ReturnType<typeof generateMerchantCenterProductSchema> {
  const baseUrl = "https://olgishcakes.co.uk";
  const productSlug = hamper.slug?.current?.trim()

  if (!productSlug) {
    throw new Error('A real public slug is required for Merchant product structured data')
  }

  const productUrl = `${baseUrl}/cakes-by-post/${productSlug}`;
  
  const mainImage = hamper.images?.find((img: MerchantImage) => img.isMain && img.asset?._ref) || 
                   hamper.images?.find((img: MerchantImage) => img.asset?._ref) || 
                   hamper.images?.[0];
  
  const imageUrl = mainImage?.asset?._ref 
    ? urlFor(mainImage).width(800).height(800).url()
    : undefined;

  const price = hamper.price ?? hamper.pricing?.standard;
  
  // Enhanced description
  const description = (
    toPlainText(hamper.shortDescription) ||
    toPlainText(hamper.description)
  ).trim();

  if (!description) {
    throw new Error('A real product description is required for Merchant product structured data')
  }

  return generateMerchantCenterProductSchema({
    name: hamper.name,
    description: description,
    url: productUrl,
    image: imageUrl,
    price: price,
    currency: "GBP",
    brand: "Olgish Cakes",
    category: "Food & Drink > Gift Baskets > Food Gift Baskets",
  });
}

/**
 * Generate sitemap data for products
 */
export function generateProductSitemapData(products: MerchantSitemapProduct[]) {
  return products.map(product => ({
    url: `https://olgishcakes.co.uk/${product.slug.current}`,
    lastModified: product._updatedAt || product._createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
}

/**
 * Validate product data for Merchant Center compliance
 */
export function validateMerchantCenterProduct(product: MerchantValidationProduct): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!product._id) errors.push('Missing product ID');
  if (!product.name) errors.push('Missing product name');
  if (!product.slug?.current) errors.push('Missing product slug');
  if (!product.pricing?.standard && !product.price) warnings.push('Missing price information');
  
  // Image validation
  const hasMainImage = product.mainImage?.asset?._ref;
  const hasDesignImages = product.designs?.standard?.some((img: MerchantImage) => img.asset?._ref) ||
                         product.designs?.individual?.some((img: MerchantImage) => img.asset?._ref);
  const hasHamperImages = product.images?.some((img: MerchantImage) => img.asset?._ref);
  const hasLegacyImages = product.images?.some((img: MerchantImage) => img.asset?._ref);
  
  if (!hasMainImage && !hasDesignImages && !hasHamperImages && !hasLegacyImages) {
    errors.push('No product images found - this will cause Google Merchant Center validation failures');
  } else {
    // Check if images have valid asset references
    if (hasMainImage && !product.mainImage?.asset?._ref) {
      errors.push('Main image asset reference is invalid');
    }
    if (hasDesignImages) {
      const invalidDesignImages = product.designs?.standard?.filter((img: MerchantImage) => 
        img.asset?._ref === undefined || img.asset?._ref === null
      ) || [];
      if (invalidDesignImages.length > 0) {
        warnings.push(`${invalidDesignImages.length} design images have invalid asset references`);
      }
    }
    if (hasLegacyImages) {
      const invalidLegacyImages = product.images?.filter((img: MerchantImage) => 
        img.asset?._ref === undefined || img.asset?._ref === null
      ) || [];
      if (invalidLegacyImages.length > 0) {
        warnings.push(`${invalidLegacyImages.length} legacy images have invalid asset references`);
      }
    }
  }

  // Description validation
  const description = product.shortDescription || product.description;
  if (!description) {
    warnings.push('Missing product description');
  } else if (Array.isArray(description) && description.length === 0) {
    warnings.push('Empty product description');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
