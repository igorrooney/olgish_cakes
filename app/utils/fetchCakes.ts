import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

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
  pricing: {
    standard: number;
    individual: number;
  };
  designs: {
    standard: Array<{
      _type: string;
      asset?: {
        _ref: string;
      };
      isMain?: boolean;
    }>;
  };
  category: string;
  ingredients: string[];
  allergens?: string[];
}

export async function getAllCakes(): Promise<Cake[]> {
  const query = `*[_type == "cake"] | order(_createdAt desc) {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    size,
    pricing,
    designs {
      standard[] {
        _type,
        asset,
        isMain
      }
    },
    category,
    ingredients,
    allergens
  }`;

  return client.fetch(query);
}

export async function getFeaturedCakes(): Promise<Cake[]> {
  const query = groq`*[_type == "cake" && isFeatured == true] | order(_createdAt desc) {
    _id,
    name,
    description,
    price,
    category,
    slug,
    designs {
      standard[] {
        image {
          asset {
            _ref
          },
          alt
        },
        isMain
      }
    }
  }`;

  return client.fetch(query);
}

export async function getCakeBySlug(slug: string): Promise<Cake | null> {
  const query = `*[_type == "cake" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    size,
    pricing,
    designs {
      standard[] {
        _type,
        asset,
        isMain,
        alt
      },
      individual[] {
        _type,
        asset,
        isMain,
        alt
      }
    },
    category,
    ingredients,
    allergens
  }`;

  return client.fetch(query, { slug });
}
