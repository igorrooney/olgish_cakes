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

export interface Cake {
  _id: string;
  _createdAt: string;
  name: string;
  slug: {
    current: string;
  };
  description: string;
  size: string;
  price: number;
  images: CakeImage[];
  category: string;
  ingredients: string[];
  allergens?: string[];
}

export const sizeLabels: Record<CakeSize["name"], string> = {
  "8inch": "8 inch",
};
