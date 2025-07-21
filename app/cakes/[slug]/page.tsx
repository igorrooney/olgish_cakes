import { getClient } from "@/sanity/lib/client";
import { Cake, blocksToText } from "@/types/cake";
import { notFound } from "next/navigation";
import { CakePageClient } from "./CakePageClient";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@mui/material";
import { Metadata } from "next";
import { getRevalidateTime } from "@/app/utils/fetchCakes";
import { CakeStructuredData } from "@/app/components/CakeStructuredData";

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
    allergens,
    mainImage,
    seo,
    structuredData
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

  // Use SEO fields if available, otherwise generate from content
  const metaTitle =
    cake.seo?.metaTitle ||
    `${cake.name} | Olgish Cakes - Traditional Ukrainian Honey Cakes in Leeds`;
  const metaDescription =
    cake.seo?.metaDescription ||
    (cake.shortDescription
      ? blocksToText(cake.shortDescription).substring(0, 160)
      : `Traditional Ukrainian honey cake - ${cake.name}. Freshly baked in Leeds with authentic recipes. Free UK delivery.`);

  const keywords =
    cake.seo?.keywords?.join(", ") ||
    `${cake.name}, ${cake.category} cake, Ukrainian honey cake, Medovik, Leeds cake, custom cake, ${cake.category} cake Leeds, Ukrainian bakery Leeds, traditional Ukrainian cake, fresh cake delivery, birthday cake, wedding cake, celebration cake, Yorkshire cake, UK cake delivery`;

  const canonicalUrl =
    cake.seo?.canonicalUrl || `https://olgishcakes.co.uk/cakes/${cake.slug.current}`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    authors: [{ name: "Olgish Cakes" }],
    creator: "Olgish Cakes",
    publisher: "Olgish Cakes",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://olgishcakes.co.uk"),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      url: canonicalUrl,
      siteName: "Olgish Cakes",
      locale: "en_GB",
      images: [
        {
          url:
            cake.mainImage?.asset?.url ||
            `https://olgishcakes.co.uk/images/cakes/${cake.slug.current}.jpg`,
          width: 1200,
          height: 630,
          alt: `${cake.name} - ${cake.category} honey cake by Olgish Cakes`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [
        cake.mainImage?.asset?.url ||
          `https://olgishcakes.co.uk/images/cakes/${cake.slug.current}.jpg`,
      ],
      creator: "@olgish_cakes",
      site: "@olgish_cakes",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
    },
    other: {
      price: cake.pricing.standard.toString(),
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      brand: "Olgish Cakes",
      category: cake.category,
      "og:price:amount": cake.pricing.standard.toString(),
      "og:price:currency": "GBP",
    },
  };
}

export default async function CakePage({ params }: PageProps) {
  const cake = await getCake(params.slug);

  if (!cake) {
    notFound();
  }

  return (
    <>
      {/* Structured Data Component */}
      <CakeStructuredData cake={cake} />

      {/* Additional Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Olgish Cakes",
            url: "https://olgishcakes.co.uk",
            logo: "https://olgishcakes.co.uk/logo.png",
            description:
              "Authentic Ukrainian honey cakes made with love in Leeds. Traditional recipes, premium ingredients, and exceptional taste.",
            telephone: "+44 786 721 8194",
            email: "hello@olgishcakes.co.uk",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Allerton Grange",
              addressLocality: "Leeds",
              postalCode: "LS17",
              addressRegion: "West Yorkshire",
              addressCountry: "GB",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: "53.8008",
              longitude: "-1.5491",
            },
            sameAs: [
              "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
              "https://www.instagram.com/olgish_cakes/",
            ],
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Ukrainian Honey Cakes",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: cake.name,
                    category: "Ukrainian Honey Cake",
                  },
                },
              ],
            },
          }),
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://olgishcakes.co.uk",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "All Cakes",
                item: "https://olgishcakes.co.uk/cakes",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: cake.name,
                item: `https://olgishcakes.co.uk/cakes/${cake.slug.current}`,
              },
            ],
          }),
        }}
      />

      {/* FAQ Schema for better search visibility */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `How long does it take to make a ${cake.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Our ${cake.name} is freshly baked to order and typically takes 2-3 working days to prepare. For custom designs, please allow 3-7 working days.`,
                },
              },
              {
                "@type": "Question",
                name: `Can I customize the ${cake.name} design?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Yes! We offer both standard and custom designs for our ${cake.name}. Custom designs allow for personalization while maintaining the authentic Ukrainian taste.`,
                },
              },
              {
                "@type": "Question",
                name: `Is delivery available for the ${cake.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we offer free UK delivery on all our cakes. We deliver to Leeds, York, Bradford, Halifax, Huddersfield, and surrounding areas.",
                },
              },
              {
                "@type": "Question",
                name: `What are the ingredients in the ${cake.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `The ${cake.name} contains: ${cake.ingredients.join(", ")}.${cake.allergens && cake.allergens.length > 0 ? ` Allergens: ${cake.allergens.join(", ")}.` : ""}`,
                },
              },
              {
                "@type": "Question",
                name: `How should I store the ${cake.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Store your ${cake.name} in an airtight container in the refrigerator for up to 5 days. For longer storage, wrap tightly and freeze for up to 3 months.`,
                },
              },
            ],
          }),
        }}
      />

      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <nav aria-label="Breadcrumb navigation">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "All Cakes", href: "/cakes" },
              { label: cake.name, href: `/cakes/${cake.slug.current}` },
            ]}
          />
        </nav>
      </Container>

      <main id="main-content">
        <CakePageClient cake={cake} />
      </main>
    </>
  );
}
