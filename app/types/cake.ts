export interface Cake {
  _id: string;
  _createdAt: string;
  name: string;
  slug: {
    _type: string;
    current: string;
  };
  description: string;
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
  ingredients: string[];
  allergens?: string[];
}
