"use client";

import { useEffect } from "react";
import { generateCakeMerchantCenterSchema } from "@/lib/google-merchant-center-schema";

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

    // Use enhanced Google Merchant Center schema
    const structuredData = generateCakeMerchantCenterSchema(cake);

    // Add keywords if available
    if (cake.seo?.keywords && cake.seo.keywords.length > 0) {
      (structuredData as any).keywords = cake.seo.keywords.join(", ");
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
