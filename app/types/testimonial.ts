import type { SanityAsset } from "@sanity/image-url/lib/types/types";

export interface Testimonial {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  customerName: string;
  cakeType: string;
  rating: number;
  date: string;
  text: string;
  cakeImage?: {
    asset?: SanityAsset;
    url?: string;
    alt?: string;
  };
  source?: "google" | "facebook" | "instagram" | "direct";
}
