"use client";

import { useEffect } from "react";
import {
  generateCakeMerchantCenterSchema,
  type MerchantCakeInput,
} from "@/lib/google-merchant-center-schema";
import { serializeJsonLd } from '@/lib/structured-data/serialize-json-ld'

interface CakeStructuredDataProps {
  cake: MerchantCakeInput & {
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
    const structuredData: ReturnType<typeof generateCakeMerchantCenterSchema> & {
      keywords?: string;
    } = generateCakeMerchantCenterSchema(cake);
    // Add keywords if available
    if (cake.seo?.keywords && cake.seo.keywords.length > 0) {
      structuredData.keywords = cake.seo.keywords.join(", ");
    }

    // Create script element
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = serializeJsonLd(structuredData);
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
