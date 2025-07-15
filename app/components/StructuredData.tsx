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
  data: any;
  id?: string;
}

export function StructuredData({ type, data, id }: StructuredDataProps) {
  useEffect(() => {
    let structuredData: any;

    switch (type) {
      case "organization":
        structuredData = generateOrganizationSchema();
        break;
      case "localBusiness":
        structuredData = generateLocalBusinessSchema();
        break;
      case "website":
        structuredData = generateWebSiteSchema();
        break;
      case "webpage":
        structuredData = generateWebPageSchema(data);
        break;
      case "breadcrumb":
        structuredData = generateBreadcrumbData(data);
        break;
      case "product":
        structuredData = generateProductSchema(data);
        break;
      case "faq":
        structuredData = generateFAQSchema(data);
        break;
      case "aggregateRating":
        structuredData = generateAggregateRatingSchema(data.rating, data.reviewCount);
        break;
      case "review":
        structuredData = generateReviewSchema(data);
        break;
      case "imageObject":
        structuredData = generateImageObjectSchema(data);
        break;
      case "service":
        structuredData = generateServiceSchema(data);
        break;
      case "event":
        structuredData = generateEventSchema(data);
        break;
      case "article":
        structuredData = generateArticleSchema(data);
        break;
      case "howTo":
        structuredData = generateHowToSchema(data);
        break;
      case "recipe":
        structuredData = generateRecipeSchema(data);
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
  }, [type, data, id]);

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
  mainEntity?: any;
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

export function ProductStructuredData({ product }: { product: any }) {
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

export function ReviewStructuredData({ review }: { review: any }) {
  return <StructuredData type="review" data={review} />;
}

export function ImageObjectStructuredData({ image }: { image: any }) {
  return <StructuredData type="imageObject" data={image} />;
}

export function ServiceStructuredData({ service }: { service: any }) {
  return <StructuredData type="service" data={service} />;
}

export function EventStructuredData({ event }: { event: any }) {
  return <StructuredData type="event" data={event} />;
}

export function ArticleStructuredData({ article }: { article: any }) {
  return <StructuredData type="article" data={article} />;
}

export function HowToStructuredData({ howTo }: { howTo: any }) {
  return <StructuredData type="howTo" data={howTo} />;
}

export function RecipeStructuredData({ recipe }: { recipe: any }) {
  return <StructuredData type="recipe" data={recipe} />;
}
