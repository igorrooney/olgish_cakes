"use client";

import { useEffect } from "react";

interface CakeStructuredDataProps {
  cake: {
    name: string;
    slug: {
      current: string;
    };
    description?: any[];
    shortDescription?: any[];
    pricing: {
      standard: number;
      individual: number;
    };
    mainImage?: {
      asset?: {
        url?: string;
      };
      alt?: string;
    };
    ingredients?: string[];
    allergens?: string[];
    category?: string;
    size?: string;
    seo?: {
      metaDescription?: string;
      keywords?: string[];
    };
    structuredData?: {
      enableProductSchema?: boolean;
      brand?: string;
      availability?: string;
    };
  };
}

export function CakeStructuredData({ cake }: CakeStructuredDataProps) {
  useEffect(() => {
    if (!cake.structuredData?.enableProductSchema) return;

    const absoluteImageUrl = cake.mainImage?.asset?.url
      ? (cake.mainImage.asset.url.startsWith("http")
          ? cake.mainImage.asset.url
          : `https://olgishcakes.co.uk${cake.mainImage.asset.url}`)
      : "https://olgishcakes.co.uk/images/placeholder-cake.jpg";

    const structuredData: any = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: cake.name,
      description: cake.seo?.metaDescription || `Traditional Ukrainian honey cake - ${cake.name}`,
      brand: {
        "@type": "Brand",
        name: cake.structuredData?.brand || "Olgish Cakes",
      },
      category: cake.category || "Traditional Ukrainian Cakes",
      image: [absoluteImageUrl],
      offers: {
        "@type": "Offer",
        price: cake.pricing.standard,
        priceCurrency: "GBP",
        availability: `https://schema.org/${cake.structuredData?.availability || "InStock"}`,
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        seller: {
          "@type": "Organization",
          name: "Olgish Cakes",
          url: "https://olgishcakes.co.uk",
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "GB",
          returnFees: "https://schema.org/FreeReturn",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 14,
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
          value: `${cake.size} inch`,
        },
        {
          "@type": "PropertyValue",
          name: "Category",
          value: "Ukrainian Honey Cake",
        },
        {
          "@type": "PropertyValue",
          name: "Ingredients",
          value: cake.ingredients?.join(", ") || "Traditional honey cake ingredients",
        },
      ],
    };

    // Add allergens if available
    if (cake.allergens && cake.allergens.length > 0) {
      structuredData.additionalProperty.push({
        "@type": "PropertyValue",
        name: "Allergens",
        value: cake.allergens.join(", "),
      });
    }

    // Add keywords if available
    if (cake.seo?.keywords && cake.seo.keywords.length > 0) {
      structuredData.keywords = cake.seo.keywords.join(", ");
    }

    // Create script element
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    script.id = "cake-structured-data";

    // Remove existing script if present
    const existingScript = document.getElementById("cake-structured-data");
    if (existingScript) {
      existingScript.remove();
    }

    // Add to head
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById("cake-structured-data");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [cake]);

  return null;
}
