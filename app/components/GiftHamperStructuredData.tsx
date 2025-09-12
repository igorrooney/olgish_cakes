"use client";

import { useEffect } from "react";
import { generateHamperMerchantCenterSchema } from "@/lib/google-merchant-center-schema";

interface GiftHamperStructuredDataProps {
  hamper: {
    _id: string;
    name: string;
    slug: {
      current: string;
    };
    description?: any[];
    shortDescription?: any[];
    price: number;
    mainImage?: {
      asset?: {
        url?: string;
      };
      alt?: string;
    };
    ingredients?: string[];
    allergens?: string[];
    category?: string;
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

export function GiftHamperStructuredData({ hamper }: GiftHamperStructuredDataProps) {
  useEffect(() => {
    if (!hamper.structuredData?.enableProductSchema) return;

    // Use enhanced Google Merchant Center schema
    const structuredData = generateHamperMerchantCenterSchema(hamper);

    // Add keywords if available
    if (hamper.seo?.keywords && hamper.seo.keywords.length > 0) {
      (structuredData as any).keywords = hamper.seo.keywords.join(", ");
    }

    // Create script element
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    script.id = "hamper-structured-data";

    // Remove existing script if present
    const existingScript = document.getElementById("hamper-structured-data");
    if (existingScript) {
      existingScript.remove();
    }

    // Add to head
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById("hamper-structured-data");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [hamper]);

  return null;
}
