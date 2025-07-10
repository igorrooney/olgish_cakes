import { client } from "@/sanity/lib/client";
import { Cake } from "@/types/cake";
import { notFound } from "next/navigation";
import { CakePageClient } from "./CakePageClient";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@mui/material";
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
    alternates: {
      canonical: `https://olgish-cakes.vercel.app/cakes/${cake.slug.current}`,
    },
  };
}

export default async function CakePage({ params }: PageProps) {
  const cake = await getCake(params.slug);

  if (!cake) {
    notFound();
  }

  // Generate structured data for the cake
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cake.name,
    description: cake.shortDescription || cake.description,
    image: `https://olgish-cakes.vercel.app/images/cakes/${cake.slug.current}.jpg`,
    url: `https://olgish-cakes.vercel.app/cakes/${cake.slug.current}`,
    brand: {
      "@type": "Brand",
      name: "Olgish Cakes",
    },
    category: cake.category,
    offers: {
      "@type": "Offer",
      price: cake.pricing.standard,
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Olgish Cakes",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "50",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "All Cakes", href: "/cakes" },
            { label: cake.name, href: `/cakes/${cake.slug.current}` },
          ]}
        />
      </Container>

      <CakePageClient cake={cake} />
    </>
  );
}
