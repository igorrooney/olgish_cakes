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

export interface Cake {
  _id: string;
  _createdAt: string;
  name: string;
  slug: {
    current: string;
  };
  description: string;
  shortDescription?: string;
  size: string;
  pricing: CakePricing;
  designs: CakeDesigns;
  category: string;
  ingredients: string[];
  allergens?: string[];
}

export const sizeLabels: Record<CakeSize["name"], string> = {
  "8inch": "8 inch",
};
