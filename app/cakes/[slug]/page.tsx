import { client } from "@/sanity/lib/client";
import { Cake } from "@/types/cake";
import { notFound } from "next/navigation";
import { CakePageClient } from "./CakePageClient";
import { Metadata } from "next";

async function getCake(slug: string): Promise<Cake | null> {
  const query = `*[_type == "cake" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    description,
    shortDescription,
    size,
    pricing,
    designs,
    category,
    ingredients,
    allergens
  }`;

  return client.fetch(query, { slug });
}

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cake = await getCake(params.slug);

  if (!cake) {
    return {
      title: "Cake Not Found | Olgish Cakes",
      description: "The requested cake could not be found.",
    };
  }

  const description = cake.shortDescription || cake.description;
  const title = `${cake.name} | Olgish Cakes - Traditional Ukrainian Cakes in Leeds`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://olgish-cakes.vercel.app/cakes/${cake.slug.current}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CakePage({ params }: PageProps) {
  const cake = await getCake(params.slug);

  if (!cake) {
    notFound();
  }

  return <CakePageClient cake={cake} />;
}
