"use client";

import { useEffect } from "react";
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateWebSiteSchema,
  generateWebPageSchema,
  generateBreadcrumbData,
  generateProductSchema,
  generateFAQSchema,
  generateAggregateRatingSchema,
  generateReviewSchema,
  generateImageObjectSchema,
  generateServiceSchema,
  generateEventSchema,
  generateArticleSchema,
  generateHowToSchema,
  generateRecipeSchema,
} from "@/app/utils/seo";
import { useReviewStats } from "./ReviewStatsProvider";

interface StructuredDataProps {
  type:
    | "organization"
    | "localBusiness"
    | "website"
    | "webpage"
    | "breadcrumb"
    | "product"
    | "faq"
    | "aggregateRating"
    | "review"
    | "imageObject"
    | "service"
    | "event"
    | "article"
    | "howTo"
    | "recipe";
  data: unknown;
  id?: string;
}

type WebPageData = Parameters<typeof generateWebPageSchema>[0];
type BreadcrumbData = Parameters<typeof generateBreadcrumbData>[0];
type ProductData = Parameters<typeof generateProductSchema>[0];
type FAQData = Parameters<typeof generateFAQSchema>[0];
type ReviewData = Parameters<typeof generateReviewSchema>[0];
type ImageObjectData = Parameters<typeof generateImageObjectSchema>[0];
type ServiceData = Parameters<typeof generateServiceSchema>[0];
type EventData = Parameters<typeof generateEventSchema>[0];
type ArticleData = Parameters<typeof generateArticleSchema>[0];
type HowToData = Parameters<typeof generateHowToSchema>[0];
type RecipeData = Parameters<typeof generateRecipeSchema>[0];

export function StructuredData({ type, data, id }: StructuredDataProps) {
  const reviewStats = useReviewStats()

  useEffect(() => {
    let structuredData: unknown;

    switch (type) {
      case "organization":
        structuredData = generateOrganizationSchema(reviewStats);
        break;
      case "localBusiness":
        structuredData = generateLocalBusinessSchema(reviewStats);
        break;
      case "website":
        structuredData = generateWebSiteSchema();
        break;
      case "webpage":
        structuredData = generateWebPageSchema(data as WebPageData);
        break;
      case "breadcrumb":
        structuredData = generateBreadcrumbData(data as BreadcrumbData);
        break;
      case "product":
        structuredData = generateProductSchema(data as ProductData);
        break;
      case "faq":
        structuredData = generateFAQSchema(data as FAQData);
        break;
      case "aggregateRating":
        structuredData = generateAggregateRatingSchema(
          (data as { rating: number }).rating,
          (data as { reviewCount: number }).reviewCount
        );
        break;
      case "review":
        structuredData = generateReviewSchema(data as ReviewData);
        break;
      case "imageObject":
        structuredData = generateImageObjectSchema(data as ImageObjectData);
        break;
      case "service":
        structuredData = generateServiceSchema(data as ServiceData);
        break;
      case "event":
        structuredData = generateEventSchema(data as EventData);
        break;
      case "article":
        structuredData = generateArticleSchema(data as ArticleData);
        break;
      case "howTo":
        structuredData = generateHowToSchema(data as HowToData);
        break;
      case "recipe":
        structuredData = generateRecipeSchema(data as RecipeData);
        break;
      default:
        return;
    }

    // Create script element
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    script.id = id || `structured-data-${type}-${Date.now()}`;

    // Remove existing script if present
    const existingScript = document.getElementById(script.id);
    if (existingScript) {
      existingScript.remove();
    }

    // Add to head
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(script.id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data, id, reviewStats]);

  return null;
}

// Convenience components for common use cases
export function OrganizationStructuredData() {
  return <StructuredData type="organization" data={{}} />;
}

export function LocalBusinessStructuredData() {
  return <StructuredData type="localBusiness" data={{}} />;
}

export function WebsiteStructuredData() {
  return <StructuredData type="website" data={{}} />;
}

export function WebPageStructuredData({
  name,
  description,
  url,
  breadcrumb,
  mainEntity,
}: {
  name: string;
  description: string;
  url: string;
  breadcrumb?: Array<{ name: string; url: string }>;
  mainEntity?: Record<string, unknown>;
}) {
  return (
    <StructuredData type="webpage" data={{ name, description, url, breadcrumb, mainEntity }} />
  );
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return <StructuredData type="breadcrumb" data={items} />;
}

export function ProductStructuredData({ product }: { product: ProductData }) {
  return <StructuredData type="product" data={product} />;
}

export function FAQStructuredData({
  questions,
}: {
  questions: Array<{ question: string; answer: string }>;
}) {
  return <StructuredData type="faq" data={questions} />;
}

export function AggregateRatingStructuredData({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  return <StructuredData type="aggregateRating" data={{ rating, reviewCount }} />;
}

export function ReviewStructuredData({ review }: { review: ReviewData }) {
  return <StructuredData type="review" data={review} />;
}

export function ImageObjectStructuredData({ image }: { image: ImageObjectData }) {
  return <StructuredData type="imageObject" data={image} />;
}

export function ServiceStructuredData({ service }: { service: ServiceData }) {
  return <StructuredData type="service" data={service} />;
}

export function EventStructuredData({ event }: { event: EventData }) {
  return <StructuredData type="event" data={event} />;
}

export function ArticleStructuredData({ article }: { article: ArticleData }) {
  return <StructuredData type="article" data={article} />;
}

export function HowToStructuredData({ howTo }: { howTo: HowToData }) {
  return <StructuredData type="howTo" data={howTo} />;
}

export function RecipeStructuredData({ recipe }: { recipe: RecipeData }) {
  return <StructuredData type="recipe" data={recipe} />;
}
