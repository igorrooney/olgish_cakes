import type { DeliveryPolicy } from './deliveryPolicy'

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

export interface GiftHamperFAQItem {
  question: string;
  answer: string;
}

export interface GiftHamperSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  faq?: GiftHamperFAQItem[];
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

export interface RichTextChild {
  text: string;
  [key: string]: unknown;
}

export interface RichTextBlock {
  _type: string;
  children?: RichTextChild[];
  [key: string]: unknown;
}

export type GiftHamperDeliveryDescriptionSource = 'global' | 'custom'
export type GiftHamperDeliveryPolicySource = 'global' | 'custom'

export interface GiftHamperDeliverySectionOverride {
  descriptionSource?: GiftHamperDeliveryDescriptionSource
  customDescription?: RichTextBlock[]
  policySource?: GiftHamperDeliveryPolicySource
  customPolicy?: Partial<DeliveryPolicy>
}

export interface GiftHampersDeliverySectionContent {
  name?: string
  description?: RichTextBlock[]
  policy?: Partial<DeliveryPolicy>
}

export interface GiftHamper {
  _id: string;
  _createdAt: string;
  name: string;
  slug: GiftHamperSlug;
  seo?: GiftHamperSEO;
  description?: RichTextBlock[];
  shortDescription?: RichTextBlock[];
  deliverySection?: GiftHamperDeliverySectionOverride;
  giftHampersDeliverySection?: GiftHampersDeliverySectionContent;
  price: number;
  images?: GiftHamperImage[]; // includes one with isMain = true
  designs?: GiftHamperDesigns; // deprecated; not used for hampers
  collections?: Array<{
    _id: string;
    name: string;
    isFeatured?: boolean;
  }>;
  category?: string;
  ingredients?: string[];
  allergens?: string[];
  order?: number;
}
