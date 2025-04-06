import { client } from "@/sanity/lib/client";
import { Cake } from "@/types/cake";
import { notFound } from "next/navigation";
import { CakePageClient } from "./CakePageClient";

async function getCake(slug: string): Promise<Cake | null> {
  const query = `*[_type == "cake" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    description,
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

export default async function CakePage({ params }: PageProps) {
  const cake = await getCake(params.slug);

  if (!cake) {
    notFound();
  }

  return <CakePageClient cake={cake} />;
}
