import type { DeliveryPolicy } from './deliveryPolicy'

export interface CakeSize {
  name: "8inch";
  price: number;
}

export interface CakeImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  isMain?: boolean;
  alt?: string;
  caption?: string;
}

export interface CakeDesigns {
  standard: CakeImage[];
  individual?: CakeImage[];
}

export interface CakePricing {
  standard: number;
  individual: number;
}

export interface CakeSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

export interface CakeStructuredData {
  enableProductSchema?: boolean;
  brand?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued";
}

export interface CakeCollection {
  _id: string;
  name: string;
  isFeatured?: boolean;
}

export type CakeDeliveryDescriptionSource = 'global' | 'custom'
export type CakeDeliveryPolicySource = 'global' | 'custom'

export interface CakeDeliverySectionOverride {
  descriptionSource?: CakeDeliveryDescriptionSource
  customDescription?: RichTextBlock[]
  policySource?: CakeDeliveryPolicySource
  customPolicy?: Partial<DeliveryPolicy>
}

export interface CakesDeliverySectionContent {
  name?: string
  description?: RichTextBlock[]
  policy?: Partial<DeliveryPolicy>
}

interface RichTextChild {
  text: string;
  [key: string]: unknown;
}

interface RichTextBlock {
  _type: string;
  children?: RichTextChild[];
  [key: string]: unknown;
}

// Utility function to convert rich text blocks to plain text
// This is kept for backward compatibility, but consider using richTextToText from lib/rich-text-utils
export function blocksToText(blocks: RichTextBlock[]): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  return blocks
    .map(block => {
      if (block._type === "block") {
        return block.children?.map((_child) => _child.text).join("") || "";
      }
      return "";
    })
    .join("\n")
    .trim();
}

export interface Cake {
  _id: string;
  _createdAt: string;
  name: string;
  slug: {
    current: string;
  };
  seo?: CakeSEO;
  description: RichTextBlock[]; // Rich text blocks
  shortDescription?: RichTextBlock[]; // Rich text blocks for short description
  deliverySection?: CakeDeliverySectionOverride;
  cakesDeliverySection?: CakesDeliverySectionContent;
  bestsellerShortDescription?: RichTextBlock[]; // Rich text blocks for bestseller section
  bestsellerCustomerStory?: string; // Customer story quote for bestseller section
  bestsellerStoryDetails?: string; // Who the cake was made for, occasion, etc.
  size: string;
  pricing: CakePricing;
  mainImage?: {
    _type: string;
    asset?: {
      _ref: string;
      url?: string;
    };
    alt?: string;
    caption?: string;
  };
  images?: CakeImage[];
  designs: CakeDesigns;
  category: string;
  collections?: CakeCollection[];
  ingredients: string[];
  allergens?: string[];
  structuredData?: CakeStructuredData;
  order?: number;
  isBestseller?: boolean;
}

export const sizeLabels: Record<CakeSize["name"], string> = {
  "8inch": "8 inch",
};
