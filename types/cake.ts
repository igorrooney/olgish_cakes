export interface Cake {
  _id: string;
  _createdAt: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: {
    _type: string;
    asset: {
      _ref: string;
      _type: string;
    };
  };
  category: "traditional" | "custom" | "seasonal";
  ingredients?: string[];
  allergens?: string[];
}
