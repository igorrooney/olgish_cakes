export interface Cake {
  _id: string;
  _createdAt: string;
  name: string;
  slug: {
    _type: string;
    current: string;
  };
  description: string;
  shortDescription?: Array<Record<string, unknown>>; // Rich text blocks for short description
  size: string;
  pricing: {
    standard: number;
    individual: number;
  };
  designs?: {
    standard?: Array<{
      _type?: string;
      asset?: {
        _type: string;
        _ref: string;
      };
      alt?: string;
      isMain?: boolean;
    }>;
    individual?: Array<{
      _type?: string;
      asset?: {
        _type: string;
        _ref: string;
      };
      alt?: string;
      isMain?: boolean;
    }>;
  };
  category: string;
  collections?: Array<{
    _id: string;
    name: string;
    isFeatured?: boolean;
  }>;
  ingredients: string[];
  allergens?: string[];
  isBestseller?: boolean;
}
