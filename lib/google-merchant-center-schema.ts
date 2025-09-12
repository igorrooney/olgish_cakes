import { Cake } from "@/types/cake";
import { GiftHamper } from "@/types/giftHamper";

// Google Merchant Center Enhanced Product Schema
export function generateGoogleMerchantCenterSchema(product: Cake | GiftHamper, type: 'cake' | 'hamper') {
  const baseUrl = "https://olgishcakes.co.uk";
  
  if (type === 'cake') {
    return generateCakeMerchantCenterSchema(product as Cake, baseUrl);
  } else {
    return generateHamperMerchantCenterSchema(product as GiftHamper, baseUrl);
  }
}

function generateCakeMerchantCenterSchema(cake: Cake, baseUrl: string) {
  const productUrl = `${baseUrl}/cakes/${cake.slug.current}`;
  const imageUrl = cake.mainImage?.asset?.url 
    ? (cake.mainImage.asset.url.startsWith('http') 
        ? cake.mainImage.asset.url 
        : `https://cdn.sanity.io${cake.mainImage.asset.url}`)
    : `${baseUrl}/images/placeholder-cake.jpg`;

  const price = cake.pricing?.standard || 25;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: cake.name,
    description: cake.shortDescription || cake.description || `Traditional Ukrainian honey cake - ${cake.name}`,
    image: [imageUrl],
    url: productUrl,
    category: "Food & Drink > Bakery > Cakes",
    brand: {
      "@type": "Brand",
      name: "Olgish Cakes",
      url: baseUrl,
    },
    manufacturer: {
      "@type": "Organization",
      name: "Olgish Cakes",
      url: baseUrl,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Leeds",
        addressRegion: "West Yorkshire",
        addressCountry: "GB",
      },
    },
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "GBP",
      availability: `https://schema.org/${cake.structuredData?.availability || "InStock"}`,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: baseUrl,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { 
          "@type": "MonetaryAmount", 
          value: 0, 
          currency: "GBP" 
        },
        shippingDestination: { 
          "@type": "DefinedRegion", 
          addressCountry: "GB" 
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { 
            "@type": "QuantitativeValue", 
            minValue: 0, 
            maxValue: 1, 
            unitCode: "DAY" 
          },
          transitTime: { 
            "@type": "QuantitativeValue", 
            minValue: 1, 
            maxValue: 3, 
            unitCode: "DAY" 
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "GB",
        returnFees: "https://schema.org/FreeReturn",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Size",
        value: `${cake.size || '6'} inch`,
      },
      {
        "@type": "PropertyValue",
        name: "Category",
        value: cake.category || "Traditional Ukrainian Cakes",
      },
      {
        "@type": "PropertyValue",
        name: "Dietary Information",
        value: cake.allergens?.join(', ') || "Contains dairy, eggs, gluten",
      },
      {
        "@type": "PropertyValue",
        name: "Origin",
        value: "Ukrainian Traditional Recipe",
      },
      {
        "@type": "PropertyValue",
        name: "Preparation",
        value: "Handmade in Leeds",
      },
    ],
    // Google Merchant Center specific properties
    gtin: `OLGISH-${cake._id}`,
    mpn: `cake-${cake.slug.current}`,
    sku: `CAKE-${cake._id}`,
    isbn: undefined,
    material: "Fresh ingredients",
    color: "Traditional",
    pattern: "Ukrainian design",
    size: `${cake.size || '6'} inch`,
    itemCondition: "https://schema.org/NewCondition",
    audience: {
      "@type": "Audience",
      audienceType: "General",
    },
  };
}

function generateHamperMerchantCenterSchema(hamper: GiftHamper, baseUrl: string) {
  const productUrl = `${baseUrl}/gift-hampers/${hamper.slug.current}`;
  const mainImage = hamper.images?.find(img => img.isMain) || hamper.images?.[0];
  const imageUrl = mainImage?.asset?.url 
    ? (mainImage.asset.url.startsWith('http') 
        ? mainImage.asset.url 
        : `https://cdn.sanity.io${mainImage.asset.url}`)
    : `${baseUrl}/images/placeholder-hamper.jpg`;

  const price = hamper.price || 35;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: hamper.name,
    description: hamper.shortDescription || hamper.description || `Beautiful Ukrainian gift hamper - ${hamper.name}`,
    image: [imageUrl],
    url: productUrl,
    category: "Food & Drink > Gift Baskets > Food Gift Baskets",
    brand: {
      "@type": "Brand",
      name: "Olgish Cakes",
      url: baseUrl,
    },
    manufacturer: {
      "@type": "Organization",
      name: "Olgish Cakes",
      url: baseUrl,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Leeds",
        addressRegion: "West Yorkshire",
        addressCountry: "GB",
      },
    },
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: baseUrl,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { 
          "@type": "MonetaryAmount", 
          value: 0, 
          currency: "GBP" 
        },
        shippingDestination: { 
          "@type": "DefinedRegion", 
          addressCountry: "GB" 
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { 
            "@type": "QuantitativeValue", 
            minValue: 0, 
            maxValue: 1, 
            unitCode: "DAY" 
          },
          transitTime: { 
            "@type": "QuantitativeValue", 
            minValue: 1, 
            maxValue: 3, 
            unitCode: "DAY" 
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "GB",
        returnFees: "https://schema.org/FreeReturn",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Category",
        value: hamper.category || "Ukrainian Gift Hamper",
      },
      {
        "@type": "PropertyValue",
        name: "Contents",
        value: hamper.ingredients?.join(', ') || "Assorted Ukrainian treats",
      },
      {
        "@type": "PropertyValue",
        name: "Dietary Information",
        value: hamper.allergens?.join(', ') || "Contains dairy, eggs, gluten",
      },
      {
        "@type": "PropertyValue",
        name: "Origin",
        value: "Ukrainian Traditional",
      },
      {
        "@type": "PropertyValue",
        name: "Presentation",
        value: "Gift wrapped hamper",
      },
    ],
    // Google Merchant Center specific properties
    gtin: `OLGISH-${hamper._id}`,
    mpn: `hamper-${hamper.slug.current}`,
    sku: `HAMPER-${hamper._id}`,
    isbn: undefined,
    material: "Premium ingredients",
    color: "Traditional",
    pattern: "Ukrainian traditional",
    itemCondition: "https://schema.org/NewCondition",
    audience: {
      "@type": "Audience",
      audienceType: "General",
    },
  };
}

// Enhanced structured data for Google Shopping compatibility
export function generateGoogleShoppingStructuredData(product: Cake | GiftHamper, type: 'cake' | 'hamper') {
  const merchantCenterSchema = generateGoogleMerchantCenterSchema(product, type);
  
  return {
    ...merchantCenterSchema,
    // Additional Google Shopping specific properties
    isRelatedTo: [
      {
        "@type": "Product",
        name: type === 'cake' ? 'Ukrainian Honey Cake' : 'Ukrainian Gift Hamper',
        category: type === 'cake' ? 'Traditional Cakes' : 'Gift Baskets',
      }
    ],
    hasMerchantReturnPolicy: {
      ...merchantCenterSchema.offers.hasMerchantReturnPolicy,
      returnPolicyUrl: `${merchantCenterSchema.url}#returns`,
    },
    // Enhanced shipping information
    offers: {
      ...merchantCenterSchema.offers,
      eligibleRegion: {
        "@type": "Country",
        name: "United Kingdom",
      },
      areaServed: [
        {
          "@type": "City",
          name: "Leeds",
        },
        {
          "@type": "City", 
          name: "Bradford",
        },
        {
          "@type": "City",
          name: "Wakefield",
        },
        {
          "@type": "City",
          name: "York",
        },
      ],
    },
  };
}
