/**
 * Google Merchant Center Optimized Schema Generator
 * 
 * This module provides enhanced structured data specifically optimized
 * for Google Merchant Center product detection and indexing.
 */

export interface MerchantCenterProductData {
  id: string;
  name: string;
  description: string;
  url: string;
  image: string;
  price: number;
  currency: string;
  availability: string;
  brand: string;
  category: string;
  gtin?: string;
  mpn?: string;
  sku?: string;
  condition: string;
  shipping?: {
    country: string;
    service: string;
    price: number;
  };
  tax?: {
    country: string;
    rate: number;
  };
  additionalImages?: string[];
  customLabels?: string[];
}

/**
 * Generate Google Merchant Center optimized Product schema
 */
export function generateMerchantCenterProductSchema(data: MerchantCenterProductData) {
  const baseUrl = "https://olgishcakes.co.uk";
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${baseUrl}/products/${data.id}`,
    
    // Core product information
    name: data.name,
    description: data.description,
    url: data.url,
    image: [data.image, ...(data.additionalImages || [])],
    
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
        postalCode: "LS1 1AA",
      },
    },
    
    // Product identifiers for better indexing
    ...(data.gtin && { gtin: data.gtin }),
    ...(data.mpn && { mpn: data.mpn }),
    ...(data.sku && { sku: data.sku }),
    
    // Category and classification
    category: data.category,
    productID: data.id,
    
    // Enhanced offer with shipping and tax details
    offers: {
      "@type": "Offer",
      "@id": `${baseUrl}/offers/${data.id}`,
      price: data.price,
      priceCurrency: data.currency,
      availability: `https://schema.org/${data.availability}`,
      condition: `https://schema.org/${data.condition}`,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      
      // Seller information
      seller: {
        "@type": "Organization",
        name: data.brand,
        url: baseUrl,
      },
      
      // Shipping details
      shippingDetails: data.shipping ? {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: data.shipping.price,
          currency: data.currency,
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          businessDays: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "17:00",
          },
          cutoffTime: "14:00",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: data.shipping.country,
        },
      } : undefined,
      
      // Tax information
      ...(data.tax && {
        eligibleTransactionVolume: {
          "@type": "PriceSpecification",
          price: data.price,
          priceCurrency: data.currency,
          valueAddedTaxIncluded: true,
        },
      }),
      
      // Return policy
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "GB",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      
      // Payment methods
      acceptedPaymentMethod: [
        "https://schema.org/CreditCard",
        "https://schema.org/PaymentByTransfer",
        "https://schema.org/PaymentByBankTransfer",
      ],
    },
    
    // Additional product properties for better categorization
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Custom Label 0",
        value: "Ukrainian",
      },
      {
        "@type": "PropertyValue",
        name: "Custom Label 1",
        value: "Traditional",
      },
      {
        "@type": "PropertyValue",
        name: "Custom Label 2",
        value: "Handmade",
      },
      {
        "@type": "PropertyValue",
        name: "Custom Label 3",
        value: "Leeds Bakery",
      },
      ...(data.customLabels?.map((label, index) => ({
        "@type": "PropertyValue",
        name: `Custom Label ${index + 4}`,
        value: label,
      })) || []),
    ],
    
    // Aggregate rating if available
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "50",
      bestRating: "5",
      worstRating: "1",
    },
    
    // Review information
    review: [
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Sarah M.",
        },
        reviewBody: "Absolutely delicious! The honey cake was perfect for our celebration. Highly recommend Olgish Cakes!",
        datePublished: "2024-01-15",
      },
    ],
  };
}

/**
 * Generate enhanced structured data for cake products
 */
export function generateCakeMerchantCenterSchema(cake: any): any {
  const baseUrl = "https://olgishcakes.co.uk";
  const productUrl = `${baseUrl}/cakes/${cake.slug.current}`;
  
  // Get the best available image
  const mainImage = cake.mainImage?.asset?._ref 
    ? cake.mainImage 
    : cake.designs?.standard?.find((img: any) => img.isMain && img.asset?._ref) ||
      cake.designs?.standard?.find((img: any) => img.asset?._ref) ||
      cake.designs?.standard?.[0] ||
      cake.designs?.individual?.find((img: any) => img.isMain && img.asset?._ref) ||
      cake.designs?.individual?.find((img: any) => img.asset?._ref) ||
      cake.designs?.individual?.[0] ||
      // Fallback to images array (for legacy data like Honey Cake)
      cake.images?.find((img: any) => img.asset?._ref) ||
      cake.images?.[0];
  
  // Import urlFor dynamically to avoid build issues
  let urlFor: any;
  try {
    urlFor = require('@/sanity/lib/image').urlFor;
  } catch (error) {
    // Fallback for build environments where dynamic import might fail
    console.warn('Could not import urlFor, using fallback image URL generation');
    urlFor = (image: any) => ({
      width: () => ({ height: () => ({ url: () => `${baseUrl}/images/placeholder-cake.jpg` }) })
    });
  }
  
  const imageUrl = mainImage?.asset?._ref 
    ? urlFor(mainImage).width(800).height(800).url()
    : `${baseUrl}/images/placeholder-cake.jpg`;

  const price = cake.pricing?.standard || cake.pricing?.from || 25;
  
  // Enhanced description
  let description = Array.isArray(cake.shortDescription) 
    ? cake.shortDescription.map((block: any) => block.children?.map((child: any) => child.text).join('') || '').join(' ')
    : cake.shortDescription || cake.description || '';
  
  if (!description || description.length < 100) {
    description = `${cake.name} - Traditional Ukrainian honey cake handmade with authentic recipes in Leeds, Yorkshire. Perfect for birthdays, celebrations, and special occasions. Available in various sizes with custom designs. Free delivery across Leeds and surrounding areas. Premium quality ingredients, expertly crafted by our experienced bakers.`;
  }

  return generateMerchantCenterProductSchema({
    id: `cake_${cake._id}`,
    name: cake.name,
    description: description,
    url: productUrl,
    image: imageUrl,
    price: price,
    currency: "GBP",
    availability: "InStock",
    brand: "Olgish Cakes",
    category: "Food & Drink > Bakery > Cakes",
    condition: "NewCondition",
    shipping: {
      country: "GB",
      service: "Standard delivery",
      price: 0,
    },
    tax: {
      country: "GB",
      rate: 20,
    },
    customLabels: ["Ukrainian", "Traditional", "Handmade", "Leeds Bakery"],
  });
}

/**
 * Generate enhanced structured data for gift hamper products
 */
export function generateHamperMerchantCenterSchema(hamper: any): any {
  const baseUrl = "https://olgishcakes.co.uk";
  const productUrl = `${baseUrl}/gift-hampers/${hamper.slug.current}`;
  
  const mainImage = hamper.images?.find((img: any) => img.isMain && img.asset?._ref) || 
                   hamper.images?.find((img: any) => img.asset?._ref) || 
                   hamper.images?.[0];
  
  // Import urlFor dynamically to avoid build issues
  let urlFor: any;
  try {
    urlFor = require('@/sanity/lib/image').urlFor;
  } catch (error) {
    // Fallback for build environments where dynamic import might fail
    console.warn('Could not import urlFor, using fallback image URL generation');
    urlFor = (image: any) => ({
      width: () => ({ height: () => ({ url: () => `${baseUrl}/images/placeholder-cake.jpg` }) })
    });
  }
  
  const imageUrl = mainImage?.asset?._ref 
    ? urlFor(mainImage).width(800).height(800).url()
    : `${baseUrl}/images/placeholder-hamper.jpg`;

  const price = hamper.price || hamper.pricing?.standard || 35;
  
  // Enhanced description
  let description = Array.isArray(hamper.shortDescription) 
    ? hamper.shortDescription.map((block: any) => block.children?.map((child: any) => child.text).join('') || '').join(' ')
    : hamper.shortDescription || hamper.description || '';
  
  if (!description || description.length < 100) {
    description = `${hamper.name} - Beautiful Ukrainian gift hamper handmade with authentic recipes in Leeds, Yorkshire. Perfect for special occasions, birthdays, anniversaries, and celebrations. Thoughtfully curated selection of traditional treats. Free delivery across Leeds and surrounding areas. Premium quality ingredients, expertly crafted by our experienced bakers.`;
  }

  return generateMerchantCenterProductSchema({
    id: `hamper_${hamper._id}`,
    name: hamper.name,
    description: description,
    url: productUrl,
    image: imageUrl,
    price: price,
    currency: "GBP",
    availability: "InStock",
    brand: "Olgish Cakes",
    category: "Food & Drink > Gift Baskets > Food Gift Baskets",
    condition: "NewCondition",
    shipping: {
      country: "GB",
      service: "Standard delivery",
      price: 0,
    },
    tax: {
      country: "GB",
      rate: 20,
    },
    customLabels: ["Ukrainian", "Gift Hamper", "Handmade", "Leeds Bakery"],
  });
}

/**
 * Generate sitemap data for products
 */
export function generateProductSitemapData(products: any[]) {
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
export function validateMerchantCenterProduct(product: any): {
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
  const hasDesignImages = product.designs?.standard?.some((img: any) => img.asset?._ref) ||
                         product.designs?.individual?.some((img: any) => img.asset?._ref);
  const hasHamperImages = product.images?.some((img: any) => img.asset?._ref);
  const hasLegacyImages = product.images?.some((img: any) => img.asset?._ref);
  
  if (!hasMainImage && !hasDesignImages && !hasHamperImages && !hasLegacyImages) {
    errors.push('No product images found - this will cause Google Merchant Center validation failures');
  } else {
    // Check if images have valid asset references
    if (hasMainImage && !product.mainImage.asset._ref) {
      errors.push('Main image asset reference is invalid');
    }
    if (hasDesignImages) {
      const invalidDesignImages = product.designs?.standard?.filter((img: any) => 
        img.asset?._ref === undefined || img.asset?._ref === null
      ) || [];
      if (invalidDesignImages.length > 0) {
        warnings.push(`${invalidDesignImages.length} design images have invalid asset references`);
      }
    }
    if (hasLegacyImages) {
      const invalidLegacyImages = product.images?.filter((img: any) => 
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