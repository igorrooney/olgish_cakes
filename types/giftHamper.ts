export interface GiftHamperImage {
  _type?: string;
  asset?: {
    _ref: string;
    url?: string;
  };
  alt?: string;
  isMain?: boolean;
  caption?: string;
}

export interface GiftHamperDesigns {
  standard?: GiftHamperImage[];
  individual?: GiftHamperImage[];
}

export interface GiftHamperSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

export interface GiftHamperSlug {
  current: string;
}

export interface GiftHamperMainImage {
  _type?: string;
  asset?: {
    _ref: string;
    url?: string;
  };
  alt?: string;
  caption?: string;
}

export interface GiftHamper {
  _id: string;
  _createdAt: string;
  name: string;
  slug: GiftHamperSlug;
  seo?: GiftHamperSEO;
  description?: any[];
  shortDescription?: any[];
  price: number;
  images?: GiftHamperImage[]; // includes one with isMain = true
  designs?: GiftHamperDesigns; // deprecated; not used for hampers
  category?: string;
  ingredients?: string[];
  allergens?: string[];
}
