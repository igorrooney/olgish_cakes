import { getClient } from "@/sanity/lib/client";
import { Cake, blocksToText } from "@/types/cake";
import { notFound } from "next/navigation";
import { CakePageClient } from "./CakePageClient";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@mui/material";
import { Metadata } from "next";
import { getRevalidateTime } from "@/app/utils/fetchCakes";

// Enable revalidation for this page
export const revalidate = getRevalidateTime();

async function getCake(slug: string, preview = false): Promise<Cake | null> {
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

  const sanityClient = getClient(preview);
  return sanityClient.fetch(query, { slug });
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

  const description = cake.shortDescription
    ? blocksToText(cake.shortDescription)
    : blocksToText(cake.description);
  const title = `${cake.name} | Olgish Cakes - Traditional Ukrainian Cakes in Leeds`;
  const keywords = `${cake.name}, ${cake.category} cake, Ukrainian cake, honey cake, Medovik, Leeds cake, custom cake, ${cake.category} cake Leeds, Ukrainian bakery Leeds`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://olgish-cakes.vercel.app/cakes/${cake.slug.current}`,
      images: [
        {
          url: `https://olgish-cakes.vercel.app/images/cakes/${cake.slug.current}.jpg`,
          width: 1200,
          height: 630,
          alt: `${cake.name} - ${cake.category} cake by Olgish Cakes`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://olgish-cakes.vercel.app/images/cakes/${cake.slug.current}.jpg`],
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
    description: cake.shortDescription
      ? blocksToText(cake.shortDescription)
      : blocksToText(cake.description),
    image: `https://olgish-cakes.vercel.app/images/cakes/${cake.slug.current}.jpg`,
    url: `https://olgish-cakes.vercel.app/cakes/${cake.slug.current}`,
    brand: {
      "@type": "Brand",
      name: "Olgish Cakes",
    },
    category: cake.category,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Size",
        value: cake.size,
      },
      {
        "@type": "PropertyValue",
        name: "Ingredients",
        value: cake.ingredients.join(", "),
      },
      ...(cake.allergens && cake.allergens.length > 0
        ? [
            {
              "@type": "PropertyValue",
              name: "Allergens",
              value: cake.allergens.join(", "),
            },
          ]
        : []),
    ],
    offers: {
      "@type": "Offer",
      price: cake.pricing.standard,
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: "https://olgish-cakes.vercel.app",
        telephone: "+44 786 721 8194",
        address: {
          "@type": "PostalAddress",
          streetAddress: "107 Harehills Lane",
          addressLocality: "Leeds",
          postalCode: "LS8 4DN",
          addressCountry: "GB",
        },
      },
      areaServed: {
        "@type": "City",
        name: "Leeds",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "50",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://olgish-cakes.vercel.app",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "All Cakes",
          item: "https://olgish-cakes.vercel.app/cakes",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: cake.name,
          item: `https://olgish-cakes.vercel.app/cakes/${cake.slug.current}`,
        },
      ],
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
