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
}

export interface CakeDesigns {
  standard: CakeImage[];
  individual?: CakeImage[];
}

export interface CakePricing {
  standard: number;
  individual: number;
}

// Utility function to convert rich text blocks to plain text
// This is kept for backward compatibility, but consider using richTextToText from lib/rich-text-utils
export function blocksToText(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  return blocks
    .map(block => {
      if (block._type === "block") {
        return block.children?.map((child: any) => child.text).join("") || "";
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
  description: any[]; // Changed from string to any[] for rich text blocks
  shortDescription?: any[]; // Rich text blocks for short description
  size: string;
  pricing: CakePricing;
  mainImage?: {
    _type: string;
    asset?: {
      _ref: string;
    };
  };
  designs: CakeDesigns;
  category: string;
  ingredients: string[];
  allergens?: string[];
}

export const sizeLabels: Record<CakeSize["name"], string> = {
  "8inch": "8 inch",
};
