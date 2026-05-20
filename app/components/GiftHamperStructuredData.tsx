"use client";

import { useEffect } from "react";
import {
  generateHamperMerchantCenterSchema,
  type MerchantHamperInput,
} from "@/lib/google-merchant-center-schema";
import { useReviewStats } from "./ReviewStatsProvider";
import { buildAggregateRating } from "@/app/utils/review-stats";

interface GiftHamperStructuredDataProps {
  hamper: MerchantHamperInput & {
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
  const reviewStats = useReviewStats();

  useEffect(() => {
    if (!hamper.structuredData?.enableProductSchema) return;

    // Use enhanced Google Merchant Center schema
    const structuredData: ReturnType<typeof generateHamperMerchantCenterSchema> & {
      keywords?: string;
    } = generateHamperMerchantCenterSchema(hamper);
    const aggregateRating = buildAggregateRating(reviewStats);

    if (aggregateRating) {
      structuredData.aggregateRating = aggregateRating;
    }

    // Add keywords if available
    if (hamper.seo?.keywords && hamper.seo.keywords.length > 0) {
      structuredData.keywords = hamper.seo.keywords.join(", ");
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
  }, [hamper, reviewStats]);

  return null;
}
