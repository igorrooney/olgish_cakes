import { getPriceValidUntil } from "@/app/utils/seo";
import { DEFAULT_REVIEWS } from "./structured-data-defaults";
import { blocksToText } from "@/types/cake";
import { Product, WithContext, Review, AggregateRating, Offer, Organization, Brand } from "schema-dts";

interface TestimonialStats {
  count: number;
  averageRating: number;
}

interface Cake {
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

export function generateSKU(name: string, index: number): string {
  const prefix = "OC";
  const cleanName = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 15);
  return `${prefix}-${cleanName}-${String(index + 1).padStart(3, '0')}`;
}

export function generateProductSchema(cake: Cake, index: number, testimonialStats: TestimonialStats): any {
  const cakeSlug = cake.slug?.current || '';
  const cakeName = cake.name || 'Cake';
  const cakePrice = cake.pricing?.standard || 25;
  const cakeAllergens = cake.allergens || [];
  const cakeIngredients = cake.ingredients || [];
  const cakeImage = cake.mainImage?.asset?.url || '';
  const cakeDescription = cake.description
    ? (typeof cake.description === 'string' ? cake.description : blocksToText(cake.description))
    : `Delicious ${cakeName} handmade with authentic recipes in Leeds.`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://olgishcakes.co.uk/order#${cakeSlug}`,
    name: cakeName,
    description: cakeDescription,
    sku: generateSKU(cakeName, index),
    mpn: `${cakeName.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-${cakePrice}`,
    brand: {
      "@type": "Brand",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
      logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png"
    },
    manufacturer: {
      "@type": "Organization",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Leeds",
        addressRegion: "West Yorkshire",
        addressCountry: "GB"
      }
    },
    category: "Food & Drink > Bakery > Cakes",
    image: [cakeImage || "https://olgishcakes.co.uk/images/placeholder-cake.jpg"],
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
      calories: "350 calories",
      fatContent: "15 grams",
      saturatedFatContent: "8 grams",
      carbohydrateContent: "40 grams",
      sugarContent: "25 grams",
      proteinContent: "6 grams",
      servingSize: "100g"
    },
    offers: {
      "@type": "Offer",
      "@id": `https://olgishcakes.co.uk/order#${cakeSlug}-offer`,
      price: cakePrice.toString(),
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      priceValidUntil: getPriceValidUntil(30),
      url: `https://olgishcakes.co.uk/order`,
      seller: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk"
      },
      areaServed: {
        "@type": "City",
        name: "Leeds"
      },
      deliveryLeadTime: {
        "@type": "QuantitativeValue",
        value: "1",
        unitCode: "DAY"
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "GBP",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "GB",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
        appliesToDeliveryMethod: "https://purl.org/goodrelations/v1#DeliveryModeMail",
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
      ratingValue: testimonialStats.averageRating.toFixed(1),
      reviewCount: testimonialStats.count > 0 ? testimonialStats.count.toString() : "2",
      bestRating: "5",
      worstRating: "1",
    },
    review: DEFAULT_REVIEWS,
  };
}

export function generateAllProductSchemas(cakes: Cake[], testimonialStats: TestimonialStats): any[] {
  return cakes.map((cake: Cake, index: number) => 
    generateProductSchema(cake, index, testimonialStats)
  );
}
